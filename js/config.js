// supabase_migration.js
// Versão convertida e corrigida: Firebase -> Supabase (ES Module)

// ===============================================
//  SUPABASE - CONFIGURAÇÃO (UMA ÚNICA VEZ)
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://ojaltbkcissundqdkojl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qYWx0YmtjaXNzdW5kcWRrb2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxOTY1MTcsImV4cCI6MjA3OTc3MjUxN30.sjcVEVsLpHSQYPs5b_6VmH7R38XY7m-QATSeh60d5U0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===============================================
//  ESTADOS GLOBAIS
// ===============================================
let products = [];
let isAdmin = false;
let cart = [];
let currentQuantity = 1;
let currentProductId = null;

// Salva carrinho
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Carrega carrinho
function loadCart() {
    const saved = localStorage.getItem('cart');
    cart = saved ? JSON.parse(saved) : [];
    updateCartCount();
}




// ===============================================
//  RENDERIZAÇÃO DE PRODUTOS
// ===============================================
function renderProducts(filteredProducts = products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!filteredProducts || filteredProducts.length === 0) {
        grid.innerHTML = '<div class="col-12"><p style="text-align: center; color: #666; padding: 2rem;">Nenhum produto encontrado.</p></div>';
        return;
    }

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-4';
        card.innerHTML = `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image_url}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <span class="product-brand">${product.brand}</span>
                    <h5 class="product-name">${product.name}</h5>
                    <p class="product-type">${product.type}</p>
                    <p class="product-subtype">${product.subtype || ''}</p>
                    <p class="product-price">R$ ${Number(product.price).toFixed(2)}</p>
                    <button class="btn-view" onclick="openProductDetails('${product.id}')">Ver Detalhes</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ===============================================
//  ADMIN - RENDERIZAÇÃO
// ===============================================
function renderAdminProducts() {
    const list = document.getElementById('adminProductsList');
    if (!list) return;
    list.innerHTML = '';

    products.forEach(product => {
        const item = document.createElement('div');
        item.className = 'card mb-2 p-3';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="color: var(--primary-dark);">${product.name}</strong>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: #666;">
                        Marca: ${product.brand} | Tipo: ${product.type} | Subtipo: ${product.subtype || 'N/A'} | R$ ${Number(product.price).toFixed(2)}
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

// ===============================================
//  DETALHES DO PRODUTO
// ===============================================
function openProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    

    if (!product) return;

    currentProductId = productId;
    currentQuantity = 1;

    const detailImage = document.getElementById('detailImage');
    if (detailImage) detailImage.src = product.image_url;
    const detailBrand = document.getElementById('detailBrand');
    if (detailBrand) detailBrand.textContent = product.brand;
    const detailName = document.getElementById('detailName');
    if (detailName) detailName.textContent = product.name;
    const detailType = document.getElementById('detailType');
    if (detailType) detailType.textContent = `Tipo: ${product.type}`;
    const detailSubtype = document.getElementById('detailSubtype');
    if (detailSubtype) detailSubtype.textContent = product.subtype ? `Subtipo: ${product.subtype}` : '';
    const detailPrice = document.getElementById('detailPrice');
    if (detailPrice) detailPrice.textContent = `R$ ${Number(product.price).toFixed(2)}`;

    const quantityDisplay = document.getElementById('quantityDisplay');
    if (quantityDisplay) quantityDisplay.textContent = '1';

    const modalEl = document.getElementById('productDetailsModal');
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

// ===============================================
//  QUANTIDADE (detalhes)
function increaseQuantity() {
    currentQuantity++;
    const d = document.getElementById('quantityDisplay');
    if (d) d.textContent = currentQuantity;
}

function decreaseQuantity() {
    if (currentQuantity > 1) {
        currentQuantity--;
        const d = document.getElementById('quantityDisplay');
        if (d) d.textContent = currentQuantity;
    }
}

// ===============================================
//  CARRINHO
// ===============================================
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
            price: Number(product.price),
            image: product.image_url,
            quantity: currentQuantity
        });
    }

    saveCart();
    loadCart();
    renderCart();
    updateCartCount();
    alert('Produto adicionado ao carrinho!');
    const modalEl = document.getElementById('productDetailsModal');
    if (modalEl) {
        const instance = bootstrap.Modal.getInstance(modalEl);
        if (instance) instance.hide();
    }
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const el = document.getElementById('cartCount');
    if (el) el.textContent = count;
}

function renderCart() {
    const container = document.getElementById('cartItemsContainer');
    const emptyMsg = document.getElementById('emptyCrt');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '';
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
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
    if (!cart[index]) return;
    cart[index].quantity += change;
    if (cart[index].quantity < 1) {
        cart.splice(index, 1);
    }
     saveCart(); 
    updateCartCount();
    renderCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
     saveCart(); 
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

// ===============================================
//  ADMIN (login simples) - mantém seu fluxo atual
// ===============================================
function loginAdmin() {
    const password = document.getElementById('adminPassword')?.value;
    if (password === 'admin123') {
        isAdmin = true;
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        if (loginModal) loginModal.hide();
        const adminModal = new bootstrap.Modal(document.getElementById('adminModal'));
        adminModal.show();
        document.getElementById('adminPassword') && (document.getElementById('adminPassword').value = '');
        renderAdminProducts();
    } else {
        alert('Senha incorreta!');
    }
}

// ===============================================
//  HELPERS DE FORMULÁRIO ADMIN (IMAGEM E SUBTIPOS)
// ===============================================

// PREVIEW DE IMAGEM (mantém base64 preview para UX)
const fileInput = typeof document !== 'undefined' ? document.getElementById('productImageFile') : null;
if (fileInput) {
    fileInput.addEventListener('change', function(e) {
        handleImageUpload(this.files[0]);
    });
}

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
        if (preview) preview.src = e.target.result;
        const previewContainer = document.getElementById('previewContainer');
        if (previewContainer) previewContainer.classList.add('show');
        // Guardamos o base64 temporariamente caso o usuário não envie arquivo (ex: arrastar)
        if (fileInput) fileInput.dataset.imageData = e.target.result;
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    if (!fileInput) return;
    fileInput.value = ''; // Limpa o input
    const previewContainer = document.getElementById('previewContainer');
    if (previewContainer) previewContainer.classList.remove('show');
    const preview = document.getElementById('imagePreview');
    if (preview) preview.src = '';
    if (fileInput.dataset.imageData) delete fileInput.dataset.imageData;
}

const fileInputLabel = typeof document !== 'undefined' ? document.getElementById('fileInputLabel') : null;
if (fileInputLabel) {
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
            if (fileInput) fileInput.files = e.dataTransfer.files;
            handleImageUpload(e.dataTransfer.files[0]);
        }
    });
}

// Converte base64 para Blob (usado se necessário)
function base64ToBlob(base64) {
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
}

// Upload da imagem para o Supabase Storage
async function uploadImageToSupabase(fileOrBase64) {
  try {
    let file;
    let filename = `product_${Date.now()}`;

    if (typeof fileOrBase64 === 'string') {
      const extMatch = fileOrBase64.match(/^data:image\/(\w+);base64,/);
      const ext = extMatch ? extMatch[1] : 'png';
      filename += `.${ext}`;
      file = base64ToBlob(fileOrBase64);
    } else {
      const originalName = fileOrBase64.name || 'upload.png';
      const ext = originalName.split('.').pop();
      filename += `.${ext}`;
      file = fileOrBase64;
    }

    const filePath = `products/${filename}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    const { data: publicData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return publicData.publicUrl;

  } catch (e) {
    console.error('Erro no upload de imagem:', e);
    throw e;
  }
}



// ===============================================
//  SUBTIPOS (updateSubtypeOptions) e toggleSubcategory
// ===============================================
function updateSubtypeOptions() {
    const type = document.getElementById("productType")?.value;
    const subtypeContainer = document.getElementById("subtypeContainer");
    const subtypeSelect = document.getElementById("productSubtype");

    if (!subtypeSelect || !subtypeContainer) return;

    subtypeSelect.innerHTML = '<option value="">Selecione o subtipo...</option>';

    let options = [];

    if (type === "Queijo") {
        options = [
            { group: "Tradicionais", items: ["Coalho tradicional", "Coalho com orégano", "Coalho com manjericão", "Coalho vinagrete", "Coalho pimenta calabresa"] },
            { group: "Especiais", items: ["Vovó Vânia", "Red Orobó", "Smoke"] },
            { group: "Maturados", items: ["Black Orobó", "Gibão de couro", "Serra do Orobó", "Sabor do campo"] }
        ];
    } else if (type === "Vinho") {
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
    } else if (type === "Linguiça" || type === "Linguiça") {
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

function toggleSubcategory(tipo) {
    const checkbox = document.querySelector(`input.filter-tipo[value='${capitalize(tipo)}']`);
    const sub = document.getElementById(`sub-${tipo}`);

    if (!checkbox || !sub) return;

    if (checkbox.checked) {
        sub.style.display = "block";
    } else {
        sub.style.display = "none";
        sub.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = false);
    }
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// ===============================================
//  FILTRO E PESQUISA
// ===============================================
function applyFilters() {
    const marcas = Array.from(document.querySelectorAll('.filter-marca:checked')).map(el => el.value);
    const tipos = Array.from(document.querySelectorAll('.filter-tipo:checked')).map(el => el.value);
    const subtipos = Array.from(document.querySelectorAll('.filter-subtipo:checked')).map(el => el.value);
    const priceMin = parseFloat(document.getElementById('priceMin')?.value) || 0;
    const priceMax = parseFloat(document.getElementById('priceMax')?.value) || Infinity;

    const filtered = products.filter(p => {
        const marcaMatch = marcas.length === 0 || marcas.includes(p.brand);
        const tipoMatch = tipos.length === 0 || tipos.includes(p.type);
        const subtypeMatch = subtipos.length === 0 || (p.subtype && subtipos.includes(p.subtype));
        const priceMatch = Number(p.price) >= priceMin && Number(p.price) <= priceMax;
        return marcaMatch && tipoMatch && subtypeMatch && priceMatch;
    });

    renderProducts(filtered);
}

function clearFilters() {
    document.querySelectorAll('.filter-marca, .filter-tipo, .filter-subtipo')
        .forEach(el => el.checked = false);
    const pm = document.getElementById('priceMin'); if (pm) pm.value = '';
    const px = document.getElementById('priceMax'); if (px) px.value = '';
    renderProducts();
}

// PESQUISA (listener)
const searchInput = typeof document !== 'undefined' ? document.getElementById('searchInput') : null;
if (searchInput) {
    searchInput.addEventListener('keyup', function() {
        const search = this.value.toLowerCase();
        const filtered = products.filter(p => 
            p.name.toLowerCase().includes(search) ||
            p.brand.toLowerCase().includes(search) ||
            p.type.toLowerCase().includes(search) ||
            (p.subtype && p.subtype.toLowerCase().includes(search))
        );
        renderProducts(filtered);
    });
}

// ===============================================
//  CARGA INICIAL (Supabase)
// ===============================================
async function loadAndRenderProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        products = data.map(p => ({ id: p.id, name: p.name, brand: p.brand, type: p.type, subtype: p.subtype, price: p.price, image_url: p.image_url }));

        renderProducts();
        if (isAdmin) renderAdminProducts();

    } catch (e) {
        console.error('Erro ao carregar produtos:', e);
        alert('Não foi possível carregar os produtos do Supabase.');
    }
}

// ADICIONAR PRODUTO (listener do formulário)
const addProductForm = typeof document !== 'undefined' ? document.getElementById('addProductForm') : null;
if (addProductForm) {
    addProductForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        try {
            const inputFile = document.getElementById('productImageFile');
            let imageUrl = null;

            if (inputFile && inputFile.files && inputFile.files[0]) {
                imageUrl = await uploadImageToSupabase(inputFile.files[0]);
            } else if (inputFile && inputFile.dataset && inputFile.dataset.imageData) {
                imageUrl = await uploadImageToSupabase(inputFile.dataset.imageData);
            } else {
                alert('Por favor, selecione uma imagem para o produto!');
                return;
            }

            const newProduct = {
                name: document.getElementById('productName').value,
                brand: document.getElementById('productBrand').value,
                type: document.getElementById('productType').value,
                subtype: document.getElementById('productSubtype').value || null,
                price: parseFloat(document.getElementById('productPrice').value),
                image_url: imageUrl
            };

            const { error } = await supabase
                .from("products")
                .insert([newProduct]);

            if (error) throw error;

            await loadAndRenderProducts();
            this.reset();
            document.getElementById('previewContainer')?.classList.remove('show');
            removeImage();
            alert('Produto adicionado com sucesso!');
        } catch (error) {
            console.error('Erro ao adicionar produto:', error);
            alert('Falha ao adicionar o produto. Tente novamente.');
        }
    });
}

// DELETAR PRODUTO
async function deleteProduct(id) {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return;

    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await loadAndRenderProducts();
        alert('Produto deletado!');
    } catch (e) {
        console.error('Erro ao deletar produto:', e);
        alert('Falha ao deletar o produto. Tente novamente.');
    }
}

// ===============================================
//  EXPORTAR FUNÇÕES PARA window (compatibilidade com HTML)
// ===============================================
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

// ===============================================
//  CARREGA PRODUTOS AO INICIAR
// ===============================================
loadAndRenderProducts();
loadCart();
renderCart();
