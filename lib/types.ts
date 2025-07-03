import type { User, Ticket } from "@prisma/client";

// Define custom types since Prisma schema uses strings
export type UserRole = "EMPLOYEE" | "ADMIN" | "FINANCE" | "HR";
export type Department = "ADMIN" | "FINANCE" | "HR";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";
export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "CANCELLED"
  | "CLOSED";

export type { User, Ticket };

export interface TicketWithUser extends Ticket {
  user: User;
}

export interface TicketFilters {
  department?: Department;
  priority?: TicketPriority;
  status?: TicketStatus;
  search?: string;
}

export interface DashboardStats {
  total: number;
  open: number;
  inProgress: number;
  onHold: number;
  cancelled: number;
  closed: number;
  byDepartment: {
    admin: number;
    finance: number;
    hr: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface CreateTicketData {
  subject: string;
  description: string;
  department: Department;
  priority: TicketPriority;
  category?: string;
  subcategory?: string;
  attachments: any;
}

export interface UpdateTicketData {
  subject?: string;
  description?: string;
  department?: Department;
  priority?: TicketPriority;
  status?: TicketStatus;
  category?: string;
  subcategory?: string;
  comment?: string;
}

// Department structure for hierarchical dropdowns
export const DEPARTMENT_STRUCTURE = {
  ADMIN: {
    "Office Facility": [
      "AC/Lighting Issues",
      "Desk Setup",
      "Cleanliness",
      "Power Outage",
      "Pest Control",
    ],
    "IT Assets": [
      "Laptop/Desktop Request",
      "Accessory Request",
      "Disposal Request",
    ],
    "ID Card & Access": [
      "ID Card Issue/Loss",
      "Door Access Request",
      "Visitor Pass",
      "Biometric Issue",
    ],
    "Travel & Transport": [
      "Cab Booking",
      "Travel Reimbursement",
      "Itinerary Change",
    ],
    "Stationery & Supplies": [
      "New Request",
      "Refill Request",
      "Printer Ink Request",
    ],
    Housekeeping: [
      "Cleaning Request",
      "Pantry Supplies",
      "Water Dispenser Issues",
    ],
    Maintenance: ["Furniture Repair", "Electrical Issue", "Plumbing"],
  },
  HR: {
    "Leave & Attendance": [
      "Leave Balance Query",
      "Attendance Correction",
      "Comp Off Request",
    ],
    "Employee Records": ["Document Request", "Name/Address Update"],
    Onboarding: ["Laptop Allocation", "Document Submission"],
    "Exit Process": ["Clearance", "Final Settlement"],
    "Policy & Compliance": ["Leave Policy", "Code of Conduct"],
    "Employee Benefits": ["Insurance", "Wellness Program"],
  },
  FINANCE: {
    Reimbursements: ["Travel", "Food", "WFH Setup"],
    "Payroll & Salary": [
      "Salary Discrepancy",
      "Payslip Request",
      "Tax Declaration Help",
      "PF Issues",
    ],
    "Vendor Payments": ["Invoice Submission", "PO Status"],
    Taxation: ["Form 16", "Investment Proof", "TDS Query"],
    "Accounts Payable": ["Payment Follow-up", "Bank Details Update"],
    "Accounts Receivable": ["Invoice Follow-up", "Receipt Confirmation"],
    "Procurement Support": ["PO Creation", "Software Request"],
  },
} as const;
