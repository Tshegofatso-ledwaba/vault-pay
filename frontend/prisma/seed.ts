import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: "CUSTOMER" },
      update: {},
      create: { name: "CUSTOMER", description: "Customer" },
    }),
    prisma.role.upsert({
      where: { name: "SUPPORT_AGENT" },
      update: {},
      create: { name: "SUPPORT_AGENT", description: "Support Agent" },
    }),
    prisma.role.upsert({
      where: { name: "COMPLIANCE_OFFICER" },
      update: {},
      create: { name: "COMPLIANCE_OFFICER", description: "Compliance Officer" },
    }),
    prisma.role.upsert({
      where: { name: "FINANCE_OFFICER" },
      update: {},
      create: { name: "FINANCE_OFFICER", description: "Finance Officer" },
    }),
    prisma.role.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: { name: "ADMIN", description: "Administrator" },
    }),
  ]);

  const roleByName = Object.fromEntries(roles.map((role) => [role.name, role]));

  const demoUsers = [
    { firstName: "Demo", lastName: "Customer", email: "customer@vaultpay.demo", password: "VaultPay123!", role: roleByName.CUSTOMER, status: "ACTIVE" as const },
    { firstName: "Demo", lastName: "Support", email: "support@vaultpay.demo", password: "VaultPay123!", role: roleByName.SUPPORT_AGENT, status: "ACTIVE" as const },
    { firstName: "Demo", lastName: "Compliance", email: "compliance@vaultpay.demo", password: "VaultPay123!", role: roleByName.COMPLIANCE_OFFICER, status: "ACTIVE" as const },
    { firstName: "Demo", lastName: "Finance", email: "finance@vaultpay.demo", password: "VaultPay123!", role: roleByName.FINANCE_OFFICER, status: "ACTIVE" as const },
    { firstName: "Demo", lastName: "Admin", email: "admin@vaultpay.demo", password: "VaultPay123!", role: roleByName.ADMIN, status: "ACTIVE" as const },
  ];

  for (const demoUser of demoUsers) {
    const existing = await prisma.user.findUnique({ where: { email: demoUser.email } });
    if (!existing) {
      const user = await prisma.user.create({
        data: {
          firstName: demoUser.firstName,
          lastName: demoUser.lastName,
          email: demoUser.email,
          passwordHash: await bcrypt.hash(demoUser.password, 10),
          status: demoUser.status,
          emailVerified: true,
          roleId: demoUser.role.id,
        },
      });

      await prisma.account.create({
        data: {
          userId: user.id,
          accountReference: `VP-${user.id.slice(0, 8).toUpperCase()}`,
          currency: "USD",
          status: "ACTIVE",
          availableBalance: 25000,
          ledgerBalance: 25000,
          version: 1,
        },
      });
    }
  }

  const customer = await prisma.user.findUnique({ where: { email: "customer@vaultpay.demo" } });
  if (customer) {
    await prisma.notification.createMany({
      data: [
        { userId: customer.id, type: "TRANSACTION_SUCCESS", title: "Deposit received", body: "Your sandbox deposit has been credited.", readAt: null },
        { userId: customer.id, type: "SECURITY_ALERT", title: "Login from a new device", body: "A recent login was detected from a new device.", readAt: null },
      ],
    });
  }
}

main().then(() => prisma.$disconnect());
