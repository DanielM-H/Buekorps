// Express server setup
const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const expressSession = require('express-session');
const { Pool } = require('pg');
const pool = new Pool();
const bodyParser = require('body-parser');
const db = require('better-sqlite3')('database.db');
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
 
// Use express-session middleware
app.use(expressSession({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
  }));
  
  // Authentication middleware
  app.post('/register', (req, res) => {
    const { name, email, password, role, organization } = req.body;
    const passwordHash = bcrypt.hashSync(password, 10);
    // Save the user to the database with the hashed password
    // ...
    const stmt = db.prepare('INSERT INTO users (name, email, password_hash, role, platoon_id) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(name, email, passwordHash, role, organization);

    res.status(200).json({ message: 'User registered successfully' });
  });
  

// User registration endpoint
app.post('/register', (req, res) => {
  const { name, email, password, role, organization } = req.body;
  const passwordHash = bcrypt.hashSync(password, 10);
  // Save the user to the database with the hashed password
  // ...
  const stmt = db.prepare('INSERT INTO users (name, email, password_hash, role, platoon_id) VALUES (?, ?, ?, ?, ?)');
  const info = stmt.run(name, email, passwordHash, role, organization);

  res.status(200).json({ message: 'User registered successfully' });
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userStatement = await db.prepare('SELECT * FROM users WHERE email = ?');
    const user = userStatement.get(email);

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (passwordMatch) {
        req.session.userId = user.id;
        if (user.role === 'Administrator') {
          const usersInSameOrgStatement = await db.prepare('SELECT * FROM users WHERE platoon_id = ?');
          const usersInSameOrg = usersInSameOrgStatement.get(user.platoon_id);
          console.log(usersInSameOrg);
          if (user.role === 'Administrator') {
            const usersInSameOrgStatement = await db.prepare('SELECT * FROM users WHERE platoon_id = ?');
            const usersInSameOrg = usersInSameOrgStatement.all(user.platoon_id);
            res.json({ message: 'Logged in as Administrator', users: usersInSameOrg });
          }
        } else {
          res.json({ message: 'Logged in' });
        }
      } else {
        res.status(401).json({ message: 'Incorrect password' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user endpoint
app.put('/users/:id', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const updateStatement = await pool.query('UPDATE users SET email = $1, name = $2, password_hash = $3 WHERE id = $4 AND role = $5', [email, name, passwordHash, req.params.id, 'Administrator']);
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user endpoint
app.delete('/users/:id', async (req, res) => {
  try {
    const deleteStatement = await pool.query('DELETE FROM users WHERE id = $1 AND role = $2', [req.params.id, 'Administrator']);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post("/", (req, res) => {
    res.sendFile(__dirname + "./index.html");
})

app.listen(3002, () => console.log('Server ready'));