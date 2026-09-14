import knex from "@/knexWrapper";
import { restAPICall } from "@/utils/restAPI";
import { mapSettingsHistoryRows } from "@/utils/userSettingsMapper";

export const userSettingsGetHistory = restAPICall(
  "mathematador",
  "userSettingsGetHistory",
  async (request, response): Promise<void> => {
    const userId = request.userId;
    if (!userId) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const historyRows = await knex("user_settings_history")
      .where({ user_id: userId })
      .orderBy("created", "desc")
      .select("setting_key", "setting_value", "created");

    response.status(200).json(mapSettingsHistoryRows(historyRows));
  }
);
