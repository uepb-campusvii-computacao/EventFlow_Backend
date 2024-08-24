import bcrypt from "bcrypt";

export async function checkPassword(password: string, password_encrypted: string){
    const check_password = await bcrypt.compare(password, password_encrypted);

    return check_password;
}