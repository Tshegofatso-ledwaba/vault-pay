import { NextResponse } from "next/server";
import { z } from "zod";
import { loginUser } from "@/lib/services/auth.service";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    const result = await loginUser(data);

    return NextResponse.json({ success: true, user: { id: result.user.id, email: result.user.email, role: result.user.role.name } }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: error.issues[0]?.message ?? "Invalid input" } }, { status: 400 });
    }

    if ((error as Error).message === "INVALID_CREDENTIALS") {
      return NextResponse.json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." } }, { status: 401 });
    }

    if ((error as Error).message === "ACCOUNT_INACTIVE") {
      return NextResponse.json({ success: false, error: { code: "ACCOUNT_INACTIVE", message: "Your account is not active." } }, { status: 403 });
    }

    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Authentication failed." } }, { status: 500 });
  }
}
