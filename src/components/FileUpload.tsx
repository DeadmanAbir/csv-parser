"use client";
import React, { useCallback, useState } from "react";
import { Upload, Table } from "lucide-react";
import type { CSVPreviewData, ProcessingRequest } from "@/utils/types";
import { parseCSV, validateFile } from "@/utils/helper";
interface FileUploadProps {
  setRequest: React.Dispatch<React.SetStateAction<ProcessingRequest | null>>;
  onUpload: (file: File) => void;
}

export function FileUpload({ onUpload, setRequest }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csvPreview, setCsvPreview] = useState<CSVPreviewData | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file && validateFile({ file, setError })) {
        await parseCSV({ file, setError, setCsvPreview });
        if (!error) {
          onUpload(file);
        }
      }
    },
    [onUpload, error]
  );

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (file && validateFile({ file, setError })) {
        const csvData = await parseCSV({ file, setError, setCsvPreview });

        if (!error && csvData && typeof csvData !== "string") {
          const response = await fetch("/api/process-csv", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ csvData }),
          });
          const data = await response.json();

          if (data.sucess === false) {
            setError(data.error);
            return;
          }
          console.log("Upload success:", data);
          setRequest(data);
          setRequest({
            id: data.productId,
            status: "processing",
            progress: 50,
          });
          onUpload(file);
          //another fetch request send id as body
          fetch("/api/minify-images", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: data.productId }),
          });
        }
      }
    },
    [onUpload, setRequest, setError]
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : error
            ? "border-red-300 bg-red-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
        />
        <div className="text-center">
          <Upload
            className={`mx-auto h-12 w-12 ${
              error ? "text-red-400" : "text-gray-400"
            }`}
          />
          <p className="mt-4 text-lg font-medium text-gray-700">
            Drop your CSV file here, or click to browse
          </p>
          <p className="mt-2 text-sm text-gray-500">
            CSV must contain 'S. No.' and 'Product Name' and 'Input Image Urls'
            columns
          </p>
          {error && (
            <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
              {error}
            </p>
          )}
        </div>
      </div>

      {csvPreview && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Table className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">CSV Preview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {csvPreview.length > 0 &&
                    Object.keys(csvPreview[0]).map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {csvPreview.slice(0, 5).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.entries(row).map(([key, value], cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {key === "Input Image Urls" ? (
                          <div className="flex flex-col gap-2">
                            {value
                              .split(",")
                              .map((url: string, imgIndex: string) => (
                                <p key={imgIndex}>{url}</p>
                              ))}
                          </div>
                        ) : (
                          value
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
