import { prisma } from "../../lib/prisma";

export async function deleteUserByUserId(uuid_user: string) {
    await prisma.userAtividade.deleteMany({
        where: {
            uuid_user
        }
    })

    await prisma.userInscricao.deleteMany({
        where: {
            uuid_user
        }
    })

    await prisma.usuario.delete({
        where: {
            uuid_user
        }
    })
}