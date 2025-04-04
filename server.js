const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'your-username',
    password: 'your-password',
    database: 'your-database-name'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'product_management.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

app.get('/shipping', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'shipping.html'));
});

app.get('/payment', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'payment.html'));
});

app.get('/confirmation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'confirmation.html'));
});

app.get('/returns', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'returns.html'));
});

// Example API endpoint
app.get('/api/products', (req, res) => {
    const query = 'SELECT * FROM products';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            res.status(500).send('Internal server error');
            return;
        }
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
