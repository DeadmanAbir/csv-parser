import Product from "@/models/Product";
import dbConnect from "@/utils/connectDb";
import { parseCSV, validateFile } from "@/utils/helper";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
export const maxDuration = 300;

const fileSchema = z.object({
  file: z.instanceof(File, { message: "File input missing" }),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    fileSchema.parse({ file });
    await dbConnect();

    const isValid = file && validateFile({ file });

    if (isValid) {
      const csvData = await parseCSV({ file });

      if (typeof csvData === "string") {
        throw new Error(
          "CSV file must contain headers and at least one row of correct formatted data"
        );
      }

      const products = csvData.map(
        (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          item: any
        ) => {
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
        }
      );

      const newProduct = new Product({
        data: products,
      });

      const result = await newProduct.save();

      return NextResponse.json({
        success: true,
        status: 200,
        productId: result.id,
        csvData: csvData,
      });
    }
    throw new Error("Please upload a CSV file");
  } catch (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    err: any
  ) {
    console.error(`Error in POST:`, err);

    return NextResponse.json({
      success: false,
      status: 500,
      error: `Error processing: ${err.message}`,
    });
  }
}
