// ─── services/smsService.js ───────────────────────────────────────────────────
// SMS notification service for order updates (Twilio / Mock console)

/**
 * Core send SMS function
 * @param {string} toPhone 
 * @param {string} message 
 */
const sendSMS = async (toPhone, message) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone  = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && fromPhone) {
    try {
      const twilio = require('twilio')(accountSid, authToken);
      const res = await twilio.messages.create({
        body: message,
        from: fromPhone,
        to:   toPhone,
      });
      console.log(`📱 Twilio SMS sent to ${toPhone}: ${res.sid}`);
      return { success: true, sid: res.sid };
    } catch (err) {
      console.error(`❌ Twilio SMS failed to ${toPhone}:`, err.message);
    }
  }

  // Console Fallback / Simulation
  console.log('\n=================== 📱 SMS NOTIFICATION ===================');
  console.log(`TO      : ${toPhone}`);
  console.log(`MESSAGE : ${message}`);
  console.log('===========================================================\n');
  return { success: true, simulated: true };
};

/**
 * Send order confirmation SMS
 * @param {Object} order 
 * @param {Object} address 
 */
const sendOrderSMS = async (order, address) => {
  const phone = address?.phone || 'Customer Phone';
  const shortId = order._id.toString().slice(-10).toUpperCase();
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const receiptUrl = `${clientUrl}/order/${order._id}/receipt`;

  const text = `🎓 Geeta University MerchStore: Your Order #${shortId} of ₹${order.finalAmount} is confirmed! View receipt: ${receiptUrl}`;

  return sendSMS(phone, text);
};

module.exports = {
  sendSMS,
  sendOrderSMS,
};
