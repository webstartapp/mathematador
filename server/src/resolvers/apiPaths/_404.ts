import { ContextType } from "@/resolvers/expressTypeResolver";

const _404 = async (
  props: Record<string, string>,
  body: Record<string, string>,
  context: ContextType
): Promise<{ message: string }> => {
  context.setResponseStatus(404);
  return {
    message: "Not found"
  };
};
export default _404;
