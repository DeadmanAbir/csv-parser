// In your model file (e.g., productSchema.js)
import mongoose from "mongoose";
import { Schema } from "mongoose";

// Create schema for the nested data object
const dataSchema = new Schema({
  serialNumber: {
    type: Number,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  inputImageUrls: {
    type: [String],
    default: [],
  },
  outputImageUrls: {
    type: [String],
    default: [],
  },
});

// Create the main product schema
const productSchema = new Schema(
  {
    id: {
      type: String,
      default: () => crypto.randomUUID(),
      required: false,
      unique: true,
    },
    data: {
      type: [dataSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["PROCESSING", "COMPLETED", "FAILED"], // ✅ Correct enum definition
      default: "PROCESSING",
    },
  },

  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
