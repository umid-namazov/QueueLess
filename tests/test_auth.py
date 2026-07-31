def test_register_and_login(client):
    payload = {
        "full_name": "Aziz Aliyev",
        "phone": "+998901112233",
        "password": "parol123",
    }
    resp = client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["phone"] == payload["phone"]
    assert "hashed_password" not in data

    resp = client.post(
        "/api/v1/auth/login",
        data={"username": payload["phone"], "password": payload["password"]},
    )
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    assert token

    resp = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["full_name"] == payload["full_name"]


def test_register_duplicate_phone_fails(client):
    payload = {"full_name": "Ali", "phone": "+998900000000", "password": "parol123"}
    client.post("/api/v1/auth/register", json=payload)
    resp = client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 400


def test_login_wrong_password_fails(client):
    payload = {"full_name": "Ali", "phone": "+998900000001", "password": "parol123"}
    client.post("/api/v1/auth/register", json=payload)
    resp = client.post(
        "/api/v1/auth/login", data={"username": payload["phone"], "password": "wrong"}
    )
    assert resp.status_code == 401


def test_profile_requires_auth(client):
    resp = client.get("/api/v1/users/me")
    assert resp.status_code == 401
