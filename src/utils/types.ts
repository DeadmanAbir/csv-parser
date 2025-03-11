export interface ProcessingRequest {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
}

export interface ProcessedResult {
  serialNumber: number;
  productName: string;
  inputImageUrls: string[];
  outputImageUrls: string[];
  status: string;
}

export interface CSVData {
  productName: string;
  imageUrls: string[];
}

export interface CSVPreview {
  "S. No.": number;
  "Product Name": string;
  "Input Image Urls": string;
}

export type CSVPreviewData = CSVPreview[];

export interface ParseCSVParams {
  file: File;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setCsvPreview: React.Dispatch<React.SetStateAction<CSVPreviewData | null>>;
}

export type ValidateFileParam = Omit<ParseCSVParams, "setCsvPreview">;
