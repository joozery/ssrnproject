
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Printer } from 'lucide-react';

const InvoicePreview = React.forwardRef(({ invoiceData, customer, companyInfo, totals, onPrint, onClose }, ref) => {
  const { subtotal, totalDiscount, priceAfterDiscount, vat, wht, grandTotal } = totals || {};

  const typeLabels = {
    invoice: 'ใบแจ้งหนี้',
    receipt: 'ใบเสร็จรับเงิน',
    quotation: 'ใบเสนอราคา',
  };

  const docNumber = invoiceData.docNumber || invoiceData.invoiceNumber;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-start z-50 overflow-auto p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl my-8 relative">
        <div className="p-4 sm:p-6 border-b flex justify-between items-center print:hidden">
          <h2 className="text-xl font-bold">ตัวอย่างเอกสาร</h2>
          <div className="flex items-center gap-2">
            <Button onClick={onPrint}>
              <Printer className="mr-2 h-4 w-4" /> ยืนยันการพิมพ์
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div ref={ref} className="p-8 md:p-12 invoice-print-area">
          <header className="flex justify-between items-start mb-12">
            <div>
                {companyInfo.logoUrl ? (
                  <img src={companyInfo.logoUrl} alt="Company Logo" className="h-16 max-w-[200px] object-contain mb-4" />
                ) : (
                  <div className="h-16 mb-4"></div>
                )}
                <h1 className="text-2xl font-bold text-gray-800">{companyInfo.name}</h1>
                <p className="text-gray-500">{companyInfo.address}</p>
                <p className="text-gray-500">{companyInfo.city}</p>
                <p className="text-gray-500">เลขประจำตัวผู้เสียภาษี: {companyInfo.taxId}</p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold uppercase text-gray-800">
                {typeLabels[invoiceData.type] || 'เอกสาร'}
              </h2>
              <p className="text-gray-500">เลขที่: {docNumber}</p>
            </div>
          </header>
          
          <section className="grid grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">ลูกค้า</h3>
              {customer ? (
                <>
                  <p className="font-bold text-gray-800">{customer.name}</p>
                  <p className="text-gray-600">{customer.company}</p>
                  <p className="text-gray-600">{customer.address}</p>
                  <p className="text-gray-600">เลขประจำตัวผู้เสียภาษี: {customer.taxId}</p>
                </>
              ) : (
                <p className="text-gray-600">ยังไม่ได้เลือกลูกค้า</p>
              )}
            </div>
            <div className="text-right">
              <div className="mb-2">
                <p className="text-sm font-semibold text-gray-500 uppercase">วันที่ออก</p>
                <p className="text-gray-800">{new Date(invoiceData.issueDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase">ยืนราคาถึงวันที่</p>
                <p className="text-gray-800">{invoiceData.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</p>
              </div>
            </div>
          </section>

          <section>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
                  <th className="p-3">รายการ</th>
                  <th className="p-3 text-center">จำนวน</th>
                  <th className="p-3 text-right">ราคา/หน่วย</th>
                  <th className="p-3 text-right">รวม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoiceData.items.map((item, index) => {
                  const itemTotal = ((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)) * (1 - (Number(item.discount) || 0) / 100);
                  return (
                  <tr key={index}>
                    <td className="p-3 align-top">
                      <p className="font-semibold">{item.description}</p>
                      <p className="text-xs text-gray-500 whitespace-pre-wrap">{item.details}</p>
                    </td>
                    <td className="p-3 text-center align-top">{item.quantity} {item.unit}</td>
                    <td className="p-3 text-right align-top">฿{(Number(item.unitPrice) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right align-top">฿{itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                )})}
              </tbody>
            </table>
          </section>

          <section className="flex justify-end mt-8">
            <div className="w-full max-w-sm space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>รวมเป็นเงิน:</span>
                <span>฿{(subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>ส่วนลด:</span>
                <span>฿{(totalDiscount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>ราคาหลังหักส่วนลด:</span>
                <span>฿{(priceAfterDiscount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              {invoiceData.includeVat && (
                <div className="flex justify-between">
                  <span>ภาษีมูลค่าเพิ่ม (7%):</span>
                  <span>฿{(vat || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {invoiceData.withholdingTax > 0 && (
                <div className="flex justify-between">
                  <span>หัก ณ ที่จ่าย ({invoiceData.withholdingTax}%):</span>
                  <span className="text-red-600">-฿{(wht || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xl text-gray-900 border-t-2 border-gray-800 pt-2 mt-2">
                <span>ยอดชำระสุทธิ:</span>
                <span>฿{(grandTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </section>
          
          <footer className="mt-16 border-t pt-8 text-gray-500 text-sm">
            {invoiceData.notes && <p className="mb-4"><strong>หมายเหตุ:</strong> {invoiceData.notes}</p>}
            <p className="text-center">ขอบคุณที่ใช้บริการ</p>
            <p className="text-center">{companyInfo.name} | {companyInfo.phone} | {companyInfo.email}</p>
          </footer>
        </div>
      </div>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-print-area, .invoice-print-area * {
            visibility: visible;
          }
          .invoice-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none;
          }
        }
      `}</style>
    </div>
  );
});

export default InvoicePreview;
