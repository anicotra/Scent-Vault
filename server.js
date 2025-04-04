const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

const db = require('./db');

const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const returnRoutes = require('./routes/returns');
const shopperRoutes = require('./routes/shoppers');
const shippingRoutes = require('./routes/shipping');
const billingRoutes = require('./routes/billing');

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/shoppers', shopperRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/billing', billingRoutes);

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});