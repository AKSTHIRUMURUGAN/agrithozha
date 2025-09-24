'use client';
import { useState } from 'react';

export default function DiseasePrediction() {
  // State for the selected image file
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showPrediction, setShowPrediction] = useState(false);

  // Handle file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setResult(null);
      setError(null);
      setShowPrediction(false);
    }
  };

  // Convert image to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Handle the analysis request
  const handleAnalyze = async () => {
    if (!image) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real app, you would call your API here
      // For now, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulated response
      const mockResponse = `**Disease:** Early Blight
**Cause:** Fungal infection (Alternaria solani)
**Remedies:**
- Apply copper-based fungicides
- Remove and destroy infected plant parts
- Improve air circulation around plants
- Water at the base to keep foliage dry`;
      
      setResult(mockResponse);
      setShowPrediction(true);
    } catch (err) {
      console.error("Error analyzing image:", err);
      setError("Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Crop Disease Prediction</h2>
        <p className="text-sm text-gray-600 mb-4">
          Upload an image of a crop to identify potential diseases and get recommendations.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg 
                className="w-8 h-8 mb-2 text-gray-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
            </div>
            <input 
              type="file" 
              onChange={handleImageChange}
              accept="image/*"
              className="hidden" 
            />
          </label>
        </div>

        {image && (
          <div className="mt-4 p-2 border border-gray-200 rounded-lg">
            <div className="relative">
              <img
                src={URL.createObjectURL(image)}
                alt="Selected crop"
                className="w-full h-48 object-contain rounded"
              />
              <button
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                title="Remove image"
              >
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading || !image}
          className={`w-full py-2.5 px-4 rounded-lg font-medium text-white transition-colors ${
            loading || !image
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </span>
          ) : (
            'Analyze for Diseases'
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      {showPrediction && result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-medium text-green-800 mb-3">Analysis Results</h3>
          <div className="space-y-2 text-sm text-gray-700">
            {result.split('\n').map((line, i) => {
              if (line.startsWith('**')) {
                const [label, ...value] = line.replace(/\*\*/g, '').split(':');
                return (
                  <div key={i} className="font-medium">
                    <span className="text-green-700">{label}:</span> {value.join(':').trim()}
                  </div>
                );
              }
              return <div key={i}>{line}</div>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
