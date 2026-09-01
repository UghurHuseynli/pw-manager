import pytest
from app.core.config import parse_cors


def test_parse_cors_comma_separated_string() -> None:
    assert parse_cors("http://a.com,http://b.com") == [
        "http://a.com",
        "http://b.com",
    ]


def test_parse_cors_list_passthrough() -> None:
    origins = ["http://a.com", "http://b.com"]
    assert parse_cors(origins) == origins


def test_parse_cors_json_style_string_passthrough() -> None:
    # A string already starting with "[" is passed through as-is (it is
    # expected to be handled by pydantic's own list parsing afterwards).
    value = '["http://a.com"]'
    assert parse_cors(value) == value


def test_parse_cors_invalid_type_raises() -> None:
    with pytest.raises(ValueError):
        parse_cors(123)
