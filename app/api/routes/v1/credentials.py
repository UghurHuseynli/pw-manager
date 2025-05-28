from fastapi import APIRouter, HTTPException
from typing import Any
from sqlmodel import select, func
from app.api.dependencies import (
    SessionDep,
    CurrentUser,
)
from app.db.credentials import (
    CredentialsCreate,
    CredentialsPublic,
    CredentialsUpdate,
    Credentials,
    CredentialDetail,
)
from app.schemas.credentials import Password
from app.schemas.users import Message
from app.crud import credentials as crud_credentials
from uuid import UUID

router = APIRouter(prefix="/credentials", tags=["credentials"])


@router.get("/", response_model=CredentialsPublic)
def read_credentials(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """Retrieve a list of credentials for the current user."""

    count_statement = select(func.count()).where(Credentials.user_id == current_user.id)
    count = session.exec(count_statement).one()

    statement = (
        select(Credentials)
        .where(Credentials.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
    )
    credentials = session.exec(statement).all()
    return CredentialsPublic(count=count, data=credentials)


@router.get("/{credential_id}", response_model=CredentialDetail)
def read_credential(
    session: SessionDep, credential_id: UUID, current_user: CurrentUser
) -> Any:
    """Retrieve a specific credential by ID for the current user."""

    credential = crud_credentials.get_current_user_credentials_by_id(
        session=session, user_id=current_user.id, credential_id=credential_id
    )

    if not credential:
        raise HTTPException(status_code=404, detail="Credential not found")

    return credential


@router.post("/", response_model=CredentialDetail, status_code=201)
def create_credential(
    session: SessionDep, credentials_in: CredentialsCreate, current_user: CurrentUser
) -> Any:
    """Create new credentials for the current user."""

    credentials_data = CredentialsCreate.model_validate(credentials_in)
    credentials = crud_credentials.create_credentials(
        session=session, credentials_create=credentials_data, user_id=current_user.id
    )

    return credentials


@router.patch("/{credential_id}", response_model=CredentialDetail)
def update_credential(
    session: SessionDep,
    credential_id: UUID,
    credential_in: CredentialsUpdate,
    current_user: CurrentUser,
) -> Any:
    """Update an existing credential for the current user."""

    db_credential = crud_credentials.get_current_user_credentials_by_id(
        session=session, user_id=current_user.id, credential_id=credential_id
    )

    if not db_credential:
        raise HTTPException(status_code=404, detail="Credential not found")

    credential = crud_credentials.update_credentials(
        session=session, db_credentials=db_credential, credentials_in=credential_in
    )

    return credential


@router.get("/{credential_id}/show-password", response_model=Password)
def show_password(
    session: SessionDep, credential_id: UUID, current_user: CurrentUser
) -> Any:
    """Retrieve the password of a specific credential for the current user."""

    credential_password = crud_credentials.get_credential_password(
        session=session, user_id=current_user.id, credential_id=credential_id
    )

    if not credential_password:
        raise HTTPException(status_code=404, detail="Credential not found")

    return Password(password=credential_password)


@router.delete("/{credential_id}", response_model=Message)
def delete_credential(
    session: SessionDep, credential_id: UUID, current_user: CurrentUser
) -> Any:
    """Delete a specific credential for the current user."""

    db_credential = crud_credentials.get_current_user_credentials_by_id(
        session=session, user_id=current_user.id, credential_id=credential_id
    )

    if not db_credential:
        raise HTTPException(status_code=404, detail="Credential not found")

    session.delete(db_credential)
    session.commit()

    return Message(message="Credential deleted successfully")
