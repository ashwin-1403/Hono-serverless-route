import { PrismaClient } from "@prisma/client/edge";

import { withAccelerate } from "@prisma/extension-accelerate";

import { env } from "hono/adapter";

type PrismaFunction = (prisma: PrismaClient, c: any) => Promise<any>;

export const initializePrismaClient = async (url: string): Promise<any> => {
    const prisma = new PrismaClient({
      datasourceUrl: url,
    }).$extends(withAccelerate());  
    return prisma;
  };

export const withPrisma = async (callback: PrismaFunction, c: any) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);

  const prisma: any = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    return await callback(prisma, c);
  } catch (error) {
    console.error("Prisma error:", error);

    return c.status(500).json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
    return;
  }
};
