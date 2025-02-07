import cv2
import numpy as np
import easyocr
import re
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize EasyOCR reader
reader = easyocr.Reader(['en'])

def process_image(image_array):
    try:
        # Resize the image
        img_color = cv2.resize(image_array, None, None, fx=0.5, fy=0.5)
        
        # Convert to grayscale
        img_gray = cv2.cvtColor(img_color, cv2.COLOR_BGR2GRAY)
        
        # Apply CLAHE for contrast enhancement
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        img_gray = clahe.apply(img_gray)
        
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(img_gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,cv2.THRESH_BINARY, 11, 2)
        
        # Find contours
        cnts, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not cnts:
            return []
            
        cnts = sorted(cnts, key=cv2.contourArea, reverse=True)
        largest_contour = cnts[0]
        
        # Create a mask for the largest contour
        mask = np.zeros_like(img_gray)
        cv2.drawContours(mask, [largest_contour], -1, 255, thickness=cv2.FILLED)
        
        # Extract the ROI
        roi = cv2.bitwise_and(img_color, img_color, mask=mask)
        x, y, w, h = cv2.boundingRect(largest_contour)
        roi_cropped = roi[y:y+h, x:x+w]
        
        # Perform text detection
        results = reader.readtext(roi_cropped)
        
        # Standardize and filter detected text
        standardized_results = []
        for detection in results:
            text = detection[1].strip()
            
            # Regular expression to find valid number formats
            if re.match(r'^\d+(\.\d+)?$', text):
                standardized_results.append(text)
            elif len(standardized_results) > 0 and re.match(r'^\d+$', text):
                last_num = standardized_results[-1]
                combined_num = last_num + text
                standardized_results[-1] = combined_num
        
        return standardized_results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process-image")
async def process_ocr_image(file: UploadFile = File(...)):
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image
        contents = await file.read()
        
        # Convert to numpy array
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Process image
        results = process_image(img)
        
        return {
            "status": "success",
            "detected_numbers": results,
            "message": "No numbers detected" if not results else None
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))