const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

let products = [];

// Rota para listar produtos
app.get('/products', (req, res) => {
  res.json(products);
});

// Rota para adicionar produtos
app.post('/products', (req, res) => {
  const { name, quantity, category, expiryDate, supplier, sku, price } = req.body;
  products.push({ name, quantity, category, expiryDate, supplier, sku, price });
  res.status(201).json({ message: 'Produto adicionado com sucesso!' });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});