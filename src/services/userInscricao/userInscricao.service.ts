import LoteRepository from "../../repositories/LoteRepository";
import UserInscricaoRepository from "../../repositories/UserInscricaoRepository";

export class UserInscricaoService {
  public static async verifyGuests(user_id: string, lote_id: string) {
    const lote = await LoteRepository.findLoteById(lote_id);

    if (!lote) {
      throw new Error("Lote não encontrado");
    }

    const userGuestSubscriptions =
      await UserInscricaoRepository.findUserGuestSubscriptions(
        user_id,
        lote.uuid_evento
      );

    console.log(userGuestSubscriptions);

    if (userGuestSubscriptions.length >= 2) {
      throw new Error("Limite de convidados atingido");
    }
    return userGuestSubscriptions;
  }
}
