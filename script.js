// E-commerce Website JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const productsGrid = document.getElementById('products-grid');
    const cartIcon = document.querySelector('.cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.querySelector('.close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartCountElement = document.querySelector('.cart-count');
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    // State
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // API URL for real product images
    const PRODUCTS_API = 'https://fakestoreapi.com/products';
    
    // Initialize the app
    initApp();
    
    function initApp() {
        loadProducts();
        updateCartUI();
        setupEventListeners();
    }
    
    // Fetch products from API
    async function loadProducts() {
        try {
            const response = await fetch(PRODUCTS_API);
            const products = await response.json();
            displayProducts(products.slice(0, 8)); // Display first 8 products
        } catch (error) {
            console.error('Error loading products:', error);
            // Fallback products if API fails
            displayProducts(getFallbackProducts());
        }
    }
    
    // Display products in the grid
    function displayProducts(products) {
        productsGrid.innerHTML = '';
        
        products.forEach(product => {
            const productCard = createProductCard(product);
            productsGrid.appendChild(productCard);
        });
    }
    
    // Create product card element
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.title}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" data-id="${product.id}" data-title="${product.title}" data-price="${product.price}" data-image="${product.image}">
                    Add to Cart
                </button>
            </div>
        `;
        
        return card;
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Cart icon click
        cartIcon.addEventListener('click', () => {
            cartModal.style.display = 'flex';
        });
        
        // Close cart modal
        closeCartBtn.addEventListener('click', () => {
            cartModal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                cartModal.style.display = 'none';
            }
        });
        
        // Add to cart button event delegation
        productsGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                const productId = parseInt(e.target.dataset.id);
                const productTitle = e.target.dataset.title;
                const productPrice = parseFloat(e.target.dataset.price);
                const productImage = e.target.dataset.image;
                
                addToCart(productId, productTitle, productPrice, productImage);
            }
        });
        
        // Cart items event delegation (for quantity changes and removal)
        cartItemsContainer.addEventListener('click', (e) => {
            const cartItem = e.target.closest('.cart-item');
            if (!cartItem) return;
            
            const productId = parseInt(cartItem.dataset.id);
            
            if (e.target.classList.contains('increase')) {
                updateCartItemQuantity(productId, 1);
            } else if (e.target.classList.contains('decrease')) {
                updateCartItemQuantity(productId, -1);
            } else if (e.target.classList.contains('remove-item')) {
                removeFromCart(productId);
            }
        });
        
        // Checkout button
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            
            alert(`Thank you for your order! Total: $${calculateCartTotal().toFixed(2)}`);
            clearCart();
            cartModal.style.display = 'none';
        });
        
        // Smooth scrolling for navigation links
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', function(e) {
                if (this.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 80,
                            behavior: 'smooth'
                        });
                        
                        // Update active link
                        document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
                        this.classList.add('active');
                    }
                }
            });
        });
    }
    
    // Cart functions
    function addToCart(id, title, price, image) {
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id,
                title,
                price,
                image,
                quantity: 1
            });
        }
        
        updateCartUI();
        saveCartToLocalStorage();
        
        // Show feedback
        showNotification(`${title} added to cart!`);
    }
    
    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCartUI();
        saveCartToLocalStorage();
    }
    
    function updateCartItemQuantity(id, change) {
        const item = cart.find(item => item.id === id);
        
        if (item) {
            item.quantity += change;
            
            if (item.quantity <= 0) {
                removeFromCart(id);
            } else {
                updateCartUI();
                saveCartToLocalStorage();
            }
        }
    }
    
    function calculateCartTotal() {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    function clearCart() {
        cart = [];
        updateCartUI();
        saveCartToLocalStorage();
    }
    
    function updateCartUI() {
        // Update cart count
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        
        // Update cart items display
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            cartTotalElement.textContent = '0.00';
            return;
        }
        
        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.dataset.id = item.id;
            cartItemElement.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <p class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn increase">+</button>
                    </div>
                    <button class="remove-item">Remove</button>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        // Update cart total
        const total = calculateCartTotal();
        cartTotalElement.textContent = total.toFixed(2);
    }
    
    function saveCartToLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #4a6fa5;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 3000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
        
        // Add CSS for animation if not already present
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Fallback products in case API fails
    function getFallbackProducts() {
        return [
            {
                id: 1,
                title: "Classic Leather Jacket",
                price: 199.99,
                image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            },
            {
                id: 2,
                title: "Wireless Bluetooth Headphones",
                price: 129.99,
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            },
            {
                id: 3,
                title: "Smart Watch Series 5",
                price: 249.99,
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            },
            {
                id: 4,
                title: "Organic Cotton T-Shirt",
                price: 124.99,
                image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            },
            {
                id: 5,
                title: "Ceramic Coffee Mug Set",
                price: 84.99,
                image: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            },
            {
                id: 6,
                title: "Professional DSLR Camera",
                price: 899.99,
                image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            },
            {
                id: 7,
                title: "Natural Bamboo Cutting Board",
                price: 69.99,
                image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            },
            {
                id: 8,
                title: "Waterproof Backpack",
                price: 199.99,
                image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            }
        ];
    }
});