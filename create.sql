  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    password_hash VARCHAR(100),
    role VARCHAR(20),
    platoon_id INT
  );

  CREATE TABLE IF NOT EXISTS platoons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    company_id INT
  );

  CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
  );

  CREATE TABLE IF NOT EXISTS parents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
  );

  CREATE TABLE IF NOT EXISTS parent_child (
    parent_id INT,
    user_id INT,
    PRIMARY KEY (parent_id, user_id),
    FOREIGN KEY (parent_id) REFERENCES parents(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );