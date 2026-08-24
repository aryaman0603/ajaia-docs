from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ShareCreate(BaseModel):
    user_id: int


class ShareResponse(BaseModel):
    id: int
    document_id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)