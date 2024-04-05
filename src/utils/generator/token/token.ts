
import { sign, verify } from "hono/jwt";

import { env } from "hono/adapter";


export const generateJwtToken = (userId: any, JWT_SECRET: string) => {
  const payload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    iat: true,
  };
  return sign(payload, JWT_SECRET);
};

export const verifyUserToken = async (c: any, next: any) => {
  try {
    const { JWT_SECRET } = env<{ DATABASE_URL: string; JWT_SECRET: string }>(c);

    const authHeader = c.req.header("Authorization");

    const token = authHeader?.split(" ")[1];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      c.status(400);
      return c.json({
        msg: "Please provide authorization token in header",
        status: 400,
        data: {},
      });
    }

    const decoded: any = await verify(token, JWT_SECRET);
    if (!decoded) {
      c.status(401);
      return c.json({
        message: "Invalid or expired token",
        status: 401,
      });
    }

    return next();
  } catch (error:any) {
    c.status(401);
    return c.json({
      message: "Unauthenticated token , Please try again",
      status: 401,
      error: error.message,
    });
  }
};