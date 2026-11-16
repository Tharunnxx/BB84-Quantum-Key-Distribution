import pytest

sq = pytest.importorskip("sequence")

from sequence_distance_bb84 import DEFAULT_DISTANCES_KM, parse_distances


def test_default_distances_are_positive():
    assert DEFAULT_DISTANCES_KM[0] == 1
    assert all(distance > 0 for distance in DEFAULT_DISTANCES_KM)


def test_parse_distances():
    assert parse_distances("1, 10, 25") == [1.0, 10.0, 25.0]
