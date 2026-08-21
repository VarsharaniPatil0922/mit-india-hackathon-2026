import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app import models, auth

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_payments.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

def test_payment_flow(client, db):
    # Setup - Register organizer and worker
    res = client.post("/api/auth/register", json={
        "email": "org_pay@test.com", "password": "password", "user_type": "organizer"
    })
    org_token = res.json()["access_token"]
    
    res = client.post("/api/auth/register", json={
        "email": "worker_pay@test.com", "password": "password", "user_type": "worker"
    })
    worker_token = res.json()["access_token"]
    
    res = client.post("/api/auth/register", json={
        "email": "org2_pay@test.com", "password": "password", "user_type": "organizer"
    })
    org2_token = res.json()["access_token"]

    # Organizer creates event
    res = client.post("/api/events", json={
        "event_type": "Wedding", "event_date": "2026-10-10", "start_time": "10:00",
        "end_time": "18:00", "location": "Mumbai", "latitude": 19.0760, "longitude": 72.8777,
        "proximity_radius": 10.0, "budget": 10000,
        "roles": [{"role_name": "Photographer", "quantity_needed": 1}]
    }, headers={"Authorization": f"Bearer {org_token}"})
    event_id = res.json()["event_id"]
    
    # Get worker ID
    worker = db.query(models.Worker).filter(models.Worker.name == "worker_pay").first()
    role = db.query(models.EventRole).filter(models.EventRole.event_id == event_id).first()
    
    # Create assignment directly (simulate matching/confirming)
    assignment = models.CrewAssignment(
        event_id=event_id,
        role_id=role.id,
        worker_id=worker.id,
        status="confirmed",
        price_agreed=2500
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    # 1. Organizer creates payment
    res = client.post("/api/payments/create", json={"assignment_id": assignment.id}, headers={"Authorization": f"Bearer {org_token}"})
    assert res.status_code == 200
    payment_data = res.json()
    assert payment_data["status"] == "PENDING"
    assert payment_data["amount"] == 2500
    assert payment_data["currency"] == "INR"
    assert payment_data["transaction_id"].startswith("CC-DEMO-")
    payment_id = payment_data["id"]

    # 2. Prevent duplicate payment creation
    res = client.post("/api/payments/create", json={"assignment_id": assignment.id}, headers={"Authorization": f"Bearer {org_token}"})
    assert res.status_code == 400

    # 3. Simulate payment (fund escrow)
    res = client.post(f"/api/payments/{payment_id}/pay", headers={"Authorization": f"Bearer {org_token}"})
    assert res.status_code == 200
    payment_data = res.json()
    assert payment_data["status"] == "HELD_IN_ESCROW"
    assert payment_data["paid_at"] is not None

    # 4. Another organizer cannot access the payment
    res = client.get(f"/api/payments/{payment_id}", headers={"Authorization": f"Bearer {org2_token}"})
    assert res.status_code == 403
    
    res = client.post(f"/api/payments/{payment_id}/release", headers={"Authorization": f"Bearer {org2_token}"})
    assert res.status_code == 403

    # 5. Worker can access their own payment
    res = client.get(f"/api/payments/{payment_id}", headers={"Authorization": f"Bearer {worker_token}"})
    assert res.status_code == 200
    assert res.json()["worker_id"] == worker.id
    
    # 6. Organizer can release escrow
    res = client.post(f"/api/payments/{payment_id}/release", headers={"Authorization": f"Bearer {org_token}"})
    assert res.status_code == 200
    payment_data = res.json()
    assert payment_data["status"] == "RELEASED"
    assert payment_data["released_at"] is not None
    
    # 7. Invalid state transition (refund a RELEASED payment)
    res = client.post(f"/api/payments/{payment_id}/refund", headers={"Authorization": f"Bearer {org_token}"})
    assert res.status_code == 400 # Must be HELD_IN_ESCROW
    
    # 8. Notifications created
    res = client.get("/api/notifications", headers={"Authorization": f"Bearer {worker_token}"})
    assert res.status_code == 200
    notifs = res.json()
    messages = [n["message"] for n in notifs]
    assert any("secured in escrow" in m for m in messages)
    assert any("has been released" in m for m in messages)
    
    # 9. List endpoints
    res = client.get("/api/worker/payments", headers={"Authorization": f"Bearer {worker_token}"})
    assert len(res.json()) >= 1
    
    res = client.get("/api/organizer/payments", headers={"Authorization": f"Bearer {org_token}"})
    assert len(res.json()) >= 1
    
    res = client.get(f"/api/events/{event_id}/payments", headers={"Authorization": f"Bearer {org_token}"})
    assert len(res.json()) >= 1
