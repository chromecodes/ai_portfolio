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
    const data = await getProject(slug);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Project data not found",
        error,
      },
      {
        status: 404,
      }
    );
  }
}
