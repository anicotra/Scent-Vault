// storeCompleteOrder.js

(function () {
  
  try {
    // Load individual pieces from localStorage
    const shopper = JSON.parse(localStorage.getItem("shoppers"))?.slice(-1)[0] || {};
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const shipping = JSON.parse(localStorage.getItem("shippingData")) || {};
    const paymentData = JSON.parse(localStorage.getItem("paymentData")) || {};
    const currentOrder = JSON.parse(localStorage.getItem("currentOrder")) || {};
    const returns = JSON.parse(localStorage.getItem("processedReturns")) || [];

    // Build the final object
    const completeOrderData = {
      shopper,
      cart,
      shipping,
      billing: {
        address: currentOrder.billing?.address || {},
        payment: {
          method: currentOrder.billing?.payment?.method || paymentData.method || "unknown",
          cardLastFour: currentOrder.billing?.payment?.lastFour || (paymentData.cardNumber ? paymentData.cardNumber.slice(-4) : "****")
        }
      },
      order: {
        confirmationNumber: currentOrder.confirmation || "SCV-" + Date.now().toString().slice(-8),
        date: currentOrder.date || new Date().toISOString(),
        subtotal: currentOrder.subtotal || 0,
        tax: currentOrder.tax || 0,
        shippingCost: currentOrder.shippingCost || shipping.shipping || 0,
        total: currentOrder.total || 0
      },
      returns
    };

    // Get existing orders or create empty array
    const orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];
    
    // Add new order to history
    orderHistory.push(completeOrderData);
    
    // Store updated history
    localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
    
    // Also keep the most recent order available separately
    localStorage.setItem("completeOrderData", JSON.stringify(completeOrderData));

    console.log("✅ Order added to history. Total orders:", orderHistory.length);
    console.log("Most recent order:", completeOrderData);
  } catch (error) {
    console.error("❌ Failed to store order data:", error);
  }
})();
