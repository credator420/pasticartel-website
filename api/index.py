import sqlite3
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="PASTICARTEL API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = "/tmp/pasticartel.db"

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS crew (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tag TEXT, name TEXT NOT NULL, role TEXT NOT NULL,
                bio TEXT, badges TEXT, instagram TEXT, spotify TEXT
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS discography (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL, version TEXT, artist TEXT NOT NULL,
                credits TEXT, cover_image TEXT, stream_url TEXT
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL, venue TEXT NOT NULL, lineup TEXT,
                city TEXT NOT NULL, ticket_url TEXT, is_sold_out INTEGER DEFAULT 0
            )
        """)

        cursor.execute("SELECT COUNT(*) FROM crew")
        if cursor.fetchone()[0] == 0:
            cursor.executemany("""
                INSERT INTO crew (tag, name, role, bio, badges, instagram, spotify)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, [
                ("#01", "DDave", "MC / Production", "Rhythmic architecture, verses, dark trap cadence.", "Lyrics,808 Beats", "#", "#"),
                ("#02", "Borkingg", "MC / Lyrics", "High-octane aggression, relentless flow, dirty punchlines.", "Bars,Hype", "#", "#"),
                ("#03", "Sára", "Vocals", "Atmospheric layers, haunting melodic hooks.", "Hooks,Melodies", "#", "#"),
                ("#04", "Doktor Kaiser", "MC / Sound Design", "Industrial synths, subterranean 808s, grime mix engineering.", "Design,Bars", "#", "#")
            ])

        cursor.execute("SELECT COUNT(*) FROM discography")
        if cursor.fetchone()[0] == 0:
            cursor.executemany("""
                INSERT INTO discography (title, version, artist, credits, cover_image, stream_url)
                VALUES (?, ?, ?, ?, ?, ?)
            """, [
                ("BIG MAC", "v6", "PAŠTICARTEL", "PAŠTICARTEL", "assets/covers/big-mac.jpg", "#"),
                ("TICHO", "v6", "PAŠTICARTEL", "feat. Shotkiee", "assets/covers/ticho.jpg", "#"),
                ("Threesome", "v6", "PAŠTICARTEL", "Ddave x Shotkiee x Borkingg", "assets/covers/threesome.jpg", "#"),
                ("SRDCE BETON", "v6", "PAŠTICARTEL", "Ddave x Shotkiee", "assets/covers/srdce-beton.jpg", "#"),
                ("MYSLEL SI ZE VI", "v6", "PAŠTICARTEL", "PAŠTICARTEL", "assets/covers/myslel-si-ze-vi.jpg", "#"),
                ("VYSOKÁ ŠKOLA ŽIVOTA", "v5.5", "PAŠTICARTEL", "PAŠTICARTEL", "assets/covers/vysoka-skola-zivota.jpg", "#"),
                ("Murder on my mind", "v5.5", "PAŠTICARTEL", "PAŠTICARTEL", "assets/covers/murder-on-my-mind.jpg", "#"),
                ("green madness", "v5.5", "PAŠTICARTEL", "by Ddave", "assets/covers/green-madness.jpg", "#"),
                ("YOUNG CANDLES", "v5.5", "PAŠTICARTEL", "PAŠTICARTEL", "assets/covers/young-candles.jpg", "#"),
                ("TULENÍ HULENÍ", "v5.5", "PAŠTICARTEL", "PAŠTICARTEL", "assets/covers/tuleni-huleni.jpg", "#")
            ])

        cursor.execute("SELECT COUNT(*) FROM events")
        if cursor.fetchone()[0] == 0:
            cursor.executemany("""
                INSERT INTO events (date, venue, lineup, city, ticket_url, is_sold_out)
                VALUES (?, ?, ?, ?, ?, ?)
            """, [
                ("OCT 24", "Warehouse Session", "Full Crew Live", "Liberec, CZ", "#", 0),
                ("NOV 12", "Cross Club", "DDave, Borkingg, Kaiser", "Prague, CZ", "#", 0),
                ("NOV 28", "Faval Music Circus", "Underground Showcase", "Brno, CZ", "#", 0),
                ("DEC 05", "Vault Night", "Pasticartel x Clash", "Bratislava, SK", "#", 1)
            ])
        conn.commit()

init_db()

@app.get("/api/roster")
def get_roster():
    init_db()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM crew ORDER BY id ASC")
        return [
            {
                "id": row["id"], "tag": row["tag"], "name": row["name"],
                "role": row["role"], "bio": row["bio"],
                "badges": row["badges"].split(",") if row["badges"] else [],
                "instagram": row["instagram"], "spotify": row["spotify"]
            }
            for row in cursor.fetchall()
        ]

@app.get("/api/discography")
def get_discography():
    init_db()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM discography ORDER BY id ASC")
        return [dict(row) for row in cursor.fetchall()]

@app.get("/api/events")
def get_events():
    init_db()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM events ORDER BY id ASC")
        return [dict(row) for row in cursor.fetchall()]