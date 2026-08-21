from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    user_type = Column(String, nullable=False) # 'organizer' or 'worker'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    organizer_profile = relationship("Organizer", back_populates="user", uselist=False)
    worker_profile = relationship("Worker", back_populates="user", uselist=False)

class Organizer(Base):
    __tablename__ = "organizers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    organization_name = Column(String)

    user = relationship("User", back_populates="organizer_profile")
    events = relationship("Event", back_populates="organizer")

class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    skill_category = Column(String)
    price_min = Column(Integer)
    price_max = Column(Integer)
    location = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    rating = Column(Float, default=5.0)
    reliability_score = Column(Integer, default=100)

    user = relationship("User", back_populates="worker_profile")
    availability = relationship("WorkerAvailability", back_populates="worker")
    assignments = relationship("CrewAssignment", back_populates="worker")

class WorkerAvailability(Base):
    __tablename__ = "worker_availability"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"))
    date = Column(String) # YYYY-MM-DD
    start_time = Column(String) # HH:MM
    end_time = Column(String) # HH:MM

    worker = relationship("Worker", back_populates="availability")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    organizer_id = Column(Integer, ForeignKey("organizers.id"))
    event_type = Column(String)
    date = Column(String)
    time = Column(String)
    location = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    proximity_radius = Column(Float)
    budget = Column(Integer)
    status = Column(String, default="matching") # matching, confirmed, completed

    organizer = relationship("Organizer", back_populates="events")
    roles = relationship("EventRole", back_populates="event")
    assignments = relationship("CrewAssignment", back_populates="event")

class EventRole(Base):
    __tablename__ = "event_roles"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    role_name = Column(String)
    quantity_needed = Column(Integer)

    event = relationship("Event", back_populates="roles")
    assignments = relationship("CrewAssignment", back_populates="role")

class CrewAssignment(Base):
    __tablename__ = "crew_assignments"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    role_id = Column(Integer, ForeignKey("event_roles.id"))
    worker_id = Column(Integer, ForeignKey("workers.id"))
    status = Column(String, default="pending") # pending, accepted, declined
    price_agreed = Column(Integer)

    event = relationship("Event", back_populates="assignments")
    role = relationship("EventRole", back_populates="assignments")
    worker = relationship("Worker", back_populates="assignments")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    message = Column(Text)
    status = Column(String, default="unread") # unread, read
    created_at = Column(DateTime(timezone=True), server_default=func.now())
