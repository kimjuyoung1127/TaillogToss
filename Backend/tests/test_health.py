"""
헬스체크 + 앱 초기화 테스트
"""


def test_root(client):
    """루트 엔드포인트 응답"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "TaillogToss API"


def test_health(client):
    """헬스체크 엔드포인트"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_openapi(client):
    """OpenAPI 스키마 접근"""
    response = client.get("/api/v1/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert "paths" in data
    assert "info" in data
