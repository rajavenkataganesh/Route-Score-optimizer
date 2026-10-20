import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_check_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "algorithms" in data


def test_score_search_api_success():
    payload = {
        "scores": [12, 24, 36, 48, 60, 72, 84],
        "target": 48
    }
    response = client.post("/api/score-search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["found"] is True
    assert data["index"] == 3
    assert len(data["steps"]) > 0


def test_score_search_api_unsorted_error():
    payload = {
        "scores": [12, 50, 20, 60],
        "target": 20
    }
    response = client.post("/api/score-search", json=payload)
    assert response.status_code == 400
    assert "ascending order" in response.json()["detail"]


def test_route_search_api_success():
    payload = {
        "routes": [50, 60, 70, 10, 20, 30, 40],
        "target": 20
    }
    response = client.post("/api/route-search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["found"] is True
    assert data["index"] == 4
    assert data["pivot_index"] == 3


def test_resource_optimize_api_success():
    payload = {
        "tasks": [10, 20, 30, 40],
        "workers": 2
    }
    response = client.post("/api/resource-optimize", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["optimal_max_workload"] == 60
    assert len(data["allocations"]) == 2


def test_resource_optimize_api_invalid_workers():
    payload = {
        "tasks": [10, 20],
        "workers": 0
    }
    response = client.post("/api/resource-optimize", json=payload)
    assert response.status_code == 422  # Pydantic validation gt=0


def test_history_and_stats_api():
    # Clear history first
    del_resp = client.delete("/api/history")
    assert del_resp.status_code == 200

    # Execute a score search
    client.post("/api/score-search", json={"scores": [1, 2, 3], "target": 2})

    # Retrieve history
    hist_resp = client.get("/api/history")
    assert hist_resp.status_code == 200
    hist_data = hist_resp.json()
    assert hist_data["total_count"] >= 1

    # Check stats
    stats_resp = client.get("/api/stats")
    assert stats_resp.status_code == 200
    stats_data = stats_resp.json()
    assert stats_data["total_operations"] >= 1

    # Check CSV export
    csv_resp = client.get("/api/export-csv")
    assert csv_resp.status_code == 200
    assert "text/csv" in csv_resp.headers["content-type"]
