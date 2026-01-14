// Product Data
const products = [
    {
        id: 1,
        name: "Cheeseburger Meal",
        description: "Juicy beef patty with cheese, lettuce, and special sauce",
        price: 8.99,
        image: "🍔",
        category: "Food"
    },
    {
        id: 2,
        name: "Pepperoni Pizza",
        description: "Large pizza with extra cheese and pepperoni",
        price: 14.99,
        image: "🍕",
        category: "Food"
    },
    {
        id: 3,
        name: "Fresh Salad Bowl",
        description: "Mixed greens with vegetables and choice of dressing",
        price: 7.49,
        image: "🥗",
        category: "Food"
    },
    {
        id: 4,
        name: "French Fries",
        description: "Crispy golden fries with sea salt",
        price: 3.99,
        image: "🍟",
        category: "Sides"
    },
    {
        id: 5,
        name: "Iced Coffee",
        description: "Cold brew with milk and vanilla syrup",
        price: 4.49,
        image: "🥤",
        category: "Drinks"
    },
    {
        id: 6,
        name: "Chocolate Sundae",
        description: "Vanilla ice cream with hot fudge and nuts",
        price: 5.99,
        image: "🍦",
        category: "Dessert"
    },
    {
        id: 7,
        name: "Chicken Wings",
        description: "Crispy wings with BBQ or Buffalo sauce",
        price: 10.99,
        image: "🍗",
        category: "Food"
    },
    {
        id: 8,
        name: "Smoothie",
        description: "Mixed berry smoothie with yogurt",
        price: 6.49,
        image: "🧃",
        category: "Drinks"
    }
];

// Shopping Cart
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateCartDisplay();
    
    // Load cart from localStorage
    if (localStorage.getItem('cart')) {
        cart = JSON.parse(localStorage.getItem('cart'));
        updateCartDisplay();
    }
});

// Load products to the page
function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <div style="font-size: 100px; text-align: center; line-height: 200px;">
                    ${product.image}
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                    <button class="add-to-cart" onclick="addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

// Add item to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    updateCartDisplay();
    showNotification(`${product.name} added to cart!`);
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    showNotification('Item removed from cart');
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity < 1) {
            removeFromCart(productId);
            return;
        }
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

// Update cart display
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
    
    // Update cart items display
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-basket"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        return;
    }
    
    cartItems.innerHTML = '';
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <div style="font-size: 40px; text-align: center; line-height: 70px;">
                    ${item.image}
                </div>
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.name}</h4>
                <p class="cart-item-price">$${item.price.toFixed(2)} each</p>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
}

// Toggle cart sidebar
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    
    cartSidebar.classList.toggle('active');
    cartOverlay.style.display = cartSidebar.classList.contains('active') ? 'block' : 'none';
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Update modal with order details
    document.getElementById('orderTotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('orderId').textContent = `#ORD-${Math.floor(Math.random() * 1000000)}`;
    
    // Show modal
    document.getElementById('checkoutModal').style.display = 'flex';
    
    // Clear cart
    cart = [];
    localStorage.removeItem('cart');
    updateCartDisplay();
    toggleCart();
}

// Close modal
function closeModal() {
    document.getElementById('checkoutModal').style.display = 'none';
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Add CSS for animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
            document.head.removeChild(style);
        }, 300);
    }, 3000);
}

// Close cart when clicking outside
document.getElementById('cartOverlay').addEventListener('click', toggleCart);

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('checkoutModal');
    if (event.target === modal) {
        closeModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar.classList.contains('active')) {
            toggleCart();
        }
    }
    
    if (event.key === 'c' && event.ctrlKey) {
        event.preventDefault();
        toggleCart();
    }
});
