import sqlite3

conn = sqlite3.connect("test.db")
cursor = conn.cursor()

for col in ["service_id", "client_id", "desired_date"]:
    try:
        cursor.execute(f"ALTER TABLE client_requests ADD COLUMN {col} VARCHAR")
        print(f"Colonne '{col}' ajoutée.")
    except sqlite3.OperationalError as e:
        print(f"'{col}' :", e)

conn.commit()
conn.close()