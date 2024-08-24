import bcrypt from "bcrypt";

export async function encryptPassword(senha: string) {
  const salt = await bcrypt.genSalt(12);
  const passwordEncrypted = await bcrypt.hash(senha, salt);

  return passwordEncrypted;
}
