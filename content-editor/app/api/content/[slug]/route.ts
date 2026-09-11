import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { writePage } from "@/lib/pagesRepo";

const UpdatePageBodySchema = z.object({
  title: z.string(),
  markdownContent: z.string(),
});

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export const PUT = async (
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> => {
  const { slug } = await context.params;
  const parsedBody = UpdatePageBodySchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 },
    );
  }

  try {
    const updatedPage = await writePage(slug, parsedBody.data);
    return NextResponse.json(updatedPage);
  } catch {
    return NextResponse.json({ message: "Unknown page slug" }, { status: 404 });
  }
};
