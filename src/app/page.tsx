"use client";

import React, { useState } from "react";

import { Upload, Image } from "lucide-react";
import type { ProcessingRequest, ProcessedResult } from "@/utils/types";
import { FileUpload } from "@/components/FileUpload";
import { StatusCheck } from "@/components/StatusCheck";
import { ResultsTable } from "@/components/ResultsTable";

function App() {
  const [processingRequest, setProcessingRequest] =
    useState<ProcessingRequest | null>(null);
  const [results, setResults] = useState<ProcessedResult[]>([]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Image className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Image Processing System
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Upload your CSV file with product details and image URLs for
            processing
          </p>
        </div>

        <div className="space-y-12">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Upload className="h-6 w-6 text-blue-600" />
              <span className="text-black"> Upload CSV</span>
            </h2>
            <FileUpload setRequest={setProcessingRequest} />
          </div>

          {processingRequest && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6 text-black">
                Processing Status
              </h2>
              <div className="max-w-2xl mx-auto">
                {/* <ProgressBar
                  progress={processingRequest.progress}
                  status={processingRequest.status}
                /> */}

                <p className="mt-4 text-sm text-gray-600">
                  Request ID: {processingRequest.id}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6 text-black">
              Check Status
            </h2>
            <StatusCheck results={results} setResults={setResults} />
          </div>
          {/* {console.log(results)} */}
          {results.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6 text-black">Results</h2>
              <ResultsTable results={results} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
