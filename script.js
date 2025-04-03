document.addEventListener("DOMContentLoaded", () => {
   const form = document.querySelector("form");

   form.addEventListener("submit", (event) => {
      event.preventDefault();

      const email = document.getElementById("email").value.trim();
      const name = document.getElementById("Name").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const age = parseInt(document.getElementById("age").value);
      const address = document.getElementById("address").value.trim();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
         alert("Please enter a valid email address.");
         return;
      }

      if (name.length < 2) {
         alert("Please enter a valid name.");
         return;
      }

      if (isNaN(age) || age <= 0) {
         alert("Please enter a valid age.");
         return;
      }

      if (address === "") {
         alert("Please enter your address.");
         return;
      }

      const shopper = {
         email,
         name,
         phone: phone || null,
         age,
         address
      };

      let shoppers = localStorage.getItem("shoppers");
      shoppers = shoppers ? JSON.parse(shoppers) : [];
      shoppers.push(shopper);
      localStorage.setItem("shoppers", JSON.stringify(shoppers));

      showThankYou(event);
   });
});

document.getElementById('productForm').addEventListener('submit', function (event) {
   event.preventDefault();

   const productName = document.getElementById('productName').value;
   const productPrice = parseFloat(document.getElementById('productPrice').value);
   const productStock = parseInt(document.getElementById('productStock').value);
   const productDescription = document.getElementById('productDescription').value;
   const productCategory = document.getElementById('productCategory').value;
   const productImageUrl = document.getElementById('productImageUrl').value;
   const currentDate = new Date().toISOString().split('T')[0];

   if (!validateProductName(productName)) {
      alert("Product name is required and should not exceed 100 characters.");
      return;
   }
   if (!validatePrice(productPrice)) {
      alert("Price must be a valid positive number.");
      return;
   }
   if (!validateStock(productStock)) {
      alert("Stock must be a valid integer and cannot be negative.");
      return;
   }

   const productDocument = {
      product_id: generateProductId(),
      name: productName,
      price: productPrice,
      stock: productStock,
      description: productDescription,
      category: productCategory,
      image_url: productImageUrl,
      date_added: currentDate,
      last_updated: currentDate
   };

   console.log("Product Document:", JSON.stringify(productDocument));
});

function validateProductName(name) {
   return name.length > 0 && name.length <= 100;
}

function validatePrice(price) {
   return !isNaN(price) && price > 0;
}

function validateStock(stock) {
   return Number.isInteger(stock) && stock >= 0;
}

function generateProductId() {
   return 'prod-' + Math.floor(Math.random() * 1000000);
}


// cart.js

const API_URL = "https://bkkrrhvcorrj-html.na.app.codingrooms.com/cart.html"; // Replace with your actual API endpoint
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Ensure the DOM is fully loaded before updating the cart
document.addEventListener("DOMContentLoaded", function () {
   updateCart();
});


function updateCart() {
   const cartContainer = document.getElementById("cartItems");
   let total = 0;
   cartContainer.innerHTML = "";

   if (cart.length === 0) {
      cartContainer.innerHTML = "<p>Your cart is empty.</p>";
      document.getElementById("cartTotal").innerText = "0.00";
      return;
   }

   cart.forEach((item, index) => {
      const quantity = item.quantity || 1;
      const itemTotal = item.price * quantity;
      total += itemTotal;

      cartContainer.innerHTML += `
         <div class="cart-item" data-price="${item.price}">
            <img src="${item.img}" alt="${item.name}">
            <div class="cart-item-details">
               <p><strong>${item.name}</strong></p>
               <p>Unit Price: $${item.price.toFixed(2)}</p>
               <p>Item Total: $<span id="itemTotal-${index}">${itemTotal.toFixed(2)}</span></p>
               <input type="number" min="1" value="${quantity}" onchange="updateQuantity(${index}, this.value)">
               <button class="btn btn-sm btn-danger mt-1" onclick="removeFromCart(${index})">Remove</button>
            </div>
         </div>`;
   });

   document.getElementById("cartTotal").innerText = total.toFixed(2);
}


function updateQuantity(index, quantity) {
   quantity = Math.max(1, parseInt(quantity));
   cart[index].quantity = quantity;
   localStorage.setItem("cart", JSON.stringify(cart));


   const itemTotal = cart[index].price * quantity;
   const itemTotalElement = document.getElementById(`itemTotal-${index}`);
   if (itemTotalElement) {
      itemTotalElement.innerText = itemTotal.toFixed(2);
   }

   // Recalculate overall cart total
   updateCart();
}

// Remove an item from the cart
function removeFromCart(index) {
   cart.splice(index, 1);
   localStorage.setItem("cart", JSON.stringify(cart));
   updateCart();
}

// Clear the entire cart
function clearCart() {
   localStorage.removeItem("cart");
   cart = [];
   updateCart();
}


function prepareCartPayload() {
   const user = JSON.parse(localStorage.getItem("shoppers"))?.slice(-1)[0] || {
      email: "guest@example.com",
      name: "Guest",
      age: 0,
      phone: null,
      address: "Unknown"
   };

   const totalPrice = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

   return {
      user,
      cartItems: cart.map(item => ({
         name: item.name,
         price: item.price,
         quantity: item.quantity || 1,
         image: item.img
      })),
      totalPrice
   };
}


function submitOrder() {
   if (cart.length === 0) {
      alert("Your cart is empty. Please add items before checking out.");
      return;
   }

   const payload = prepareCartPayload();

   $.ajax({
      url: API_URL,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
      success: function (response) {
         alert("Order submitted successfully!");
         localStorage.removeItem("cart");
         cart = [];
         updateCart();
         console.log("Server Response:", response);
      },
      error: function (xhr, status, error) {
         alert("Order submission failed. Try again later.");
         console.error("Error:", xhr.responseText);
      }
   });
}


// shipping.js

// Global variables to track selections and cart subtotal
let currentShippingMethod = null;
let currentShippingCarrier = null;
let cartSubtotal = 0;


function selectShippingMethod(method) {
   // Remove highlight from  "Shipping Method" section
   document.querySelectorAll('.shipping-option').forEach(option => {
      const sectionHeader = option.closest('.form-section')?.querySelector('h3');
      if (sectionHeader && sectionHeader.textContent.trim() === 'Shipping Method') {
         option.classList.remove('selected');
      }
   });

   // Highlight the clicked option 
   if (window.event && window.event.currentTarget) {
      window.event.currentTarget.classList.add('selected');
   }
   currentShippingMethod = method;


   updateShippingCost();
}


function selectShippingCarrier(carrier) {
   // Remove highlight "Shipping Carrier" section
   document.querySelectorAll('.shipping-option').forEach(option => {
      const sectionHeader = option.closest('.form-section')?.querySelector('h3');
      if (sectionHeader && sectionHeader.textContent.trim() === 'Shipping Carrier') {
         option.classList.remove('selected');
      }
   });

   // Highlight the clicked option 
   if (window.event && window.event.currentTarget) {
      window.event.currentTarget.classList.add('selected');
   }
   currentShippingCarrier = carrier;
}


function updateShippingCost() {
   let shippingCost = 0;
   if (currentShippingMethod === 'standard') shippingCost = 5.99;
   else if (currentShippingMethod === 'express') shippingCost = 12.99;
   else if (currentShippingMethod === 'overnight') shippingCost = 24.99;

   document.getElementById('shippingCost').textContent = `$${shippingCost.toFixed(2)}`;
   updateOrderTotal();
}


function calculateTax(subtotal) {
   return subtotal * 0.06;
}


function updateOrderTotal() {
   const subtotal = parseFloat(document.getElementById('subtotal').textContent.replace('$', ''));
   const shipping = parseFloat(document.getElementById('shippingCost').textContent.replace('$', ''));
   const tax = calculateTax(subtotal);

   document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;

   const total = subtotal + tax + shipping;
   document.getElementById('orderTotal').textContent = `$${total.toFixed(2)}`;
}


function proceedToPayment() {
   // Validate the form fields 
   const form = document.getElementById('shippingForm');
   if (!form.checkValidity()) {
      alert('Please fill out all required shipping information.');
      return;
   }

   // Ensure that both a shipping method 
   if (!currentShippingMethod || !currentShippingCarrier) {
      alert('Please select both a shipping method and carrier');
      return;
   }

   // Collect the shipping information 
   const shippingData = {
      address: {
         firstName: document.getElementById('firstName').value,
         lastName: document.getElementById('lastName').value,
         address: document.getElementById('address').value,
         city: document.getElementById('city').value,
         state: document.getElementById('state').value,
         zipCode: document.getElementById('zipCode').value,
         email: document.getElementById('email').value,
         saveAddress: document.getElementById('saveAddress').checked
      },
      method: currentShippingMethod,
      carrier: currentShippingCarrier,
      subtotal: cartSubtotal,
      tax: calculateTax(cartSubtotal),
      shipping: parseFloat(document.getElementById('shippingCost').textContent.replace('$', '')),
      total: parseFloat(document.getElementById('orderTotal').textContent.replace('$', ''))
   };

   // Save shipping data to localStorage 
   localStorage.setItem('shippingData', JSON.stringify(shippingData));
   window.location.href = 'payment.html';
}

