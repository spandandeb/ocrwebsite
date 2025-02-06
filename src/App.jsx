import React, { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

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

    // Simulate ML processing 
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div 
        className={`
          border-2 border-dashed rounded-lg p-8 text-center 
          transition-all duration-300
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
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
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload className="w-12 h-12 text-gray-500 mb-4" />
          <p className="text-gray-600">
            Drag and drop images here or 
            <span className="text-blue-600 ml-1">click to upload</span>
          </p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Uploaded Files</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <div 
                key={index} 
                className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
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
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {processingResults.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Processing Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processingResults.map((result, index) => (
              <div 
                key={index} 
                className="bg-white p-4 rounded-lg shadow"
              >
                <h4 className="font-medium mb-2">{result.fileName}</h4>
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