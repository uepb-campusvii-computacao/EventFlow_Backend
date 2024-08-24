import { Request, Response, NextFunction } from "express";
import jsonwebtoken from "jsonwebtoken";

export async function checkToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({message: "Acesso negado" });
  }

  jsonwebtoken.verify(
    token,
    process.env.SECRET || "",
    (err: jsonwebtoken.VerifyErrors | null, decoded?: any) => {
      if (err) {
        return res.status(401).send({message: "Token inválido"});
      }

      req.params.id = decoded.id;

      next();
    }
  );
}
