// storeCompleteOrder.js


(function() {
  try {
    // 1. Get RAW data from localStorage
    const rawCart = JSON.parse(localStorage.getItem('cart')) || [];
    const rawShopper = JSON.parse(localStorage.getItem('shoppers'))?.slice(-1)[0] || {};
    const rawShipping = JSON.parse(localStorage.getItem('shippingData')) || {};
    
    // 2. Transform cart items to consistent format
    const orderItems = rawCart.map((item, index) => ({
      id: `item-${Date.now()}-${index}`,
      name: item.name || `Product ${index + 1}`,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      image: item.image || item.img || 'https://via.placeholder.com/150',
      category: item.category || item.desc || 'General'
    }));
    
    // 3. Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.06;
    const shippingCost = Number(rawShipping.shipping) || 0;
    const total = subtotal + tax + shippingCost;
    
    // 4. Build the COMPLETE order object
    const completeOrder = {
      id: `SCV-${Date.now().toString().slice(-8)}`,
      date: new Date().toISOString(),
      customer: {
        ...rawShopper,
        email: rawShipping.address?.email || rawShopper.email
      },
      items: orderItems,
      shipping: {
        ...rawShipping,
        cost: shippingCost
      },
      payment: {
        method: 'credit', // Default
        lastFour: '****' // Default
      },
      totals: {
        subtotal,
        tax,
        shipping: shippingCost,
        total
      }
    };
    
    // 5. Save to localStorage in MULTIPLE formats for compatibility
    localStorage.setItem('completeOrderData', JSON.stringify(completeOrder));
    localStorage.setItem('currentOrder', JSON.stringify(completeOrder));
    
    // 6. Add to order history
    const history = JSON.parse(localStorage.getItem('orderHistory')) || [];
    history.unshift(completeOrder);
    localStorage.setItem('orderHistory', JSON.stringify(history.slice(0, 50))); // Keep last 50 orders
    
    console.log('✅ Order saved successfully!', completeOrder);
  } catch (error) {
    console.error('❌ Failed to save order:', error);
    // Emergency backup of cart
    localStorage.setItem('lastCartBackup', localStorage.getItem('cart'));
  }
})();
