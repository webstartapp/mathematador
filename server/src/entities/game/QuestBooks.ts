import { IQuestBook, IQuestBookRequest } from "@/_generated/sessionOperations";
import knex, { sanateInsertData } from "@/knexWrapper";
import { ExpressTypeResolver } from "@/resolvers/expressTypeResolver";

export const QuestBooksDB = ExpressTypeResolver({
  table: "quest_books",
  resolvers: {
    getQuestBook: async (props: { questBookId: string }) => {
      const questBook = await knex("quest_books").where("id", props.questBookId).first();
      return questBook;
    },
    createQuestBook: async (_props: undefined, body: IQuestBookRequest): Promise<Required<IQuestBook>> => {
      const sanateData = { ...body } as Partial<IQuestBook>;
      delete sanateData.id;
      delete sanateData.created;
      const questBook = await knex("quest_books").insert(sanateInsertData(QuestBooksDB, sanateData)).returning("*");
      return knex("quest_books").where("id", questBook[0].id).first() as Promise<Required<IQuestBook>>;
    },
    updateQuestBook: async (props: { questBookId: string }, body: IQuestBookRequest) => {
      const sanateData = { ...body } as Partial<IQuestBook>;
      delete sanateData.id;
      delete sanateData.created;
      await knex("quest_books")
        .where("id", props.questBookId)
        .update(sanateInsertData(QuestBooksDB, [sanateData])[0]);
      return knex("quest_books").where("id", props.questBookId).first();
    },
    deleteQuestBook: async (props: { questBookId: string }) => {
      await knex("quest_books").where("id", props.questBookId).del();
      return "QuestBook deleted";
    },
    getAllQuestBooks: async (): Promise<Required<IQuestBook>[]> => {
      const questbook = await knex("quest_books").select("*");
      return questbook as Required<IQuestBook>[];
    },
    getRandomQuestBook: async (props: { collectedQuestBookIds: string[]; tags: string[] }) => {
      const all = (await QuestBooksDB.resolvers.getAllQuestBooks()) as Required<IQuestBook>[];
      const filtered = all.filter(
        (questBook) =>
          !props.collectedQuestBookIds.includes(questBook.id) &&
          questBook.tags.some((tag: string) => props.tags.includes(tag))
      );
      return filtered[Math.floor(Math.random() * filtered.length)];
    }
  }
});
