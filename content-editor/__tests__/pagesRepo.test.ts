import { listPageSlugs, readPage, writePage } from "@/lib/pagesRepo";

describe("pagesRepo", () => {
  it("lists exactly the known page slugs", async () => {
    const slugs = await listPageSlugs();
    expect(slugs.slice().sort()).toEqual(
      [
        "ai-participation",
        "cookies-policy",
        "gdpr",
        "terms-and-conditions",
      ].sort(),
    );
  });

  it("reads a known page's real committed content", async () => {
    const page = await readPage("gdpr");
    expect(page).not.toBeNull();
    expect(page?.title).toBe("Privacy Policy (GDPR)");
    expect(page?.markdownContent.length).toBeGreaterThan(0);
  });

  it("returns null for a slug outside the known-pages registry", async () => {
    const page = await readPage("not-a-real-page");
    expect(page).toBeNull();
  });

  // Regression test: knownPageTitles used to be a plain object, so a slug
  // colliding with an Object.prototype property name would pass the "is
  // this known?" check via an inherited property instead of a real one.
  it("does not resolve an Object.prototype property name as a known page", async () => {
    const page = await readPage("toString");
    expect(page).toBeNull();
  });

  it("throws when writing to an unknown slug", async () => {
    await expect(
      writePage("not-a-real-page", { title: "x", markdownContent: "y" }),
    ).rejects.toThrow("Unknown page slug");
  });

  it("throws when writing to an Object.prototype-colliding slug", async () => {
    await expect(
      writePage("toString", { title: "x", markdownContent: "y" }),
    ).rejects.toThrow("Unknown page slug");
  });
});
