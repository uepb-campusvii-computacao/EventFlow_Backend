import { Perfil } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function verifyAdminUserRoleInEvent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const event_id  = req.params.event_id;
  const user_id = req.params.user_id;

  const response = await prisma.userEvento.findUnique({
    where: {
      uuid_user_uuid_evento: {
        uuid_evento: event_id,
        uuid_user: user_id
      }
    }
  })

  if (response?.perfil === Perfil.PARTICIPANTE) {
    return res.status(403).send("Acesso negado");
  }

  next();
}
