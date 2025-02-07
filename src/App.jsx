import React, { useState } from 'react';
import { 
  ImagePlus, 
  FileText, 
  X, 
  Loader 
} from 'lucide-react';

function App() {
  const [files, setFiles] = useState([]);
  const [processingResults, setProcessingResults] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (event) => {
    const uploadedFiles = event.target.files 
      ? Array.from(event.target.files) 
      : Array.from(event.dataTransfer.files);
    processFiles(uploadedFiles);
  };

  const processFiles = async (uploadedFiles) => {
    const newFiles = [...files, ...uploadedFiles];
    setFiles(newFiles);
    setIsProcessing(true);

    try {
      const results = await Promise.all(
        uploadedFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('http://localhost:8000/process-image', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Error processing ${file.name}`);
          }

          const data = await response.json();
          return {
            fileName: file.name,
            extractedText: data.detected_numbers.join(', ') || 'No numbers detected',
          };
        })
      );

      setProcessingResults((prev) => [...prev, ...results]);
    } catch (error) {
      console.error('Error processing files:', error);
      setProcessingResults((prev) => [
        ...prev,
        {
          fileName: 'Error',
          extractedText: 'Failed to process image. Please try again.',
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (fileToRemove) => {
    setFiles(files.filter(file => file !== fileToRemove));
    setProcessingResults(
      processingResults.filter(result => result.fileName !== fileToRemove.name)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-800 mb-4">
          OCR Meter Reading Converter
        </h1>
        <p className="text-xl text-blue-600 max-w-2xl mx-auto">
          Upload your meter reading images and we'll convert them to digital text. 
          Simply drag and drop or click to upload your meter reading photos.
        </p>
      </div>

      <div 
        className={`
          w-full max-w-2xl border-4 border-dashed rounded-2xl p-12 text-center 
          transition-all duration-300 transform
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50 scale-105 shadow-2xl' 
            : 'border-blue-300 bg-white/70 hover:border-blue-400'}
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFileUpload(e);
        }}
      >
        <input 
          type="file" 
          multiple 
          accept="image/*"
          className="hidden" 
          id="file-upload"
          onChange={handleFileUpload}
          disabled={isProcessing}
        />
        <label 
          htmlFor="file-upload" 
          className="cursor-pointer flex flex-col items-center justify-center"
        >
          {isProcessing ? (
            <Loader className="w-24 h-24 text-blue-500 mb-6 animate-spin" />
          ) : (
            <ImagePlus className="w-24 h-24 text-blue-500 mb-6 opacity-70" />
          )}
          <p className="text-xl text-blue-600 font-semibold">
            {isProcessing ? 'Processing...' : 'Drag and Drop Meter Reading Images'}
          </p>
          <p className="text-sm text-blue-400 mt-2">
            {!isProcessing && 'or'} <span className="underline">Click to Upload</span>
          </p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-8 w-full max-w-4xl">
          <h3 className="text-2xl font-semibold mb-4 text-blue-800">Uploaded Files</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <div 
                key={index} 
                className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between"
              >
                <div className="flex items-center">
                  <FileText className="w-6 h-6 text-blue-500 mr-3" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => removeFile(file)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                  disabled={isProcessing}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {processingResults.length > 0 && (
        <div className="mt-8 w-full max-w-4xl">
          <h3 className="text-2xl font-semibold mb-4 text-blue-800">Processed Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processingResults.map((result, index) => (
              <div 
                key={index} 
                className="bg-white p-4 rounded-lg shadow-md"
              >
                <h4 className="font-medium mb-2 text-blue-700">{result.fileName}</h4>
                <p className="text-gray-600">{result.extractedText}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;