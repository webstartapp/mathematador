const _404 = async (props: Record<string, string>, body: Record<string, string>, context: any) => {
  context.setResponseStatus(404);
  return {
      message: "Not found"
  };
}
export default _404;
