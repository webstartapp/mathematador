import knex from "@/knexWrapper";
import { restAPICall } from "@/utils/restAPI";
import { mapSettingsHistoryRows } from "@/utils/userSettingsMapper";

export const userSettingsGetCurrent = restAPICall(
  "mathematador",
  "userSettingsGetCurrent",
  async (request, response): Promise<void> => {
    const userId = request.userId;
    if (!userId) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Latest row per setting_key - not a separate "current" table to keep
    // in sync, just the newest history row for each key this account has
    // ever changed.
    const currentRows = await knex("user_settings_history")
      .distinctOn("setting_key")
      .where({ user_id: userId })
      .orderBy([{ column: "setting_key" }, { column: "created", order: "desc" }])
      .select("setting_key", "setting_value", "created");

    response.status(200).json(mapSettingsHistoryRows(currentRows));
  }
);
