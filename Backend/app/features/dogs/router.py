"""
강아지 라우터 — CRUD 5종
FE api/dog.ts 매핑: getDogs, getDog, createDog, updateDog, deleteDog
Parity: APP-001
"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.features.dogs import schemas, service

router = APIRouter()


@router.get("/", response_model=List[schemas.DogListItem])
async def get_dogs(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """강아지 목록 조회 (멀티독)"""
    return await service.get_dog_list(db, user_id)


@router.get("/{dog_id}", response_model=schemas.DogProfileFull)
async def get_dog_profile(
    dog_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """강아지 상세 프로필 조회"""
    return await service.get_dog_full_profile(db, user_id, dog_id)


@router.post("/", response_model=schemas.DogListItem, status_code=status.HTTP_201_CREATED)
async def create_dog(
    data: schemas.DogCreateRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """강아지 추가 (멀티독)"""
    return await service.create_dog(db, user_id, data)


@router.put("/{dog_id}", response_model=schemas.DogProfileFull)
async def update_dog_profile(
    dog_id: UUID,
    data: schemas.DogProfileUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """강아지 프로필 수정"""
    return await service.update_dog_profile(db, user_id, dog_id, data)


@router.delete("/{dog_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dog(
    dog_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """강아지 삭제"""
    await service.delete_dog(db, user_id, dog_id)
    return None
