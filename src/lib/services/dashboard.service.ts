import { prisma } from "@/lib/db";

export async function getDashboardData(userId: string) {
  const [accounts, recentTransactions, notifications, balances] = await Promise.all([
    prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaction.findMany({
      where: {
        OR: [{ senderUserId: userId }, { receiverUserId: userId }],
      },
      include: {
        sourceAccount: true,
        destinationAccount: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.account.aggregate({
      where: { userId },
      _sum: {
        availableBalance: true,
        ledgerBalance: true,
      },
    }),
  ]);

  const totalBalance = Number((balances._sum.availableBalance ?? 0).toString());
  const ledgerBalance = Number((balances._sum.ledgerBalance ?? 0).toString());

  return {
    accounts: accounts.map((account) => ({
      ...account,
      availableBalance: Number(account.availableBalance.toString()),
      ledgerBalance: Number(account.ledgerBalance.toString()),
    })),
    totalBalance,
    ledgerBalance,
    recentTransactions: recentTransactions.map((transaction) => ({
      ...transaction,
      amount: Number(transaction.amount.toString()),
    })),
    notifications: notifications.map((notification) => ({
      ...notification,
    })),
  };
}

export async function getAdminOverview() {
  const [usersCount, accountsCount, transactionsCount, alertsCount] = await Promise.all([
    prisma.user.count(),
    prisma.account.count(),
    prisma.transaction.count(),
    prisma.fraudAlert.count(),
  ]);

  const totals = await prisma.account.aggregate({
    _sum: {
      availableBalance: true,
      ledgerBalance: true,
    },
  });

  return {
    usersCount,
    accountsCount,
    transactionsCount,
    alertsCount,
    totalBalance: Number((totals._sum.availableBalance ?? 0).toString()),
  };
}
