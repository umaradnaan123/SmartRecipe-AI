from pydantic import BaseModel
from typing import Optional
from .user import UserOut

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenPayload(BaseModel):
    sub: Optional[int] = None
    role: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str
