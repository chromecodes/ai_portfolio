import { NextResponse } from "next/server";
import { getFuture } from "@/lib/future/repository";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      lang: string;
    }>;
  }
) {
  try {
    const { lang } = await params;
    const data = await getFuture(lang);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Future page data not found",
        error,
      },
      {
        status: 404,
      }
    );
  }
}
