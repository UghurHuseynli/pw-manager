from fastapi.testclient import TestClient
from app.core.config import settings


def test_health_check(client: TestClient) -> None:
    r = client.get(f"{settings.API_V1_STR}/health")
    response = r.json()

    assert r.status_code == 200
    assert response == {"status": "ok"}
