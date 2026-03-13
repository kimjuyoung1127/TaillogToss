"""
보안 검증 테스트 — 예외 계층 + 인증 흐름
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

from app.core.exceptions import (
    BadRequestException,
    DomainException,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
)


class TestDomainExceptions:
    def test_not_found(self):
        exc = NotFoundException("Dog not found")
        assert exc.message == "Dog not found"
        assert isinstance(exc, DomainException)

    def test_bad_request(self):
        exc = BadRequestException("Invalid input")
        assert exc.message == "Invalid input"
        assert isinstance(exc, DomainException)

    def test_unauthorized(self):
        exc = UnauthorizedException("No token")
        assert exc.message == "No token"
        assert isinstance(exc, DomainException)

    def test_forbidden(self):
        exc = ForbiddenException("Not a member")
        assert exc.message == "Not a member"
        assert isinstance(exc, DomainException)

    def test_inheritance(self):
        """모든 도메인 예외가 DomainException 상속"""
        assert issubclass(NotFoundException, DomainException)
        assert issubclass(BadRequestException, DomainException)
        assert issubclass(UnauthorizedException, DomainException)
        assert issubclass(ForbiddenException, DomainException)


class TestExceptionHandler:
    def test_handler_mapping(self):
        """domain_exception_handler 매핑 테스트 (sync 호출)"""
        from app.core.exceptions import domain_exception_handler
        import asyncio

        async def run():
            from fastapi import Request
            from starlette.testclient import TestClient

            # NotFoundException → 404
            exc = NotFoundException("test")
            mock_request = MagicMock(spec=Request)
            response = await domain_exception_handler(mock_request, exc)
            assert response.status_code == 404

            # ForbiddenException → 403
            exc2 = ForbiddenException("test")
            response2 = await domain_exception_handler(mock_request, exc2)
            assert response2.status_code == 403

        asyncio.run(run())


class TestSecurityEndpoints:
    def test_unauth_dogs_returns_error(self):
        """인증 없이 /dogs 호출 시 에러"""
        from fastapi.testclient import TestClient
        from app.main import app

        app.dependency_overrides.clear()
        with TestClient(app) as c:
            response = c.get("/api/v1/dogs/")
            assert response.status_code in (401, 403, 422, 500)
