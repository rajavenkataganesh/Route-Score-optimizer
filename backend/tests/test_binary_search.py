import pytest
from backend.algorithms.binary_search import binary_search


def test_binary_search_found_middle():
    arr = [10, 20, 30, 40, 50, 60, 70]
    res = binary_search(arr, 40)
    assert res.found is True
    assert res.index == 3
    assert res.target == 40
    assert res.iterations > 0
    assert len(res.steps) > 0
    assert res.steps[-1].action == "found"


def test_binary_search_found_ends():
    arr = [5, 12, 19, 23, 45, 67, 89]
    # First element
    res_first = binary_search(arr, 5)
    assert res_first.found is True
    assert res_first.index == 0

    # Last element
    res_last = binary_search(arr, 89)
    assert res_last.found is True
    assert res_last.index == 6


def test_binary_search_not_found():
    arr = [10, 20, 30, 40, 50]
    # Lower than min
    res_low = binary_search(arr, 5)
    assert res_low.found is False
    assert res_low.index == -1

    # Higher than max
    res_high = binary_search(arr, 99)
    assert res_high.found is False
    assert res_high.index == -1

    # Between elements
    res_mid = binary_search(arr, 25)
    assert res_mid.found is False
    assert res_mid.index == -1
    assert res_mid.steps[-1].action == "not_found"


def test_binary_search_single_element():
    res_match = binary_search([42], 42)
    assert res_match.found is True
    assert res_match.index == 0

    res_no_match = binary_search([42], 100)
    assert res_no_match.found is False
    assert res_no_match.index == -1


def test_binary_search_empty():
    res = binary_search([], 10)
    assert res.found is False
    assert res.index == -1
    assert res.iterations == 0
    assert len(res.steps) == 0
