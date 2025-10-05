from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://ic_easy_user:0904@localhost:5432/ic_easy_db"

print("Testing database connection...")
try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT current_database(), current_user, version()"))
        row = result.fetchone()
        print(f"Database: {row[0]}")
        print(f"User: {row[1]}")
        print(f"PostgreSQL version: {row[2][:50]}...")
        print("\nConnection successful!")
except Exception as e:
    print(f"Connection failed: {e}")