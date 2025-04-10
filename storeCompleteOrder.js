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

    // Store into localStorage
    localStorage.setItem("completeOrderData", JSON.stringify(completeOrderData));

    console.log("✅ completeOrderData saved to localStorage:");
    console.log(completeOrderData);
  } catch (error) {
    console.error("❌ Failed to store completeOrderData:", error);
  }
})();
