import { prisma } from "@/lib/db";

export type TransactionAction = "transfer" | "deposit" | "withdrawal";

export async function createMoneyMovement(params: {
  userId: string;
  action: TransactionAction;
  amount: number;
  recipientEmail?: string;
  note?: string;
}) {
  const { userId, action, amount, recipientEmail, note } = params;

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("INVALID_AMOUNT");
  }

  if (action === "transfer") {
    if (!recipientEmail) {
      throw new Error("RECIPIENT_REQUIRED");
    }

    const senderAccount = await prisma.account.findFirst({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });

    if (!senderAccount) {
      throw new Error("NO_ACCOUNT_FOUND");
    }

    const recipientUser = await prisma.user.findUnique({
      where: { email: recipientEmail.toLowerCase() },
    });

    if (!recipientUser) {
      throw new Error("RECIPIENT_NOT_FOUND");
    }

    const recipientAccount = await prisma.account.findFirst({
      where: { userId: recipientUser.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });

    if (!recipientAccount) {
      throw new Error("RECIPIENT_ACCOUNT_NOT_FOUND");
    }

    return prisma.$transaction(async (tx) => {
      const senderSnapshot = await tx.account.findUnique({ where: { id: senderAccount.id } });
      const recipientSnapshot = await tx.account.findUnique({ where: { id: recipientAccount.id } });

      if (!senderSnapshot || !recipientSnapshot) {
        throw new Error("ACCOUNT_NOT_FOUND");
      }

      const senderBalance = Number(senderSnapshot.availableBalance.toString());
      if (senderBalance < amount) {
        throw new Error("INSUFFICIENT_FUNDS");
      }

      const senderNewBalance = senderBalance - amount;
      const recipientNewBalance = Number(recipientSnapshot.availableBalance.toString()) + amount;

      await tx.account.update({
        where: { id: senderAccount.id },
        data: {
          availableBalance: senderNewBalance,
          ledgerBalance: senderNewBalance,
          version: { increment: 1 },
        },
      });

      await tx.account.update({
        where: { id: recipientAccount.id },
        data: {
          availableBalance: recipientNewBalance,
          ledgerBalance: recipientNewBalance,
          version: { increment: 1 },
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          publicRef: `TRX-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          sourceAccountId: senderAccount.id,
          destinationAccountId: recipientAccount.id,
          senderUserId: userId,
          receiverUserId: recipientUser.id,
          amount,
          currency: "ZAR",
          type: "TRANSFER",
          status: "COMPLETED",
          riskStatus: "LOW",
          note: note ?? "Wallet transfer",
        },
      });

      await tx.ledgerEntry.createMany({
        data: [
          {
            transactionId: transaction.id,
            accountId: senderAccount.id,
            entryType: "DEBIT",
            amount: amount,
            balanceAfter: senderNewBalance,
          },
          {
            transactionId: transaction.id,
            accountId: recipientAccount.id,
            entryType: "CREDIT",
            amount: amount,
            balanceAfter: recipientNewBalance,
          },
        ],
      });

      await tx.notification.createMany({
        data: [
          {
            userId: userId,
            type: "TRANSACTION_SUCCESS",
            title: "Transfer sent",
            body: `You sent R${amount.toFixed(2)} to ${recipientUser.email}.`,
          },
          {
            userId: recipientUser.id,
            type: "TRANSACTION_SUCCESS",
            title: "Transfer received",
            body: `You received R${amount.toFixed(2)} from ${userId}.`,
          },
        ],
      });

      return transaction;
    });
  }

  const account = await prisma.account.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  if (!account) {
    throw new Error("NO_ACCOUNT_FOUND");
  }

  return prisma.$transaction(async (tx) => {
    const current = await tx.account.findUnique({ where: { id: account.id } });
    if (!current) {
      throw new Error("ACCOUNT_NOT_FOUND");
    }

    const currentBalance = Number(current.availableBalance.toString());
    const nextBalance = action === "deposit" ? currentBalance + amount : currentBalance - amount;

    if (action === "withdrawal" && nextBalance < 0) {
      throw new Error("INSUFFICIENT_FUNDS");
    }

    await tx.account.update({
      where: { id: account.id },
      data: {
        availableBalance: nextBalance,
        ledgerBalance: nextBalance,
        version: { increment: 1 },
      },
    });

    const transaction = await tx.transaction.create({
      data: {
        publicRef: `TRX-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        sourceAccountId: action === "withdrawal" ? account.id : null,
        destinationAccountId: action === "deposit" ? account.id : null,
        senderUserId: action === "withdrawal" ? userId : null,
        receiverUserId: action === "deposit" ? userId : null,
        amount,
        currency: "ZAR",
        type: action === "deposit" ? "DEPOSIT" : "WITHDRAWAL",
        status: "COMPLETED",
        riskStatus: "LOW",
        note: note ?? (action === "deposit" ? "Wallet top-up" : "Wallet withdrawal"),
      },
    });

    await tx.ledgerEntry.create({
      data: {
        transactionId: transaction.id,
        accountId: account.id,
        entryType: action === "deposit" ? "CREDIT" : "DEBIT",
        amount,
        balanceAfter: nextBalance,
      },
    });

    await tx.notification.create({
      data: {
        userId,
        type: "TRANSACTION_SUCCESS",
        title: action === "deposit" ? "Top-up received" : "Withdrawal processed",
        body: action === "deposit"
          ? `Your wallet was topped up by R${amount.toFixed(2)}.`
          : `A withdrawal of R${amount.toFixed(2)} was processed.`,
      },
    });

    return transaction;
  });
}
