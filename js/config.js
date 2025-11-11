// === ESTADO GLOBAL ===

// PRODUTOS PADRÃO (AGORA APENAS UM FALLBACK, OS DADOS VIRÃO DO FIREBASE)
let products = [];

let isAdmin = false;
let cart = [];
let currentQuantity = 1;
let currentProductId = null;

// === INICIALIZAÇÃO DO FIREBASE ===

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7EruNNAAa7fVJsVyT6SXojLPQPlo0wi0",
  authDomain: "kitandinha-5212f.firebaseapp.com",
  projectId: "kitandinha-5212f",
  storageBucket: "kitandinha-5212f.firebasestorage.app",
  messagingSenderId: "1083262950549",
  appId: "1:1083262950549:web:998b72f86e4dccab2bcf9c",
  measurementId: "G-0MXZWJPKW3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// === LÓGICA DE CARREGAMENTO E RENDERIZAÇÃO ===

// RENDERIZAR PRODUTOS
function renderProducts(filteredProducts = products) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    if (filteredProducts.length === 0) {
        grid.innerHTML = '<div class="col-12"><p style="text-align: center; color: #666; padding: 2rem;">Nenhum produto encontrado.</p></div>';
        return;
    }

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-4';
        card.innerHTML = `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <span class="product-brand">${product.brand}</span>
                    <h5 class="product-name">${product.name}</h5>
                    <p class="product-type">${product.type}</p>
                    <p class="product-subtype">${product.subtype || ''}</p>
                    <p class="product-price">R$ ${product.price.toFixed(2)}</p>
                    <button class="btn-view" onclick="openProductDetails('${product.id}')">Ver Detalhes</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// RENDERIZAR PRODUTOS NO ADMIN
function renderAdminProducts() {
    const list = document.getElementById('adminProductsList');
    list.innerHTML = '';

    products.forEach(product => {
        const item = document.createElement('div');
        item.className = 'card mb-2 p-3';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="color: var(--primary-dark);">${product.name}</strong>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: #666;">
                        Marca: ${product.brand} | Tipo: ${product.type} | Subtipo: ${product.subtype || 'N/A'} | R$ ${product.price.toFixed(2)}
                    </p>
                </div>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product.id}')">
                    <i class="bi bi-trash"></i> Deletar
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

// === LÓGICA DE PRODUTOS (CLIENTE) ===

function openProductDetails(productId) {
    // Achar produto pelo ID (que agora é o ID do Firebase)
    const product = products.find(p => p.id === productId);
    if (!product) return;

    currentProductId = productId;
    currentQuantity = 1;

    document.getElementById('detailImage').src = product.image;
    document.getElementById('detailBrand').textContent = product.brand;
    document.getElementById('detailName').textContent = product.name;
    document.getElementById('detailType').textContent = `Tipo: ${product.type}`;
    // ATUALIZADO: Verifica se subtipo existe
    document.getElementById("detailSubtype").textContent = product.subtype ? `Subtipo: ${product.subtype}` : '';
    document.getElementById("detailPrice").textContent = `R$ ${product.price.toFixed(2)}`;
    document.getElementById('detailPrice').textContent = `R$ ${product.price.toFixed(2)}`;
    document.getElementById('quantityDisplay').textContent = '1';

    const modal = new bootstrap.Modal(document.getElementById('productDetailsModal'));
    modal.show();
}

function increaseQuantity() {
    currentQuantity++;
    document.getElementById('quantityDisplay').textContent = currentQuantity;
}

function decreaseQuantity() {
    if (currentQuantity > 1) {
        currentQuantity--;
        document.getElementById('quantityDisplay').textContent = currentQuantity;
    }
}

// === LÓGICA DO CARRINHO (Sem alteração, é tudo local) ===

function addToCart() {
    const product = products.find(p => p.id === currentProductId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === currentProductId);
    
    if (existingItem) {
        existingItem.quantity += currentQuantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: currentQuantity
        });
    }

    updateCartCount();
    alert('Produto adicionado ao carrinho!');
    bootstrap.Modal.getInstance(document.getElementById('productDetailsModal')).hide();
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

function renderCart() {
    const container = document.getElementById('cartItemsContainer');
    const emptyMsg = document.getElementById('emptyCrt');

    if (cart.length === 0) {
        container.innerHTML = '';
        emptyMsg.style.display = 'block';
        return;
    }

    emptyMsg.style.display = 'none';
    container.innerHTML = '';

    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" class="cart-item-image" alt="${item.name}">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">R$ ${item.price.toFixed(2)}</div>
                <div class="cart-item-controls">
                    <div class="cart-item-qty">
                        <button class="quantity-btn" style="width: 30px; height: 30px; padding: 0; font-size: 0.8rem;" onclick="changeCartQuantity(${index}, -1)">−</button>
                        <span style="margin: 0 0.5rem; font-weight: 600;">${item.quantity}</span>
                        <button class="quantity-btn" style="width: 30px; height: 30px; padding: 0; font-size: 0.8rem;" onclick="changeCartQuantity(${index}, 1)">+</button>
                    </div>
                    <button class="remove-cart-btn" onclick="removeFromCart(${index})">Remover</button>
                </div>
            </div>
        `;
        container.appendChild(cartItem);
    });

    const summary = document.createElement('div');
    summary.className = 'cart-summary';
    summary.innerHTML = `
        <div class="summary-row">
            <span>Subtotal:</span>
            <span>R$ ${total.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Frete:</span>
            <span>A calcular</span>
        </div>
        <div class="summary-row total">
            <span>Total:</span>
            <span>R$ ${total.toFixed(2)}</span>
        </div>
    `;
    container.appendChild(summary);
}

function changeCartQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity < 1) {
        cart.splice(index, 1);
    }
    updateCartCount();
    renderCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    renderCart();
}

function finalizeOrderWhatsApp() {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }

    let message = 'Olá! Gostaria de fazer o seguinte pedido:\n\n';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        message += `${item.name} (x${item.quantity}) - R$ ${itemTotal.toFixed(2)}\n`;
    });

    message += `\nTotal: R$ ${total.toFixed(2)}\n\nPor favor, confirme a disponibilidade e o prazo de entrega.`;

    const whatsappNumber = '5575991976897';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
}

// === LÓGICA DE ADMIN ===

// LOGIN ADMIN
function loginAdmin() {
    const password = document.getElementById('adminPassword').value;
    if (password === 'admin123') {
        isAdmin = true;
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        loginModal.hide();
        document.getElementById('adminPassword').value = '';
        const adminModal = new bootstrap.Modal(document.getElementById('adminModal'));
        adminModal.show();
        renderAdminProducts(); // A lista já foi carregada do Firebase, apenas renderiza
    } else {
        alert('Senha incorreta!');
    }
}

// ADICIONAR PRODUTO (AGORA SALVA NO FIREBASE)
document.getElementById('addProductForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const imageData = document.getElementById('productImageFile').dataset.imageData;
    if (!imageData) {
        alert('Por favor, selecione uma imagem para o produto!');
        return;
    }

    const newProduct = {
        // ID não é mais necessário, o Firebase gerencia
        name: document.getElementById('productName').value,
        brand: document.getElementById('productBrand').value,
        type: document.getElementById('productType').value,
        subtype: document.getElementById('productSubtype').value || null,
        price: parseFloat(document.getElementById('productPrice').value),
        image: imageData
    };

    try {
        // Salva o novo produto no Firestore
        const docRef = await addDoc(collection(db, "products"), newProduct);
        console.log("Produto salvo com ID: ", docRef.id);

        // Recarrega todos os produtos do Firebase para atualizar a UI
        await loadAndRenderProducts();

        this.reset();
        document.getElementById('previewContainer').classList.remove('show');
        removeImage(); // Limpa o preview e o data
        alert('Produto adicionado com sucesso!');

    } catch (error) {
        console.error("Erro ao adicionar produto: ", error);
        alert('Falha ao adicionar o produto. Tente novamente.');
    }
});

// DELETAR PRODUTO (AGORA DELETA DO FIREBASE)
async function deleteProduct(id) {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
        try {
            // Deleta o documento do Firestore usando o ID
            await deleteDoc(doc(db, "products", id));

            // Recarrega os produtos para atualizar a UI
            await loadAndRenderProducts();
            
            alert('Produto deletado!');
        } catch (error) {
            console.error("Erro ao deletar produto: ", error);
            alert('Falha ao deletar o produto. Tente novamente.');
        }
    }
}

// === HELPERS DE FORMULÁRIO ADMIN (IMAGEM E SUBTIPOS) ===

// PREVIEW DE IMAGEM
document.getElementById('productImageFile').addEventListener('change', function(e) {
    handleImageUpload(this.files[0]);
});

function handleImageUpload(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem válido!');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('imagePreview');
        preview.src = e.target.result;
        document.getElementById('previewContainer').classList.add('show');
        document.getElementById('productImageFile').dataset.imageData = e.target.result;
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    document.getElementById('productImageFile').value = ''; // Limpa o input
    document.getElementById('previewContainer').classList.remove('show');
    document.getElementById('imagePreview').src = '';
  // Limpa o data-attribute que armazena o base64
    if (document.getElementById('productImageFile').dataset.imageData) {
        delete document.getElementById('productImageFile').dataset.imageData;
    }
}

const fileInputLabel = document.getElementById('fileInputLabel');
const fileInput = document.getElementById('productImageFile');

fileInputLabel.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.classList.add('dragover');
});

fileInputLabel.addEventListener('dragleave', function() {
    this.classList.remove('dragover');
});

fileInputLabel.addEventListener('drop', function(e) {
    e.preventDefault();
    this.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        fileInput.files = e.dataTransfer.files;
        handleImageUpload(e.dataTransfer.files[0]);
    }
});

function updateSubtypeOptions() {
    const type = document.getElementById("productType").value;
    const subtypeContainer = document.getElementById("subtypeContainer");
    const subtypeSelect = document.getElementById("productSubtype");

    subtypeSelect.innerHTML = '<option value="">Selecione o subtipo...</option>';

    let options = [];

    if (type === "Queijo") {
        options = [
            { group: "Tradicionais", items: ["Coalho tradicional", "Coalho com orégano", "Coalho com manjericão", "Coalho vinagrete", "Coalho pimenta calabresa"] },
            { group: "Especiais", items: ["Vovó Vânia", "Red Orobó", "Smoke"] },
            { group: "Maturados", items: ["Black Orobó", "Gibão de couro", "Serra do Orobó", "Sabor do campo"] }
        ];
    }

    else if (type === "Vinho") {
        options = [
            { group: "Tipos", items: [
                "Vinho Tinto Seco",
                "Vinho Tinto Suave",
                "Vinho Rosé",
                "Vinho Branco",
                "Espumantes",
                "Vinhos Chilenos",
                "Vinhos Argentinos",
                "Vinhos Espanhóis",
                "Rótulos Baianos",
                "UVVA & Vinhos Vale do Capão"
            ] }
        ];
    }

    else if (type === "Linguiça") {
        options = [
            { group: "Suíno", items: [
                "Tradicional",
                "Cuiabana Queijo c/ Rúcula",
                "Apimentada",
                "Pimenta Biquinho",
                "Palmito",
                "Azeitona"
            ] },
            { group: "Bovina", items: [
                "Costela",
                "Picanha",
                "Mista",
                "Apimentada"
            ] },
            { group: "Frango", items: [
                "Tradicional",
                "Apimentada",
                "Bacon"
            ] }
        ];
    }

    // Exibe o container se houver subtipo
    if (options.length > 0) {
        subtypeContainer.style.display = "block";
        options.forEach(group => {
            const optgroup = document.createElement("optgroup");
            optgroup.label = group.group;
            group.items.forEach(item => {
                const opt = document.createElement("option");
                opt.value = item;
                opt.textContent = item;
                optgroup.appendChild(opt);
            });
            subtypeSelect.appendChild(optgroup);
        });
    } else {
        subtypeContainer.style.display = "none";
    }
}

// === LÓGICA DE FILTRO E PESQUISA (Sem alteração) ===

// FILTROS
function applyFilters() {
    const marcas = Array.from(document.querySelectorAll('.filter-marca:checked')).map(el => el.value);
    const tipos = Array.from(document.querySelectorAll('.filter-tipo:checked')).map(el => el.value);
    const subtipos = Array.from(document.querySelectorAll('.filter-subtipo:checked')).map(el => el.value);
    const priceMin = parseFloat(document.getElementById('priceMin').value) || 0;
    const priceMax = parseFloat(document.getElementById('priceMax').value) || Infinity;

    const filtered = products.filter(p => {
        const marcaMatch = marcas.length === 0 || marcas.includes(p.brand);
        const tipoMatch = tipos.length === 0 || tipos.includes(p.type);
        const subtypeMatch = subtipos.length === 0 || (p.subtype && subtipos.includes(p.subtype));
        const priceMatch = p.price >= priceMin && p.price <= priceMax;
        return marcaMatch && tipoMatch && subtypeMatch && priceMatch;
    });

    renderProducts(filtered);
}

// LIMPAR FILTROS
function clearFilters() {
    document.querySelectorAll('.filter-marca, .filter-tipo, .filter-subtipo')
        .forEach(el => el.checked = false);
    document.getElementById('priceMin').value = '';
    document.getElementById('priceMax').value = '';
    renderProducts();
}

// PESQUISA
document.getElementById('searchInput').addEventListener('keyup', function() {
    const search = this.value.toLowerCase();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.brand.toLowerCase().includes(search) ||
        p.type.toLowerCase().includes(search) ||
        (p.subtype && p.subtype.toLowerCase().includes(search))
    );
    renderProducts(filtered);
});

function toggleSubcategory(tipo) {
    const checkbox = document.querySelector(`input.filter-tipo[value='${capitalize(tipo)}']`);
    const sub = document.getElementById(`sub-${tipo}`);

    if (!checkbox || !sub) return;

    if (checkbox.checked) {
        sub.style.display = "block";
    } else {
        sub.style.display = "none";
        // Desmarca subtipos ao desmarcar tipo principal
        sub.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = false);
    }
}

// === FUNÇÕES UTILITÁRIAS ===

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// === EVENT LISTENERS ADICIONAIS E INICIALIZAÇÃO ===

document.getElementById('cartModal').addEventListener('show.bs.modal', function() {
    renderCart();
});

// Listener duplicado (removido, pois a lógica principal já está no listener 'submit' do 'addProductForm')
// document.getElementById("addProductForm").addEventListener("submit", function (e) { ... });

// === FUNÇÃO DE CARGA INICIAL ===

async function loadAndRenderProducts() {
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        products = []; // Limpa o array local
        querySnapshot.forEach((doc) => {
            // Adiciona o produto com o ID do Firebase
            products.push({ id: doc.id, ...doc.data() });
        });
        
        // Renderiza os produtos na tela principal e no painel admin
        renderProducts();
        if (isAdmin) {
             renderAdminProducts(); // Atualiza a lista do admin se o modal estiver aberto
        }

    } catch (e) {
        console.error("Erro ao carregar produtos: ", e);
        alert('Não foi possível carregar os produtos do banco de dados.');
    }
}

// RENDERIZAR INICIAL
// Chama a nova função de carregamento do Firebase ao iniciar
loadAndRenderProducts();

window.openProductDetails = openProductDetails;
window.deleteProduct = deleteProduct;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.addToCart = addToCart;
window.changeCartQuantity = changeCartQuantity;
window.removeFromCart = removeFromCart;
window.finalizeOrderWhatsApp = finalizeOrderWhatsApp;
window.loginAdmin = loginAdmin;
window.toggleSubcategory = toggleSubcategory;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.updateSubtypeOptions = updateSubtypeOptions;
window.removeImage = removeImage;