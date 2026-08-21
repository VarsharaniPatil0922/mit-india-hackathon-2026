import random
from app.database import SessionLocal, engine
from app import models
from app.auth import get_password_hash

# Create tables if not exist
models.Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(models.User).count() > 0:
        print("Database already seeded")
        return

    print("Seeding database...")

    # Create one organizer
    org_user = models.User(
        email="organizer@crew.com",
        password_hash=get_password_hash("password"),
        user_type="organizer"
    )
    db.add(org_user)
    db.commit()
    db.refresh(org_user)
    
    org = models.Organizer(user_id=org_user.id, name="Event Masters", organization_name="Event Masters Inc")
    db.add(org)
    
    # Create worker users and profiles
    skills = ["Photographer", "Videographer", "Sound Engineer", "Security", "Decorator", "Emcee", "Catering"]
    first_names = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Atharv", "Diya", "Sanya", "Kavya", "Riya", "Aanya", "Myra", "Ananya", "Sara"]
    last_names = ["Patil", "Deshmukh", "Joshi", "Kulkarni", "Deshpande", "Pawar", "Shinde", "Gaikwad", "Jadhav", "Kale"]

    # Base coordinates for Pune
    base_lat = 18.5204
    base_lon = 73.8567

    for i in range(1, 41):
        email = f"worker{i}@crew.com"
        user = models.User(
            email=email,
            password_hash=get_password_hash("password"),
            user_type="worker"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Randomize properties
        name = f"{random.choice(first_names)} {random.choice(last_names)}"
        skill = random.choice(skills)
        # Random location in Pune (offset roughly +/- 0.1 deg)
        lat = base_lat + random.uniform(-0.1, 0.1)
        lon = base_lon + random.uniform(-0.1, 0.1)
        
        # Prices
        if skill in ["Photographer", "Videographer", "Emcee"]:
            p_min = random.randint(5, 15) * 1000
        else:
            p_min = random.randint(1, 5) * 1000
        p_max = p_min + random.randint(1, 5) * 1000

        rating = round(random.uniform(3.5, 5.0), 1)
        reliability = random.randint(70, 100)

        worker = models.Worker(
            user_id=user.id,
            name=name,
            skill_category=skill,
            price_min=p_min,
            price_max=p_max,
            location="Pune",
            latitude=lat,
            longitude=lon,
            rating=rating,
            reliability_score=reliability
        )
        db.add(worker)

    db.commit()
    print("Seeding complete! 1 organizer and 40 workers added.")
    print("Organizer login: organizer@crew.com / password")
    print("Worker login: worker1@crew.com / password")

if __name__ == "__main__":
    seed_db()
