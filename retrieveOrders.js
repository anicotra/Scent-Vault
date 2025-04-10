// retrieveOrders.js

/**
 * Retrieve all orders (newest first)
 */
export function getAllOrders() {
  try {
    const orders = JSON.parse(localStorage.getItem("orderHistory")) || [];
    return orders.reverse(); // Reverse to show newest first
  } catch (error) {
    console.error("Failed to retrieve orders:", error);
    return [];
  }
}

/**
 * Find specific order by confirmation number
 */
export function getOrderByConfirmation(confNum) {
  const orders = getAllOrders();
  return orders.find(order => order.order.confirmationNumber === confNum) || null;
}

/**
 * Get the latest single order
 */
export function getLatestOrder() {
  try {
    return JSON.parse(localStorage.getItem("completeOrderData")) || null;
  } catch (error) {
    console.error("Failed to retrieve latest order:", error);
    return null;
  }
}

/**
 * Get orders filtered by status (if status tracking exists)
 */
export function getOrdersByStatus(status) {
  const orders = getAllOrders();
  return orders.filter(order => order.order.status === status);
}
