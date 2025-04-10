class ShoppingCart {
    constructor() {
        this.items = [];
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.className = 'notification-container';
        document.body.appendChild(this.notificationContainer);
        this.setupModal();
    }

    addItem(name, price) {
        this.items.push({ name, price });
        this.updateUI();
        this.saveToLocalStorage();
        this.showNotification(`✅ ${name} añadido al carrito`);
    }

    removeItem(index) {
        const removedItem = this.items.splice(index, 1)[0];
        this.updateUI();
        this.saveToLocalStorage();
        this.showNotification(`🗑️ ${removedItem.name} eliminado`);
    }

    clearCart() {
        this.items = [];
        this.updateUI();
        this.saveToLocalStorage();
    }

    calculateTotal() {
        return this.items.reduce((sum, item) => sum + item.price, 0);
    }

    updateUI() {
        const cartItemsElement = document.getElementById('cart-items');
        const cartTotalElement = document.getElementById('cart-total');
        const cartCount = document.getElementById('cartCount');

        cartCount.textContent = this.items.length;
        
        if (this.items.length > 0) {
            cartCount.style.transform = 'scale(1.2)';
            setTimeout(() => {
                cartCount.style.transform = 'scale(1)';
            }, 300);
        }

        if (this.items.length === 0) {
            cartItemsElement.innerHTML = '<div class="empty-cart shake">Tu carrito está vacío</div>';
            cartTotalElement.style.display = 'none';
            return;
        }

        cartItemsElement.innerHTML = '';
        this.items.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <button class="remove-item" data-index="${index}" aria-label="Eliminar ${item.name}">X</button>
            `;
            cartItemsElement.appendChild(itemElement);
        });

        cartTotalElement.textContent = `Total: $${this.calculateTotal().toFixed(2)}`;
        cartTotalElement.style.display = 'block';
    }

    saveToLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    loadFromLocalStorage() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
            this.updateUI();
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        this.notificationContainer.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(-50%) translateY(0)';
            
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(-50%) translateY(20px)';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 2500);
        }, 10);
    }

    setupModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'image-modal';
        this.modal.innerHTML = `
            <span class="close-modal" tabindex="0" aria-label="Cerrar imagen">&times;</span>
            <img src="" alt="Imagen ampliada">
        `;
        document.body.appendChild(this.modal);

        this.modal.querySelector('.close-modal').addEventListener('click', () => {
            this.modal.classList.remove('active');
        });

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.modal.classList.remove('active');
            }
        });

        document.querySelectorAll('.pizza-image, .snack-image').forEach(img => {
            img.addEventListener('click', () => {
                if (!img.src) return;
                this.modal.querySelector('img').src = img.src;
                this.modal.querySelector('img').alt = img.alt;
                this.modal.classList.add('active');
            });
        });
    }

    sendWhatsAppOrder() {
        if (this.items.length === 0) {
            this.showNotification('🛒 Tu carrito está vacío');
            return;
        }
        
        let message = `¡Hola Dashuri's Pizza! Quiero hacer un pedido:\n\n*Mi pedido*\n`;
        
        this.items.forEach(item => {
            message += `- ${item.name}: $${item.price.toFixed(2)}\n`;
        });
        
        message += `\n*Total: $${this.calculateTotal().toFixed(2)}*\n\n`;
        message += `*Instrucciones especiales:* \n\n`;
        message += `*Por favor confírmenme el pedido y tiempo estimado de entrega*`;
        
        const phoneNumber = '7226834501';
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
    }

    scrollToCart() {
        const cartElement = document.querySelector('.cart');
        cartElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        cartElement.style.boxShadow = '0 0 15px rgba(211, 47, 47, 0.5)';
        setTimeout(() => {
            cartElement.style.boxShadow = 'var(--shadow-sm)';
        }, 1000);
    }
}

class PizzaApp {
    constructor() {
        this.cart = new ShoppingCart();
        this.pizzaPrices = {
            'Pepperoni': { 'Grande': 140, 'Familiar': 160 },
            'Hawaiana': { 'Grande': 155, 'Familiar': 175 },
            'Margarita': { 'Grande': 155, 'Familiar': 175 },
            'Argentina': { 'Grande': 165, 'Familiar': 185 },
            'Trópico': { 'Grande': 180, 'Familiar': 200 },
            '5 Quesos': { 'Grande': 165, 'Familiar': 185 },
            'Suprema': { 'Grande': 180, 'Familiar': 200 },
            'Dashuri\'s (Pera)': { 'Grande': 155, 'Familiar': 175 }
        };
        
        this.bestSellers = ['Pepperoni', 'Hawaiana', 'Argentina'];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.animateCards();
        this.setupImageLazyLoading();
        this.setupRatingSystem();
        this.cart.loadFromLocalStorage();
        this.addBestSellerBadges();
        this.setupKeyboardNavigation();
    }

    addBestSellerBadges() {
        document.querySelectorAll('.pizza-card, .snack-card').forEach(card => {
            const name = card.querySelector('.pizza-name, .snack-name').textContent;
            if (this.bestSellers.includes(name)) {
                const badge = document.createElement('div');
                badge.className = 'badge';
                badge.textContent = 'Más vendido';
                badge.setAttribute('aria-label', 'Producto más vendido');
                card.insertBefore(badge, card.firstChild);
            }
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                this.handleAddToCart(e.target);
            }
            
            if (e.target.classList.contains('remove-item')) {
                const index = parseInt(e.target.dataset.index);
                this.cart.removeItem(index);
            }
        });

        document.getElementById('add-combination').addEventListener('click', () => {
            this.handleAddCombination();
        });

        document.getElementById('send-order').addEventListener('click', () => {
            this.cart.sendWhatsAppOrder();
        });

        document.getElementById('floatingCart').addEventListener('click', () => {
            this.cart.scrollToCart();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelector('.image-modal')?.classList.remove('active');
            }
        });
    }

    handleAddToCart(button) {
        const name = button.getAttribute('data-name');
        const size = button.getAttribute('data-size');
        const price = parseFloat(button.getAttribute('data-price'));
        
        this.cart.addItem(`${name} (${size})`, price);
    }

    handleAddCombination() {
        const firstHalf = document.getElementById('first-half').value;
        const secondHalf = document.getElementById('second-half').value;
        const size = document.getElementById('combination-size').value;
        
        const errors = this.validateCombination(firstHalf, secondHalf, size);
        if (errors.length > 0) {
            errors.forEach(error => this.cart.showNotification(`⚠️ ${error}`));
            return;
        }

        const firstPrice = this.pizzaPrices[firstHalf][size];
        const secondPrice = this.pizzaPrices[secondHalf][size];
        const price = Math.max(firstPrice, secondPrice);
        
        this.cart.addItem(`Mitad ${firstHalf} / Mitad ${secondHalf} (${size})`, price);
        
        document.getElementById('first-half').value = '';
        document.getElementById('second-half').value = '';
        document.getElementById('combination-size').value = '';
    }

    validateCombination(first, second, size) {
        const errors = [];
        if (!first) errors.push("Selecciona la primera mitad");
        if (!second) errors.push("Selecciona la segunda mitad");
        if (!size) errors.push("Selecciona el tamaño");
        if (first && second && first === second) errors.push("Selecciona pizzas diferentes");
        
        return errors;
    }

    animateCards() {
        const pizzaCards = document.querySelectorAll('.pizza-card, .snack-card');
        pizzaCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('visible');
            }, 100 * index);
        });
    }

    setupImageLazyLoading() {
        const lazyImageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    lazyImageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '200px'
        });

        document.querySelectorAll('[data-src]').forEach(img => {
            lazyImageObserver.observe(img);
        });
    }

    setupRatingSystem() {
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', (e) => {
                const value = e.target.dataset.value;
                const productName = e.target.closest('.pizza-card, .snack-card').querySelector('.pizza-name, .snack-name').textContent;
                this.cart.showNotification(`⭐ Gracias por valorar ${productName} con ${value} estrellas`);
            });
            
            star.addEventListener('mouseover', (e) => {
                const value = e.target.dataset.value;
                const stars = e.target.parentElement.querySelectorAll('.star');
                stars.forEach((s, i) => {
                    s.classList.toggle('active', i < value);
                });
            });
            
            star.addEventListener('mouseout', (e) => {
                const stars = e.target.parentElement.querySelectorAll('.star');
                stars.forEach(s => s.classList.remove('active'));
            });
        });
    }
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }).catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new PizzaApp();
});
