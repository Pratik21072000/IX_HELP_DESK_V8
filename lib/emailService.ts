import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import type { Ticket, User } from "@/lib/types";

// Initialize SES client
const sesClient = new SESClient({
  region: process.env.AWS_SES_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Department email mapping
const DEPARTMENT_EMAILS = {
  ADMIN: process.env.ADMIN_EMAIL || "harikaa@incubxperts.com",
  FINANCE: process.env.FINANCE_EMAIL || "vrushalim@incubxperts.com",
  HR: process.env.HR_EMAIL || "pratikka@incubxperts.com",
} as const;

// Priority labels for better readability
const PRIORITY_LABELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
} as const;

// Status labels for better readability
const STATUS_LABELS = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  ON_HOLD: "On Hold",
  CANCELLED: "Cancelled",
  CLOSED: "Closed",
} as const;

// Department labels for better readability
const DEPARTMENT_LABELS = {
  ADMIN: "Administration",
  FINANCE: "Finance",
  HR: "Human Resources",
} as const;

/**
 * Generate HTML email template for new ticket notification
 */
function generateTicketEmailHTML(ticket: Ticket & { user: User }): string {
  const priorityColor =
    ticket.priority === "HIGH"
      ? "#dc2626"
      : ticket.priority === "MEDIUM"
        ? "#ea580c"
        : "#16a34a";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Support Ticket Created</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #374151; color: #d1d5db; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; }
        .ticket-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af; }
        .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
        .label { font-weight: bold; color: #374151; }
        .value { color: #6b7280; }
        .priority { padding: 4px 12px; border-radius: 20px; color: white; font-weight: bold; font-size: 12px; }
        .description-box { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .btn { background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; }
        .urgent { color: #dc2626; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎫 New Support Ticket Created</h1>
          <p>A new support ticket has been submitted to your department</p>
        </div>
        
        <div class="content">
          <div class="ticket-info">
            <h2 style="margin-top: 0; color: #1e40af;">Ticket #${ticket.id}</h2>
            
            <div class="info-row">
              <span class="label">Subject:</span>
              <span class="value">${ticket.subject}</span>
            </div>
            
            <div class="info-row">
              <span class="label">Priority:</span>
              <span class="priority" style="background-color: ${priorityColor};">
                ${PRIORITY_LABELS[ticket.priority as keyof typeof PRIORITY_LABELS]}
              </span>
            </div>
            
            <div class="info-row">
              <span class="label">Department:</span>
              <span class="value">${DEPARTMENT_LABELS[ticket.department as keyof typeof DEPARTMENT_LABELS]}</span>
            </div>
            
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="value">${STATUS_LABELS[ticket.status as keyof typeof STATUS_LABELS]}</span>
            </div>
            
            <div class="info-row">
              <span class="label">Created By:</span>
              <span class="value">${ticket.user.name} (${ticket.user.role})</span>
            </div>
            
            <div class="info-row">
              <span class="label">Created At:</span>
              <span class="value">${new Date(ticket.createdAt).toLocaleString(
                "en-US",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZoneName: "short",
                },
              )}</span>
            </div>
            
            ${
              ticket.category
                ? `
            <div class="info-row">
              <span class="label">Category:</span>
              <span class="value">${ticket.category}</span>
            </div>
            `
                : ""
            }
            
            ${
              ticket.subcategory
                ? `
            <div class="info-row">
              <span class="label">Subcategory:</span>
              <span class="value">${ticket.subcategory}</span>
            </div>
            `
                : ""
            }
          </div>
          
          <h3 style="color: #374151;">Description:</h3>
          <div class="description-box">
            ${ticket.description.replace(/\n/g, "<br>")}
          </div>
          
          ${
            ticket.priority === "HIGH"
              ? `
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p class="urgent">⚠️ HIGH PRIORITY TICKET</p>
            <p style="margin: 5px 0; color: #991b1b;">This ticket requires immediate attention due to its high priority status.</p>
          </div>
          `
              : ""
          }
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login" class="btn">
              View Ticket in Dashboard
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
          
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 15px;">
            <h4 style="margin-top: 0; color: #1e40af;">📋 Next Steps:</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Review the ticket details carefully</li>
              <li>Assign the ticket to an appropriate team member</li>
              <li>Update the ticket status as work progresses</li>
              <li>Communicate with the requester if additional information is needed</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>HelpDesk System | ${DEPARTMENT_LABELS[ticket.department as keyof typeof DEPARTMENT_LABELS]} Department</p>
          <p style="font-size: 12px; margin: 5px 0;">
            This is an automated notification. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate plain text email for new ticket notification
 */
function generateTicketEmailText(ticket: Ticket & { user: User }): string {
  return `
NEW SUPPORT TICKET CREATED

Ticket #${ticket.id}
Subject: ${ticket.subject}
Priority: ${PRIORITY_LABELS[ticket.priority as keyof typeof PRIORITY_LABELS]}
Department: ${DEPARTMENT_LABELS[ticket.department as keyof typeof DEPARTMENT_LABELS]}
Status: ${STATUS_LABELS[ticket.status as keyof typeof STATUS_LABELS]}
Created By: ${ticket.user.name} (${ticket.user.role})
Created At: ${new Date(ticket.createdAt).toLocaleString()}
${ticket.category ? `Category: ${ticket.category}` : ""}
${ticket.subcategory ? `Subcategory: ${ticket.subcategory}` : ""}

Description:
${ticket.description}

${ticket.priority === "HIGH" ? "\n⚠️ HIGH PRIORITY TICKET - Requires immediate attention!\n" : ""}

Please log in to the HelpDesk system to view and manage this ticket:
${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login

---
HelpDesk System | ${DEPARTMENT_LABELS[ticket.department as keyof typeof DEPARTMENT_LABELS]} Department
This is an automated notification.
  `.trim();
}

/**
 * Send email notification for new ticket
 */
export async function sendTicketCreatedEmail(
  ticket: Ticket & { user: User },
): Promise<void> {
  try {
    const departmentEmail =
      DEPARTMENT_EMAILS[ticket.department as keyof typeof DEPARTMENT_EMAILS];
    const fromEmail = process.env.SES_FROM_EMAIL || "noreply@company.com";

    if (!departmentEmail) {
      console.error(`No email configured for department: ${ticket.department}`);
      return;
    }

    // Validate AWS credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error("AWS SES credentials not configured");
      return;
    }

    const priorityPrefix = ticket.priority === "HIGH" ? "[URGENT] " : "";
    const subject = `${priorityPrefix}New Ticket #${ticket.id}: ${ticket.subject}`;

    const emailParams = {
      Source: fromEmail,
      Destination: {
        ToAddresses: [departmentEmail],
        // Optional: CC other relevant people
        CcAddresses: process.env.CC_EMAILS
          ? process.env.CC_EMAILS.split(",")
          : [],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: generateTicketEmailHTML(ticket),
            Charset: "UTF-8",
          },
          Text: {
            Data: generateTicketEmailText(ticket),
            Charset: "UTF-8",
          },
        },
      },
    };

    const command = new SendEmailCommand(emailParams);
    const response = await sesClient.send(command);

    console.log(
      `Email sent successfully for ticket #${ticket.id}: ${JSON.stringify(emailParams, null, 2)}`,
      response,
    );
  } catch (error) {
    console.error("Failed to send ticket notification email:", error);
    // Don't throw error to avoid breaking ticket creation if email fails
  }
}

/**
 * Send email notification for ticket status updates
 */
export async function sendTicketUpdateEmail(
  ticket: Ticket & { user: User },
  oldStatus: string,
  newStatus: string,
  comment?: string,
): Promise<void> {
  try {
    const fromEmail = process.env.SES_FROM_EMAIL || "noreply@company.com";

    // Send notification to ticket creator
    if (!ticket.user.username || !ticket.user.username.includes("@")) {
      console.log("Ticket creator doesn't have a valid email address");
      return;
    }

    const subject = `Ticket #${ticket.id} Status Updated: ${newStatus}`;

    const htmlBody = `
      <h2>Ticket Status Update</h2>
      <p>Your ticket #${ticket.id} status has been updated.</p>
      <p><strong>Subject:</strong> ${ticket.subject}</p>
      <p><strong>Status:</strong> ${oldStatus} → ${newStatus}</p>
      ${comment ? `<p><strong>Comment:</strong> ${comment}</p>` : ""}
      <p>View your ticket: <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/my-tickets">My Tickets</a></p>
    `;

    const textBody = `
Ticket Status Update

Your ticket #${ticket.id} status has been updated.
Subject: ${ticket.subject}
Status: ${oldStatus} → ${newStatus}
${comment ? `Comment: ${comment}` : ""}

View your ticket: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/my-tickets
    `;

    const emailParams = {
      Source: fromEmail,
      Destination: {
        ToAddresses: [ticket.user.username],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: "UTF-8",
          },
          Text: {
            Data: textBody,
            Charset: "UTF-8",
          },
        },
      },
    };

    const command = new SendEmailCommand(emailParams);
    await sesClient.send(command);

    console.log(`Status update email sent for ticket #${ticket.id}`);
  } catch (error) {
    console.error("Failed to send ticket update email:", error);
  }
}
