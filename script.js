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

const API_URL = "https://anicotra.github.io/Scent-Vault/cart.html"; // Replace with your actual API endpoint
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



(function() {
  // --- Utility Validation Functions ---

  // Validate email address format.
  function validateEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Validate credit card number (simple 16-digit check after removing spaces).
  function validateCreditCardNumber(number) {
    number = number.replace(/\s+/g, '');
    var re = /^\d{16}$/;
    return re.test(number);
  }

  // Validate expiration date in MM/YY format and ensure it is in the future.
  function validateExpiry(expiry) {
    // Check format MM/YY
    var re = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!re.test(expiry)) {
      return false;
    }
    var parts = expiry.split('/');
    var month = parseInt(parts[0], 10);
    var year = parseInt(parts[1], 10) + 2000; // Assumes 20XX
    // Set expiry to the first day of the following month
    var expiryDate = new Date(year, month);
    var now = new Date();
    return expiryDate > now;
  }

  // Validate CVV (3 or 4 digits).
  function validateCVV(cvv) {
    var re = /^\d{3,4}$/;
    return re.test(cvv);
  }

  // --- Verifier Functions ---

  // Verifier for Payment page forms.
  function verifyPaymentForm() {
    // Get billing address fields
    var billingFirstName = document.getElementById('billingFirstName');
    var billingLastName  = document.getElementById('billingLastName');
    var billingAddress   = document.getElementById('billingAddress');
    var billingCity      = document.getElementById('billingCity');
    var billingState     = document.getElementById('billingState');
    var billingZip       = document.getElementById('billingZip');
    // Get credit card fields (if present)
    var cardNumber       = document.getElementById('cardNumber');
    var cardExpiry       = document.getElementById('cardExpiry');
    var cardCvv          = document.getElementById('cardCvv');

    // Verify billing information exists and is not empty.
    if (billingFirstName && billingLastName && billingAddress &&
        billingCity && billingState && billingZip) {
      if (
        billingFirstName.value.trim() === '' ||
        billingLastName.value.trim()  === '' ||
        billingAddress.value.trim()   === '' ||
        billingCity.value.trim()      === '' ||
        billingState.value.trim()     === '' ||
        billingZip.value.trim()       === ''
      ) {
        alert('Please fill out all required billing information.');
        return false;
      }
    }

    // Verify credit card details if the card fields exist.
    if (cardNumber && cardExpiry && cardCvv) {
      if (!validateCreditCardNumber(cardNumber.value)) {
        alert('Invalid credit card number. Please enter a 16-digit number.');
        return false;
      }
      if (!validateExpiry(cardExpiry.value)) {
        alert('Invalid expiry date. Please enter in MM/YY format and ensure the card is not expired.');
        return false;
      }
      if (!validateCVV(cardCvv.value)) {
        alert('Invalid CVV. Please enter a 3 or 4 digit code.');
        return false;
      }
    }
    return true;
  }

  // Verifier for Confirmation page data.
  function verifyConfirmationData() {
    var shippingData = localStorage.getItem('shippingData');
    var paymentData  = localStorage.getItem('paymentData');

    if (!shippingData) {
      console.error('Missing shipping data in localStorage.');
      return false;
    }
    if (!paymentData) {
      console.error('Missing payment data in localStorage.');
      return false;
    }
    // Optionally, you can add further checks for order items, totals, etc.
    return true;
  }

  // Verifier for Returns page form.
  function verifyReturnRequest() {
    // Verify that either email or order number is provided.
    var orderEmail  = document.getElementById('orderEmail');
    var orderNumber = document.getElementById('orderNumber');

    if (orderEmail && orderNumber) {
      if (orderEmail.value.trim() === '' && orderNumber.value.trim() === '') {
        alert('Please enter either your email address or order number.');
        return false;
      }
      if (orderEmail.value.trim() !== '' && !validateEmail(orderEmail.value.trim())) {
        alert('Please enter a valid email address.');
        return false;
      }
    }

    // Verify that a return reason is selected.
    // (Assumes a hidden input with id "returnReason" is updated when a reason is chosen.)
    var returnReason = document.getElementById('returnReason');
    if (returnReason) {
      if (returnReason.value.trim() === '') {
        alert('Please select a return reason.');
        return false;
      }
      // If reason is "other", ensure details are provided.
      if (returnReason.value.trim() === 'other') {
        var returnDetails = document.getElementById('returnDetails');
        if (returnDetails && returnDetails.value.trim() === '') {
          alert('Please provide details for the return.');
          return false;
        }
      }
    }

    // Verify that at least one item is selected for return.
    
    var checkboxes = document.querySelectorAll('.return-item-checkbox');
    var itemSelected = false;
    checkboxes.forEach(function(checkbox) {
      if (checkbox.checked) {
        itemSelected = true;
      }
    });
    if (!itemSelected) {
      alert('Please select at least one item to return.');
      return false;
    }

    return true;
  }

  // --- Expose the verifiers to the Global Scope ---
  window.JSVerifiers = {
    // Utility functions
    validateEmail: validateEmail,
    validateCreditCardNumber: validateCreditCardNumber,
    validateExpiry: validateExpiry,
    validateCVV: validateCVV,
    // Page verifiers
    verifyPaymentForm: verifyPaymentForm,
    verifyConfirmationData: verifyConfirmationData,
    verifyReturnRequest: verifyReturnRequest
  };
})();
