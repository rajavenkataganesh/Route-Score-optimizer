import math
from typing import List, Tuple, Dict, Any
from backend.models.schemas import (
    WorkerAllocation,
    OptimizerStep,
    ResourceOptimizeResponse
)


def check_feasibility(tasks: List[float], max_limit: float, workers_available: int) -> Tuple[bool, int]:
    """
    Greedy monotonic feasibility check:
    Determines if tasks can be partitioned contiguously into <= workers_available
    such that no worker exceeds max_limit.

    Returns:
        (is_feasible, workers_needed)
    """
    if not tasks:
        return True, 0

    workers_needed = 1
    current_load = 0.0

    for task in tasks:
        if task > max_limit:
            return False, float("inf")
        if current_load + task > max_limit:
            workers_needed += 1
            current_load = task
        else:
            current_load += task

    return (workers_needed <= workers_available), workers_needed


def compute_allocations(tasks: List[float], max_limit: float, workers_available: int) -> List[WorkerAllocation]:
    """
    Partitions tasks contiguously among workers given the optimal maximum limit.
    Ensures all workers (up to workers_available) are accounted for, even if some have 0 tasks.
    When workers_available >= len(tasks), each task is allocated to an individual worker.
    """
    allocations: List[WorkerAllocation] = []
    
    if workers_available >= len(tasks):
        for idx, task in enumerate(tasks):
            allocations.append(
                WorkerAllocation(
                    worker_id=idx + 1,
                    tasks=[task],
                    task_indices=[idx],
                    total_load=round(task, 2)
                )
            )
        for w in range(len(tasks) + 1, workers_available + 1):
            allocations.append(
                WorkerAllocation(
                    worker_id=w,
                    tasks=[],
                    task_indices=[],
                    total_load=0.0
                )
            )
        return allocations

    current_worker_tasks: List[float] = []
    current_worker_indices: List[int] = []
    current_load = 0.0
    worker_id = 1

    for idx, task in enumerate(tasks):
        if current_load + task > max_limit and current_worker_tasks:
            allocations.append(
                WorkerAllocation(
                    worker_id=worker_id,
                    tasks=current_worker_tasks,
                    task_indices=current_worker_indices,
                    total_load=round(current_load, 2)
                )
            )
            worker_id += 1
            current_worker_tasks = [task]
            current_worker_indices = [idx]
            current_load = task
        else:
            current_worker_tasks.append(task)
            current_worker_indices.append(idx)
            current_load += task

    if current_worker_tasks:
        allocations.append(
            WorkerAllocation(
                worker_id=worker_id,
                tasks=current_worker_tasks,
                task_indices=current_worker_indices,
                total_load=round(current_load, 2)
            )
        )
        worker_id += 1

    # Fill any remaining idle workers (if workers_available > number of partitions)
    while worker_id <= workers_available:
        allocations.append(
            WorkerAllocation(
                worker_id=worker_id,
                tasks=[],
                task_indices=[],
                total_load=0.0
            )
        )
        worker_id += 1

    return allocations


def optimize_resource_allocation(tasks: List[float], workers: int) -> ResourceOptimizeResponse:
    """
    Binary Search on Answer to determine the minimum possible maximum workload.

    Assumption:
        Tasks must remain in their original sequence (contiguous grouping).
        Each worker receives a contiguous slice of tasks.

    Time Complexity: O(N * log(sum(tasks) - max(tasks)))
    Space Complexity: O(K) where K is number of workers

    Returns:
        ResourceOptimizeResponse with optimal workload, step trace, and worker assignments.
    """
    n = len(tasks)
    if n == 0:
        return ResourceOptimizeResponse(
            workers_available=workers,
            total_tasks=0,
            total_workload=0.0,
            optimal_max_workload=0.0,
            theoretical_lower_bound=0.0,
            theoretical_upper_bound=0.0,
            allocations=[],
            iterations=0,
            steps=[],
            metrics={},
            message="Optimization failed: Task list is empty."
        )

    # Check for invalid negative tasks
    if any(t < 0 for t in tasks):
        raise ValueError("Task workloads cannot be negative.")

    total_load = sum(tasks)
    max_single_task = max(tasks)

    # If all tasks are integer values, use integer binary search; otherwise round
    is_all_ints = all(isinstance(t, int) or t.is_integer() for t in tasks)

    # Search range:
    # Lower bound: max single task (a worker must at least be able to process the largest task)
    # Upper bound: sum of all tasks (one worker processes everything)
    low = int(max_single_task) if is_all_ints else max_single_task
    high = int(total_load) if is_all_ints else total_load

    theoretical_lower = max(max_single_task, math.ceil(total_load / workers) if is_all_ints else (total_load / workers))
    theoretical_upper = total_load

    steps: List[OptimizerStep] = []
    iteration = 0
    optimal_limit = high

    # If workers >= tasks, each worker takes at most one task
    if workers >= n:
        optimal_limit = max_single_task
        allocations = compute_allocations(tasks, optimal_limit, workers)
        steps.append(
            OptimizerStep(
                step_number=1,
                low=low,
                high=high,
                mid=optimal_limit,
                feasible=True,
                workers_needed=n,
                workers_available=workers,
                explanation=(
                    f"Workers ({workers}) >= Tasks ({n}). Each worker can take at most 1 task. "
                    f"The optimal maximum workload is simply the maximum single task: {optimal_limit}."
                )
            )
        )
        loads = [a.total_load for a in allocations if a.tasks]
        return ResourceOptimizeResponse(
            workers_available=workers,
            total_tasks=n,
            total_workload=round(total_load, 2),
            optimal_max_workload=round(optimal_limit, 2),
            theoretical_lower_bound=round(theoretical_lower, 2),
            theoretical_upper_bound=round(theoretical_upper, 2),
            allocations=allocations,
            iterations=1,
            steps=steps,
            metrics={
                "min_assigned_load": round(min(loads) if loads else 0, 2),
                "max_assigned_load": round(max(loads) if loads else 0, 2),
                "utilization_rate": round((total_load / (optimal_limit * workers) * 100) if optimal_limit * workers > 0 else 100, 2),
                "idle_workers": workers - len(loads)
            },
            message=f"Optimal workload limit found: {optimal_limit} with {workers} workers."
        )

    # Binary search loop
    while low <= high:
        iteration += 1
        if is_all_ints:
            mid = (low + high) // 2
        else:
            mid = round((low + high) / 2.0, 2)
            if high - low < 0.01:
                break

        feasible, needed = check_feasibility(tasks, mid, workers)

        if feasible:
            optimal_limit = mid
            explanation = (
                f"Step {iteration}: Tested max workload limit {mid}. "
                f"Tasks can be assigned using {needed} worker(s) (<= available {workers}). "
                f"FEASIBLE! Candidate optimal limit updated to {mid}. Now trying lower workloads: high = {mid - 1}."
            )
            steps.append(
                OptimizerStep(
                    step_number=iteration,
                    low=round(low, 2),
                    high=round(high, 2),
                    mid=round(mid, 2),
                    feasible=True,
                    workers_needed=needed,
                    workers_available=workers,
                    explanation=explanation
                )
            )
            if is_all_ints:
                high = mid - 1
            else:
                high = mid - 0.01
        else:
            explanation = (
                f"Step {iteration}: Tested max workload limit {mid}. "
                f"Tasks would require {needed} worker(s), exceeding available {workers}. "
                f"INFEASIBLE! Need higher workload capacity: low = {mid + 1}."
            )
            steps.append(
                OptimizerStep(
                    step_number=iteration,
                    low=round(low, 2),
                    high=round(high, 2),
                    mid=round(mid, 2),
                    feasible=False,
                    workers_needed=needed if needed != float("inf") else workers + 1,
                    workers_available=workers,
                    explanation=explanation
                )
            )
            if is_all_ints:
                low = mid + 1
            else:
                low = mid + 0.01

    allocations = compute_allocations(tasks, optimal_limit, workers)
    loads = [a.total_load for a in allocations if a.tasks]
    max_load = max(loads) if loads else 0
    min_load = min(loads) if loads else 0
    balance_variance = round(max_load - min_load, 2)
    utilization_rate = round((total_load / (optimal_limit * workers) * 100) if (optimal_limit * workers) > 0 else 100, 2)

    return ResourceOptimizeResponse(
        workers_available=workers,
        total_tasks=n,
        total_workload=round(total_load, 2),
        optimal_max_workload=round(optimal_limit, 2),
        theoretical_lower_bound=round(theoretical_lower, 2),
        theoretical_upper_bound=round(theoretical_upper, 2),
        allocations=allocations,
        iterations=iteration,
        steps=steps,
        metrics={
            "min_assigned_load": round(min_load, 2),
            "max_assigned_load": round(max_load, 2),
            "load_difference": balance_variance,
            "utilization_rate": utilization_rate,
            "active_workers": len(loads),
            "idle_workers": workers - len(loads)
        },
        message=f"Optimal maximum workload is {round(optimal_limit, 2)} across {workers} workers, determined in {iteration} binary search iterations."
    )
