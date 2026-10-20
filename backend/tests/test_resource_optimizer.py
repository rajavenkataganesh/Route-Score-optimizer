import pytest
from backend.algorithms.resource_optimizer import optimize_resource_allocation, check_feasibility


def test_resource_optimizer_standard_case():
    # Tasks: [10, 20, 30, 40], Workers: 2
    # Possible partitions:
    # Worker 1: [10, 20, 30] (60), Worker 2: [40] (40) -> Max load = 60
    # Other partition: [10, 20] (30), [30, 40] (70) -> Max load = 70
    # Optimal max load is 60.
    res = optimize_resource_allocation([10, 20, 30, 40], 2)
    assert res.optimal_max_workload == 60
    assert res.workers_available == 2
    assert res.total_tasks == 4
    assert res.total_workload == 100
    assert len(res.allocations) == 2
    assert max(a.total_load for a in res.allocations) <= 60


def test_resource_optimizer_painters_partition():
    # Tasks: [1, 2, 3, 4, 5, 6, 7, 8, 9], 3 workers -> optimal max is 17
    # Worker 1: 1+2+3+4+5 = 15
    # Worker 2: 6+7 = 13
    # Worker 3: 8+9 = 17
    res = optimize_resource_allocation([1, 2, 3, 4, 5, 6, 7, 8, 9], 3)
    assert res.optimal_max_workload == 17
    assert len(res.allocations) == 3
    assert max(a.total_load for a in res.allocations) <= 17


def test_resource_optimizer_workers_more_than_tasks():
    # 5 workers, 3 tasks
    res = optimize_resource_allocation([15, 30, 45], 5)
    assert res.optimal_max_workload == 45
    assert len(res.allocations) == 5
    # Active workers should have individual tasks
    active_loads = [a.total_load for a in res.allocations if a.tasks]
    assert active_loads == [15, 30, 45]


def test_resource_optimizer_single_worker():
    # 1 worker, all tasks
    res = optimize_resource_allocation([10, 20, 30], 1)
    assert res.optimal_max_workload == 60
    assert len(res.allocations) == 1
    assert res.allocations[0].total_load == 60


def test_resource_optimizer_negative_tasks():
    with pytest.raises(ValueError, match="negative"):
        optimize_resource_allocation([10, -5, 20], 2)


def test_resource_optimizer_empty():
    res = optimize_resource_allocation([], 3)
    assert res.total_tasks == 0
    assert res.optimal_max_workload == 0
