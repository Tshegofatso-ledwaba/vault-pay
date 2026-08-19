import { NextResponse } from "next/server";
import { z } from "zod";
import { registerUser } from "@/lib/services/auth.service";
import { createSession } from "@/lib/auth/session";

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    const user = await registerUser(data);
    await createSession(user.id, request.headers.get("user-agent") ?? undefined);

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: error.issues[0]?.message ?? "Invalid input" } }, { status: 400 });
    }

    if ((error as Error).message === "USER_EXISTS") {
      return NextResponse.json({ success: false, error: { code: "USER_EXISTS", message: "An account with this email already exists." } }, { status: 409 });
    }

    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}
