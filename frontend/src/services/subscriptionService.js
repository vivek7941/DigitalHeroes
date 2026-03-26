import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users'; // Adjust based on your server.js

export const subscriptionService = {
  /**
   * PRD Section 03 & 04: Check if user can enter a draw
   * Only 'active' status is allowed to post scores.
   */
  canUserParticipate: (user) => {
    return user && user.subscriptionStatus === 'active';
  },

  /**
   * PRD Section 12: Cancel Subscription
   * Moves status to 'canceled' - user stays active until the end of the month
   */
  cancelSubscription: async (userId) => {
    try {
      const response = await axios.post(`${API_URL}/cancel`, { userId });
      // Update local storage to reflect changes immediately
      const user = JSON.parse(localStorage.getItem("user"));
      user.subscriptionStatus = 'canceled';
      localStorage.setItem("user", JSON.stringify(user));
      return response.data;
    } catch (error) {
      console.error("Cancellation failed", error);
      throw error;
    }
  },

  /**
   * PRD Section 03: Renew/Upgrade
   * Yearly plans get the 2-month discount as per PRD
   */
  getPlanDetails: (planType) => {
    const plans = {
      monthly: { price: 10, billing: 'Monthly', impact: '10% Min' },
      yearly: { price: 100, billing: 'Yearly', discount: '2 Months Free', impact: '10% Min' }
    };
    return plans[planType];
  }
};