from sqlmodel import Session, select
import pyotp
import io, qrcode
from app.db.users import User, UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password
from app.crud.base import save_to_db


def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create,
        update={"hashed_password": get_password_hash(user_create.password)},
    )

    save_to_db(session=session, instance=db_obj, refresh=True)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> User:
    user_data = user_in.model_dump(exclude_unset=True)
    db_user.sqlmodel_update(user_data)

    save_to_db(session=session, instance=db_user, refresh=True)
    return db_user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(session=session, email=email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_totp_qr(*, user: User, issuer_name: str):
    totp = pyotp.TOTP(user.otp_secret)
    uri = totp.provisioning_uri(name=user.username, issuer_name=issuer_name)
    img = qrcode.make(uri)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()
