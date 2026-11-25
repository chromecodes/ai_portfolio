import { NextResponse } from "next/server";
import { getProject } from "@/lib/projects/repository";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") || "en";

    const data = await getProject(slug, lang);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch {
    // No raw error details — avoids leaking server internals
    return NextResponse.json(
      {
        success: false,
        message: "Project data not found",
      },
      {
        status: 404,
      }
    );
  }
}
