export const downloadReceipt = (order) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download the receipt.');
    return;
  }
  
  const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee;">
        <div style="font-weight: 600; color: #1a1a1a;">${item.name}</div>
        <div style="font-size: 11px; color: #666; margin-top: 2px;">Size: ${item.size}</div>
      </td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price?.toLocaleString('en-IN')}.00</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">₹${(item.price * item.qty)?.toLocaleString('en-IN')}.00</td>
    </tr>
  `).join('');

  const shippingHtml = order.shippingAddress 
    ? `
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 11px; text-transform: uppercase; color: #999; margin-bottom: 8px; letter-spacing: 1px;">Delivery Address</h3>
        <p style="font-weight: 600; margin: 0; color: #1a1a1a;">${order.shippingAddress.fullName || ''}</p>
        <p style="margin: 4px 0 0 0; color: #444; line-height: 1.4;">
          ${order.shippingAddress.street || ''}<br>
          ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} - ${order.shippingAddress.pincode || ''}<br>
          Phone: ${order.shippingAddress.phone || ''}
        </p>
      </div>
    `
    : `
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 11px; text-transform: uppercase; color: #999; margin-bottom: 8px; letter-spacing: 1px;">Collection Point</h3>
        <p style="font-weight: 600; margin: 0; color: #1a1a1a;">Geeta University Store Counter</p>
        <p style="margin: 4px 0 0 0; color: #444; line-height: 1.4;">
          Block A Administrative Office<br>
          Geeta University Campus, Panipat, Haryana
        </p>
      </div>
    `;

  const deliveryFee = order.totalAmount - order.subtotal + (order.discount || 0);

  const receiptHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt - Order #${order._id}</title>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 40px;
            color: #333;
            background-color: #fff;
          }
          .receipt-container {
            max-w: 680px;
            margin: 0 auto;
            border: 1px solid #e5e5e5;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #f5f5f5;
            padding-bottom: 24px;
            margin-bottom: 30px;
          }
          .logo-text {
            color: #7A1C1C;
            font-weight: 800;
            font-size: 20px;
            letter-spacing: -0.5px;
            margin: 0;
            text-transform: uppercase;
          }
          .logo-subtext {
            font-size: 11px;
            color: #d4af37;
            font-weight: 600;
            margin: 2px 0 0 0;
            letter-spacing: 1px;
          }
          .invoice-title {
            font-size: 24px;
            font-weight: 800;
            color: #1a1a1a;
            margin: 0;
            text-align: right;
          }
          .order-id {
            font-size: 12px;
            color: #666;
            margin-top: 4px;
            font-family: monospace;
          }
          .meta-grid {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 40px;
            margin-bottom: 30px;
          }
          .meta-item h3 {
            font-size: 11px;
            text-transform: uppercase;
            color: #999;
            margin-bottom: 8px;
            letter-spacing: 1px;
          }
          .meta-item p {
            font-weight: 600;
            margin: 0;
            color: #1a1a1a;
            font-size: 13px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .items-table th {
            text-align: left;
            padding: 10px 8px;
            border-bottom: 2px solid #1a1a1a;
            font-size: 11px;
            text-transform: uppercase;
            color: #999;
            letter-spacing: 0.5px;
          }
          .summary-container {
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
          }
          .summary-table {
            width: 280px;
            border-collapse: collapse;
          }
          .summary-table td {
            padding: 8px 0;
            font-size: 13px;
            color: #555;
          }
          .summary-table .total-row td {
            border-top: 2px solid #7A1C1C;
            padding-top: 14px;
            font-weight: 800;
            font-size: 18px;
            color: #7A1C1C;
          }
          .footer {
            margin-top: 50px;
            border-top: 1px dashed #e5e5e5;
            padding-top: 20px;
            text-align: center;
            font-size: 11px;
            color: #999;
          }
          .print-btn {
            background-color: #7A1C1C;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 13px;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            margin-bottom: 20px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }
          .print-btn:hover {
            background-color: #611414;
          }
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              padding: 0;
            }
            .receipt-container {
              border: none;
              box-shadow: none;
              padding: 0;
              max-w: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div style="max-w: 680px; margin: 0 auto; text-align: right;" class="no-print">
          <button class="print-btn" onclick="window.print()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Print / Save as PDF
          </button>
        </div>
        <div class="receipt-container">
          <div class="header">
            <div>
              <h1 class="logo-text">Geeta University</h1>
              <p class="logo-subtext">Merchandise Store</p>
            </div>
            <div>
              <h2 class="invoice-title">OFFICIAL RECEIPT</h2>
              <div class="order-id">ID: ${order._id}</div>
            </div>
          </div>

          <div class="meta-grid">
            <div>
              <div style="margin-bottom: 24px;">
                <h3 style="font-size: 11px; text-transform: uppercase; color: #999; margin-bottom: 8px; letter-spacing: 1px;">Order Date</h3>
                <p>${dateStr}</p>
              </div>
              ${shippingHtml}
            </div>
            <div>
              <div style="margin-bottom: 24px;">
                <h3 style="font-size: 11px; text-transform: uppercase; color: #999; margin-bottom: 8px; letter-spacing: 1px;">Payment Method</h3>
                <p style="text-transform: uppercase;">${order.paymentMethod === 'stripe' ? 'Credit Card / Stripe' : order.paymentMethod}</p>
              </div>
              <div style="margin-bottom: 24px;">
                <h3 style="font-size: 11px; text-transform: uppercase; color: #999; margin-bottom: 8px; letter-spacing: 1px;">Payment Status</h3>
                <p style="text-transform: uppercase; color: ${order.paymentStatus === 'paid' ? '#15803d' : '#854d0e'};">${order.paymentStatus || 'Pending'}</p>
              </div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 55%">Item Description</th>
                <th style="width: 10%; text-align: center;">Qty</th>
                <th style="width: 15%; text-align: right;">Unit Price</th>
                <th style="width: 20%; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="summary-container">
            <table class="summary-table">
              <tr>
                <td>Subtotal</td>
                <td style="text-align: right; font-weight: 600;">₹${order.subtotal?.toLocaleString('en-IN')}.00</td>
              </tr>
              <tr>
                <td>Delivery Fee</td>
                <td style="text-align: right; font-weight: 600;">${deliveryFee === 0 ? 'Free' : '₹' + deliveryFee + '.00'}</td>
              </tr>
              ${order.discount > 0 ? `
              <tr style="color: #15803d; font-weight: 600;">
                <td>Coupon Discount</td>
                <td style="text-align: right;">- ₹${order.discount?.toLocaleString('en-IN')}.00</td>
              </tr>
              ` : ''}
              <tr class="total-row">
                <td>Total Paid</td>
                <td style="text-align: right;">₹${order.totalAmount?.toLocaleString('en-IN')}.00</td>
              </tr>
            </table>
          </div>

          <div class="footer">
            <p style="font-weight: 600; color: #1a1a1a; margin-bottom: 4px;">Thank you for your purchase!</p>
            <p style="margin: 0;">Geeta University Merchandise Store, Panipat, Haryana</p>
            <p style="margin: 4px 0 0 0; font-size: 9px; color: #bbb;">This is a computer-generated document and does not require a physical signature.</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(receiptHtml);
  printWindow.document.close();
};
