import { ParseCSVParams, ValidateFileParam } from "./types";
import Papa from "papaparse";
export const validateFile = ({ file, setError }: ValidateFileParam) => {
  if (!file.name.endsWith(".csv")) {
    setError("Please upload a CSV file");
    return false;
  }
  setError(null);
  return true;
};

export const parseCSV = async ({
  file,
  setError,
  setCsvPreview,
}: ParseCSVParams) => {
  const text = file.stream().getReader();
  const result = await text.read();
  const decoder = new TextDecoder("utf-8");
  const csvText = decoder.decode(result.value);
  const { data } = Papa.parse(csvText, {
    header: true,
    dynamicTyping: true,
  });

  const allowedKeys = ["S. No.", "Product Name", "Input Image Urls"];

  const filteredData = data.filter(
    (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      obj: any
    ) =>
      Object.keys(obj).length === 3 &&
      allowedKeys.every((key) => obj.hasOwnProperty(key) && obj[key]) // Ensure all keys exist & have values
  );

  if (filteredData.length === 0) {
    setError(
      "CSV file must contain headers and at least one row of correct formatted data"
    );
    setCsvPreview(null);
    return "CSV file must contain headers and at least one row of correct formatted data";
  }

  // @ts-ignore
  setCsvPreview(filteredData);
  return filteredData;
};

export const validateCSVFormat = (
  headers: string[],
  rows: string[][]
): string | null => {
  // Check if required columns exist
  const requiredColumns = ["S. No.", "Product Name", "Input Image Urls"];
  const headerSet = new Set(headers.map((h) => h.toLowerCase().trim()));

  const missingColumns = requiredColumns.filter(
    (col) => !headerSet.has(col.toLowerCase())
  );
  if (missingColumns.length > 0) {
    return `Missing required columns: ${missingColumns.join(", ")}`;
  }

  // Check if all rows have the correct number of columns
  const invalidRows = rows.filter((row) => row.length !== headers.length);
  if (invalidRows.length > 0) {
    return `Found ${invalidRows.length} rows with incorrect number of columns`;
  }

  // Validate image URLs
  const urlColumnIndex = headers.findIndex(
    (h) => h.toLowerCase().trim() === "Input Image Urls"
  );
  const invalidUrls = rows.filter((row) => {
    try {
      new URL(row[urlColumnIndex]);
      return false;
    } catch {
      return true;
    }
  });

  if (invalidUrls.length > 0) {
    return `Found ${invalidUrls.length} rows with invalid image URLs`;
  }

  // Check for empty values in required fields
  const productNameIndex = headers.findIndex(
    (h) => h.toLowerCase().trim() === "Product Name"
  );
  const emptyFields = rows.filter(
    (row) => !row[productNameIndex]?.trim() || !row[urlColumnIndex]?.trim()
  );

  if (emptyFields.length > 0) {
    return `Found ${emptyFields.length} rows with empty required fields`;
  }

  return null;
};
