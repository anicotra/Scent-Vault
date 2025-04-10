// storeCompleteOrder.js

(function () {
  try {
    // Load all relevant data from localStorage
    const shopper = JSON.parse(localStorage.getItem("shoppers"))?.slice(-1)[0] || {};
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const shipping = JSON.parse(localStorage.getItem("shippingData")) || {};
    const paymentData = JSON.parse(localStorage.getItem("paymentData")) || {};
    const currentOrder = JSON.parse(localStorage.getItem("currentOrder")) || {};
    const returns = JSON.parse(localStorage.getItem("processedReturns")) || [];

    // Calculate totals if not already in currentOrder
    const subtotal = currentOrder.subtotal || cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const tax = currentOrder.tax || subtotal * 0.06; // 6% tax
    const shippingCost = currentOrder.shippingCost || shipping.shipping || 0;
    const total = currentOrder.total || subtotal + tax + shippingCost;

    // Enhanced order data with complete item details
    const completeOrderData = {
      shopper: {
        ...shopper,
        email: shipping.address?.email || shopper.email // Ensure email is captured
      },
      items: cart.map(item => ({
        productId: item.name.replace(/\s+/g, '-').toLowerCase() + '-' + Math.random().toString(36).substr(2, 5),
        name: item.name,
        description: item.desc || '',
        category: item.category || '',
        price: item.price,
        quantity: item.quantity || 1,
        image: item.image || item.img || 'https://via.placeholder.com/150'
      })),
      shipping: {
        ...shipping,
        address: shipping.address || currentOrder.billing?.address || {}
      },
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
        subtotal: subtotal,
        tax: tax,
        shippingCost: shippingCost,
        total: total
      },
      returns
    };

    // Get existing order history or initialize
    const orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];
    
    // Add new order to history (prepend so newest appears first)
    orderHistory.unshift(completeOrderData);
    
    // Keep only the last 50 orders to prevent localStorage overflow
    const trimmedHistory = orderHistory.slice(0, 50);
    
    // Update localStorage
    localStorage.setItem("orderHistory", JSON.stringify(trimmedHistory));
    localStorage.setItem("completeOrderData", JSON.stringify(completeOrderData));
    localStorage.setItem("currentOrder", JSON.stringify(completeOrderData)); // For backward compatibility

    console.log("✅ Order successfully saved. History now contains:", trimmedHistory.length, "orders");
    console.log("Latest order details:", completeOrderData);
  } catch (error) {
    console.error("❌ Error saving order data:", error);
    
    // Fallback: At least save the cart data
    try {
      localStorage.setItem("orderBackup_" + Date.now(), JSON.stringify({
        cart: JSON.parse(localStorage.getItem("cart")),
        timestamp: new Date().toISOString()
      }));
    } catch (e) {
      console.error("Couldn't even save backup:", e);
    }
  }
})();
