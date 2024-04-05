import { env } from "hono/adapter";

import { initializePrismaClient, withPrisma } from "../../utils/prisma/prisma";

import {
  ValidationRule,
  validateInputs,
} from "../../utils/validation/validation";

import { stringParser } from "../user/user";

import { generateNumericId } from "../../utils/generator/id/id";

import { generateJwtToken } from "../../utils/generator/token/token";

import { decrypt, encrypt } from "../../utils/password/password";

export const registerUser = async (c: any) => {
  const { DATABASE_URL, JWT_SECRET } = env<{
    DATABASE_URL: string;
    JWT_SECRET: string;
  }>(c);

  const prisma: any = await initializePrismaClient(DATABASE_URL);

  try {
    const { name, email, phone, password } = await c.req.json();

    const hashedPassword = await encrypt(password, JWT_SECRET);

    const validationRules: ValidationRule[] = [
      {
        condition: email,
        statusCode: 400,
        message: "Please enter email address",
      },
      {
        condition: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        statusCode: 400,
        message: "Invalid email format",
      },
      {
        condition: phone,
        statusCode: 400,
        message: "Please enter phone number",
      },
      {
        condition: /^\d{10}$/.test(phone),
        statusCode: 400,
        message: "Invalid phone number format",
      },
      {
        condition: name && name.length > 0 && name.length <= 15,
        statusCode: 400,
        message: "Name should be between 1 and 15 characters",
      },
      {
        condition: password && password.length > 0 && password.length <= 15,
        statusCode: 400,
        message: "Pasww should be between 1 and 15 characters",
      },
    ];

    const response = validateInputs(c, validationRules);

    if (response) {
      return response;
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: stringParser(email) },
    });

    if (existingUser) {
      c.status(400);
      return c.json({
        message: "User already exists with this email",
        data: {},
      });
    } else {
      const id = Number(generateNumericId(5));

      const token = await generateJwtToken(id, JWT_SECRET);

      await withPrisma(async (prisma) => {
        await prisma.user.create({
          data: {
            id,
            phone,
            email: stringParser(email),
            name: stringParser(name),
            password: hashedPassword,
          },
        });
      }, c);

      return c.json({
        data: "User Registration completed successfully",
        user: { name, email, phone },
        token,
      });
    }
  } catch (error) {
    console.error("Error occurred while adding user:", error);
    c.status(500);
    return c.json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

export const loginUser = async (c: any) => {
  try {
    const { JWT_SECRET } = env<{ DATABASE_URL: string; JWT_SECRET: string }>(c);

    const { email, password } = await c.req.json();

    const validationRules: ValidationRule[] = [
      {
        condition: email,
        statusCode: 400,
        message: "Please enter email address",
      },
      {
        condition: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        statusCode: 400,
        message: "Invalid email format",
      },
      {
        condition: password && password.length > 0 && password.length <= 15,
        statusCode: 400,
        message: "Pasww should be between 1 and 15 characters",
      },
    ];

    const response = validateInputs(c, validationRules);

    if (response) {
      return response;
    }
    let existingUser: any = {};

    await withPrisma(async (prisma) => {
      existingUser = await prisma.user.findUnique({
        where: {
          email: stringParser(email),
        },
      });
    }, c);
    if (decrypt(existingUser?.password,JWT_SECRET)  === password) {
      const token = await generateJwtToken(existingUser.id, JWT_SECRET);
      return c.json({
        data: "Login successful",
        user: {
          name: existingUser.name,
          email: existingUser.email,
          phone: existingUser.phone,
        },
        token,
      });
    } else {
      c.status(401);
      return c.json({ error: "Invalid email or password" });
    }
  } catch (error) {
    c.status(401);
    return c.json({
      message: "Invalid email or password",
      status: 401,
      error: error,
    });
  }
};
