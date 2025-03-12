"use client";

import React, { useState } from "react";
import { Search, Loader2, File, Download } from "lucide-react";
import { ProcessedResult } from "@/utils/types";
import { Parser } from "@json2csv/plainjs";

interface StatusCheckProps {
  results: ProcessedResult[];
  setResults: React.Dispatch<React.SetStateAction<ProcessedResult[]>>;
}

export function StatusCheck({ results, setResults }: StatusCheckProps) {
  const [requestId, setRequestId] = useState("");
  const [status, setStatus] = useState<
    "PROCESSING" | "COMPLETED" | "FAILED" | "error" | null
  >(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Function to check the status of a request
  const checkStatus = async () => {
    if (!requestId.trim()) return;

    setIsLoading(true);
    // Reset status to null while fetching to hide the status card
    setStatus(null);

    try {
      const response = await fetch(
        `/api/get-status/${requestId}?returnData=false`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log(data);
      if (data.success) {
        setStatus(data.data);
        // Set appropriate message based on status
        setStatusMessage(
          data.data === "COMPLETED"
            ? "Process completed successfully"
            : data.data === "FAILED"
            ? "Process failed to complete"
            : "Process is still running"
        );
      } else {
        setStatus("error");
        setStatusMessage(data.error || "Failed to fetch status");
      }
    } catch (error) {
      console.error("Error checking status:", error);
      setStatus("error");
      setStatusMessage("An error occurred while checking status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkStatus();
  };

  const handleShowCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch(
      `/api/get-status/${requestId}?returnData=true`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (Array.isArray(data.data.data)) {
      data.data.data.forEach(
        (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          item: any
        ) => delete item._id
      );
    }

    setResults(data.data.data);
  };

  const handleDownloadCSV = (e: React.FormEvent) => {
    e.preventDefault();

    // Preprocess the results to convert inputImageUrls and outputImageUrls arrays to comma-separated strings
    const processedResults = results.map((item) => {
      // Clone the item to avoid mutating the original data
      const newItem = { ...item };

      // Function to join array into a comma-separated string
      const arrayToCommaSeparatedString = (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        array: any
      ) => (Array.isArray(array) ? array.join(",") : array);

      // Convert inputImageUrls if it exists
      if (newItem.inputImageUrls) {
        newItem.inputImageUrls = arrayToCommaSeparatedString(
          newItem.inputImageUrls
        );
      }

      // Convert outputImageUrls if it exists
      if (newItem.outputImageUrls) {
        newItem.outputImageUrls = arrayToCommaSeparatedString(
          newItem.outputImageUrls
        );
      }

      return newItem;
    });

    const parser = new Parser();
    const csv = parser.parse(processedResults);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    // Create a link element
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "output.csv");

    // Append the link to the body
    document.body.appendChild(link);

    // Trigger the download
    link.click();

    // Clean up and remove the link
    document.body.removeChild(link);
  };

  const getStatusColor = () => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-50 text-green-700 border-green-200";
      case "error":
      case "FAILED":
        return "bg-red-50 text-red-700 border-red-200";
      case "PROCESSING":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={requestId}
            onChange={(e) => setRequestId(e.target.value)}
            placeholder="Enter request ID"
            className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !requestId.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              <span className="text-white">Check Status</span>
            </>
          )}
        </button>
      </form>

      {/* Show loader when fetching data */}
      {isLoading && (
        <div className="flex justify-center items-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-700">Fetching status...</span>
        </div>
      )}

      {/* Show status card only when we have a status and not loading */}
      {status && !isLoading && (
        <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
          <div className="flex items-center gap-2">
            <span className="font-medium capitalize">
              {status.toLowerCase()}
            </span>
          </div>
          {statusMessage && <p className="mt-1 text-sm">{statusMessage}</p>}

          {/* CSV buttons - only shown when status is COMPLETED */}
          {status === "COMPLETED" && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleShowCSV}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors cursor-pointer"
              >
                <File className="h-4 w-4" />
                Show CSV
              </button>
              <button
                onClick={handleDownloadCSV}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Download CSV
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
