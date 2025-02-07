import React, { useState } from 'react';
import { 
  ImagePlus, 
  FileText, 
  X, 
  Loader,
  AlertCircle,
  Check,
  AlertTriangle
} from 'lucide-react';

const API_URL = 'http://localhost:8000/process-image';

function App() {
  const [files, setFiles] = useState([]);
  const [processingResults, setProcessingResults] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const validateImageFile = (file) => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload only image files');
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('Image size should be less than 5MB');
    }
    return true;
  };

  const handleFileUpload = (event) => {
    setError(null);
    const uploadedFiles = event.target.files 
      ? Array.from(event.target.files) 
      : Array.from(event.dataTransfer.files);
    
    try {
      uploadedFiles.forEach(validateImageFile);
      processFiles(uploadedFiles);
    } catch (err) {
      setError(err.message);
    }
  };

  const processFiles = async (uploadedFiles) => {
    const newFiles = [...files, ...uploadedFiles];
    setFiles(newFiles);
    setIsProcessing(true);
    setError(null);

    try {
      const results = await Promise.all(
        uploadedFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);

          try {
            const response = await fetch(API_URL, {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.detail || `Error processing ${file.name}`);
            }

            const data = await response.json();
            
            return {
              fileName: file.name,
              extractedText: data.detected_numbers.length > 0 
                ? data.detected_numbers.join(', ') 
                : 'No numbers detected',
              status: data.detected_numbers.length > 0 ? 'success' : 'warning'
            };
          } catch (error) {
            console.error(`Error processing ${file.name}:`, error);
            return {
              fileName: file.name,
              extractedText: `Failed to process: ${error.message}`,
              status: 'error'
            };
          }
        })
      );

      setProcessingResults((prev) => [...prev, ...results]);
    } catch (error) {
      console.error('Error processing files:', error);
      setError('Failed to process images. Please check your connection and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
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
          Meter Reading OCR
        </h1>
        <p className="text-xl text-blue-600 max-w-2xl mx-auto">
          Upload meter reading images to extract numbers. 
          The system will process and detect meter readings automatically.
        </p>
      </div>

      {error && (
        <div className="w-full max-w-2xl mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

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
            {isProcessing ? 'Processing...' : 'Drag and Drop Meter Images'}
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
          <h3 className="text-2xl font-semibold mb-4 text-blue-800">Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processingResults.map((result, index) => (
              <div 
                key={index} 
                className={`bg-white p-4 rounded-lg shadow-md ${
                  result.status === 'error' ? 'border-l-4 border-red-500' :
                  result.status === 'warning' ? 'border-l-4 border-yellow-500' :
                  'border-l-4 border-green-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-blue-700">{result.fileName}</h4>
                  {getStatusIcon(result.status)}
                </div>
                <p className={`${
                  result.status === 'error' ? 'text-red-600' :
                  result.status === 'warning' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>{result.extractedText}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;