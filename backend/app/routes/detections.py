import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import User, DetectionHistory
from ..schemas.detection import DetectionResponse, DetectionHistoryItem, ResourceLink
from ..services.auth_service import get_current_user
from ..services.ai_service import AIService
from ..config import settings

router = APIRouter(prefix="/detections", tags=["Detections"])

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

def validate_file(file: UploadFile):
    # Validate extension
    ext = file.filename.split(".")[-1].lower()
    allowed = settings.ALLOWED_EXTENSIONS.split(",")
    if ext not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension. Allowed extensions are: {settings.ALLOWED_EXTENSIONS}"
        )
    
    # Check if we should enforce size limit (FastAPI reads file in memory or tempfile)
    # We can check size by reading a chunk or reading full contents then seeking back
    return ext

@router.post("/detect", response_model=DetectionResponse)
async def detect_object(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ext = validate_file(file)
    
    # Read file content
    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE / (1024*1024)}MB."
        )

    # Reset file cursor just in case
    await file.seek(0)

    # Save file with unique filename
    unique_filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    try:
        with open(filepath, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save file: {str(e)}"
        )

    # Call AI vision service
    detected_name, ai_insights = AIService.detect_object_and_insights(contents, file.filename)
    
    # Save to history
    new_detection = DetectionHistory(
        user_id=current_user.id,
        image_path=filepath,
        detected_object=detected_name,
        ai_insights=ai_insights
    )
    db.add(new_detection)
    db.commit()
    db.refresh(new_detection)

    # Generate resource links
    resource_links = AIService.generate_resource_links(detected_name)

    image_url = f"/api/detections/images/{unique_filename}"

    return {
        "id": new_detection.id,
        "detected_object": new_detection.detected_object,
        "ai_insights": new_detection.ai_insights,
        "resource_links": resource_links,
        "image_url": image_url,
        "created_at": new_detection.created_at
    }

@router.get("/history", response_model=List[DetectionHistoryItem])
def get_detection_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    detections = db.query(DetectionHistory)\
        .filter(DetectionHistory.user_id == current_user.id)\
        .order_by(DetectionHistory.created_at.desc())\
        .all()
    
    items = []
    for d in detections:
        filename = os.path.basename(d.image_path)
        items.append({
            "id": d.id,
            "detected_object": d.detected_object,
            "image_url": f"/api/detections/images/{filename}",
            "created_at": d.created_at
        })
    return items

@router.get("/history/{detection_id}", response_model=DetectionResponse)
def get_detection_detail(
    detection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    d = db.query(DetectionHistory).filter(
        DetectionHistory.id == detection_id,
        DetectionHistory.user_id == current_user.id
    ).first()
    
    if not d:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection history item not found"
        )
    
    filename = os.path.basename(d.image_path)
    resource_links = AIService.generate_resource_links(d.detected_object)
    
    return {
        "id": d.id,
        "detected_object": d.detected_object,
        "ai_insights": d.ai_insights,
        "resource_links": resource_links,
        "image_url": f"/api/detections/images/{filename}",
        "created_at": d.created_at
    }

@router.delete("/history/{detection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_detection(
    detection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    d = db.query(DetectionHistory).filter(
        DetectionHistory.id == detection_id,
        DetectionHistory.user_id == current_user.id
    ).first()
    
    if not d:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection history item not found"
        )
    
    # Optionally delete file from disk
    try:
        if os.path.exists(d.image_path):
            os.remove(d.image_path)
    except Exception as e:
        print(f"Error removing image file {d.image_path}: {e}")
        
    db.delete(d)
    db.commit()
    return None

# Serve uploaded images statically
from fastapi.responses import FileResponse

@router.get("/images/{filename}")
def serve_image(filename: str, db: Session = Depends(get_db)):
    # Note: For production, use Nginx/S3, but this is simple and secure enough for local full-stack
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    return FileResponse(filepath)
