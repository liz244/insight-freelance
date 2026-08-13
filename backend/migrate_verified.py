import sqlite3

conn = sqlite3.connect("test.db")
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE freelance_profiles ADD COLUMN verified BOOLEAN DEFAULT 0")
    print("Colonne 'verified' ajoutée.")
except sqlite3.OperationalError as e:
    print("Erreur :", e)

conn.commit()
conn.close()
