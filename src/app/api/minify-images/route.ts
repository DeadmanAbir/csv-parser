import Product from "@/models/Product";
import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id }: { id: string } = body;

    // Fetch product
    const image = await Product.findOne({ id });
    if (!image) {
      return NextResponse.json({
        success: false,
        status: 404,
        error: "Product not found",
      });
    }

    const imageUrlArray = image.data.map(
      (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        item: any
      ) => item.inputImageUrls
    );
    const outputImageUrls: string[][] = [];

    for (let i = 0; i < imageUrlArray.length; i++) {
      const compressedImageUrls: string[] = [];

      for (let j = 0; j < imageUrlArray[i].length; j++) {
        const imageUrl = imageUrlArray[i][j];

        try {
          const response = await fetch(imageUrl);
          if (!response.ok) {
            console.warn(`Failed to fetch image: ${imageUrl}`);
            continue;
          }

          // Convert response to buffer
          const buffer = await response.arrayBuffer();
          const inputBuffer = Buffer.from(buffer);

          // Get image format metadata
          const metadata = await sharp(inputBuffer).metadata();
          const format = metadata.format; // Example: 'jpeg', 'png', 'webp'

          let compressedImage: Buffer;
          if (format === "jpeg" || format === "jpg") {
            compressedImage = await sharp(inputBuffer)
              .jpeg({ quality: 50 })
              .toBuffer();
          } else if (format === "png") {
            compressedImage = await sharp(inputBuffer)
              .png({ compressionLevel: 9 })
              .toBuffer();
          } else if (format === "webp") {
            compressedImage = await sharp(inputBuffer)
              .webp({ quality: 50 })
              .toBuffer();
          } else {
            console.warn(`Unsupported format: ${format}, skipping ${imageUrl}`);
            continue;
          }

          // Upload the compressed image to Cloudinary
          const uploadedUrl = await new Promise<string>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { resource_type: "image", folder: image.id },
              (error, result) => {
                if (error) {
                  console.error("Cloudinary upload failed:", error);
                  image.status = "FAILED";
                  image.save().then(() => {
                    reject(error);
                  });
                } else {
                  resolve(result?.secure_url as string);
                }
              }
            );
            uploadStream.end(compressedImage);
          });

          compressedImageUrls.push(uploadedUrl);
        } catch (error) {
          console.error(`Error processing image ${imageUrl}:`, error);
        }
      }

      outputImageUrls.push(compressedImageUrls);
    }

    for (let i = 0; i < image.data.length; i++) {
      image.data[i].outputImageUrls = outputImageUrls[i];
    }

    image.status = "COMPLETED";
    const updatedImage = await image.save();
    return NextResponse.json({
      success: true,
      status: 200,
      updatedImage,
    });
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
