import sqlite3

conn = sqlite3.connect("test.db")
cursor = conn.cursor()

cursor.execute("UPDATE users SET role = 'admin' WHERE email = 'admin@liz.com'")

conn.commit()
print(cursor.rowcount, "compte(s) mis à jour")
conn.close()