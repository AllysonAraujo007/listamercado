// Função para adicionar produtos à lista
document.getElementById('addProductButton').addEventListener('click', function () {
  const productName = document.getElementById('productName').value.trim();

  // Verifica se o campo está vazio
  if (!productName) {
    alert('Por favor, digite o nome do produto.');
    return;
  }

  // Cria um novo item na lista
  const li = document.createElement('li');
  li.textContent = productName;

  // Adiciona o item à lista
  document.getElementById('productList').appendChild(li);

  // Limpa o campo de entrada
  document.getElementById('productName').value = '';
});
