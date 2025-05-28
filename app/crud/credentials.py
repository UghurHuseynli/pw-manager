from sqlmodel import Session, select
from uuid import UUID
from app.db.credentials import Credentials, CredentialsCreate, CredentialsUpdate
from app.core.security import get_credential_password_hash, decrypt_credential_password
from app.crud.base import save_to_db


def get_current_user_credentials_by_id(
    *, session: Session, user_id: UUID, credential_id: UUID
) -> Credentials | None:
    statement = select(Credentials).where(
        Credentials.id == credential_id, Credentials.user_id == user_id
    )
    credentials = session.exec(statement).first()
    return credentials


def create_credentials(
    *, session: Session, credentials_create: CredentialsCreate, user_id: UUID
) -> Credentials:
    db_obj = Credentials.model_validate(
        credentials_create,
        update={
            "user_id": user_id,
            "hashed_password": get_credential_password_hash(
                credentials_create.password
            ),
        },
    )
    save_to_db(session=session, instance=db_obj, refresh=True)
    return db_obj


def update_credentials(
    *, session: Session, db_credentials: Credentials, credentials_in: CredentialsUpdate
) -> Credentials:
    credentials_data = credentials_in.model_dump(exclude_unset=True)

    if "password" in credentials_data:
        credentials_data["hashed_password"] = get_credential_password_hash(
            credentials_data.pop("password")
        )
    db_credentials.sqlmodel_update(credentials_data)
    save_to_db(session=session, instance=db_credentials, refresh=True)
    return db_credentials


def get_credential_password(
    *, session: Session, user_id: UUID, credential_id: UUID
) -> str | None:
    credentials = get_current_user_credentials_by_id(
        session=session, user_id=user_id, credential_id=credential_id
    )
    if not credentials:
        return None
    return decrypt_credential_password(credentials.hashed_password)
