import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo users
  const hashedPassword = await bcrypt.hash("password123", 12);

  const employee1 = await prisma.user.upsert({
    where: { username: "pratikka@incubxperts.com" },
    update: {},
    create: {
      username: "pratikka@incubxperts.com",
      password: hashedPassword,
      name: "John Employee",
      role: "EMPLOYEE",
    },
  });

  const employee2 = await prisma.user.upsert({
    where: { username: "pratikka@incubxperts.com" },
    update: {},
    create: {
      username: "pratikka@incubxperts.com",
      password: hashedPassword,
      name: "Jane Employee",
      role: "EMPLOYEE",
    },
  });

  const adminManager = await prisma.user.upsert({
    where: { username: "harikaa@incubxperts.com" },
    update: {},
    create: {
      username: "harikaa@incubxperts.com",
      password: hashedPassword,
      name: "Admin Manager",
      role: "ADMIN",
      department: "ADMIN",
    },
  });

  const financeManager = await prisma.user.upsert({
    where: { username: "vrushalim@incubxperts.com" },
    update: {},
    create: {
      username: "vrushalim@incubxperts.com",
      password: hashedPassword,
      name: "Finance Manager",
      role: "FINANCE",
      department: "FINANCE",
    },
  });

  // const hrManager = await prisma.user.upsert({
  //   where: { username: "pratikka@incubxperts.com" },
  //   update: {},
  //   create: {
  //     username: "pratikka@incubxperts.com",
  //     password: hashedPassword,
  //     name: "HR Manager",
  //     role: "HR",
  //     department: "HR",
  //   },
  // });

  // Create sample tickets
  const tickets = [
    {
      subject:
        "[IT Assets - Laptop/Desktop Request] Need new development laptop",
      description:
        "My current laptop is too slow for development work. Need a new one with better specs.",
      department: "ADMIN",
      priority: "HIGH",
      status: "OPEN",
      category: "IT Assets",
      subcategory: "Laptop/Desktop Request",
      createdBy: employee1.id,
    },
    {
      subject: "[Reimbursements - Travel] Travel expense reimbursement",
      description:
        "Need reimbursement for client meeting travel expenses from last week.",
      department: "FINANCE",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      category: "Reimbursements",
      subcategory: "Travel",
      createdBy: employee1.id,
    },
    {
      subject: "[Leave & Attendance - Leave Balance Query] Check leave balance",
      description:
        "Want to check my current leave balance and plan upcoming vacation.",
      department: "HR",
      priority: "LOW",
      status: "CLOSED",
      category: "Leave & Attendance",
      subcategory: "Leave Balance Query",
      createdBy: employee2.id,
    },
    {
      subject: "[Office Facility - AC/Lighting Issues] AC not working properly",
      description:
        "The air conditioning in conference room B is not cooling properly.",
      department: "ADMIN",
      priority: "MEDIUM",
      status: "ON_HOLD",
      category: "Office Facility",
      subcategory: "AC/Lighting Issues",
      createdBy: employee2.id,
    },
  ];

  for (const ticketData of tickets) {
    await prisma.ticket.create({
      data: ticketData as any,
    });
  }

  console.log("✅ Database seeded successfully!");
  console.log("\n📝 Demo Users:");
  console.log("- john.employee / password123 (Employee)");
  console.log("- jane.employee / password123 (Employee)");
  console.log("- admin.manager / password123 (Admin Manager)");
  console.log("- finance.manager / password123 (Finance Manager)");
  console.log("- hr.manager / password123 (HR Manager)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
