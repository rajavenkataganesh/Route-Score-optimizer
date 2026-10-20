# Route & Score Optimizer — Backend (FastAPI + Python)

A high-performance Python FastAPI backend implementing Data Structures and Algorithms (DSA) centered around Binary Search variations:
1. **Standard Binary Search** (`O(log n)` time, `O(1)` space)
2. **Rotated Sorted Array Search** (`O(log n)` time, `O(1)` space)
3. **Binary Search on the Answer — Resource Allocation Optimizer** (`O(n · log(sum - max))` time, `O(k)` space)

---

## Directory Structure
```
backend/
├── algorithms/
│   ├── __init__.py
│   ├── binary_search.py        # Standard binary search with step tracing
│   ├── rotated_array_search.py # Rotated sorted array search & pivot detection
│   └── resource_optimizer.py   # Contiguous task-to-worker allocation
├── models/
│   ├── __init__.py
│   └── schemas.py              # Pydantic validation models
├── tests/
│   ├── __init__.py
│   ├── test_api.py             # FastAPI TestClient endpoint tests
│   ├── test_binary_search.py   # Unit tests for binary search
│   ├── test_rotated_array.py   # Unit tests for rotated array search
│   └── test_resource_optimizer.py # Unit tests for workload partition
├── main.py                     # FastAPI application & REST endpoints
├── requirements.txt            # Python dependencies
└── README.md                   # Backend documentation
```

---

## Algorithms & Theoretical Analysis

### 1. Standard Binary Search
- **Endpoint:** `POST /api/score-search`
- **Core Invariant:** Search range `[low, high]` is halved in each step by comparing `target` with `arr[mid]`.
- **Time Complexity:** Best: `O(1)`, Average & Worst: `O(log n)`
- **Space Complexity:** `O(1)` auxiliary

### 2. Rotated Sorted Array Search
- **Endpoint:** `POST /api/route-search`
- **Core Invariant:** For any rotated sorted array of distinct elements, either `arr[low..mid]` or `arr[mid..high]` is guaranteed to be strictly sorted. If the target falls inside the range of the sorted half, we prune the other half; otherwise, we search the unsorted half.
- **Pivot Detection:** Identifies the minimum element index in `O(log n)` time.
- **Time Complexity:** `O(log n)`
- **Space Complexity:** `O(1)` auxiliary

### 3. Binary Search on the Answer (Resource Optimizer)
- **Endpoint:** `POST /api/resource-optimize`
- **Problem Formulation:** Given $n$ tasks with workloads $w_1, w_2, \dots, w_n$ and $k$ workers. Tasks must be assigned contiguously to preserve task order. Determine the minimum possible maximum workload assigned to any worker.
- **Monotonicity:** If a maximum workload limit $W$ is feasible, any limit $W' > W$ is also feasible. If $W$ is infeasible, any $W'' < W$ is also infeasible.
- **Search Range:**
  - Lower Bound: $\max(w_i)$ (a worker must at least be able to process the single largest task)
  - Upper Bound: $\sum w_i$ (one worker receives all tasks)
- **Feasibility Check:** Greedy contiguous allocation in `O(n)` time.
- **Time Complexity:** `O(n · log(sum(w) - max(w)))`
- **Space Complexity:** `O(k)` where $k$ is the number of workers.

---

## Setup & Running with PowerShell

### 1. Create and Activate Virtual Environment
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies
```powershell
pip install -r backend\requirements.txt
```

### 3. Run Automated Tests
```powershell
.\venv\Scripts\python -m pytest backend\tests -v
```

### 4. Start the FastAPI Server
```powershell
.\venv\Scripts\uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```
API Documentation will be accessible at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`
