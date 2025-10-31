# backend/services/cache_service.py
import time, json, sqlite3, os

class CacheService:
    """Simple SQLite-based cache with time-to-live (TTL)."""

    def __init__(self, ttl_seconds: int = 86400, db_path: str = "cache.db"):
        self.ttl = ttl_seconds
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        os.makedirs(os.path.dirname(self.db_path) or ".", exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cache (
                key TEXT PRIMARY KEY,
                value TEXT,
                expiry REAL
            )
        """)
        conn.commit()
        conn.close()

    def get(self, key: str):
        now = time.time()
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute("SELECT value, expiry FROM cache WHERE key=?", (key,))
        row = cur.fetchone()
        conn.close()
        if not row:
            return None
        value, expiry = row
        if now > expiry:
            self.delete(key)
            return None
        return json.loads(value)

    def set(self, key: str, value):
        expiry = time.time() + self.ttl
        data = json.dumps(value)
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute(
            "REPLACE INTO cache (key, value, expiry) VALUES (?, ?, ?)",
            (key, data, expiry)
        )
        conn.commit()
        conn.close()

    def delete(self, key: str):
        conn = sqlite3.connect(self.db_path)
        conn.execute("DELETE FROM cache WHERE key=?", (key,))
        conn.commit()
        conn.close()
