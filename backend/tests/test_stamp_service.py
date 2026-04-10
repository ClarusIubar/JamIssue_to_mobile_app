from types import SimpleNamespace

import pytest
from fastapi import HTTPException, status

from app.config import Settings
from app.models import SessionUser, StampToggleRequest
from app.services import stamp_service


def build_session_user() -> SessionUser:
    return SessionUser(
        id="user-1",
        nickname="tester",
        email="tester@example.com",
        provider="kakao",
        profileImage=None,
        isAdmin=False,
        profileCompletedAt=None,
    )


def test_toggle_stamp_service_maps_permission_error_to_403(monkeypatch):
    def failing_toggle_stamp(*_args, **_kwargs):
        raise PermissionError("forbidden")

    monkeypatch.setattr(stamp_service, "toggle_stamp_entry", failing_toggle_stamp)

    with pytest.raises(HTTPException) as caught:
        stamp_service.toggle_stamp_service(
            SimpleNamespace(),
            StampToggleRequest(placeId="place-1", latitude=36.35, longitude=127.38),
            build_session_user(),
            Settings(stamp_unlock_radius_meters=120),
        )

    assert caught.value.status_code == status.HTTP_403_FORBIDDEN


def test_toggle_stamp_service_maps_missing_place_to_404(monkeypatch):
    def failing_toggle_stamp(*_args, **_kwargs):
        raise ValueError("장소를 찾을 수 없어요.")

    monkeypatch.setattr(stamp_service, "toggle_stamp_entry", failing_toggle_stamp)

    with pytest.raises(HTTPException) as caught:
        stamp_service.toggle_stamp_service(
            SimpleNamespace(),
            StampToggleRequest(placeId="missing-place", latitude=36.35, longitude=127.38),
            build_session_user(),
            Settings(stamp_unlock_radius_meters=120),
        )

    assert caught.value.status_code == status.HTTP_404_NOT_FOUND
