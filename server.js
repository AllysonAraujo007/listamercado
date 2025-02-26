const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexão com o banco de dados MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'sua_senha',
  database: 'estoque'
});

db.connect(err => {
  if (err) throw err;
  console.log('Conectado ao banco de dados!');
});

// Secret para JWT
const JWT_SECRET = 'seu_segredo_jwt';

// Função para gerar token JWT
function generateToken(user) {
  return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
}

// Middleware de autenticação
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Rota para login (autenticação)
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Simulação de usuário (em produção, verifique no banco de dados)
  if (username === 'admin' && password === 'senha123') {
    const token = generateToken({ id: 1 });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Credenciais inválidas!' });
  }
});

// Rota para listar produtos (com paginação)
app.get('/products', authenticateToken, (req, res) => {
  const { page = 1, limit = 10, sortBy = 'name', order = 'ASC' } = req.query;

  const offset = (page - 1) * limit;

  const query = `
    SELECT * FROM products
    ORDER BY ${db.escapeId(sortBy)} ${order}
    LIMIT ? OFFSET ?
  `;

  db.query(query, [parseInt(limit), parseInt(offset)], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Rota para adicionar produtos (com validação)
app.post(
  '/products',
  authenticateToken,
  [
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantidade deve ser um número positivo'),
    body('category').notEmpty().withMessage('Categoria é obrigatória'),
    body('expiryDate').notEmpty().withMessage('Data de validade é obrigatória'),
    body('supplier').notEmpty().withMessage('Fornecedor é obrigatório'),
    body('sku').notEmpty().withMessage('SKU é obrigatório'),
    body('price').isFloat({ min: 0 }).withMessage('Preço deve ser um número positivo')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, quantity, category, expiryDate, supplier, sku, price } = req.body;

    const query = `
      INSERT INTO products (name, quantity, category, expiry_date, supplier, sku, price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [name, quantity, category, expiryDate, supplier, sku, price], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Produto adicionado com sucesso!', id: result.insertId });
    });
  }
);

// Rota para remover produtos
app.delete('/products/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM products WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Produto não encontrado!' });
    res.json({ message: 'Produto removido com sucesso!' });
  });
});

// Rota para exportar produtos em CSV
app.get('/export/csv', authenticateToken, (req, res) => {
  const query = 'SELECT * FROM products';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    let csvContent = "data:text/csv;charset=utf-8,";

    // Cabeçalho do CSV
    csvContent += "Nome,Quantidade,Categoria,Data de Validade,Fornecedor,SKU,Preço\n";

    // Dados dos produtos
    results.forEach(product => {
      const row = `${product.name},${product.quantity},${product.category},${product.expiry_date},${product.supplier},${product.sku},${product.price}`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    res.redirect(encodedUri);
  });
});

// Notificação automática para produtos com estoque baixo
function checkLowStock() {
  const query = 'SELECT * FROM products WHERE quantity < 10';
  db.query(query, (err, results) => {
    if (err) console.error(err);

    results.forEach(product => {
      sendNotification(product.name, product.quantity);
    });
  });
}

function sendNotification(productName, quantity) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'seuemail@gmail.com',
      pass: 'suasenha'
    }
  });

  const mailOptions = {
    from: 'seuemail@gmail.com',
    to: 'destinatario@gmail.com',
    subject: 'Alerta de Estoque Baixo',
    text: `O produto ${productName} está com estoque baixo! Quantidade atual: ${quantity}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error(error);
    else console.log('E-mail enviado: ' + info.response);
  });
}

// Executar verificação de estoque baixo a cada hora
setInterval(checkLowStock, 60 * 60 * 1000);

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
