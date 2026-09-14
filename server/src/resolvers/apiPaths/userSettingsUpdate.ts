import { UserSettingsUpdateBody } from "@/_generated/be_fe.zod";
import knex from "@/knexWrapper";
import { restAPICall } from "@/utils/restAPI";

export const userSettingsUpdate = restAPICall(
  "mathematador",
  "userSettingsUpdate",
  async (request, response): Promise<void> => {
    const userId = request.userId;
    if (!userId) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { settingKey, settingValue } = request.body;

    // Always a fresh insert, never an update-in-place - this table is an
    // append-only history log, so every change is its own row.
    const [insertedRow] = await knex("user_settings_history")
      .insert({
        user_id: userId,
        setting_key: settingKey,
        setting_value: settingValue
      })
      .returning("created");

    response.status(200).json({
      settingKey,
      settingValue,
      changedAt: insertedRow.created.toISOString()
    });
  },
  {
    body: UserSettingsUpdateBody
  }
);
