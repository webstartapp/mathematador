import { IGameConfiguration } from "@/_generated/sessionOperations";
import { TagsDB } from "@/entities/tags";

const game_configuration = async (): Promise<IGameConfiguration> => {
  const tags = await TagsDB.resolvers.getTags();
  return {
    tags: tags.filter((tag) => tag.active),
    languages: ["en", "cz"]
  };
};

export default game_configuration;
