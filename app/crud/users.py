import uuid
from sqlmodel import Session, select
from app.db.users import User, UserCreate, UserRegister
from app.core.security import get_password_hash


def create_admin_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create, update={"hashed_password": get_password_hash(user_create.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def create_user(*, session: Session, user_register: UserRegister) -> User:
    db_obj = User.model_validate(
        user_register,
        update={"hashed_password": get_password_hash(user_register.password)},
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user
