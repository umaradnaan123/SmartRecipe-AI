from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict

class DetectionCreate(BaseModel):
    pass # Uploaded via multipart form-data

class ResourceLink(BaseModel):
    name: str
    url: str

class DetectionResponse(BaseModel):
    id: int
    detected_object: str
    ai_insights: str
    resource_links: List[ResourceLink]
    image_url: str
    created_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True

class DetectionHistoryItem(BaseModel):
    id: int
    detected_object: str
    image_url: str
    created_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True
