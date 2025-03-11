import Product from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const returnData = request.nextUrl.searchParams.get("returnData");
  console.log(id, returnData);
  try {
    const image = await Product.findOne({ id });

    if (!image) {
      return NextResponse.json({
        success: false,
        status: 404,
        error: "Product not found",
      });
    }
    return NextResponse.json({
      success: true,
      status: 200,
      data: returnData === "true" ? image : image.status,
    });
  } catch (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any
  ) {
    console.error(error);
    return NextResponse.json({
      success: false,
      status: 500,
      error: error.message,
    });
  }
}
