import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { createMoneyMovement } from "@/lib/services/transaction.service";

const schema = z.object({
  action: z.enum(["transfer", "deposit", "withdrawal"]),
  amount: z.number().positive(),
  recipientEmail: z.string().email().optional(),
  note: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Please sign in to continue." } }, { status: 401 });
    }

    const body = await request.json();
    const data = schema.parse(body);

    const transaction = await createMoneyMovement({
      userId: user.id,
      action: data.action,
      amount: data.amount,
      recipientEmail: data.recipientEmail,
      note: data.note,
    });

    return NextResponse.json({ success: true, transaction }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: error.issues[0]?.message ?? "Invalid input" } }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Transaction failed.";
    const errorMap: Record<string, { code: string; status: number; message: string }> = {
      INVALID_AMOUNT: { code: "INVALID_AMOUNT", status: 400, message: "Amount must be greater than zero." },
      RECIPIENT_REQUIRED: { code: "RECIPIENT_REQUIRED", status: 400, message: "A recipient email is required for transfers." },
      NO_ACCOUNT_FOUND: { code: "NO_ACCOUNT_FOUND", status: 404, message: "No active account was found for this user." },
      RECIPIENT_NOT_FOUND: { code: "RECIPIENT_NOT_FOUND", status: 404, message: "Recipient account not found." },
      RECIPIENT_ACCOUNT_NOT_FOUND: { code: "RECIPIENT_ACCOUNT_NOT_FOUND", status: 404, message: "Recipient account is not active." },
      ACCOUNT_NOT_FOUND: { code: "ACCOUNT_NOT_FOUND", status: 404, message: "Account was not found." },
      INSUFFICIENT_FUNDS: { code: "INSUFFICIENT_FUNDS", status: 400, message: "Insufficient funds for this transaction." },
    };

    const mapped = errorMap[message] ?? { code: "TRANSACTION_FAILED", status: 500, message: "Transaction failed." };
    return NextResponse.json({ success: false, error: { code: mapped.code, message: mapped.message } }, { status: mapped.status });
  }
}
