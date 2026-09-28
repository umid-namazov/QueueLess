from fastapi.testclient import TestClient

from app.models.branch import Branch
from tests.conftest import TestingSessionLocal


def _create_test_branch(name="Test Barbershop", category="sartaroshxona", avg_service=15) -> Branch:
    db = TestingSessionLocal()
    branch = Branch(
        name=name,
        category=category,
        address="Toshkent, Chilonzor 9",
        avg_service_minutes=avg_service,
        working_hours="09:00-20:00",
        is_approved=True,
    )
    db.add(branch)
    db.commit()
    db.refresh(branch)
    branch_id = branch.id
    db.close()
    return branch


def test_ai_model_info(client: TestClient):
    response = client.get("/api/v1/ai/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "model_name" in data
    assert data["version"] == "1.0.0"
    assert data["framework"] == "scikit-learn"
    assert data["status"] in ("online", "degraded")
    assert "metrics" in data


def test_ai_predict_wait_time(client: TestClient):
    branch = _create_test_branch(name="Test Klinika", category="poliklinika")
    
    payload = {
        "branch_id": branch.id,
        "date": "2026-10-01",
        "time": "10:00",
    }
    response = client.post("/api/v1/ai/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["branch_id"] == branch.id
    assert data["branch_name"] == "Test Klinika"
    assert data["predicted_wait_minutes"] >= 0
    assert data["predicted_queue_length"] >= 0
    assert "traffic_level" in data


def test_ai_predict_with_realtime_queue(client: TestClient):
    branch = _create_test_branch(name="Fast CarWash", category="avtoyuvish")

    payload = {
        "branch_id": branch.id,
        "date": "2026-10-01",
        "time": "18:00",
        "current_queue_length": 6,
    }
    response = client.post("/api/v1/ai/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_queue_length"] == 6
    assert data["predicted_wait_minutes"] > 0


def test_ai_smart_recommendation(client: TestClient):
    branch = _create_test_branch(name="Central Bank", category="bank")

    payload = {
        "branch_id": branch.id,
        "target_date": "2026-10-01",
        "preferred_time": "12:00",
        "search_window_hours": 2,
    }
    response = client.post("/api/v1/ai/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["branch_id"] == branch.id
    assert "selected_slot" in data
    assert "recommended_slot" in data
    assert "ai_recommendation_message" in data
    # Foydalanuvchi tanlagan vaqt jumla ichida bo'lishi kerak
    assert "12:00 ni tanladingiz" in data["ai_recommendation_message"]
    assert "Taxminiy kutish:" in data["ai_recommendation_message"]


def test_ai_branch_hourly_forecast(client: TestClient):
    branch = _create_test_branch(name="Grand Barbershop", category="sartaroshxona")

    response = client.get(f"/api/v1/ai/branch/{branch.id}/forecast?date=2026-10-01")
    assert response.status_code == 200
    data = response.json()
    assert data["branch_id"] == branch.id
    assert len(data["forecast"]) == 12 # 09:00 dan 20:00 gacha
    assert "recommended_best_time" in data
    assert "peak_time" in data


def test_ai_predict_branch_not_found(client: TestClient):
    payload = {
        "branch_id": 99999,
        "time": "15:00",
    }
    response = client.post("/api/v1/ai/predict", json=payload)
    assert response.status_code == 404
    assert response.json()["detail"] == "Filial topilmadi"
