document.addEventListener('DOMContentLoaded', () => {
    const productListContainer = document.querySelector('.product-list');
    const categoryFilters = document.querySelectorAll('input[name="category"]');
    const priceFilters = document.querySelectorAll('input[name="price"]');
    const sortBySelect = document.getElementById('sort-by');
    const cartCountElements = document.querySelectorAll('.cart-count'); // Target all cart counts

    // Load products from local storage or use defaults with more variety
    let products = JSON.parse(localStorage.getItem('products')) || [
        { id: 1, name: 'Adventure Helmet (Grey)', category: 'helmet', price: 180, image: 'https://via.placeholder.com/150/808080/ffffff?Text=AdvHelmetGrey' },
        { id: 2, name: 'Leather Touring Jacket', category: 'jacket', price: 350, image: 'https://via.placeholder.com/150/343a40/ffffff?Text=LeatherTouring' },
        { id: 3, name: 'Mesh Summer Gloves (Black)', category: 'glove', price: 50, image: 'https://via.placeholder.com/150/000000/ffffff?Text=MeshGlovesBlack' },
        { id: 4, name: 'Armored Riding Pants', category: 'pant', price: 200, image: 'https://via.placeholder.com/150/6c757d/ffffff?Text=ArmoredPants' },
        { id: 5, name: 'Waterproof Touring Boots', category: 'boot', price: 280, image: 'https://via.placeholder.com/150/495057/ffffff?Text=WaterproofBoots' },
        { id: 6, name: 'Full-Face Helmet (Red)', category: 'helmet', price: 220, image: 'https://via.placeholder.com/150/dc3545/ffffff?Text=FullFaceRed' },
        { id: 7, name: 'Textile Adventure Jacket', category: 'jacket', price: 280, image: 'https://via.placeholder.com/150/28a745/ffffff?Text=TextileAdv' },
        { id: 8, name: 'Winter Riding Gloves', category: 'glove', price: 75, image: 'https://via.placeholder.com/150/007bff/ffffff?Text=WinterGloves' },
        { id: 9, name: 'Kevlar Reinforced Pants', category: 'pant', price: 230, image: 'https://via.placeholder.com/150/17a2b8/ffffff?Text=KevlarPants' },
        { id: 10, name: 'Sport Riding Boots', category: 'boot', price: 320, image: 'https://via.placeholder.com/150/ffc107/000000?Text=SportBoots' },
        { id: 11, name: 'Modular Helmet (Black)', category: 'helmet', price: 250, image: 'https://via.placeholder.com/150/000000/ffffff?Text=ModularHelmet' },
        { id: 12, name: 'Retro Leather Jacket', category: 'jacket', price: 400, image: 'https://via.placeholder.com/150/6f42c1/ffffff?Text=RetroLeather' },
        { id: 13, name: 'Gauntlet Gloves (Brown)', category: 'glove', price: 65, image: 'https://via.placeholder.com/150/a0761d/ffffff?Text=GauntletGloves' },
        { id: 14, name: 'Off-Road Riding Pants', category: 'pant', price: 190, image: 'https://via.placeholder.com/150/20c997/ffffff?Text=OffRoadPants' },
        { id: 15, name: 'Casual Riding Shoes', category: 'boot', price: 150, image: 'https://via.placeholder.com/150/fd7e14/ffffff?Text=CasualShoes' },
        // Add even more product data as needed
    ];

    let filteredProducts = [...products];
    let cart = loadCart();
    updateCartCountUI();
    renderProducts(filteredProducts); // Initial render on homepage

    // Update products array from admin page
    window.updateProductData = (newProducts) => {
        products = newProducts;
        filterProducts();
        // Re-render on the current category page if applicable
        const path = window.location.pathname;
        if (path.includes('helmet.html')) renderCategory('helmet', document.getElementById('helmetProducts'));
        if (path.includes('jackets.html')) renderCategory('jacket', document.getElementById('jacketProducts'));
        if (path.includes('pants.html')) renderCategory('pant', document.getElementById('pantProducts'));
        if (path.includes('boots.html')) renderCategory('boot', document.getElementById('bootProducts'));
        if (path.includes('gloves.html')) renderCategory('glove', document.getElementById('gloveProducts'));
    };

    categoryFilters.forEach(filter => {
        filter.addEventListener('change', filterProducts);
    });

    priceFilters.forEach(filter => {
        filter.addEventListener('change', filterProducts);
    });

    sortBySelect.addEventListener('change', () => {
        sortProducts(sortBySelect.value);
    });

    function renderProducts(productList) {
        if (!productListContainer) return; // Only on homepage
        productListContainer.innerHTML = '';
        if (productList.length === 0) {
            productListContainer.innerHTML = '<p>No products found.</p>';
            return;
        }
        productList.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            `;
            productListContainer.appendChild(productCard);
        });

        const addToCartButtons = productListContainer.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.dataset.id);
                addToCart(productId);
            });
        });
        updateCartCountUI();
    }

    function renderCategory(categoryName, container) {
        if (!container) return;
        const categoryList = products.filter(product => product.category === categoryName);
        container.innerHTML = '';
        if (categoryList.length === 0) {
            container.innerHTML = `<p>No ${categoryName} available.</p>`;
            return;
        }
        categoryList.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            `;
            container.appendChild(productCard);
        });

        const addToCartButtons = container.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.dataset.id);
                addToCart(productId);
            });
        });
        updateCartCountUI();
    }

    function filterProducts() {
        const selectedCategories = Array.from(categoryFilters)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        const selectedPriceRange = document.querySelector('input[name="price"]:checked').value;

        filteredProducts = products.filter(product => {
            const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category);
            const priceMatch = filterByPrice(product.price, selectedPriceRange);
            return categoryMatch && priceMatch;
        });

        sortProducts(sortBySelect.value);
        renderProducts(filteredProducts);
    }

    function filterByPrice(price, range) {
        if (range === 'all') return true;
        const [min, max] = range.split('-').map(Number);
        if (max === undefined) return price >= min;
        return price >= min && price <= max;
    }

    function sortProducts(sortBy) {
        switch (sortBy) {
            case 'price-low-to-high':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high-to-low':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name-a-z':
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-z-a':
                filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                filteredProducts = [...products]; // Reset to original order
                filterProducts(); // Re-apply filters after reset
                return;
        }
        renderProducts(filteredProducts);
    }

    function addToCart(productId) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            const productToAdd = products.find(product => product.id === productId);
            if (productToAdd) {
                cart.push({ ...productToAdd, quantity: 1 });
            }
        }
        saveCart();
        updateCartCountUI();
    }

    function loadCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function updateCartCountUI() {
        const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        cartCountElements.forEach(el => el.textContent = totalQuantity);
    }

    // Render category pages on load if we are on them
    const path = window.location.pathname;
    if (path.includes('helmet.html')) renderCategory('helmet', document.getElementById('helmetProducts'));
    if (path.includes('jackets.html')) renderCategory('jacket', document.getElementById('jacketProducts'));
    if (path.includes('pants.html')) renderCategory('pant', document.getElementById('pantProducts'));
    if (path.includes('boots.html')) renderCategory('boot', document.getElementById('bootProducts'));
    if (path.includes('gloves.html')) renderCategory('glove', document.getElementById('gloveProducts'));
});
