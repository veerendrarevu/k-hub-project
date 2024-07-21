from bson import ObjectId
from pydantic import BaseModel, Field, validator

class ObjectIdStr(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not isinstance(v, ObjectId):
            raise TypeError('ObjectId expected')
        return str(v)

class Note(BaseModel):
    id: ObjectIdStr = Field(..., alias='_id')

    @validator('id', pre=True)
    def validate_objectid(cls, v):
        return str(v)
