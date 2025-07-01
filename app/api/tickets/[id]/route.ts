import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isManager, canManageDepartment } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTicketUpdateEmail } from "@/lib/emailService";
import type { UpdateTicketData } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(params.id) },
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

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Check if user can access this ticket
    const canAccess =
      ticket.createdBy === user.id ||
      canManageDepartment(user.role, user.department, ticket.department);

    if (!canAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("Get ticket error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: Number } },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const number = Number(params.id);
    const ticket = await prisma.ticket.findUnique({
      where: { id: number },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const data: UpdateTicketData = await request.json();
    console.log(data);

    // Check permissions
    const isOwner = ticket.createdBy === user.id;
    const isManager = canManageDepartment(
      user.role,
      user.department,
      ticket.department,
    );

    if (!isOwner && !isManager) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Employees can only edit their own open tickets
    if (isOwner && !isManager && ticket.status !== "OPEN") {
      return NextResponse.json(
        { error: "Can only edit open tickets" },
        { status: 403 },
      );
    }

    // Managers can update status, employees can update content
    let updateData: any = {};

    if (isManager) {
      // Managers can update status
      if (data.status) {
        updateData.status = data.status;
      }
    }

    if (isOwner && ticket.status === "OPEN") {
      // Owners can update content of open tickets
      if (data.subject) {
        const cleanSubject = data.subject
          .trim()
          .replace(/[^\w\s\-.,!?()]/g, "");
        updateData.subject =
          data.category && data.subcategory
            ? `[${data.category} - ${data.subcategory}] ${cleanSubject}`
            : cleanSubject;
      }
      if (data.description) {
        updateData.description = data.description.trim();
      }
      if (data.department) {
        updateData.department = data.department;
      }
      if (data.priority) {
        updateData.priority = data.priority;
      }
      if (data.category) {
        updateData.category = data.category;
      }
      if (data.subcategory) {
        updateData.subcategory = data.subcategory;
      }
      if (data.comment) {
        updateData.comment = data.comment;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    updateData.updatedAt = new Date();

    const updatedTicket = await prisma.ticket.update({
      where: { id: number },
      data: updateData,
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

    console.log(updateData.status);
    console.log(ticket.status);
    // Send email notification if status was updated
    if (updateData.status && updateData.status !== ticket.status) {
      try {
        await sendTicketUpdateEmail(
          updatedTicket as any,
          ticket.status,
          updateData.status,
          updateData.comment,
        );
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError);
        // Don't fail the update if email fails
      }
    }

    return NextResponse.json({ ticket: updatedTicket });
  } catch (error) {
    console.error("Update ticket error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const ticketId = parseInt(params.id);
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Only ticket owner or department manager can delete
    const canDelete =
      ticket.createdBy === user.id ||
      canManageDepartment(user.role, user.department, ticket.department);

    if (!canDelete) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await prisma.ticket.delete({
      where: { id: ticketId },
    });

    return NextResponse.json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Delete ticket error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
