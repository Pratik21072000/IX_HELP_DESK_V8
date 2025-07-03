import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isManager } from "@/lib/auth";
import Busboy from "busboy";
import { Readable } from "stream";
import { prisma } from "@/lib/prisma";
import { sendTicketCreatedEmail } from "@/lib/emailService";
import type { CreateTicketData, TicketFilters } from "@/lib/types";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { buffer } from "stream/consumers";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters: TicketFilters = {
      department: (searchParams.get("department") as any) || undefined,
      priority: (searchParams.get("priority") as any) || undefined,
      status: (searchParams.get("status") as any) || undefined,
      search: searchParams.get("search") || undefined,
    };

    // Check if this is a "My Tickets" request (personal tickets only)
    const myTicketsOnly = searchParams.get("myTickets") === "true";

    let whereClause: any = {};

    // Apply role-based filtering
    if (myTicketsOnly) {
      // For "My Tickets" - show only tickets created by the user
      whereClause.createdBy = user.id;
    } else if (user.role === "EMPLOYEE") {
      // Employees always see only their own tickets
      whereClause.createdBy = user.id;
    } else if (isManager(user.role) && user.department) {
      // Managers see department tickets (for management/dashboard view)
      whereClause.department = user.department;
    }

    // Apply additional filters
    if (filters.department) {
      whereClause.department = filters.department;
    }
    if (filters.priority) {
      whereClause.priority = filters.priority;
    }
    if (filters.status) {
      whereClause.status = filters.status;
    }
    if (filters.search) {
      whereClause.OR = [
        { subject: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    const getTickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const tickets = await Promise.all(
      getTickets.map(async (ticket) => {
        const attachments = ticket.attachments
          ? JSON.parse(ticket.attachments)
          : [];

        const signedAttachments = await Promise.all(
          attachments.map(async (key: string) => {
            const command = new GetObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET!,
              Key: key,
            });

            const signedUrl = await getSignedUrl(s3, command, {
              expiresIn: 300,
            });
            return signedUrl;
          }),
        );

        return {
          ...ticket,
          attachments: signedAttachments,
        };
      }),
    );

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Get tickets error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
// export async function POST(request: NextRequest) {
//   try {
//     const user = await getCurrentUser();
//     if (!user) {
//       return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
//     }

//     const data: CreateTicketData = await request.json();
//     console.log(data);

//     if (
//       !data.subject ||
//       !data.description ||
//       !data.department ||
//       !data.priority
//     ) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 },
//       );
//     }

//     // Clean and sanitize subject - remove junk characters but keep basic punctuation
//     const cleanSubject = data.subject
//       .trim()
//       .replace(/[^\w\s\-.,!?()&@#$%]/g, "") // Remove special chars except common ones
//       .replace(/\b[a-z]{8,}\b/gi, "") // Remove random 8+ letter strings like "viggucu8i"
//       .replace(/\s+/g, " ") // Replace multiple spaces with single space
//       .trim();

//     const baseSubject =
//       data.category && data.subcategory
//         ? `[${data.category} - ${data.subcategory}] ${cleanSubject}`
//         : cleanSubject;

//     // Create tickets for each selected department
//     const createdTickets = [];

//     let ticket: any;

//     ticket = await prisma.ticket.create({
//       data: {
//         subject: baseSubject,
//         description: data.description.trim(),
//         department: data.department,
//         priority: data.priority,
//         category: data.category,
//         subcategory: data.subcategory,
//         createdBy: user.id,
//       },
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             username: true,
//             role: true,
//             department: true,
//           },
//         },
//       },
//     });

//     createdTickets.push(ticket);
//     // for (const department of data.departments) {
//     //   const fullSubject =
//     //     data.departments.length > 1
//     //       ? `[${department}] ${baseSubject}`
//     //       : baseSubject;

//     // }

//     // Send email notification to the department
//     try {
//       await sendTicketCreatedEmail(ticket);
//     } catch (emailError) {
//       console.error("Failed to send email notification:", emailError);
//       // Don't fail ticket creation if email fails
//     }

//     return NextResponse.json({ ticket }, { status: 201 });
//   } catch (error) {
//     console.error("Create ticket error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 },
//     );
//   }
// }

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_2!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_2!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 },
      );
    }

    const fields: Record<string, string> = {};
    const uploads: Promise<any>[] = [];
    const uploadedFiles: string[] = [];

    const busboy = Busboy({ headers: { "content-type": contentType } });

    busboy.on("field", (name, value) => {
      fields[name] = value;
    });

    busboy.on("file", async (name, file, filename, encoding, mimetype) => {
      const key = `tickets/${Date.now()}-${filename?.filename}`;
      const fileBuffer = await buffer(file);

      const uploadPromise = s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: key,
          Body: fileBuffer,
          ContentType: mimetype,
          ContentLength: fileBuffer.length,
        }),
      );

      uploads.push(uploadPromise);
      uploadedFiles.push(key);
    });

    const stream = Readable.fromWeb(req.body as any);

    return await new Promise((resolve, reject) => {
      stream.pipe(busboy);

      busboy.on("finish", async () => {
        try {
          await Promise.all(uploads);

          // Extract and validate ticket fields
          const {
            subject,
            description,
            department,
            priority,
            category = "",
            subcategory = "",
            attachments,
          } = fields;

          if (!subject || !description || !department || !priority) {
            return resolve(
              NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
              ),
            );
          }

          const cleanSubject = subject
            .trim()
            .replace(/[^\w\s\-.,!?()&@#$%]/g, "")
            .replace(/\b[a-z]{8,}\b/gi, "")
            .replace(/\s+/g, " ")
            .trim();

          const baseSubject =
            category && subcategory
              ? `[${category} - ${subcategory}] ${cleanSubject}`
              : cleanSubject;

          const ticket: any = await prisma.ticket.create({
            data: {
              subject: baseSubject,
              description: description.trim(),
              department,
              priority,
              category,
              subcategory,
              createdBy: user.id,
              attachments: JSON.stringify(uploadedFiles),
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  role: true,
                  department: true,
                },
              },
            },
          });

          try {
            await sendTicketCreatedEmail(ticket);
          } catch (emailError) {
            console.error("Failed to send email notification:", emailError);
            // Don't fail ticket creation if email fails
          }

          return resolve(
            NextResponse.json(
              { message: "Ticket created", uploadedFiles },
              { status: 201 },
            ),
          );
        } catch (error) {
          console.error("Ticket creation failed:", error);
          return reject(
            NextResponse.json(
              { error: "Internal Server Error" },
              { status: 500 },
            ),
          );
        }
      });

      busboy.on("error", (err) => {
        console.error("Busboy error:", err);
        return reject(
          NextResponse.json({ error: "Upload parse error" }, { status: 500 }),
        );
      });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
