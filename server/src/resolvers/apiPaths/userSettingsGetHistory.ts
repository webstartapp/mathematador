import * as zod from "zod";

import knex from "@/knexWrapper";
import { restAPICall } from "@/utils/restAPI";
import { mapSettingsHistoryRows } from "@/utils/userSettingsMapper";

const DEFAULT_HISTORY_PAGE_SIZE = 50;
const MAX_HISTORY_PAGE_SIZE = 200;

const HistoryCursorSchema = zod.object({
  created: zod.string(),
  id: zod.string()
});
type HistoryCursor = zod.infer<typeof HistoryCursorSchema>;

// Opaque to the client - just base64 JSON internally. Encodes both columns
// of the composite sort key, not just `id` alone: a backfilled row (see
// the migration/userConsentRecord.ts) can carry an older `created` than
// its actual insertion order (`id`) reflects, so `id` alone can't reliably
// resume an ORDER BY created DESC, id DESC listing - only the pair can.
const encodeHistoryCursor = (cursor: HistoryCursor): string => Buffer.from(JSON.stringify(cursor)).toString("base64");

// safeParse (not a type assertion, which this repo's lint config bans) is
// what actually narrows the untyped JSON.parse result - an invalid/
// malformed/stale cursor (including one that isn't even valid JSON) is
// treated the same as no cursor at all (see the caller below) rather than
// failing the request over a value that's opaque to the client anyway.
const decodeHistoryCursor = (rawCursor: string): HistoryCursor | null => {
  try {
    const decodedJson = Buffer.from(rawCursor, "base64").toString("utf8");
    const parsedCursor = HistoryCursorSchema.safeParse(JSON.parse(decodedJson));
    return parsedCursor.success ? parsedCursor.data : null;
  } catch {
    return null;
  }
};

export const userSettingsGetHistory = restAPICall(
  "mathematador",
  "userSettingsGetHistory",
  async (request, response): Promise<void> => {
    const userId = request.userId;
    if (!userId) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const requestedLimit = Number(request.query.limit);
    const pageSize =
      Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, MAX_HISTORY_PAGE_SIZE)
        : DEFAULT_HISTORY_PAGE_SIZE;

    const rawCursor = typeof request.query.cursor === "string" ? request.query.cursor : null;
    const cursor = rawCursor ? decodeHistoryCursor(rawCursor) : null;

    let historyQuery = knex("user_settings_history").where({ user_id: userId });
    if (cursor) {
      historyQuery = historyQuery.andWhereRaw("(created, id) < (?, ?)", [cursor.created, cursor.id]);
    }

    // Fetches one extra row (pageSize + 1) purely to detect whether a next
    // page exists without a separate COUNT query - that extra row is never
    // included in the response itself.
    const rows = await historyQuery
      .orderBy([
        { column: "created", order: "desc" },
        { column: "id", order: "desc" }
      ])
      .limit(pageSize + 1)
      .select("setting_key", "setting_value", "created", "device_id", "id");

    const hasNextPage = rows.length > pageSize;
    const pageRows = hasNextPage ? rows.slice(0, pageSize) : rows;
    const lastRow = pageRows[pageRows.length - 1];

    response.status(200).json({
      items: mapSettingsHistoryRows(pageRows),
      nextCursor:
        hasNextPage && lastRow ? encodeHistoryCursor({ created: lastRow.created.toISOString(), id: lastRow.id }) : null
    });
  }
);
