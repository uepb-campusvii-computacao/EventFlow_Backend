import { prisma } from "../../plugins/prisma";

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

    await prisma.userEvento.deleteMany({
        where: {
            uuid_user
        }
    })
}