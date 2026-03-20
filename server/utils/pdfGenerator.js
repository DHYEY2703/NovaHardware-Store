const PDFDocument = require('pdfkit');

const generateInvoicePDF = (order, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Headers
      doc.fillColor('#0f172a').fontSize(24).text('NOVAHARDWARE', { align: 'center' });
      doc.fillColor('#06b6d4').fontSize(10).text('OFFICIAL AUTOMATED INVOICE', { align: 'center', characterSpacing: 2 });
      doc.moveDown(2);

      // Order Info
      doc.fillColor('#475569').fontSize(12).text(`Order ID: ${order._id}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      // Customer Info
      doc.fillColor('#0f172a').fontSize(14).text('Billed To:');
      doc.fillColor('#475569').fontSize(12).text(`${user.name}`);
      doc.text(`${order.shippingAddress.address}`);
      doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`);
      doc.text(`${order.shippingAddress.country}`);
      doc.moveDown(2);

      // Table Header
      const tableTop = doc.y;
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(12);
      doc.text('Item Description', 50, tableTop);
      doc.text('Qty', 350, tableTop, { width: 50, align: 'center' });
      doc.text('Line Total', 450, tableTop, { align: 'right' });
      
      doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).strokeColor('#e2e8f0').stroke();
      doc.font('Helvetica');

      // Table Body
      let y = tableTop + 30;
      doc.fillColor('#475569').fontSize(10);
      order.orderItems.forEach(item => {
        doc.text(item.name, 50, y, { width: 280 });
        doc.text(item.qty.toString(), 350, y, { width: 50, align: 'center' });
        doc.text(`$${(item.price * item.qty).toFixed(2)}`, 450, y, { align: 'right' });
        y += 25;
        doc.moveTo(50, y - 5).lineTo(550, y - 5).strokeColor('#f1f5f9').stroke();
      });

      // Totals
      doc.moveDown(2);
      y = doc.y;
      doc.fillColor('#0f172a').fontSize(12);
      doc.text('Subtotal:', 350, y);
      doc.text(`$${order.itemsPrice.toFixed(2)}`, 450, y, { align: 'right' });
      y += 20;
      doc.text('Shipping:', 350, y);
      doc.text(`$${order.shippingPrice.toFixed(2)}`, 450, y, { align: 'right' });
      y += 20;
      doc.text('Tax (15%):', 350, y);
      doc.text(`$${order.taxPrice.toFixed(2)}`, 450, y, { align: 'right' });
      
      y += 20;
      doc.moveTo(350, y - 5).lineTo(550, y - 5).strokeColor('#e2e8f0').stroke();
      doc.font('Helvetica-Bold').fontSize(16).fillColor('#06b6d4');
      doc.text('TOTAL:', 350, y);
      doc.text(`$${order.totalPrice.toFixed(2)}`, 450, y, { align: 'right' });

      // Footer
      doc.moveDown(4);
      doc.font('Helvetica').fontSize(10).fillColor('#94a3b8').text('Thank you for purchasing premium computing hardware from Nova.', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generateInvoicePDF;
