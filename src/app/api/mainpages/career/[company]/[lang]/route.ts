import { NextResponse } from "next/server";
import { getCareer } from "@/lib/career/repository";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      company: string;
      lang: string;
    }>;
  }
) {
  try {
    const { company, lang } = await params;

    const data = await getCareer(company, lang);

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Career data not found",
        error,
      },
      {
        status: 404,
      }
    );
  }
}