def _register_and_get_token(client, phone="+998907776655"):
    payload = {"full_name": "Test User", "phone": phone, "password": "parol123"}
    client.post("/api/v1/auth/register", json=payload)
    resp = client.post(
        "/api/v1/auth/login", data={"username": phone, "password": "parol123"}
    )
    return resp.json()["access_token"]


def test_book_queue_assigns_incrementing_numbers(client, sample_branch):
    token1 = _register_and_get_token(client, "+998901000001")
    token2 = _register_and_get_token(client, "+998901000002")

    r1 = client.post(
        "/api/v1/queue/book",
        json={"branch_id": sample_branch.id},
        headers={"Authorization": f"Bearer {token1}"},
    )
    r2 = client.post(
        "/api/v1/queue/book",
        json={"branch_id": sample_branch.id},
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert r1.status_code == 201
    assert r2.status_code == 201
    assert r1.json()["queue_number"] == 1
    assert r2.json()["queue_number"] == 2


def test_cannot_book_twice_same_day(client, sample_branch):
    token = _register_and_get_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    client.post("/api/v1/queue/book", json={"branch_id": sample_branch.id}, headers=headers)
    resp = client.post("/api/v1/queue/book", json={"branch_id": sample_branch.id}, headers=headers)
    assert resp.status_code == 400


def test_cancel_booking(client, sample_branch):
    token = _register_and_get_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    booking = client.post(
        "/api/v1/queue/book", json={"branch_id": sample_branch.id}, headers=headers
    ).json()

    resp = client.delete(f"/api/v1/queue/{booking['id']}", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "cancelled"

    # Bekor qilingandan keyin yana band qilish mumkin bo'lishi kerak
    resp2 = client.post("/api/v1/queue/book", json={"branch_id": sample_branch.id}, headers=headers)
    assert resp2.status_code == 201


def test_cannot_cancel_others_booking(client, sample_branch):
    token1 = _register_and_get_token(client, "+998901111111")
    token2 = _register_and_get_token(client, "+998902222222")
    booking = client.post(
        "/api/v1/queue/book",
        json={"branch_id": sample_branch.id},
        headers={"Authorization": f"Bearer {token1}"},
    ).json()

    resp = client.delete(
        f"/api/v1/queue/{booking['id']}",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert resp.status_code == 403


def test_my_bookings_shows_people_ahead(client, sample_branch):
    token1 = _register_and_get_token(client, "+998903333333")
    token2 = _register_and_get_token(client, "+998904444444")

    client.post(
        "/api/v1/queue/book",
        json={"branch_id": sample_branch.id},
        headers={"Authorization": f"Bearer {token1}"},
    )
    client.post(
        "/api/v1/queue/book",
        json={"branch_id": sample_branch.id},
        headers={"Authorization": f"Bearer {token2}"},
    )

    resp = client.get(
        "/api/v1/queue/my", headers={"Authorization": f"Bearer {token2}"}
    )
    assert resp.status_code == 200
    data = resp.json()[0]
    assert data["people_ahead"] == 1
    assert data["estimated_wait_minutes"] == 10


def test_confirm_booking_by_qr(client, sample_branch):
    token = _register_and_get_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    booking = client.post(
        "/api/v1/queue/book", json={"branch_id": sample_branch.id}, headers=headers
    ).json()

    resp = client.post(f"/api/v1/queue/confirm/{booking['qr_code']}")
    assert resp.status_code == 200
    assert resp.json()["status"] == "confirmed"
