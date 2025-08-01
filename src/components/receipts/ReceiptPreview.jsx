import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Printer, 
  Download,
  DollarSign,
  Calendar,
  User,
  FileText,
  Building
} from 'lucide-react';

const ReceiptPreview = ({ receipt, customer, invoice, companyInfo, onBack, onPrint }) => {
  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'ไม่ระบุ';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      cash: 'เงินสด',
      bank_transfer: 'โอนเงิน',
      check: 'เช็ค',
      credit_card: 'บัตรเครดิต',
      other: 'อื่นๆ'
    };
    return methods[method] || method;
  };

  const getStatusLabel = (status) => {
    const statuses = {
      draft: 'แบบร่าง',
      issued: 'ออกแล้ว',
      paid: 'ชำระแล้ว',
      cancelled: 'ยกเลิก'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-500',
      issued: 'bg-blue-500',
      paid: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับ
          </Button>
          <h1 className="text-2xl font-bold">ตัวอย่างใบเสร็จรับเงิน</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onPrint}>
            <Printer className="h-4 w-4 mr-2" />
            พิมพ์
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            ดาวน์โหลด
          </Button>
        </div>
      </div>

      {/* Receipt Preview */}
      <Card className="print:shadow-none print:border-0">
        <CardContent className="p-8">
          {/* Company Header */}
          <div className="text-center mb-8 border-b pb-6">
            {companyInfo?.logo_url && (
              <img 
                src={companyInfo.logo_url} 
                alt="Company Logo" 
                className="h-16 mx-auto mb-4"
              />
            )}
            <h1 className="text-2xl font-bold mb-2">
              {companyInfo?.company_name || 'ชื่อบริษัท'}
            </h1>
            <p className="text-gray-600 mb-1">
              {companyInfo?.address || 'ที่อยู่บริษัท'}
            </p>
            <p className="text-gray-600 mb-1">
              โทร: {companyInfo?.phone || 'เบอร์โทร'} | อีเมล: {companyInfo?.email || 'อีเมล'}
            </p>
            <p className="text-gray-600">
              เลขประจำตัวผู้เสียภาษี: {companyInfo?.tax_id || 'เลขประจำตัวผู้เสียภาษี'}
            </p>
          </div>

          {/* Receipt Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 whitespace-nowrap">ใบเสร็จรับเงิน</h2>
            <div className="flex justify-between items-center">
              <div className="text-left">
                <p className="text-sm text-gray-600">เลขที่: <span className="font-semibold">{receipt?.receipt_number || 'ไม่ระบุ'}</span></p>
                <p className="text-sm text-gray-600">วันที่: <span className="font-semibold">{formatDate(receipt?.issue_date)}</span></p>
              </div>
              <Badge className={`${getStatusColor(receipt?.status)} text-white`}>
                {getStatusLabel(receipt?.status)}
              </Badge>
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <User className="h-5 w-5" />
                ข้อมูลลูกค้า
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">ชื่อ:</span> {customer?.name || 'ไม่ระบุ'}</p>
                <p><span className="font-medium">ที่อยู่:</span> {customer?.address || 'ไม่ระบุ'}</p>
                <p><span className="font-medium">โทร:</span> {customer?.phone || 'ไม่ระบุ'}</p>
                <p><span className="font-medium">อีเมล:</span> {customer?.email || 'ไม่ระบุ'}</p>
                {customer?.tax_id && (
                  <p><span className="font-medium">เลขประจำตัวผู้เสียภาษี:</span> {customer.tax_id}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Building className="h-5 w-5" />
                ข้อมูลบริษัท
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">ชื่อ:</span> {companyInfo?.company_name || 'ไม่ระบุ'}</p>
                <p><span className="font-medium">ที่อยู่:</span> {companyInfo?.address || 'ไม่ระบุ'}</p>
                <p><span className="font-medium">โทร:</span> {companyInfo?.phone || 'ไม่ระบุ'}</p>
                <p><span className="font-medium">อีเมล:</span> {companyInfo?.email || 'ไม่ระบุ'}</p>
                {companyInfo?.tax_id && (
                  <p><span className="font-medium">เลขประจำตัวผู้เสียภาษี:</span> {companyInfo.tax_id}</p>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Reference */}
          {receipt?.invoice_id && invoice && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                อ้างอิงใบแจ้งหนี้
              </h3>
              <p><span className="font-medium">เลขที่:</span> {invoice.invoice_number || invoice.invoiceNumber || `INV-${invoice.id}`}</p>
              <p><span className="font-medium">วันที่:</span> {formatDate(invoice.issue_date)}</p>
            </div>
          )}

          {/* Payment Details */}
          <div className="border-t pt-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">รายละเอียดการชำระเงิน</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">จำนวนเงิน:</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(receipt?.total_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">วิธีชำระเงิน:</span>
                  <span>{getPaymentMethodLabel(receipt?.payment_method)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">วันที่ชำระเงิน:</span>
                  <span>{formatDate(receipt?.payment_date)}</span>
                </div>
              </div>
            </div>

            {/* Check Information */}
            {receipt?.payment_method === 'check' && receipt?.is_check && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-md font-semibold mb-3">ข้อมูลเช็ค</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">สั่งจ่ายในนาม:</span>
                    <p className="text-gray-700">{receipt.payable_to || 'ไม่ระบุ'}</p>
                  </div>
                  <div>
                    <span className="font-medium">วันที่รับเช็ค:</span>
                    <p className="text-gray-700">{formatDate(receipt.check_received_date)}</p>
                  </div>
                  <div>
                    <span className="font-medium">วันที่รับโอน:</span>
                    <p className="text-gray-700">{formatDate(receipt.check_transfer_date)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {receipt?.description && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">หมายเหตุ</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{receipt.description}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="border-t-2 border-gray-300 pt-4 mt-8">
                  <p className="text-sm text-gray-600 mb-2">ลงชื่อผู้รับเงิน</p>
                  <div className="h-16 border-b border-gray-300 mb-2"></div>
                  <p className="text-sm text-gray-600">วันที่: _________________</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-gray-300 pt-4 mt-8">
                  <p className="text-sm text-gray-600 mb-2">ลงชื่อผู้จ่ายเงิน</p>
                  <div className="h-16 border-b border-gray-300 mb-2"></div>
                  <p className="text-sm text-gray-600">วันที่: _________________</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReceiptPreview; 