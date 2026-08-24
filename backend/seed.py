from database import SessionLocal
from models import User


def seed_users():
    db = SessionLocal()

    try:
        existing_users = db.query(User).count()

        if existing_users > 0:
            print("Users already seeded.")
            return

        users = [
            User(
                name="Aryaman Sharma",
                email="aryaman@example.com",
            ),
            User(
                name="Priya Mehta",
                email="priya@example.com",
            ),
        ]

        db.add_all(users)
        db.commit()

        print("Seeded demo users successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_users()