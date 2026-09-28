from fastapi.testclient import TestClient
from datetime import datetime, timezone

from app.models.branch import Branch
from tests.conftest import TestingSessionLocal


def _create_test_branch(
    name="Test Barbershop",
    category="sartaroshxona",
    avg_service=15,
    working_hours="09:00-20:00",
) -> Branch:
    db = TestingSessionLocal()
    branch = Branch(
        name=name,
        category=category,
        address="Toshkent, Chilonzor 9",
        avg_service_minutes=avg_service,
        working_hours=working_hours,
        is_approved=True,
    )
    db.add(branch)
    db.commit()
    db.refresh(branch)
    db.close()
    return branch


def test_ai_model_info(client: TestClient):
    response = client.get("/api/v1/ai/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "model_name" in data
    assert "2.0.0" in data["version"]
    assert "scikit-learn" in data["framework"]
    assert data["status"] in ("online", "degraded")
    assert "metrics" in data
    assert "benchmark_summary" in data


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
    assert data["confidence_score"] >= 0.80


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
    assert "recommendation_reason" in data
    assert data["confidence_score"] >= 0.90
    # Foydalanuvchi tanlagan vaqt jumla ichida bo'lishi kerak
    assert "12:00 ni tanladingiz" in data["ai_recommendation_message"]
    assert "Taxminiy kutish:" in data["ai_recommendation_message"]


def test_ai_respects_branch_working_hours(client: TestClient):
    """Filialning qisqa ish vaqtini (masalan 10:00-14:00) tekshirish."""
    branch = _create_test_branch(
        name="Short Hours Clinic",
        category="poliklinika",
        working_hours="10:00-14:00",
    )

    payload = {
        "branch_id": branch.id,
        "target_date": "2026-10-05",
        "preferred_time": "11:00",
        "search_window_hours": 3,
    }
    response = client.post("/api/v1/ai/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    rec_time = data["recommended_slot"]["time"]
    rec_h, _ = map(int, rec_time.split(":"))
    # Tavsiya faqat 10:00 dan 14:00 gacha bo'lishi shart
    assert 10 <= rec_h <= 14


def test_ai_branch_hourly_forecast(client: TestClient):
    branch = _create_test_branch(name="Grand Barbershop", category="sartaroshxona", working_hours="09:00-20:00")

    response = client.get(f"/api/v1/ai/branch/{branch.id}/forecast?date=2026-10-01")
    assert response.status_code == 200
    data = response.json()
    assert data["branch_id"] == branch.id
    assert len(data["forecast"]) >= 11
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
