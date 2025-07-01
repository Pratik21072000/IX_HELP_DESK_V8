import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTicketCreatedEmail } from "@/lib/emailService";
import type { CreateTicketData, TicketFilters } from "@/lib/types";

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

    const tickets = await prisma.ticket.findMany({
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

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Get tickets error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // All authenticated users can create tickets

    const data: CreateTicketData = await request.json();
    console.log(data);

    if (
      !data.subject ||
      !data.description ||
      !data.department ||
      !data.priority
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Clean and sanitize subject - remove junk characters but keep basic punctuation
    const cleanSubject = data.subject
      .trim()
      .replace(/[^\w\s\-.,!?()&@#$%]/g, "") // Remove special chars except common ones
      .replace(/\b[a-z]{8,}\b/gi, "") // Remove random 8+ letter strings like "viggucu8i"
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim();

    const baseSubject =
      data.category && data.subcategory
        ? `[${data.category} - ${data.subcategory}] ${cleanSubject}`
        : cleanSubject;

    // Create tickets for each selected department
    const createdTickets = [];

    let ticket: any;

    ticket = await prisma.ticket.create({
      data: {
        subject: baseSubject,
        description: data.description.trim(),
        department: data.department,
        priority: data.priority,
        category: data.category,
        subcategory: data.subcategory,
        createdBy: user.id,
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

    createdTickets.push(ticket);
    // for (const department of data.departments) {
    //   const fullSubject =
    //     data.departments.length > 1
    //       ? `[${department}] ${baseSubject}`
    //       : baseSubject;

    // }

    // Send email notification to the department
    try {
      await sendTicketCreatedEmail(ticket);
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Don't fail ticket creation if email fails
    }

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error("Create ticket error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
