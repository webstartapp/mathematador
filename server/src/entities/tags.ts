import { ITag, ITagRequest } from "@/_generated/sessionOperations";
import knex from "@/knexWrapper";
import { ExpressTypeResolver } from "@/resolvers/expressTypeResolver";

export const TagsDB = ExpressTypeResolver({
  table: "tags",
  resolvers: {
    getTags: async () => {
      return (await knex("tags").select("*")).sort((a, b) => (a.created > b.created ? -1 : 1));
    },
    getTag: async (props: { tagId: string }): Promise<ITag> => {
      const tag = await knex("tags").where("id", props.tagId).first();
      if (!tag) {
        throw new Error("Tag not found");
      }
      return tag;
    },
    createTag: async (_props, body: ITagRequest): Promise<ITag> => {
      const tag = await knex("tags").insert(body).returning("*");
      return TagsDB.resolvers.getTag({ tagId: tag[0].id });
    },
    updateTag: async (props: { id: string }, body: ITagRequest): Promise<ITag> => {
      await knex("tags").where("id", props.id).update(body);
      return TagsDB.resolvers.getTag({ tagId: props.id });
    },
    updateTagsBulk: async (_props, body: ITag[]): Promise<ITag[]> => {
      await Promise.all(
        body.map(async (tag) => {
          const cleantag = { ...tag } as any;
          delete cleantag.created;
          delete cleantag.id;
          return await TagsDB.resolvers.updateTag({ id: tag.id }, cleantag);
        })
      );
      return TagsDB.resolvers.getTags();
    }
  }
});
