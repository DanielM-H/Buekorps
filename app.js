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
  
  // Login endpoint
  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  
    if (user.rows.length > 0) {
      const passwordMatch = await bcrypt.compare(password, user.rows[0].password_hash);
      if (passwordMatch) {
        req.session.userId = user.rows[0].id;
        res.json({ message: 'Logged in' });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
  
  // Authentication middleware
  // app.use(async (req, res, next) => {
  //   if (req.session.userId) {
  //     const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
  //     req.user = user.rows[0];
  //     next();
  //   } else {
  //     res.status(401).json({ message: 'Not authenticated' });
  //   }
  // });
  
  // Authorization middleware
  // app.use((req, res, next) => {
  //   if (req.user && req.user.role === 'admin') {
  //     next();
  //   } else {
  //     res.status(403).json({ message: 'Not authorized' });
  //   }
  // });


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

app.post("/", (req, res) => {
    res.sendFile(__dirname + "./index.html");
})

app.listen(3002, () => console.log('Server ready'));