from collections.abc import Callable

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..models import CategoryFilter, CourseMood, SessionUser
from ..repositories.page_repository import (
    list_course_entries,
    list_place_entries,
    read_bootstrap_bundle,
    read_place_entry,
)
from ..repositories.review_repository import list_review_entries


def _raise_not_found(detail: str) -> None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

def _run_not_found_policy(action: Callable[[], object]):
    try:
        return action()
    except ValueError as error:
        _raise_not_found(str(error))


def read_bootstrap_service(db: Session, session_user: SessionUser | None):
    return read_bootstrap_bundle(db, session_user.id if session_user else None)


def read_places_service(db: Session, category: CategoryFilter):
    return list_place_entries(db, category)


def read_place_service(db: Session, place_id: str):
    return _run_not_found_policy(lambda: read_place_entry(db, place_id))


def read_courses_service(db: Session, mood: CourseMood | None):
    return list_course_entries(db, mood)


def read_reviews_service(db: Session, place_id: str | None, user_id: str | None, session_user: SessionUser | None):
    return list_review_entries(db, place_id=place_id, user_id=user_id, current_user_id=session_user.id if session_user else None)
