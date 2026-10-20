from typing import List, Optional
from backend.models.schemas import RotatedSearchStep, RouteSearchResponse


def find_pivot_index(arr: List[float]) -> Optional[int]:
    """
    Finds the index of the pivot (the point where rotation occurs).
    In a rotated sorted array [4, 5, 6, 7, 0, 1, 2], the pivot element is 0 at index 4
    (or peak 7 at index 3). Here we define pivot as the minimum element's index.
    Returns 0 if the array is not rotated (or already sorted).
    """
    n = len(arr)
    if n <= 1:
        return 0

    low, high = 0, n - 1
    # If the array is strictly sorted without rotation
    if arr[low] < arr[high]:
        return 0

    while low < high:
        mid = (low + high) // 2
        if arr[mid] > arr[high]:
            low = mid + 1
        else:
            high = mid
    return low


def search_rotated_array(arr: List[float], target: float) -> RouteSearchResponse:
    """
    Modified Binary Search for searching in a rotated sorted array.
    Time Complexity: O(log n)
    Space Complexity: O(1) auxiliary (O(k) for step tracing)

    Under standard rotated sorted array assumptions with distinct elements,
    at least one half of the array [low...mid] or [mid...high] is always sorted.
    We test if the target falls within the sorted half; if yes, we discard the other half,
    otherwise we search the unsorted half.
    """
    n = len(arr)
    steps: List[RotatedSearchStep] = []

    if n == 0:
        return RouteSearchResponse(
            target=target,
            found=False,
            index=-1,
            pivot_index=None,
            iterations=0,
            total_elements=0,
            steps=[],
            message="Search failed: Route array is empty."
        )

    pivot_idx = find_pivot_index(arr)
    low = 0
    high = n - 1
    iteration = 0
    found_index = -1

    while low <= high:
        iteration += 1
        mid = (low + high) // 2
        mid_val = arr[mid]
        active_indices = list(range(low, high + 1))

        if mid_val == target:
            found_index = mid
            steps.append(
                RotatedSearchStep(
                    step_number=iteration,
                    low=low,
                    high=high,
                    mid=mid,
                    mid_value=mid_val,
                    sorted_half="match",
                    action="found",
                    explanation=(
                        f"Step {iteration}: Target route {target} matches arr[{mid}] = {mid_val}. "
                        f"Search concluded successfully at index {mid}."
                    ),
                    active_range=active_indices
                )
            )
            break

        # Check which subarray is sorted
        if arr[low] <= mid_val:
            # Left half is sorted: arr[low...mid]
            sorted_half = "left"
            if arr[low] <= target < mid_val:
                action = "go_left"
                explanation = (
                    f"Step {iteration}: Left half [index {low}..{mid}] is sorted ({arr[low]} <= {mid_val}). "
                    f"Target {target} lies within [{arr[low]}, {mid_val}). "
                    f"Shrinking boundary to left: high = mid - 1 = {mid - 1}."
                )
                steps.append(
                    RotatedSearchStep(
                        step_number=iteration,
                        low=low,
                        high=high,
                        mid=mid,
                        mid_value=mid_val,
                        sorted_half=sorted_half,
                        action=action,
                        explanation=explanation,
                        active_range=active_indices
                    )
                )
                high = mid - 1
            else:
                action = "go_right"
                explanation = (
                    f"Step {iteration}: Left half [index {low}..{mid}] is sorted ({arr[low]} <= {mid_val}), "
                    f"but target {target} does NOT lie within [{arr[low]}, {mid_val}). "
                    f"Target must be in right subarray: low = mid + 1 = {mid + 1}."
                )
                steps.append(
                    RotatedSearchStep(
                        step_number=iteration,
                        low=low,
                        high=high,
                        mid=mid,
                        mid_value=mid_val,
                        sorted_half=sorted_half,
                        action=action,
                        explanation=explanation,
                        active_range=active_indices
                    )
                )
                low = mid + 1
        else:
            # Right half is sorted: arr[mid...high]
            sorted_half = "right"
            if mid_val < target <= arr[high]:
                action = "go_right"
                explanation = (
                    f"Step {iteration}: Right half [index {mid}..{high}] is sorted ({mid_val} <= {arr[high]}). "
                    f"Target {target} lies within ({mid_val}, {arr[high]}]. "
                    f"Shrinking boundary to right: low = mid + 1 = {mid + 1}."
                )
                steps.append(
                    RotatedSearchStep(
                        step_number=iteration,
                        low=low,
                        high=high,
                        mid=mid,
                        mid_value=mid_val,
                        sorted_half=sorted_half,
                        action=action,
                        explanation=explanation,
                        active_range=active_indices
                    )
                )
                low = mid + 1
            else:
                action = "go_left"
                explanation = (
                    f"Step {iteration}: Right half [index {mid}..{high}] is sorted ({mid_val} <= {arr[high]}), "
                    f"but target {target} does NOT lie within ({mid_val}, {arr[high]}]. "
                    f"Target must be in left subarray: high = mid - 1 = {mid - 1}."
                )
                steps.append(
                    RotatedSearchStep(
                        step_number=iteration,
                        low=low,
                        high=high,
                        mid=mid,
                        mid_value=mid_val,
                        sorted_half=sorted_half,
                        action=action,
                        explanation=explanation,
                        active_range=active_indices
                    )
                )
                high = mid - 1

    if found_index == -1:
        steps.append(
            RotatedSearchStep(
                step_number=iteration + 1,
                low=low,
                high=high,
                mid=max(0, min(n - 1, (low + high) // 2)),
                mid_value=arr[max(0, min(n - 1, (low + high) // 2))],
                sorted_half="none",
                action="not_found",
                explanation=(
                    f"Search range exhausted: low ({low}) exceeded high ({high}). "
                    f"Route target {target} does not exist in the rotated array."
                ),
                active_range=[]
            )
        )
        msg = f"Target route {target} was not found in the rotated array after {iteration} iterations."
    else:
        msg = f"Target route {target} found at index {found_index} in {iteration} iteration(s) (rotation pivot at index {pivot_idx})."

    return RouteSearchResponse(
        target=target,
        found=(found_index != -1),
        index=found_index,
        pivot_index=pivot_idx,
        iterations=iteration,
        total_elements=n,
        steps=steps,
        message=msg
    )
