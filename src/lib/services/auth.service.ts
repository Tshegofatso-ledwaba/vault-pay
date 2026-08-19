import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { RoleName, UserStatus } from "@/generated/prisma";

export async function registerUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) {
    throw new Error("USER_EXISTS");
  }

  const role = await prisma.role.findUnique({ where: { name: RoleName.CUSTOMER } });
  if (!role) {
    throw new Error("ROLE_MISSING");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email.toLowerCase(),
      passwordHash,
      phone: input.phone,
      emailVerified: true,
      status: UserStatus.ACTIVE,
      roleId: role.id,
    },
  });

  await prisma.account.create({
    data: {
      userId: user.id,
      accountReference: `VP-${user.id.slice(0, 8).toUpperCase()}`,
      currency: "ZAR",
      status: "ACTIVE",
      availableBalance: 0,
      ledgerBalance: 0,
      version: 0,
    },
  });

  return user;
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    include: { role: true },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new Error("ACCOUNT_INACTIVE");
  }

  const token = await createSession(user.id, "server-agent", "127.0.0.1");
  return { user, token };
}

export async function verifyEmailToken(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, status: UserStatus.ACTIVE },
  });

  return true;
}
