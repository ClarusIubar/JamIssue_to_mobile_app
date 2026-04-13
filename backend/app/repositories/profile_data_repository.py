from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from ..db_models import User, UserIdentity
from ..models import ProfileUpdateRequest
from ..naver_oauth import NaverProfile
from ..repository_support import generate_user_id, utcnow_naive


def _nickname_exists(db: Session, nickname: str, *, exclude_user_id: str | None = None) -> bool:
    stmt = select(User.user_id).where(func.lower(User.nickname) == nickname.lower())
    if exclude_user_id:
        stmt = stmt.where(User.user_id != exclude_user_id)
    return db.scalar(stmt.limit(1)) is not None


def ensure_unique_nickname(db: Session, nickname: str, *, exclude_user_id: str | None = None) -> str:
    normalized = nickname.strip()
    if len(normalized) < 2:
        raise ValueError("닉네임은 두 글자 이상으로 적어 주세요.")
    if _nickname_exists(db, normalized, exclude_user_id=exclude_user_id):
        raise ValueError("이미 사용 중인 닉네임이에요.")
    return normalized


def build_unique_social_nickname(db: Session, nickname: str, *, exclude_user_id: str | None = None) -> str:
    base = nickname.strip() or "이름 없음"
    if not _nickname_exists(db, base, exclude_user_id=exclude_user_id):
        return base
    for suffix in range(2, 10000):
        candidate = f"{base[:95]}{suffix}"
        if not _nickname_exists(db, candidate, exclude_user_id=exclude_user_id):
            return candidate
    raise ValueError("사용 가능한 닉네임을 만들 수 없어요.")


def upsert_social_user(
    db: Session,
    *,
    provider: str,
    provider_user_id: str,
    nickname: str,
    email: str | None = None,
    profile_image: str | None = None,
) -> User:
    identity = db.scalars(
        select(UserIdentity)
        .options(joinedload(UserIdentity.user))
        .where(UserIdentity.provider == provider, UserIdentity.provider_user_id == provider_user_id)
    ).first()
    now = utcnow_naive()

    if identity:
        user = identity.user
        changed = False
        if user.email != email:
            user.email = email
            changed = True
        if user.provider != provider:
            user.provider = provider
            changed = True
        if identity.email != email:
            identity.email = email
            changed = True
        if identity.profile_image != profile_image:
            identity.profile_image = profile_image
            changed = True
        if changed:
            identity.updated_at = now
            user.updated_at = now
        db.commit()
        db.refresh(user)
        return user

    safe_nickname = build_unique_social_nickname(db, nickname)
    user = User(
        user_id=generate_user_id(),
        nickname=safe_nickname,
        email=email,
        provider=provider,
        created_at=now,
        updated_at=now,
    )
    db.add(user)
    db.flush()
    db.add(
        UserIdentity(
            user_id=user.user_id,
            provider=provider,
            provider_user_id=provider_user_id,
            email=email,
            profile_image=profile_image,
            created_at=now,
            updated_at=now,
        )
    )
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise ValueError("이미 사용 중인 닉네임이에요.") from error
    db.refresh(user)
    return user


def link_social_identity(
    db: Session,
    *,
    user_id: str,
    provider: str,
    provider_user_id: str,
    email: str | None = None,
    profile_image: str | None = None,
) -> User:
    user = db.get(User, user_id)
    if not user:
        raise ValueError("연결할 기존 계정을 찾을 수 없어요.")

    now = utcnow_naive()
    existing_identity = db.scalars(
        select(UserIdentity).where(UserIdentity.provider == provider, UserIdentity.provider_user_id == provider_user_id)
    ).first()
    if existing_identity:
        if existing_identity.user_id != user_id:
            raise ValueError("이미 다른 계정에 연결된 로그인 수단이에요.")
        if existing_identity.email != email or existing_identity.profile_image != profile_image:
            existing_identity.email = email
            existing_identity.profile_image = profile_image
            existing_identity.updated_at = now
            db.commit()
            db.refresh(user)
        return user

    provider_slot = db.scalars(
        select(UserIdentity).where(UserIdentity.user_id == user_id, UserIdentity.provider == provider)
    ).first()
    if provider_slot:
        raise ValueError("이미 같은 제공자의 계정이 연결되어 있어요.")

    if email and not user.email:
        user.email = email
        user.updated_at = now

    db.add(
        UserIdentity(
            user_id=user.user_id,
            provider=provider,
            provider_user_id=provider_user_id,
            email=email,
            profile_image=profile_image,
            created_at=now,
            updated_at=now,
        )
    )
    db.commit()
    db.refresh(user)
    return user


def upsert_naver_user(db: Session, profile: NaverProfile) -> User:
    nickname = profile.nickname or profile.name or "이름 없음"
    return upsert_social_user(
        db,
        provider="naver",
        provider_user_id=profile.id,
        nickname=nickname,
        email=profile.email,
        profile_image=profile.profile_image,
    )


def link_naver_identity(db: Session, user_id: str, profile: NaverProfile) -> User:
    return link_social_identity(
        db,
        user_id=user_id,
        provider="naver",
        provider_user_id=profile.id,
        email=profile.email,
        profile_image=profile.profile_image,
    )


def update_user_profile(db: Session, user_id: str, payload: ProfileUpdateRequest) -> User:
    user = db.get(User, user_id)
    if not user:
        raise ValueError("사용자 정보를 찾을 수 없어요.")

    nickname = ensure_unique_nickname(db, payload.nickname, exclude_user_id=user_id)
    now = utcnow_naive()
    user.nickname = nickname
    if user.profile_completed_at is None:
        user.profile_completed_at = now
    user.updated_at = now
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise ValueError("이미 사용 중인 닉네임이에요.") from error
    db.refresh(user)
    return user
