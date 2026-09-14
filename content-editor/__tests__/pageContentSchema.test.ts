import { PageContentSchema } from "@/lib/pageContentSchema";

describe("PageContentSchema", () => {
  it("accepts a valid page object", () => {
    const result = PageContentSchema.safeParse({
      title: "Terms & Conditions",
      markdownContent: "# Hello",
      updatedAt: "2026-09-11T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a page missing a required field", () => {
    const result = PageContentSchema.safeParse({
      title: "Terms & Conditions",
      updatedAt: "2026-09-11T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a page with a non-string field", () => {
    const result = PageContentSchema.safeParse({
      title: "Terms & Conditions",
      markdownContent: 12345,
      updatedAt: "2026-09-11T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });
});
