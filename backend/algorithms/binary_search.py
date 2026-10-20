from typing import List, Tuple, Dict, Any
from backend.models.schemas import BinarySearchStep, ScoreSearchResponse


def binary_search(arr: List[float], target: float) -> ScoreSearchResponse:
    """
    Executes standard Binary Search on a sorted array of numbers.
    Time Complexity: O(log n)
    Space Complexity: O(1) auxiliary (O(k) for step tracing)

    Returns:
        ScoreSearchResponse containing match status, index, iteration count,
        and step-by-step visualizer trace.
    """
    n = len(arr)
    steps: List[BinarySearchStep] = []

    if n == 0:
        return ScoreSearchResponse(
            target=target,
            found=False,
            index=-1,
            iterations=0,
            total_elements=0,
            steps=[],
            message="Search failed: The input array is empty."
        )

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
                BinarySearchStep(
                    step_number=iteration,
                    low=low,
                    high=high,
                    mid=mid,
                    mid_value=mid_val,
                    action="found",
                    explanation=(
                        f"Step {iteration}: Compared target ({target}) with arr[{mid}] = {mid_val}. "
                        f"Exact match found! Target is located at index {mid}."
                    ),
                    active_range=active_indices
                )
            )
            break
        elif mid_val < target:
            explanation = (
                f"Step {iteration}: Compared target ({target}) with arr[{mid}] = {mid_val}. "
                f"Since target {target} > {mid_val}, the target must lie in the right subarray. "
                f"Updating search boundary: low = mid + 1 = {mid + 1}."
            )
            steps.append(
                BinarySearchStep(
                    step_number=iteration,
                    low=low,
                    high=high,
                    mid=mid,
                    mid_value=mid_val,
                    action="go_right",
                    explanation=explanation,
                    active_range=active_indices
                )
            )
            low = mid + 1
        else:
            explanation = (
                f"Step {iteration}: Compared target ({target}) with arr[{mid}] = {mid_val}. "
                f"Since target {target} < {mid_val}, the target must lie in the left subarray. "
                f"Updating search boundary: high = mid - 1 = {mid - 1}."
            )
            steps.append(
                BinarySearchStep(
                    step_number=iteration,
                    low=low,
                    high=high,
                    mid=mid,
                    mid_value=mid_val,
                    action="go_left",
                    explanation=explanation,
                    active_range=active_indices
                )
            )
            high = mid - 1

    if found_index == -1:
        # Final terminal step explaining why not found
        steps.append(
            BinarySearchStep(
                step_number=iteration + 1,
                low=low,
                high=high,
                mid=max(0, min(n - 1, (low + high) // 2)),
                mid_value=arr[max(0, min(n - 1, (low + high) // 2))],
                action="not_found",
                explanation=(
                    f"Search range exhausted: low ({low}) exceeded high ({high}). "
                    f"Target {target} does not exist in the array."
                ),
                active_range=[]
            )
        )
        msg = f"Target score {target} was not found in the array after {iteration} iterations."
    else:
        msg = f"Target score {target} found at index {found_index} in {iteration} iteration(s)."

    return ScoreSearchResponse(
        target=target,
        found=(found_index != -1),
        index=found_index,
        iterations=iteration,
        total_elements=n,
        steps=steps,
        message=msg
    )
