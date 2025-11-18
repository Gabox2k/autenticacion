import Database from 'better-sqlite3'

const db = new Database('./db.sqlite')

db.exec(`
  CREATE TABLE IF NOT EXISTS usuario (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  )
`);

export default db