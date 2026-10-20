# Route & Score Optimizer — Comprehensive System Documentation

## 1. Executive Summary

**Route & Score Optimizer** is a full-stack educational and analytical web platform that demonstrates the power of **Binary Search** across three distinct algorithmic paradigms:
1. **Resource Allocation Optimizer:** Workload balancing using *Binary Search on the Answer* (the Painter's Partition / Book Allocation problem).
2. **Route Search:** Finding target waypoints in a *Rotated Sorted Array* with $O(\log n)$ pivot identification.
3. **Score Search:** Exact percentile/metric lookup using *Standard Binary Search* with step-by-step low/mid/high pointer tracing.
4. **Interactive Step-by-Step Visualizer:** Real-time visual timeline showing search bounds contracting logarithmically, active elements, and comparative explanations.
5. **Dashboard & Audit Reports:** Aggregated operational metrics, query telemetry, and JSON export capabilities.

---

## 2. Architecture & Tech Stack

```
+-------------------------------------------------------+
|                    Browser Client                     |
|           React 19 + Vite (Port 5173)                 |
|  - Glassmorphic UI (Vanilla CSS)                      |
|  - StepControls & Visualizer Timeline                 |
|  - Real-time Backend Health Polling                   |
+---------------------------+---------------------------+
                            |
                     REST HTTP (JSON)
                     Vite Proxy (/api)
                            |
+---------------------------v---------------------------+
|                    FastAPI Backend                    |
|             Python 3.13 + Uvicorn (Port 8000)         |
|  - In-Memory Query & Telemetry Store                  |
|  - Pydantic v2 Request/Response Validation            |
+---------------------------+---------------------------+
                            |
       +--------------------+--------------------+
       |                    |                    |
+------v-------+    +-------v-------+    +-------v-------+
|    Score     |    |    Route      |    |   Resource    |
|    Search    |    |    Search     |    |   Optimizer   |
| Standard BS  |    | Rotated Array |    |   BS on Ans   |
|   O(log n)   |    |   O(log n)    |    | O(n log(S-M)) |
+--------------+    +---------------+    +---------------+
```

### Component Breakdown
| Layer | Technologies | Responsibilities |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Lucide Icons, Vanilla CSS | UI rendering, user interaction, preset management, animated timeline playback |
| **Backend** | Python 3.13, FastAPI, Uvicorn | REST API endpoints, input validation, memory storage, error formatting |
| **Algorithms** | Pure Python (`backend/algorithms/`) | Core algorithm logic, mathematical invariants, detailed step telemetry |
| **Testing** | Pytest, Starlette TestClient | Unit tests for algorithms, edge case validation, REST endpoint integration tests |

---

## 3. Algorithm Deep Dives

### 3.1. Resource Allocation Optimizer (Binary Search on the Answer)
- **File:** `backend/algorithms/resource_optimizer.py`
- **Endpoint:** `POST /api/resource-optimize`
- **Problem Statement:** Given $n$ contiguous tasks with workloads $W = [w_1, w_2, \dots, w_n]$ and $k$ workers, assign contiguous segments of tasks to each worker such that the **maximum workload assigned to any worker is minimized**.

#### Mathematical Formulation & Monotonicity
Let $f(C)$ be the minimum number of workers required to process all tasks such that no worker's total workload exceeds capacity $C$.
- If $C_1 < C_2$, then $f(C_1) \ge f(C_2)$ (**monotonically decreasing**).
- If capacity $C$ is feasible ($f(C) \le k$), then any capacity $C' > C$ is also feasible.
- Therefore, we can binary search the capacity answer space:
  $$\text{Search Space: } [\text{low}, \text{high}] = [\max(W), \sum_{i=1}^n w_i]$$

#### Feasibility Function (Greedy Check)
```python
def is_feasible(tasks: list[int], max_workload: int, available_workers: int) -> tuple[bool, list[WorkerAllocation]]:
    current_worker_id = 1
    current_sum = 0
    current_tasks = []
    allocations = []

    for task in tasks:
        if current_sum + task > max_workload:
            # Seal off current worker and start the next
            allocations.append(WorkerAllocation(worker_id=current_worker_id, tasks=current_tasks, total_workload=current_sum))
            current_worker_id += 1
            current_sum = task
            current_tasks = [task]
        else:
            current_sum += task
            current_tasks.append(task)
            
    allocations.append(WorkerAllocation(worker_id=current_worker_id, tasks=current_tasks, total_workload=current_sum))
    return (current_worker_id <= available_workers, allocations)
```

#### Complexity Analysis
- **Time Complexity:** $O(n \cdot \log(\sum W - \max(W)))$, where each feasibility check takes linear time $O(n)$ and the search space size is $\sum W - \max(W)$.
- **Auxiliary Space Complexity:** $O(k)$ to store worker partitions.

---

### 3.2. Route Search in Rotated Sorted Arrays
- **File:** `backend/algorithms/rotated_array_search.py`
- **Endpoint:** `POST /api/route-search`
- **Problem Statement:** Search for a target value in an array originally sorted in ascending order that has been rotated at an unknown pivot index (e.g., `[40, 50, 60, 70, 10, 20, 30]`).

#### Key Algorithmic Invariant
For any subarray `arr[low..high]`, when split at `mid = (low + high) // 2`, **at least one half (`arr[low..mid]` or `arr[mid..high]`) is guaranteed to be strictly sorted**:
1. **Case 1: Left half is sorted (`arr[low] <= arr[mid]`)**
   - If `arr[low] <= target < arr[mid]`, target must be in the left half $\rightarrow$ `high = mid - 1`.
   - Otherwise, target is in the right half $\rightarrow$ `low = mid + 1`.
2. **Case 2: Right half is sorted (`arr[mid] <= arr[high]`)**
   - If `arr[mid] < target <= arr[high]`, target must be in the right half $\rightarrow$ `low = mid + 1`.
   - Otherwise, target is in the left half $\rightarrow$ `high = mid - 1`.

#### Pivot Index Detection
The pivot (index of the minimum element) is detected independently in $O(\log n)$ time:
- Compare `arr[mid]` with `arr[high]`. If `arr[mid] > arr[high]`, pivot lies in `[mid + 1, high]`; otherwise, it lies in `[low, mid]`.

#### Complexity Analysis
- **Time Complexity:** $O(\log n)$ strictly logarithmic time.
- **Auxiliary Space Complexity:** $O(1)$.

---

### 3.3. Score Search (Standard Binary Search)
- **File:** `backend/algorithms/binary_search.py`
- **Endpoint:** `POST /api/score-search`
- **Problem Statement:** Locate target score $T$ in a strictly sorted list $S = [s_0, s_1, \dots, s_{n-1}]$.

#### Operation Step Tracing
Each step generates full telemetry:
- `low`, `high`, `mid`, and `mid_value`.
- `comparison`: e.g., `"arr[4] (56) < target (77)"`.
- `reasoning`: Clear educational explanation on why the left half was eliminated.
- `eliminated_range`: `[low, mid]` or `[mid, high]`.
- `remaining_candidates`: Size of the remaining search space.

#### Complexity Analysis
- **Time Complexity:** Best: $O(1)$, Average/Worst: $O(\log n)$.
- **Auxiliary Space Complexity:** $O(1)$.

---

## 4. REST API Specification

### Base URL: `http://127.0.0.1:8000`

### 4.1. Health Check
- **`GET /`**
- **Response:**
  ```json
  {
    "status": "healthy",
    "service": "Route & Score Optimizer API",
    "version": "1.0.0",
    "algorithms": ["Standard Binary Search", "Rotated Sorted Array Search", "Binary Search on Answer"]
  }
  ```

### 4.2. Score Search API
- **`POST /api/score-search`**
- **Request Body:**
  ```json
  {
    "scores": [15, 28, 35, 42, 56, 68, 77, 85, 94, 99],
    "target": 77
  }
  ```
- **Response Body:**
  ```json
  {
    "target": 77,
    "found": true,
    "index": 6,
    "total_iterations": 4,
    "time_complexity": "O(log n)",
    "space_complexity": "O(1)",
    "steps": [
      {
        "step_number": 1,
        "low": 0,
        "high": 9,
        "mid": 4,
        "mid_value": 56,
        "comparison": "arr[4] (56) < target (77)",
        "action": "TARGET_GREATER",
        "reasoning": "Since arr[4] = 56 is less than target 77, target must lie to the right.",
        "eliminated_range": [0, 4],
        "remaining_candidates": 5
      }
    ]
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: If `scores` is empty or not sorted in ascending order.

### 4.3. Route Search API
- **`POST /api/route-search`**
- **Request Body:**
  ```json
  {
    "routes": [40, 50, 60, 70, 10, 20, 30],
    "target": 20
  }
  ```
- **Response Body:**
  ```json
  {
    "target": 20,
    "found": true,
    "index": 5,
    "pivot_index": 4,
    "total_iterations": 2,
    "time_complexity": "O(log n)",
    "space_complexity": "O(1)",
    "steps": [ ... ]
  }
  ```

### 4.4. Resource Optimizer API
- **`POST /api/resource-optimize`**
- **Request Body:**
  ```json
  {
    "tasks": [10, 20, 30, 40],
    "workers": 2
  }
  ```
- **Response Body:**
  ```json
  {
    "min_max_workload": 60,
    "total_tasks": 4,
    "total_workload_sum": 100,
    "max_single_task": 40,
    "workers_count": 2,
    "search_low_initial": 40,
    "search_high_initial": 100,
    "total_iterations": 5,
    "allocations": [
      {
        "worker_id": 1,
        "tasks": [10, 20, 30],
        "total_workload": 60,
        "is_bottleneck": true
      },
      {
        "worker_id": 2,
        "tasks": [40],
        "total_workload": 40,
        "is_bottleneck": false
      }
    ],
    "time_complexity": "O(n · log(sum - max))",
    "space_complexity": "O(k)"
  }
  ```

### 4.5. Telemetry & Analytics APIs
- **`GET /api/stats`**: Real-time aggregated statistics (total queries, breakdown by module, average iterations).
- **`GET /api/history`**: Audit trail of the last 100 executed operations.
- **`DELETE /api/history`**: Clears session audit history.

---

## 5. Automated Testing & Verification

The suite features 23 tests implemented using `pytest` and `starlette.testclient.TestClient`.

```
============================= test session starts =============================
platform win32 -- Python 3.13.3, pytest-9.1.1, pluggy-1.7.0
rootdir: D:\p2, configfile: pytest.ini
collected 23 items

backend/tests/test_api.py::test_health_check_endpoint PASSED             [  4%]
backend/tests/test_api.py::test_score_search_api_success PASSED          [  8%]
backend/tests/test_api.py::test_score_search_api_unsorted_error PASSED   [ 13%]
backend/tests/test_api.py::test_route_search_api_success PASSED          [ 17%]
backend/tests/test_api.py::test_resource_optimize_api_success PASSED     [ 21%]
backend/tests/test_api.py::test_resource_optimize_api_invalid_workers PASSED [ 26%]
backend/tests/test_api.py::test_history_and_stats_api PASSED             [ 30%]
backend/tests/test_binary_search.py::test_binary_search_found_middle PASSED [ 34%]
backend/tests/test_binary_search.py::test_binary_search_found_ends PASSED [ 39%]
backend/tests/test_binary_search.py::test_binary_search_not_found PASSED [ 43%]
backend/tests/test_binary_search.py::test_binary_search_single_element PASSED [ 47%]
backend/tests/test_binary_search.py::test_binary_search_empty PASSED     [ 52%]
backend/tests/test_resource_optimizer.py::test_resource_optimizer_standard_case PASSED [ 56%]
backend/tests/test_resource_optimizer.py::test_resource_optimizer_painters_partition PASSED [ 60%]
backend/tests/test_resource_optimizer.py::test_resource_optimizer_workers_more_than_tasks PASSED [ 65%]
backend/tests/test_resource_optimizer.py::test_resource_optimizer_single_worker PASSED [ 69%]
backend/tests/test_resource_optimizer.py::test_resource_optimizer_negative_tasks PASSED [ 73%]
backend/tests/test_resource_optimizer.py::test_resource_optimizer_empty PASSED [ 78%]
backend/tests/test_rotated_array.py::test_find_pivot_index PASSED        [ 82%]
backend/tests/test_rotated_array.py::test_search_rotated_array_various_positions PASSED [ 86%]
backend/tests/test_rotated_array.py::test_search_rotated_array_not_found PASSED [ 91%]
backend/tests/test_rotated_array.py::test_search_rotated_array_unrotated PASSED [ 95%]
backend/tests/test_rotated_array.py::test_search_rotated_array_single_and_empty PASSED [100%]

======================== 23 passed, 1 warning in 2.08s ========================
```

---

## 6. Execution Guide

### Starting the Servers
1. **Backend (Terminal 1):**
   ```powershell
   cd D:\p2
   .\venv\Scripts\python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
   ```
2. **Frontend (Terminal 2):**
   ```powershell
   cd D:\p2\frontend
   npm run dev
   ```
3. **Open Application:** [http://localhost:5173](http://localhost:5173)
4. **Open API Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
