import sqlite3

conn = sqlite3.connect("test.db")
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE users ADD COLUMN suspended BOOLEAN DEFAULT 0")
    print("Colonne 'suspended' ajoutée.")
except sqlite3.OperationalError as e:
    print("Erreur :", e)

conn.commit()
conn.close()