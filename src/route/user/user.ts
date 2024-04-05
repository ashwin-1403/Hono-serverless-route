import { env } from "hono/adapter";

import { initializePrismaClient } from "../../utils/prisma/prisma";

export const getUser = async (c: any) => {
  try {

    const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);

    const prisma: any = await initializePrismaClient(DATABASE_URL);

    const user = await prisma.user.findMany();
    
    return c.json({ message: "Data retrieved successfully", data: user });

  } catch (error) {

    console.error("Error retrieving data:", error);

    return c.status(500).json({ message: "Internal server error" });
  }
};

export const stringParser = (str: any) => {
  return str.toString();
};





