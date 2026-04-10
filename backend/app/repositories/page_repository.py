from sqlalchemy.orm import Session

from ..models import CategoryFilter, CourseMood
from ..repository_normalized import (
    get_bootstrap,
    get_place,
    list_courses,
    list_places,
)


def read_bootstrap_bundle(db: Session, user_id: str | None):
    return get_bootstrap(db, user_id)


def list_place_entries(db: Session, category: CategoryFilter):
    return list_places(db, category)


def read_place_entry(db: Session, place_id: str):
    return get_place(db, place_id)


def list_course_entries(db: Session, mood: CourseMood | None):
    return list_courses(db, mood)
