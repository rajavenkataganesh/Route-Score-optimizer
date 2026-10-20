import time
import uuid
from datetime import datetime
from typing import List
import io
import csv

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from backend.models.schemas import (
    ScoreSearchRequest,
    ScoreSearchResponse,
    RouteSearchRequest,
    RouteSearchResponse,
    ResourceOptimizeRequest,
    ResourceOptimizeResponse,
    HistoryItem,
    HistoryResponse,
    StatsResponse,
)
from backend.algorithms.binary_search import binary_search
from backend.algorithms.rotated_array_search import search_rotated_array
from backend.algorithms.resource_optimizer import optimize_resource_allocation

app = FastAPI(
    title="Route & Score Optimizer API",
    description="FastAPI backend providing Binary Search DSA implementations for resource allocation, rotated route searching, and score searching.",
    version="1.0.0"
)

# Enable CORS for frontend development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for session operations
SESSION_HISTORY: List[HistoryItem] = []


def record_history(
    operation_type: str,
    title: str,
    summary: str,
    input_summary: str,
    result_summary: str,
    iterations: int,
    execution_time_ms: float,
    status: str = "SUCCESS"
):
    """Stores an execution record in the session history."""
    item = HistoryItem(
        id=str(uuid.uuid4())[:8],
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        operation_type=operation_type,
        title=title,
        summary=summary,
        input_summary=input_summary,
        result_summary=result_summary,
        iterations=iterations,
        execution_time_ms=round(execution_time_ms, 3),
        status=status
    )
    SESSION_HISTORY.insert(0, item)  # Latest first
    # Keep up to 200 items in memory
    if len(SESSION_HISTORY) > 200:
        SESSION_HISTORY.pop()


@app.get("/", tags=["Health"])
def health_check():
    """Health check endpoint confirming API status and system time."""
    return {
        "status": "healthy",
        "service": "Route & Score Optimizer API",
        "version": "1.0.0",
        "algorithms": [
            "Standard Binary Search (O(log n))",
            "Rotated Sorted Array Search (O(log n))",
            "Binary Search on Answer Resource Allocation (O(n log(sum-max)))"
        ],
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/score-search", response_model=ScoreSearchResponse, tags=["Algorithms"])
def run_score_search(payload: ScoreSearchRequest):
    """
    Executes standard Binary Search on a sorted array of scores.
    Validates that the input array is sorted.
    """
    start_time = time.perf_counter()

    # Validate that array is sorted in ascending order
    scores = payload.scores
    if scores:
        for i in range(len(scores) - 1):
            if scores[i] > scores[i + 1]:
                raise HTTPException(
                    status_code=400,
                    detail=f"Input scores must be sorted in ascending order. Found {scores[i]} > {scores[i+1]} at index {i}."
                )

    result = binary_search(scores, payload.target)
    elapsed_ms = (time.perf_counter() - start_time) * 1000.0

    record_history(
        operation_type="SCORE_SEARCH",
        title="Score Search",
        summary=f"Searched for score {payload.target} among {len(scores)} scores.",
        input_summary=f"Array size: {len(scores)}, Target: {payload.target}",
        result_summary=f"Found: {result.found} (Index: {result.index}), Iterations: {result.iterations}",
        iterations=result.iterations,
        execution_time_ms=elapsed_ms,
        status="SUCCESS" if result.found else "NOT_FOUND"
    )

    return result


@app.post("/api/route-search", response_model=RouteSearchResponse, tags=["Algorithms"])
def run_route_search(payload: RouteSearchRequest):
    """
    Executes modified Binary Search on a rotated sorted array of route IDs or scores.
    Handles distinct elements under standard rotated array rules.
    """
    start_time = time.perf_counter()

    result = search_rotated_array(payload.routes, payload.target)
    elapsed_ms = (time.perf_counter() - start_time) * 1000.0

    record_history(
        operation_type="ROUTE_SEARCH",
        title="Route Search (Rotated Array)",
        summary=f"Searched for route {payload.target} in rotated array of {len(payload.routes)} elements.",
        input_summary=f"Array size: {len(payload.routes)}, Target: {payload.target}",
        result_summary=f"Found: {result.found} (Index: {result.index}, Pivot: {result.pivot_index}), Iterations: {result.iterations}",
        iterations=result.iterations,
        execution_time_ms=elapsed_ms,
        status="SUCCESS" if result.found else "NOT_FOUND"
    )

    return result


@app.post("/api/resource-optimize", response_model=ResourceOptimizeResponse, tags=["Algorithms"])
def run_resource_optimize(payload: ResourceOptimizeRequest):
    """
    Calculates the optimal contiguous workload allocation across workers using Binary Search on Answer.
    """
    start_time = time.perf_counter()

    if not payload.tasks:
        raise HTTPException(status_code=400, detail="Tasks list cannot be empty.")
    if payload.workers <= 0:
        raise HTTPException(status_code=400, detail="Workers count must be greater than zero.")

    try:
        result = optimize_resource_allocation(payload.tasks, payload.workers)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    elapsed_ms = (time.perf_counter() - start_time) * 1000.0

    record_history(
        operation_type="RESOURCE_OPTIMIZE",
        title="Resource Workload Optimizer",
        summary=f"Optimized {len(payload.tasks)} tasks across {payload.workers} workers.",
        input_summary=f"{len(payload.tasks)} tasks, {payload.workers} workers, total load: {sum(payload.tasks)}",
        result_summary=f"Optimal Max Workload: {result.optimal_max_workload}, Iterations: {result.iterations}",
        iterations=result.iterations,
        execution_time_ms=elapsed_ms,
        status="SUCCESS"
    )

    return result


@app.get("/api/history", response_model=HistoryResponse, tags=["History"])
def get_history():
    """Retrieves session execution history."""
    return HistoryResponse(
        items=SESSION_HISTORY,
        total_count=len(SESSION_HISTORY)
    )


@app.delete("/api/history", tags=["History"])
def clear_history():
    """Clears all session execution history."""
    SESSION_HISTORY.clear()
    return {"message": "Session history cleared successfully."}


@app.get("/api/stats", response_model=StatsResponse, tags=["Dashboard"])
def get_stats():
    """Aggregates metrics for the dashboard."""
    total = len(SESSION_HISTORY)
    score_count = sum(1 for x in SESSION_HISTORY if x.operation_type == "SCORE_SEARCH")
    route_count = sum(1 for x in SESSION_HISTORY if x.operation_type == "ROUTE_SEARCH")
    opt_count = sum(1 for x in SESSION_HISTORY if x.operation_type == "RESOURCE_OPTIMIZE")
    avg_iter = (sum(x.iterations for x in SESSION_HISTORY) / total) if total > 0 else 0.0

    return StatsResponse(
        total_operations=total,
        score_searches=score_count,
        route_searches=route_count,
        resource_optimizations=opt_count,
        avg_iterations=round(avg_iter, 2)
    )


@app.get("/api/export-csv", tags=["Reports"])
def export_history_csv():
    """Exports session history as a downloadable CSV report."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID",
        "Timestamp",
        "Operation Type",
        "Title",
        "Input Summary",
        "Result Summary",
        "Iterations",
        "Execution Time (ms)",
        "Status"
    ])

    for item in SESSION_HISTORY:
        writer.writerow([
            item.id,
            item.timestamp,
            item.operation_type,
            item.title,
            item.input_summary,
            item.result_summary,
            item.iterations,
            item.execution_time_ms,
            item.status
        ])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=optimizer_history_report.csv"}
    )
