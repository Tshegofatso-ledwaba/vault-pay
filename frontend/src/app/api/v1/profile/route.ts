import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Please sign in to continue." } }, { status: 401 });
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, firstName: true, lastName: true, email: true, phone: true, createdAt: true },
    });

    if (!profile) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "User not found." } }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch profile." } }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Please sign in to continue." } }, { status: 401 });
    }

    const body = await request.json();
    const data = schema.parse(body);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
      select: { id: true, firstName: true, lastName: true, email: true, phone: true, createdAt: true },
    });

    return NextResponse.json({ success: true, profile: updated }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: error.issues[0]?.message ?? "Invalid input" } }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to update profile." } }, { status: 500 });
  }
}
