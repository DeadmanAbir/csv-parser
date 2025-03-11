import Product from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  console.log(id);
  try {
    const image = await Product.findOne({ id });

    if (!image) {
      return NextResponse.json({
        success: false,
        status: 404,
        error: "Product not found",
      });
    }
    console.log(image.status);
    return NextResponse.json({
      success: true,
      status: 200,
      data: image.status,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({
      success: false,
      status: 500,
      error: error.message,
    });
  }
}
