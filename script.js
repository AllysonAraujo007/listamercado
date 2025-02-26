// Função para adicionar produtos à lista
document.getElementById('addProductButton').addEventListener('click', function () {
  const productName = document.getElementById('productName').value.trim();

  if (!productName) {
    alert('Por favor, digite o nome do produto.');
    return;
  }

  // Criar um novo item na lista
  const li = document.createElement('li');
  li.textContent = productName;

  // Adicionar o item à lista
  document.getElementById('productList').appendChild(li);

  // Limpar o campo de entrada
  document.getElementById('productName').value = '';
};
