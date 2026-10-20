from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field


# --- Binary Search Models ---
class BinarySearchStep(BaseModel):
    step_number: int
    low: int
    high: int
    mid: int
    mid_value: float
    action: str  # e.g., "compare", "found", "go_right", "go_left", "not_found"
    explanation: str
    active_range: List[int] = Field(default_factory=list)


class ScoreSearchRequest(BaseModel):
    scores: List[float] = Field(..., description="Sorted list of scores/numbers")
    target: float = Field(..., description="Target score to locate")


class ScoreSearchResponse(BaseModel):
    target: float
    found: bool
    index: int
    iterations: int
    total_elements: int
    time_complexity: str = "O(log n)"
    space_complexity: str = "O(1)"
    steps: List[BinarySearchStep]
    message: str


# --- Rotated Array Search Models ---
class RotatedSearchStep(BaseModel):
    step_number: int
    low: int
    high: int
    mid: int
    mid_value: float
    sorted_half: str  # "left" or "right"
    action: str
    explanation: str
    active_range: List[int] = Field(default_factory=list)


class RouteSearchRequest(BaseModel):
    routes: List[float] = Field(..., description="List of route IDs or scores in rotated sorted order")
    target: float = Field(..., description="Target route ID or score")


class RouteSearchResponse(BaseModel):
    target: float
    found: bool
    index: int
    pivot_index: Optional[int] = None
    iterations: int
    total_elements: int
    time_complexity: str = "O(log n)"
    space_complexity: str = "O(1)"
    steps: List[RotatedSearchStep]
    message: str


# --- Resource Optimizer Models ---
class WorkerAllocation(BaseModel):
    worker_id: int
    tasks: List[float]
    task_indices: List[int]
    total_load: float


class OptimizerStep(BaseModel):
    step_number: int
    low: float
    high: float
    mid: float  # candidate max workload limit
    feasible: bool
    workers_needed: int
    workers_available: int
    explanation: str


class ResourceOptimizeRequest(BaseModel):
    tasks: List[float] = Field(..., description="List of task workload units")
    workers: int = Field(..., gt=0, description="Number of available workers/resources (must be > 0)")


class ResourceOptimizeResponse(BaseModel):
    workers_available: int
    total_tasks: int
    total_workload: float
    optimal_max_workload: float
    theoretical_lower_bound: float
    theoretical_upper_bound: float
    allocations: List[WorkerAllocation]
    iterations: int
    time_complexity: str = "O(n · log(sum - max))"
    space_complexity: str = "O(k)"
    steps: List[OptimizerStep]
    metrics: Dict[str, Any]
    message: str


# --- History and Operations Models ---
class HistoryItem(BaseModel):
    id: str
    timestamp: str
    operation_type: str  # "SCORE_SEARCH", "ROUTE_SEARCH", "RESOURCE_OPTIMIZE"
    title: str
    summary: str
    input_summary: str
    result_summary: str
    iterations: int
    execution_time_ms: float
    status: str = "SUCCESS"


class HistoryResponse(BaseModel):
    items: List[HistoryItem]
    total_count: int


class StatsResponse(BaseModel):
    total_operations: int
    score_searches: int
    route_searches: int
    resource_optimizations: int
    avg_iterations: float
