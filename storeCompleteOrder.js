// storeCompleteOrder.js
(function() {
  try {
    // 1. Load all data pieces (unchanged)
    const shopper = JSON.parse(localStorage.getItem("shoppers"))?.slice(-1)[0] || {};
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const shipping = JSON.parse(localStorage.getItem("shippingData")) || {};
    const paymentData = JSON.parse(localStorage.getItem("paymentData")) || {};
    const currentOrder = JSON.parse(localStorage.getItem("currentOrder")) || {};
    const returns = JSON.parse(localStorage.getItem("processedReturns")) || [];

    // 2. Build the complete order object (unchanged)
    const completeOrderData = {
      shopper,
      cart,
      shipping,
      billing: {
        address: currentOrder.billing?.address || {},
        payment: {
          method: currentOrder.billing?.payment?.method || paymentData.method || "unknown",
          cardLastFour: currentOrder.billing?.payment?.lastFour || 
                       (paymentData.cardNumber ? paymentData.cardNumber.slice(-4) : "****")
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

    // 3. FIXED: PROPERLY HANDLE ORDER HISTORY
    const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");
    
    // Validate existing history is an array
    if (!Array.isArray(orderHistory)) {
      console.warn("Corrupted orderHistory - resetting");
      localStorage.removeItem("orderHistory");
      orderHistory = [];
    }

    // Add new order
    orderHistory.push(completeOrderData);

    // 4. Save with proper indentation for DevTools readability
    localStorage.setItem("orderHistory", JSON.stringify(orderHistory, null, 2)); // 2-space indent
    localStorage.setItem("completeOrderData", JSON.stringify(completeOrderData, null, 2));

    console.log("✅ Order saved. Full history:", orderHistory);
  } catch (error) {
    console.error("❌ Order save failed:", error);
  }
})();
