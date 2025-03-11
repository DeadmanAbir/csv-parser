import Product from "@/models/Product";
import { CSVPreviewData } from "@/utils/types";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { csvData }: { csvData: CSVPreviewData } = body;

    const products = csvData.map((item) => {
      const inputImageUrls = item["Input Image Urls"]
        ? item["Input Image Urls"]
            .replace(/\n/g, "")
            .split(",")
            .map((url: string) => url.trim())
            .filter(Boolean)
        : [];

      return {
        serialNumber: Number(item["S. No."]),
        productName: item["Product Name"].trim(),
        inputImageUrls,
        outputImageUrls: [],
      };
    });

    const newProduct = new Product({
      data: products,
    });

    const result = await newProduct.save();

    return NextResponse.json({
      success: true,
      status: 200,
      productId: result.id,
    });
  } catch (err: any) {
    console.error(`Error in POST:`, err);

    return NextResponse.json({
      success: false,
      status: 500,
      error: `Error processing: ${err.message}`,
    });
  }
}
