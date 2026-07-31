import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./test_queueless.db")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401  (must import before `app` name gets rebound below)
from app.api.deps import get_db
from app.db.base_class import Base
from app.main import app
from app.models.branch import Branch

# Har bir test run uchun toza, xotiradagi (in-memory) SQLite baza
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture()
def client():
    return TestClient(app)


@pytest.fixture()
def sample_branch():
    db = TestingSessionLocal()
    branch = Branch(name="Test Poliklinika", category="poliklinika", avg_service_minutes=10)
    db.add(branch)
    db.commit()
    db.refresh(branch)
    db.close()
    return branch
