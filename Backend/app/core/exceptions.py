"""
도메인 예외 계층 + FastAPI 글로벌 핸들러 — Service 레이어를 HTTP 관심사에서 분리
DogCoach exceptions.py 마이그레이션
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse


class DomainException(Exception):
    """비즈니스 로직 에러 기반 클래스"""
    def __init__(self, message: str):
        self.message = message


class NotFoundException(DomainException):
    """리소스 미발견 (404)"""
    pass


class BadRequestException(DomainException):
    """잘못된 요청 (400)"""
    pass


class UnauthorizedException(DomainException):
    """인증 실패 (401)"""
    pass


class ForbiddenException(DomainException):
    """권한 부족 (403) — B2B 역할 가드용"""
    pass


async def domain_exception_handler(request: Request, exc: DomainException) -> JSONResponse:
    """DomainException → HTTP 응답 매핑"""
    if isinstance(exc, NotFoundException):
        status_code = status.HTTP_404_NOT_FOUND
    elif isinstance(exc, BadRequestException):
        status_code = status.HTTP_400_BAD_REQUEST
    elif isinstance(exc, UnauthorizedException):
        status_code = status.HTTP_401_UNAUTHORIZED
    elif isinstance(exc, ForbiddenException):
        status_code = status.HTTP_403_FORBIDDEN
    else:
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR

    return JSONResponse(
        status_code=status_code,
        content={"detail": exc.message},
    )
