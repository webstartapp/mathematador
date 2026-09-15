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

    // Capped - this is an append-only, ever-growing log with no pruning of
    // its own, so an unbounded response isn't warranted for what's meant
    // to be a human-readable recent-changes view, not a full audit export.
    const HISTORY_ROW_LIMIT = 200;

    const historyRows = await knex("user_settings_history")
      .where({ user_id: userId })
      .orderBy([
        { column: "created", order: "desc" },
        { column: "id", order: "desc" }
      ])
      .limit(HISTORY_ROW_LIMIT)
      .select("setting_key", "setting_value", "created", "device_id");

    response.status(200).json(mapSettingsHistoryRows(historyRows));
  }
);
