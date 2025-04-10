document.addEventListener('DOMContentLoaded', function() {
    const cart = [];
    const cartItemsElement = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const addCombinationButton = document.getElementById('add-combination');
    const sendOrderButton = document.getElementById('send-order');
    const floatingCart = document.getElementById('floatingCart');
    const cartCount = document.getElementById('cartCount');
    
    // Mapa de precios para las pizzas
    const pizzaPrices = {
        'Pepperoni': { 'Grande': 140, 'Familiar': 160 },
        'Hawaiana': { 'Grande': 155, 'Familiar': 175 },
        'Margarita': { 'Grande': 155, 'Familiar': 175 },
        'Argentina': { 'Grande': 165, 'Familiar': 185 },
        'Trópico': { 'Grande': 180, 'Familiar': 200 },
        '5 Quesos': { 'Grande': 165, 'Familiar': 185 },
        'Suprema': { 'Grande': 180, 'Familiar': 200 },
        'Dashuri\'s (Pera)': { 'Grande': 155, 'Familiar': 175 }
    };
    
    // Animación de aparición de las pizzas y snacks
    const pizzaCards = document.querySelectorAll('.pizza-card, .snack-card');
    pizzaCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('visible');
        }, 100 * index);
    });
    
    // Cargador de imágenes
    document.querySelectorAll('.pizza-image, .snack-image').forEach(img => {
        img.onload = function() {
            this.classList.add('loaded');
        };
        if (img.complete) img.onload();
    });
    
    // Sistema de valoraciones
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', function() {
            const value = this.dataset.value;
            const productName = this.closest('.pizza-card, .snack-card').querySelector('.pizza-name, .snack-name').textContent;
            alert(`¡Gracias por valorar ${productName} con ${value} estrellas!`);
            
            // Aquí podrías enviar esta información a tu backend
            // Ejemplo: saveRating(productName, value);
        });
        
        star.addEventListener('mouseover', function() {
            const value = this.dataset.value;
            const stars = this.parentElement.querySelectorAll('.star');
            stars.forEach((s, i) => {
                s.classList.toggle('active', i < value);
            });
        });
        
        star.addEventListener('mouseout', function() {
            const stars = this.parentElement.querySelectorAll('.star');
            stars.forEach(s => s.classList.remove('active'));
        });
    });
    
    // Añadir productos al carrito
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const name = this.getAttribute('data-name');
            const size = this.getAttribute('data-size');
            const price = parseFloat(this.getAttribute('data-price'));
            
            addToCart(`${name} (${size})`, price);
        });
    });
    
    // Añadir combinaciones mitad y mitad al carrito
    addCombinationButton.addEventListener('click', function() {
        const firstHalf = document.getElementById('first-half').value;
        const secondHalf = document.getElementById('second-half').value;
        const size = document.getElementById('combination-size').value;
        
        if (!firstHalf || !secondHalf || !size) {
            alert('Por favor selecciona ambas mitades y el tamaño');
            return;
        }
        
        if (firstHalf === secondHalf) {
            alert('Por favor selecciona dos pizzas diferentes para la combinación');
            return;
        }
        
        // Obtener precios de ambas pizzas
        const firstPrice = pizzaPrices[firstHalf][size];
        const secondPrice = pizzaPrices[secondHalf][size];
        
        // El precio es el mayor de los dos
        const price = Math.max(firstPrice, secondPrice);
        
        addToCart(`Mitad ${firstHalf} / Mitad ${secondHalf} (${size})`, price);
        
        // Limpiar selección
        document.getElementById('first-half').value = '';
        document.getElementById('second-half').value = '';
        document.getElementById('combination-size').value = '';
    });
    
    // Función para añadir items al carrito
    function addToCart(name, price) {
        cart.push({
            name: name,
            price: price
        });
        
        updateCart();
        updateCartCount();
        
        // Notificación
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = `✅ ${name} añadido al carrito`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Actualizar el carrito
    function updateCart() {
        if (cart.length === 0) {
            cartItemsElement.innerHTML = '<div class="empty-cart">Tu carrito está vacío</div>';
            cartTotalElement.style.display = 'none';
            return;
        }
        
        cartItemsElement.innerHTML = '';
        let total = 0;
        
        cart.forEach((item, index) => {
            total += item.price;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <button class="remove-item" data-index="${index}">X</button>
            `;
            
            cartItemsElement.appendChild(itemElement);
        });
        
        // Agregar eventos a los botones de eliminar
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                removeFromCart(index);
            });
        });
        
        cartTotalElement.textContent = `Total: $${total.toFixed(2)}`;
        cartTotalElement.style.display = 'block';
    }
    
    // Función para eliminar items del carrito
    function removeFromCart(index) {
        const removedItem = cart.splice(index, 1)[0];
        updateCart();
        updateCartCount();
        
        // Notificación
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = `🗑️ ${removedItem.name} eliminado`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Función para actualizar el contador del carrito
    function updateCartCount() {
        cartCount.textContent = cart.length;
        
        // Animación cuando se añade un producto
        if (parseInt(cartCount.textContent) > 0) {
            cartCount.style.transform = 'scale(1.2)';
            setTimeout(() => {
                cartCount.style.transform = 'scale(1)';
            }, 300);
        }
    }
    
    // Evento para mostrar/ocultar el carrito al hacer clic en el icono
    floatingCart.addEventListener('click', function() {
        const cartElement = document.querySelector('.cart');
        const cartRect = cartElement.getBoundingClientRect();
        
        // Desplazamiento suave hasta el carrito
        window.scrollTo({
            top: cartRect.top + window.scrollY - 20,
            behavior: 'smooth'
        });
        
        // Efecto visual de atención
        cartElement.style.boxShadow = '0 0 15px rgba(211, 47, 47, 0.5)';
        setTimeout(() => {
            cartElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        }, 1000);
    });
    
    // Enviar pedido por WhatsApp
    sendOrderButton.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }
        
        sendWhatsAppMessage();
    });
    
    // Enviar mensaje por WhatsApp
    function sendWhatsAppMessage() {
        let message = `¡Hola Dashuri's Pizza! Quiero hacer un pedido:\n\n*Detalles del cliente*\nNombre: \nTeléfono: \nDirección: \n\n*Mi pedido*\n`;
        
        cart.forEach(item => {
            message += `- ${item.name}: $${item.price.toFixed(2)}\n`;
        });
        
        message += `\n*Total: $${calculateTotal().toFixed(2)}*\n\n`;
        message += `*Instrucciones especiales:* \n\n`;
        message += `*Por favor confírmenme el pedido y tiempo estimado de entrega*`;
        
        const phoneNumber = '7226834501';
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
    }
    
    // Calcular total
    function calculateTotal() {
        return cart.reduce((sum, item) => sum + item.price, 0);
    }
});