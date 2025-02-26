let products = [];

// Função para buscar produtos do backend
async function fetchProducts() {
  try {
    const response = await fetch('http://localhost:5000/products');
    if (!response.ok) throw new Error('Erro ao buscar produtos');
    const data = await response.json();
    products = data;
    updateProductList();
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Função para adicionar produtos ao backend
async function addProductToBackend(product) {
  try {
    const response = await fetch('http://localhost:5000/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!response.ok) throw new Error('Erro ao adicionar produto');
    const result = await response.json();
    alert(result.message);
    fetchProducts(); // Atualiza a lista após adicionar
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Função para remover produtos do backend
async function removeProductFromBackend(id) {
  try {
    const response = await fetch(`http://localhost:5000/products/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Erro ao remover produto');
    const result = await response.json();
    alert(result.message);
    fetchProducts(); // Atualiza a lista após remover
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Função para atualizar a lista de produtos na interface
function updateProductList() {
  const productList = document.getElementById('productList');
  productList.innerHTML = '';

  products.forEach(product => {
    const li = document.createElement('li');
    li.textContent = `${product.name} - ${product.quantity} unidades (Categoria: ${product.category}, Fornecedor: ${product.supplier}, Preço: R$${product.price.toFixed(2)})`;

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remover';
    removeButton.className = 'remove-btn';
    removeButton.onclick = () => removeProductFromBackend(product.id);

    li.appendChild(removeButton);
    productList.appendChild(li);
  });
}

// Evento para adicionar produtos
document.getElementById('addProductButton').addEventListener('click', async () => {
  const productName = document.getElementById('productName').value.trim();
  const quantity = parseInt(document.getElementById('quantity').value.trim());
  const category = document.getElementById('category').value;
  const expiryDate = document.getElementById('expiryDate').value;
  const supplier = document.getElementById('supplier').value.trim();
  const sku = document.getElementById('sku').value.trim();
  const price = parseFloat(document.getElementById('price').value.trim());

  if (!productName || !quantity || !category || !expiryDate || !supplier || !sku || !price) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  const newProduct = {
    name: productName,
    quantity,
    category,
    expiryDate,
    supplier,
    sku,
    price
  };

  await addProductToBackend(newProduct);

  // Limpar os campos de entrada
  document.getElementById('productName').value = '';
  document.getElementById('quantity').value = '';
  document.getElementById('category').value = '';
  document.getElementById('expiryDate').value = '';
  document.getElementById('supplier').value = '';
  document.getElementById('sku').value = '';
  document.getElementById('price').value = '';
});

// Inicializar a lista de produtos ao carregar a página
fetchProducts();
