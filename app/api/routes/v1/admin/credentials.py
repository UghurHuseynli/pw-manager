from fastapi import APIRouter, HTTPException
from typing import Any
from sqlmodel import select, func
from app.api.dependencies import SessionDep
from app.db.credentials import (
    CredentialsCreate,
    CredentialsPublic,
    CredentialsAdminUpdate,
    Credentials,
    CredentialAdminDetail,
)
from app.schemas.credentials import Password
from app.schemas.users import Message
from app.crud import credentials as crud_credentials
from uuid import UUID

router = APIRouter(prefix="/credentials", tags=["admin:credentials"])


@router.get("/", response_model=CredentialsPublic)
def read_credentials(
    session: SessionDep, user_id: UUID = None, skip: int = 0, limit: int = 100
) -> Any:
    """Retrieve a list of credentials or filter by user_id if provided."""
    if user_id:
        count_statement = select(func.count()).where(Credentials.user_id == user_id)
        statement = (
            select(Credentials)
            .where(Credentials.user_id == user_id)
            .offset(skip)
            .limit(limit)
        )
    else:
        count_statement = select(func.count()).select_from(Credentials)

        statement = select(Credentials).offset(skip).limit(limit)

    count = session.exec(count_statement).one()
    credentials = session.exec(statement).all()
    return CredentialsPublic(count=count, data=credentials)


@router.get("/{credential_id}", response_model=CredentialAdminDetail)
def read_credential(session: SessionDep, credential_id: UUID) -> Any:
    """Retrieve a specific credential by ID."""

    credential = crud_credentials.get_credentials_by_id(
        session=session, credential_id=credential_id
    )

    if not credential:
        raise HTTPException(status_code=404, detail="Credential not found")

    return credential


@router.post("/", response_model=CredentialAdminDetail, status_code=201)
def create_credential(
    session: SessionDep, credentials_in: CredentialsCreate, user_id: UUID
) -> Any:
    """Create new credentials for the user_id."""

    credentials_data = CredentialsCreate.model_validate(credentials_in)
    credentials = crud_credentials.create_credentials(
        session=session, credentials_create=credentials_data, user_id=user_id
    )

    return credentials


@router.patch("/{credential_id}", response_model=CredentialAdminDetail)
def update_credential(
    session: SessionDep, credential_id: UUID, credential_in: CredentialsAdminUpdate
) -> Any:
    """Update an existing credential for user_id."""

    db_credential = crud_credentials.get_credentials_by_id(
        session=session, credential_id=credential_id
    )

    if not db_credential:
        raise HTTPException(status_code=404, detail="Credential not found")

    credential = crud_credentials.update_credentials_by_admin(
        session=session, db_credentials=db_credential, credentials_in=credential_in
    )
    if not credential:
        raise HTTPException(status_code=404, detail="User not found")

    return credential


@router.delete("/{credential_id}", response_model=Message)
def delete_credential(session: SessionDep, credential_id: UUID) -> Any:
    """Delete a specific credential."""

    db_credential = crud_credentials.get_credentials_by_id(
        session=session, credential_id=credential_id
    )

    if not db_credential:
        raise HTTPException(status_code=404, detail="Credential not found")

    session.delete(db_credential)
    session.commit()

    return Message(message="Credential deleted successfully")
