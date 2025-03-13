import { NextFunction, Request, Response } from "express";
import jsonwebtoken from "jsonwebtoken";
import EventRepository from "../repositories/EventRepository";

export async function verifyEventPrivacy(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { event_id } = req.params;

    const event = await EventRepository.findEventById(event_id);

    if (!event.isPrivate) {
      next();
    }

    const token = req.headers["event-authorization"] as string;

    if (!token) {
      return res.status(401).json({ message: "Acesso negado" });
    }

    jsonwebtoken.verify(
      token,
      process.env.SECRET || "",
      (err: jsonwebtoken.VerifyErrors | null, decoded?: any) => {
        if (err) {
          return res.status(401).send({ message: "Token inválido" });
        }

        next();
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    return res
      .status(500)
      .json({ message: "An unexpected error occurred", error: error });
  }
}
