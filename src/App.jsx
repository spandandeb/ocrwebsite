import React, { useState } from 'react';

function App() {
  const [files, setFiles] = useState([]);
  const [processingResults, setProcessingResults] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = (event) => {
    const uploadedFiles = event.target.files 
      ? Array.from(event.target.files) 
      : Array.from(event.dataTransfer.files);
    processFiles(uploadedFiles);
  };

  const processFiles = async (uploadedFiles) => {
    const newFiles = [...files, ...uploadedFiles];
    setFiles(newFiles);

    const results = newFiles.map(file => ({
      fileName: file.name,
      extractedText: 'Processed result placeholder'
    }));

    setProcessingResults(results);
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
        />
        <label 
          htmlFor="file-upload" 
          className="cursor-pointer flex flex-col items-center justify-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-24 h-24 text-blue-500 mb-6 opacity-70"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <p className="text-xl text-blue-600 font-semibold">
            Drag and Drop Meter Reading Images
          </p>
          <p className="text-sm text-blue-400 mt-2">
            or <span className="underline">Click to Upload</span>
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
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="w-6 h-6 text-blue-500 mr-3" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0013.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
                    />
                  </svg>
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
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="w-5 h-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" 
                    />
                  </svg>
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