from sqlmodel import Session
from typing import TypeVar


T = TypeVar("T")


def save_to_db(
    *, session: Session, instance: T, commit: bool = True, refresh: bool = False
) -> T:
    session.add(instance)
    if commit:
        session.commit()
    if refresh:
        session.refresh(instance)
    return instance
