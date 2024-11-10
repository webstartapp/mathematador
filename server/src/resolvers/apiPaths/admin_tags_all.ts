import { Iadmin_tags_allCallResolver } from "@/_generated/sessionOperations";
import { TagsDB } from "@/entities/tags";

const resolver: Iadmin_tags_allCallResolver = TagsDB.resolvers.getTags;

export default resolver;
