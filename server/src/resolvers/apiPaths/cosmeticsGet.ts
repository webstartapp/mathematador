import { Cosmetic } from "@/_generated/model";
import knex from "@/knexWrapper";
import { restAPICall } from "@/utils/restAPI";

export const cosmeticsGet = restAPICall("mathematador", "cosmeticsGetAll", async (request, response): Promise<void> => {
  const userId = request.userId;

  if (!userId) {
    response.status(401).json({ message: "Unauthorized" });
    return;
  }

  const cosmetics = await knex("cosmetics").select("*");

  const formattedCosmetics = cosmetics.map<Cosmetic>((cosmeticItem) => {
    const cosmeticType: "cape" | "suit" | "flare" =
      cosmeticItem.type === "cape" || cosmeticItem.type === "suit" || cosmeticItem.type === "flare"
        ? cosmeticItem.type
        : "cape";

    return {
      id: cosmeticItem.id,
      name: cosmeticItem.name,
      type: cosmeticType,
      price: cosmeticItem.price,
      assetId: cosmeticItem.asset_id,
      requiredLevel: cosmeticItem.required_level
    };
  });

  response.status(200).json(formattedCosmetics);
});
