import logging

from sqlmodel import Session

from app.core.db import engine, init_db
from app.db.credentials import Credentials  # noqa: F401

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main() -> None:
    logger.info("Ensuring first superuser exists")
    with Session(engine) as session:
        init_db(session=session)
    logger.info("Done")


if __name__ == "__main__":
    main()
