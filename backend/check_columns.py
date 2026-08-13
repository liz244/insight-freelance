import sqlite3

conn = sqlite3.connect("test.db")
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(users)")
for col in cursor.fetchall():
    print(col)
conn.close()