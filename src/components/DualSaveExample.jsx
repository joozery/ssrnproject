import React, { useState } from 'react';
import axios from '../lib/axios';

const DualSaveExample = () => {
  const [formData, setFormData] = useState({
    // Invoice data
    invoice_number: '',
    customer_id: 'cust_001',
    issue_date: '',
    due_date: '',
    subject: '',
    notes: '',
    internal_notes: '',
    subtotal: 0,
    vat_amount: 0,
    withholding_tax: 0,
    total_amount: 0,
    status: 'pending',
    type: 'invoice',
    payment_method: 'โอนเข้าบัญชี',
    payment_date: '',
    reference_number: '',
    invoice_items: [],
    
    // Quotation data
    quotation_number: '',
    quotation_subject: '',
    quotation_notes: '',
    quotation_internal_notes: '',
    quotation_subtotal: 0,
    quotation_vat_amount: 0,
    quotation_withholding_tax: 0,
    quotation_total_amount: 0,
    quotation_status: 'draft',
    quotation_type: 'quotation',
    quotation_items: []
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value, type = 'invoice') => {
    setFormData(prev => {
      const items = type === 'invoice' ? [...prev.invoice_items] : [...prev.quotation_items];
      items[index] = {
        ...items[index],
        [field]: value
      };
      
      // คำนวณ amount
      if (field === 'quantity' || field === 'unit_price' || field === 'discount') {
        const quantity = parseFloat(items[index].quantity) || 0;
        const unitPrice = parseFloat(items[index].unit_price) || 0;
        const discount = parseFloat(items[index].discount) || 0;
        items[index].amount = (quantity * unitPrice) * (1 - discount / 100);
      }
      
      return {
        ...prev,
        [type === 'invoice' ? 'invoice_items' : 'quotation_items']: items
      };
    });
  };

  const addItem = (type = 'invoice') => {
    const newItem = {
      description: '',
      details: '',
      quantity: 1,
      unit: 'หน่วย',
      unit_price: 0,
      discount: 0,
      amount: 0
    };

    setFormData(prev => ({
      ...prev,
      [type === 'invoice' ? 'invoice_items' : 'quotation_items']: [
        ...prev[type === 'invoice' ? 'invoice_items' : 'quotation_items'],
        newItem
      ]
    }));
  };

  const removeItem = (index, type = 'invoice') => {
    setFormData(prev => ({
      ...prev,
      [type === 'invoice' ? 'invoice_items' : 'quotation_items']: 
        prev[type === 'invoice' ? 'invoice_items' : 'quotation_items'].filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const invoiceSubtotal = formData.invoice_items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const invoiceVat = invoiceSubtotal * 0.07;
    const invoiceTotal = invoiceSubtotal + invoiceVat;

    const quotationSubtotal = formData.quotation_items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const quotationVat = quotationSubtotal * 0.07;
    const quotationTotal = quotationSubtotal + quotationVat;

    setFormData(prev => ({
      ...prev,
      subtotal: invoiceSubtotal,
      vat_amount: invoiceVat,
      total_amount: invoiceTotal,
      quotation_subtotal: quotationSubtotal,
      quotation_vat_amount: quotationVat,
      quotation_total_amount: quotationTotal
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // คำนวณยอดรวมก่อนส่ง
      calculateTotals();

      const response = await axios.post('/invoices/dual-save', formData);
      
      if (response.data.success) {
        setResult(response.data);
        // รีเซ็ตฟอร์ม
        setFormData({
          invoice_number: '',
          customer_id: 'cust_001',
          issue_date: '',
          due_date: '',
          subject: '',
          notes: '',
          internal_notes: '',
          subtotal: 0,
          vat_amount: 0,
          withholding_tax: 0,
          total_amount: 0,
          status: 'pending',
          type: 'invoice',
          payment_method: 'โอนเข้าบัญชี',
          payment_date: '',
          reference_number: '',
          invoice_items: [],
          quotation_number: '',
          quotation_subject: '',
          quotation_notes: '',
          quotation_internal_notes: '',
          quotation_subtotal: 0,
          quotation_vat_amount: 0,
          quotation_withholding_tax: 0,
          quotation_total_amount: 0,
          quotation_status: 'draft',
          quotation_type: 'quotation',
          quotation_items: []
        });
      }
    } catch (error) {
      setError(error.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">ตัวอย่างการใช้งาน API Dual Save</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ข้อมูลทั่วไป */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">ข้อมูลทั่วไป</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Invoice Number</label>
              <input
                type="text"
                name="invoice_number"
                value={formData.invoice_number}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quotation Number</label>
              <input
                type="text"
                name="quotation_number"
                value={formData.quotation_number}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Customer ID</label>
              <input
                type="text"
                name="customer_id"
                value={formData.customer_id}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Issue Date</label>
              <input
                type="date"
                name="issue_date"
                value={formData.issue_date}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Invoice Items</h2>
            <button
              type="button"
              onClick={() => addItem('invoice')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              เพิ่มรายการ
            </button>
          </div>
          
          {formData.invoice_items.map((item, index) => (
            <div key={index} className="border p-4 rounded mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value, 'invoice')}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value, 'invoice')}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit Price</label>
                  <input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(index, 'unit_price', e.target.value, 'invoice')}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Amount</label>
                  <input
                    type="number"
                    value={item.amount}
                    readOnly
                    className="w-full p-2 border rounded bg-gray-100"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeItem(index, 'invoice')}
                className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                ลบ
              </button>
            </div>
          ))}
        </div>

        {/* Quotation Items */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Quotation Items</h2>
            <button
              type="button"
              onClick={() => addItem('quotation')}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              เพิ่มรายการ
            </button>
          </div>
          
          {formData.quotation_items.map((item, index) => (
            <div key={index} className="border p-4 rounded mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value, 'quotation')}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value, 'quotation')}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit Price</label>
                  <input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(index, 'unit_price', e.target.value, 'quotation')}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Amount</label>
                  <input
                    type="number"
                    value={item.amount}
                    readOnly
                    className="w-full p-2 border rounded bg-gray-100"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeItem(index, 'quotation')}
                className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                ลบ
              </button>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึก Invoice และ Quotation'}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>ข้อผิดพลาด:</strong> {error}
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <strong>สำเร็จ!</strong> {result.message}
          <div className="mt-2">
            <p><strong>Invoice ID:</strong> {result.data.invoice.id}</p>
            <p><strong>Quotation ID:</strong> {result.data.quotation.id}</p>
            <p><strong>Invoice Items:</strong> {result.data.invoice.items.length} รายการ</p>
            <p><strong>Quotation Items:</strong> {result.data.quotation.items.length} รายการ</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DualSaveExample; 