import pytest
from backend.algorithms.rotated_array_search import search_rotated_array, find_pivot_index


def test_find_pivot_index():
    assert find_pivot_index([4, 5, 6, 7, 0, 1, 2]) == 4
    assert find_pivot_index([1, 2, 3, 4, 5]) == 0
    assert find_pivot_index([3, 1]) == 1
    assert find_pivot_index([]) == 0


def test_search_rotated_array_various_positions():
    arr = [4, 5, 6, 7, 0, 1, 2]
    # Target in right side of pivot
    res0 = search_rotated_array(arr, 0)
    assert res0.found is True
    assert res0.index == 4

    res2 = search_rotated_array(arr, 2)
    assert res2.found is True
    assert res2.index == 6

    # Target in left side of pivot
    res4 = search_rotated_array(arr, 4)
    assert res4.found is True
    assert res4.index == 0

    res6 = search_rotated_array(arr, 6)
    assert res6.found is True
    assert res6.index == 2


def test_search_rotated_array_not_found():
    arr = [4, 5, 6, 7, 0, 1, 2]
    res3 = search_rotated_array(arr, 3)
    assert res3.found is False
    assert res3.index == -1

    res_neg = search_rotated_array(arr, -5)
    assert res_neg.found is False
    assert res_neg.index == -1


def test_search_rotated_array_unrotated():
    arr = [10, 20, 30, 40, 50]
    res = search_rotated_array(arr, 30)
    assert res.found is True
    assert res.index == 2


def test_search_rotated_array_single_and_empty():
    assert search_rotated_array([10], 10).found is True
    assert search_rotated_array([10], 20).found is False
    assert search_rotated_array([], 10).found is False
