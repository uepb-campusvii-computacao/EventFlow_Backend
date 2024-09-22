import { Perfil } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

export async function verifyAdminUserRole(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const role = req.params.role;

  console.log(role)

  if (role !== Perfil.ADMIN) {
    return res.status(403).send("Acesso negado");
  }

  next();
}
