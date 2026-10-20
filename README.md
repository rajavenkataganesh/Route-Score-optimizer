# Route & Score Optimizer

A production-ready full-stack web application demonstrating Data Structures and Algorithms (DSA) through:
1. **Resource Allocation Optimizer** using **Binary Search on the Answer** (Painter's Partition / Book Allocation problem).
2. **Route Search** using **Rotated Sorted Array Binary Search** with automated pivot detection.
3. **Score Search** using **Standard Binary Search** with real-time iteration metrics.
4. **Interactive Step-by-Step Algorithm Visualizer** showing low/mid/high pointer movements, array element highlights, range narrowing explanations, and auto-playback controls.
5. **Analytics Dashboard & Reports** with statistical aggregations, operational history, and JSON export.

---

## Technology Stack

- **Frontend:** React 19, Vite, Lucide Icons, Pure Vanilla CSS (responsive, dark-mode glassmorphic theme).
- **Backend:** Python 3.13, FastAPI, Pydantic, Uvicorn.
- **Algorithms:** Python implementations with detailed step tracing for educational visualization.
- **Testing:** Pytest unit and integration test suite (`23 passed`).
- **Communication:** REST APIs via HTTP (`fetch` with Vite development proxy).

---

## Directory Structure

```
p2/
├── backend/
│   ├── algorithms/
│   │   ├── binary_search.py        # Standard binary search with step tracing
│   │   ├── rotated_array_search.py # Rotated sorted array search & pivot index
│   │   └── resource_optimizer.py   # Binary search on answer for contiguous allocation
│   ├── models/
│   │   └── schemas.py              # Pydantic request & response models
│   ├── tests/
│   │   ├── test_api.py             # FastAPI TestClient endpoint test suite
│   │   ├── test_binary_search.py   # Standard binary search unit tests
│   │   ├── test_rotated_array.py   # Rotated array unit tests
│   │   └── test_resource_optimizer.py # Resource optimizer unit tests
│   ├── main.py                     # FastAPI application & REST endpoints
│   ├── requirements.txt            # Python dependencies
│   └── README.md                   # Backend documentation
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Header navigation & backend status badge
│   │   │   ├── Dashboard.jsx       # Operations overview, metrics, quick start
│   │   │   ├── ResourceOptimizer.jsx # Workload allocation with presets
│   │   │   ├── RouteSearch.jsx     # Rotated array route search
│   │   │   ├── ScoreSearch.jsx     # Standard score search
│   │   │   ├── Visualizer.jsx      # Animated pointer step visualizer
│   │   │   ├── StepControls.jsx    # Play/Pause, prev/next, speed slider
│   │   │   ├── ComplexityBadge.jsx # Time & space complexity tags
│   │   │   └── Reports.jsx         # Full operation audit log & JSON export
│   │   ├── services/
│   │   │   └── api.js              # Centralized backend REST API client
│   │   ├── App.jsx                 # Top-level view router and layout
│   │   ├── main.jsx                # React DOM entry point
│   │   └── index.css               # Modern glassmorphism CSS design system
│   ├── package.json                # Frontend dependencies & scripts
│   └── vite.config.js              # Vite configuration with API proxy to port 8000
├── pytest.ini                      # Pytest configuration
└── README.md                       # Project overview & execution guide
```

---

## Algorithms & Theoretical Complexity

| Algorithm | Feature | Time Complexity | Auxiliary Space | Key Invariant / Guarantee |
| :--- | :--- | :--- | :--- | :--- |
| **Standard Binary Search** | Score Search | $O(\log n)$ | $O(1)$ | Discards half the search space per comparison |
| **Rotated Array Search** | Route Search | $O(\log n)$ | $O(1)$ | Identifies which half is sorted, then prunes |
| **Binary Search on Answer** | Resource Optimizer | $O(n \cdot \log(\Sigma w - \max w))$ | $O(k)$ | Workload feasibility is monotonic: $F(W)$ |

---

## Windows PowerShell Setup and Execution

Open **Visual Studio Code** in `D:\p2` and run the following commands in PowerShell.

### 1. Run Automated Pytest Suite
```powershell
# From the project root D:\p2
.\venv\Scripts\python -m pytest -v
```

### 2. Start the Python FastAPI Backend (Terminal 1)
```powershell
cd D:\p2
.\venv\Scripts\Activate.ps1
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend will be running at:* `http://127.0.0.1:8000`  
*Interactive Swagger Documentation:* `http://127.0.0.1:8000/docs`

### 3. Start the React Vite Frontend (Terminal 2)
```powershell
cd D:\p2\frontend
npm run dev
```
*Frontend will be running at:* `http://localhost:5173`

---

## Sample Inputs & Quick Test Presets

### Resource Allocation Optimizer
- **Tasks:** `10, 20, 30, 40`
- **Workers:** `2`
- **Expected Workload Limit:** `60`
- **Worker 1:** Tasks `[10, 20, 30]` (Sum: 60)
- **Worker 2:** Tasks `[40]` (Sum: 40)

### Rotated Route Search
- **Route IDs / Scores:** `40, 50, 60, 70, 10, 20, 30`
- **Target:** `20`
- **Expected Index:** `5`
- **Detected Pivot (Minimum):** Index `4` (Value: 10)

### Score Search
- **Scores:** `15, 28, 35, 42, 56, 68, 77, 85, 94, 99`
- **Target:** `77`
- **Expected Index:** `6`
- **Iterations:** 4 steps
