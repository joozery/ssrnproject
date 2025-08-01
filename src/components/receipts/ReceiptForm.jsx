import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { 
  ArrowLeft, 
  Save, 
  DollarSign,
  User,
  FileText,
  Calendar,
  CreditCard
} from 'lucide-react';

const ReceiptForm = ({ 
  receipt, 
  customers, 
  invoices, 
  onSave, 
  onBack, 
  companyInfo, 
  isSubmitting 
}) => {
  const [formData, setFormData] = useState({
    receipt_number: '',
    customer_id: '',
    invoice_id: '',
    issue_date: '',
    payment_date: '',
    payment_method: '',
    total_amount: '',
    description: '',
    status: 'issued',
    is_check: false,
    payable_to: '',
    check_received_date: '',
    check_transfer_date: ''
  });

  useEffect(() => {
    if (receipt) {
      setFormData({
        receipt_number: receipt.receipt_number || '',
        customer_id: receipt.customer_id || '',
        invoice_id: receipt.invoice_id || '',
        issue_date: receipt.issue_date ? receipt.issue_date.split('T')[0] : '',
        payment_date: receipt.payment_date ? receipt.payment_date.split('T')[0] : '',
        payment_method: receipt.payment_method || '',
        total_amount: receipt.total_amount || '',
        description: receipt.description || '',
        status: receipt.status || 'issued',
        is_check: receipt.is_check || false,
        payable_to: receipt.payable_to || '',
        check_received_date: receipt.check_received_date ? receipt.check_received_date.split('T')[0] : '',
        check_transfer_date: receipt.check_transfer_date ? receipt.check_transfer_date.split('T')[0] : ''
      });
    } else {
      // Generate receipt number for new receipt
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const receiptNumber = `RCP-${year}${month}${day}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      setFormData({
        receipt_number: receiptNumber,
        customer_id: '',
        invoice_id: '',
        issue_date: today.toISOString().split('T')[0],
        payment_date: today.toISOString().split('T')[0],
        payment_method: '',
        total_amount: '',
        description: '',
        status: 'issued',
        is_check: false,
        payable_to: '',
        check_received_date: '',
        check_transfer_date: ''
      });
    }
  }, [receipt]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInvoiceChange = (invoiceId) => {
    const selectedInvoice = invoices.find(inv => inv.id == invoiceId);
    if (selectedInvoice) {
      setFormData(prev => ({
        ...prev,
        invoice_id: invoiceId,
        customer_id: selectedInvoice.customer_id || prev.customer_id,
        total_amount: selectedInvoice.total_amount || prev.total_amount
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        invoice_id: invoiceId
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.customer_id) {
      toast({
        title: "ผิดพลาด!",
        description: "กรุณาเลือกลูกค้า",
        variant: "destructive",
      });
      return;
    }

    if (!formData.total_amount || Number(formData.total_amount) <= 0) {
      toast({
        title: "ผิดพลาด!",
        description: "กรุณาระบุจำนวนเงินที่ถูกต้อง",
        variant: "destructive",
      });
      return;
    }

    const receiptData = {
      ...formData,
      id: receipt?.id,
      total_amount: Number(formData.total_amount)
    };

    onSave(receiptData);
  };

  const paymentMethods = [
    { value: 'cash', label: 'เงินสด' },
    { value: 'bank_transfer', label: 'โอนเงิน' },
    { value: 'check', label: 'เช็ค' },
    { value: 'credit_card', label: 'บัตรเครดิต' },
    { value: 'other', label: 'อื่นๆ' }
  ];

  const statusOptions = [
    { value: 'draft', label: 'แบบร่าง' },
    { value: 'issued', label: 'ออกแล้ว' },
    { value: 'paid', label: 'ชำระแล้ว' },
    { value: 'cancelled', label: 'ยกเลิก' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          กลับ
        </Button>
        <h1 className="text-2xl font-bold">
          {receipt ? 'แก้ไขใบเสร็จรับเงิน' : 'สร้างใบเสร็จรับเงินใหม่'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                ข้อมูลพื้นฐาน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="receipt_number">เลขที่ใบเสร็จ</Label>
                <Input
                  id="receipt_number"
                  value={formData.receipt_number}
                  onChange={(e) => handleInputChange('receipt_number', e.target.value)}
                  placeholder="เลขที่ใบเสร็จ"
                />
              </div>

              <div>
                <Label htmlFor="customer_id">ลูกค้า *</Label>
                <Select value={formData.customer_id} onValueChange={(value) => handleInputChange('customer_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกลูกค้า" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="invoice_id">ใบแจ้งหนี้ (ไม่บังคับ)</Label>
                <Select value={formData.invoice_id} onValueChange={handleInvoiceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกใบแจ้งหนี้" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">ไม่มีใบแจ้งหนี้</SelectItem>
                    {invoices.map((invoice) => (
                      <SelectItem key={invoice.id} value={invoice.id.toString()}>
                        {invoice.invoice_number || invoice.invoiceNumber || `INV-${invoice.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">สถานะ</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                ข้อมูลการชำระเงิน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="total_amount">จำนวนเงิน *</Label>
                <Input
                  id="total_amount"
                  type="number"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) => handleInputChange('total_amount', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="payment_method">วิธีชำระเงิน</Label>
                <Select value={formData.payment_method} onValueChange={(value) => handleInputChange('payment_method', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกวิธีชำระเงิน" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Check Information */}
              {formData.payment_method === 'check' && (
                <>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_check"
                      checked={formData.is_check}
                      onChange={(e) => handleInputChange('is_check', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="is_check">เช็ค</Label>
                  </div>

                  {formData.is_check && (
                    <>
                      <div>
                        <Label htmlFor="payable_to">สั่งจ่ายในนาม</Label>
                        <Input
                          id="payable_to"
                          value={formData.payable_to}
                          onChange={(e) => handleInputChange('payable_to', e.target.value)}
                          placeholder="ชื่อบริษัทหรือบุคคลที่สั่งจ่าย"
                        />
                      </div>

                      <div>
                        <Label htmlFor="check_received_date">วันที่รับเช็ค</Label>
                        <Input
                          id="check_received_date"
                          type="date"
                          value={formData.check_received_date}
                          onChange={(e) => handleInputChange('check_received_date', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="check_transfer_date">วันที่รับโอน</Label>
                        <Input
                          id="check_transfer_date"
                          type="date"
                          value={formData.check_transfer_date}
                          onChange={(e) => handleInputChange('check_transfer_date', e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              <div>
                <Label htmlFor="issue_date">วันที่ออกใบเสร็จ</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => handleInputChange('issue_date', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="payment_date">วันที่ชำระเงิน</Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => handleInputChange('payment_date', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>หมายเหตุ</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="หมายเหตุเพิ่มเติม..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={onBack}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'กำลังบันทึก...' : (receipt ? 'อัปเดต' : 'สร้าง')}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default ReceiptForm; 