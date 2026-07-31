def test_list_branches_empty_seed(client):
    # Startup event seeds demo branches into the real DB, but our test overrides
    # get_db to use an isolated in-memory-like test DB, which starts empty.
    resp = client.get("/api/v1/branches")
    assert resp.status_code == 200
    assert resp.json() == []


def test_list_branches_with_data(client, sample_branch):
    resp = client.get("/api/v1/branches")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["name"] == "Test Poliklinika"
    assert data[0]["current_waiting_count"] == 0


def test_get_branch_not_found(client):
    resp = client.get("/api/v1/branches/999")
    assert resp.status_code == 404
