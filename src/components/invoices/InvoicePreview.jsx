
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Printer, ZoomIn, ZoomOut, RotateCw, Settings, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

const InvoicePreview = React.forwardRef(({ invoiceData, customer, companyInfo, totals, onPrint, onClose }, ref) => {
  console.log('🔍 Debug - InvoicePreview render - invoiceData:', invoiceData);
  console.log('🔍 Debug - InvoicePreview render - customer:', customer);
  console.log('🔍 Debug - InvoicePreview render - companyInfo:', companyInfo);
  console.log('🔍 Debug - InvoicePreview render - totals:', totals);

  // Error boundary check
  if (!invoiceData) {
    console.error('❌ Error: invoiceData is null or undefined in InvoicePreview');
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-muted-foreground mb-4">ไม่สามารถโหลดข้อมูลเอกสารได้</p>
          <Button onClick={onClose}>ปิด</Button>
        </div>
      </div>
    );
  }

  if (!companyInfo) {
    console.error('❌ Error: companyInfo is null or undefined in InvoicePreview');
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-muted-foreground mb-4">ไม่สามารถโหลดข้อมูลบริษัทได้</p>
          <Button onClick={onClose}>ปิด</Button>
        </div>
      </div>
    );
  }

  // Convert backend field names to frontend field names for display
  const convertInvoiceData = (data) => {
    if (!data) return {};
    return {
      id: data.id,
      docNumber: data.quotation_number || data.docNumber || data.invoiceNumber,
      invoiceNumber: data.quotation_number || data.docNumber || data.invoiceNumber,
      customerId: data.customer_id,
      issueDate: data.issue_date,
      dueDate: data.due_date,
      subject: data.subject,
      notes: data.notes,
      internalNotes: data.internal_notes,
      amount: data.total_amount || data.amount,
      subtotal: data.subtotal,
      vatAmount: data.vat_amount,
      withholdingTax: data.withholding_tax,
      status: data.status,
      type: data.type,
      items: data.items || []
    };
  };

  const convertedInvoiceData = convertInvoiceData(invoiceData);
  console.log('🔍 Debug - convertedInvoiceData:', convertedInvoiceData);

  const typeLabels = {
    invoice: 'ใบแจ้งหนี้',
    receipt: 'ใบเสร็จรับเงิน',
    quotation: 'ใบเสนอราคา',
  };

  const [logoSize, setLogoSize] = useState(64); // ขนาดโลโก้เริ่มต้น (px)
  const [showSettings, setShowSettings] = useState(false);
  const [pageSettings, setPageSettings] = useState({
    pageSize: 'A4',
    orientation: 'portrait',
    margin: 'normal',
    fontSize: 'normal'
  });
  const [customSettings, setCustomSettings] = useState({
    documentTitle: typeLabels[convertedInvoiceData.type] || 'เอกสาร',
    companyName: companyInfo.name || '',
    logoSize: 64
  });

  const { subtotal, totalDiscount, priceAfterDiscount, vat, wht, grandTotal } = totals || {};

  const docNumber = convertedInvoiceData.docNumber || convertedInvoiceData.invoiceNumber;

  const handleLogoSizeChange = (newSize) => {
    const size = Math.max(32, Math.min(200, newSize)); // จำกัดขนาดระหว่าง 32-200px
    setLogoSize(size);
    setCustomSettings(prev => ({ ...prev, logoSize: size }));
  };

  const handlePageSettingChange = (field, value) => {
    setPageSettings(prev => ({ ...prev, [field]: value }));
  };

  const resetPageSettings = () => {
    setPageSettings({
      pageSize: 'A4',
      orientation: 'portrait',
      margin: 'normal',
      fontSize: 'normal'
    });
    setCustomSettings({
      documentTitle: typeLabels[convertedInvoiceData.type] || 'เอกสาร',
      companyName: companyInfo.name || '',
      logoSize: 64
    });
    setLogoSize(64);
  };

  const saveSettings = () => {
    const settingsToSave = {
      pageSettings,
      customSettings,
      documentType: convertedInvoiceData.type
    };
    localStorage.setItem('invoicePrintSettings', JSON.stringify(settingsToSave));
    toast({ title: "สำเร็จ!", description: "บันทึกการตั้งค่าเรียบร้อยแล้ว" });
  };

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('invoicePrintSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.documentType === convertedInvoiceData.type) {
          setPageSettings(settings.pageSettings || pageSettings);
          setCustomSettings(settings.customSettings || customSettings);
          setLogoSize(settings.customSettings?.logoSize || 64);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  };

  // โหลดการตั้งค่าที่บันทึกไว้เมื่อ component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const getPageStyle = () => {
    const styles = {
      A4: { width: '210mm', minHeight: '297mm' },
      A5: { width: '148mm', minHeight: '210mm' },
      Letter: { width: '8.5in', minHeight: '11in' },
      Legal: { width: '8.5in', minHeight: '14in' }
    };
    
    const margins = {
      narrow: '10mm',
      normal: '20mm',
      wide: '30mm'
    };
    
    const fontSizes = {
      small: '0.75rem',
      normal: '0.875rem',
      large: '1rem'
    };
    
    return {
      ...styles[pageSettings.pageSize],
      margin: margins[pageSettings.margin],
      fontSize: fontSizes[pageSettings.fontSize],
      transform: pageSettings.orientation === 'landscape' ? 'rotate(90deg)' : 'none'
    };
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-start z-50 overflow-auto p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl my-8 relative">
        <div className="p-4 sm:p-6 border-b flex justify-between items-center print:hidden">
          <h2 className="text-xl font-bold">ตัวอย่างเอกสาร</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="mr-2 h-4 w-4" /> ตั้งค่า
            </Button>
            <Button 
              onClick={() => {
                console.log('🔍 Debug - Confirm print button clicked');
                console.log('🔍 Debug - onPrint function:', onPrint);
                console.log('🔍 Debug - invoiceData:', invoiceData);
                console.log('🔍 Debug - customer:', customer);
                console.log('🔍 Debug - companyInfo:', companyInfo);
                onPrint();
              }}
            >
              <Printer className="mr-2 h-4 w-4" /> ยืนยันการพิมพ์
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {showSettings && (
          <div className="p-4 border-b bg-gray-100 print:hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">ตั้งค่าการพิมพ์</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={saveSettings}>
                  <Save className="mr-2 h-4 w-4" /> บันทึก
                </Button>
                <Button variant="outline" size="sm" onClick={resetPageSettings}>
                  <RotateCw className="mr-2 h-4 w-4" /> รีเซ็ต
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="documentTitle">หัวข้อเอกสาร</Label>
                <Input 
                  id="documentTitle" 
                  value={customSettings.documentTitle} 
                  onChange={(e) => setCustomSettings(prev => ({ ...prev, documentTitle: e.target.value }))}
                  placeholder="เช่น: ใบแจ้งหนี้"
                />
              </div>
              <div>
                <Label htmlFor="companyName">ชื่อบริษัท</Label>
                <Input 
                  id="companyName" 
                  value={customSettings.companyName} 
                  onChange={(e) => setCustomSettings(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="ชื่อบริษัท"
                />
              </div>
              <div>
                <Label htmlFor="logoSize">ขนาดโลโก้ (px)</Label>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleLogoSizeChange(logoSize - 8)}
                    disabled={logoSize <= 32}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Input 
                    id="logoSize" 
                    type="number" 
                    value={logoSize} 
                    onChange={(e) => handleLogoSizeChange(parseInt(e.target.value) || 64)}
                    className="w-20 text-center"
                    min="32"
                    max="200"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleLogoSizeChange(logoSize + 8)}
                    disabled={logoSize >= 200}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="pageSize">ขนาดกระดาษ</Label>
                <select 
                  id="pageSize" 
                  value={pageSettings.pageSize} 
                  onChange={(e) => handlePageSettingChange('pageSize', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="A4">A4</option>
                  <option value="A5">A5</option>
                  <option value="Letter">Letter</option>
                  <option value="Legal">Legal</option>
                </select>
              </div>
              <div>
                <Label htmlFor="orientation">แนวกระดาษ</Label>
                <select 
                  id="orientation" 
                  value={pageSettings.orientation} 
                  onChange={(e) => handlePageSettingChange('orientation', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="portrait">แนวตั้ง</option>
                  <option value="landscape">แนวนอน</option>
                </select>
              </div>
              <div>
                <Label htmlFor="margin">ขอบกระดาษ</Label>
                <select 
                  id="margin" 
                  value={pageSettings.margin} 
                  onChange={(e) => handlePageSettingChange('margin', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="narrow">แคบ</option>
                  <option value="normal">ปกติ</option>
                  <option value="wide">กว้าง</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div>
                <Label htmlFor="fontSize">ขนาดตัวอักษร</Label>
                <select 
                  id="fontSize" 
                  value={pageSettings.fontSize} 
                  onChange={(e) => handlePageSettingChange('fontSize', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="small">เล็ก</option>
                  <option value="normal">ปกติ</option>
                  <option value="large">ใหญ่</option>
                </select>
              </div>
              <div className="col-span-3">
                <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                  <strong>การตั้งค่าปัจจุบัน:</strong> {pageSettings.pageSize} | 
                  {pageSettings.orientation === 'portrait' ? 'แนวตั้ง' : 'แนวนอน'} | 
                  ขอบ: {pageSettings.margin === 'narrow' ? 'แคบ' : pageSettings.margin === 'wide' ? 'กว้าง' : 'ปกติ'} | 
                  ตัวอักษร: {pageSettings.fontSize === 'small' ? 'เล็ก' : pageSettings.fontSize === 'large' ? 'ใหญ่' : 'ปกติ'} | 
                  หัวข้อ: {customSettings.documentTitle} | 
                  บริษัท: {customSettings.companyName}
                </div>
              </div>
            </div>
          </div>
        )}

        <div 
          ref={ref} 
          className="invoice-print-area"
          style={{
            ...getPageStyle(),
            padding: pageSettings.margin === 'narrow' ? '10mm' : 
                     pageSettings.margin === 'wide' ? '30mm' : '20mm',
            fontSize: pageSettings.fontSize === 'small' ? '0.75rem' : 
                     pageSettings.fontSize === 'large' ? '1rem' : '0.875rem',
            backgroundColor: 'white',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            margin: '0 auto',
            maxWidth: '100%'
          }}
        >
          <header className="flex justify-between items-start mb-12">
            <div>
                {companyInfo.logoUrl ? (
                  <img 
                    src={companyInfo.logoUrl} 
                    alt="Company Logo" 
                    style={{ height: `${logoSize}px`, maxWidth: '200px' }}
                    className="object-contain mb-4" 
                  />
                ) : (
                  <div style={{ height: `${logoSize}px` }} className="mb-4"></div>
                )}
                <h1 className="text-lg font-bold text-gray-800">{customSettings.companyName || companyInfo.name}</h1>
                <p className="text-gray-500 text-sm">{companyInfo.address}</p>
                <p className="text-gray-500 text-sm">{companyInfo.city}</p>
                <p className="text-gray-500 text-sm">เลขประจำตัวผู้เสียภาษี: {companyInfo.taxId}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold uppercase text-gray-800 whitespace-nowrap">
                {customSettings.documentTitle}
              </h2>
              <p className="text-gray-500 text-sm">เลขที่: {docNumber}</p>
            </div>
          </header>
          
          <section className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">ลูกค้า</h3>
                              {customer ? (
                  <>
                    <p className="font-bold text-gray-800 text-sm">{customer.name}</p>
                    <p className="text-gray-600 text-sm">{customer.company}</p>
                    <p className="text-gray-600 text-sm">{customer.address}</p>
                    <p className="text-gray-600 text-sm">เลขประจำตัวผู้เสียภาษี: {customer.taxId}</p>
                  </>
                ) : (
                  <p className="text-gray-600 text-sm">ยังไม่ได้เลือกลูกค้า</p>
                )}
            </div>
            <div className="text-right">
              <div className="mb-1">
                <p className="text-xs font-semibold text-gray-500 uppercase">วันที่ออก</p>
                <p className="text-gray-800 text-sm">{new Date(invoiceData.issueDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">ยืนราคาถึงวันที่</p>
                <p className="text-gray-800 text-sm">{invoiceData.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</p>
              </div>
            </div>
          </section>

          <section>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <th className="p-2">รายการ</th>
                  <th className="p-2 text-center">จำนวน</th>
                  <th className="p-2 text-right">ราคา/หน่วย</th>
                  <th className="p-2 text-right">รวม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoiceData.items.map((item, index) => {
                  // Handle both frontend and backend item structures
                  const quantity = Number(item.quantity) || 0;
                  const unitPrice = Number(item.unitPrice || item.unit_price) || 0;
                  const discount = Number(item.discount) || 0;
                  const itemTotal = quantity * unitPrice * (1 - discount / 100);
                  
                  return (
                  <tr key={index}>
                    <td className="p-2 align-top">
                      <p className="font-semibold text-sm">{item.description}</p>
                      <p className="text-xs text-gray-500 whitespace-pre-wrap">{item.details}</p>
                    </td>
                    <td className="p-2 text-center align-top text-sm">{quantity} {item.unit}</td>
                    <td className="p-2 text-right align-top text-sm">฿{unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 text-right align-top text-sm">฿{itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                )})}
              </tbody>
            </table>
          </section>

          <section className="flex justify-end mt-8">
            <div className="w-full max-w-sm space-y-1 text-gray-700 text-sm">
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
              <div className="flex justify-between font-bold text-lg text-gray-900 border-t-2 border-gray-800 pt-2 mt-2">
                <span>ยอดชำระสุทธิ:</span>
                <span>฿{(grandTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </section>
          
          {/* ข้อมูลธนาคาร */}
          {(companyInfo.bank_name || companyInfo.bank_account_name || companyInfo.bank_account_number) && (
            <section className="mt-8 p-3 border rounded-lg bg-gray-50">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">ข้อมูลการชำระเงิน</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {companyInfo.bank_name && (
                  <div>
                    <span className="font-medium text-gray-600">ธนาคาร:</span>
                    <span className="ml-2 text-gray-800">{companyInfo.bank_name}</span>
                  </div>
                )}
                {companyInfo.bank_account_name && (
                  <div>
                    <span className="font-medium text-gray-600">ชื่อบัญชี:</span>
                    <span className="ml-2 text-gray-800">{companyInfo.bank_account_name}</span>
                  </div>
                )}
                {companyInfo.bank_account_number && (
                  <div>
                    <span className="font-medium text-gray-600">เลขบัญชี:</span>
                    <span className="ml-2 text-gray-800 font-mono">{companyInfo.bank_account_number}</span>
                  </div>
                )}
                {companyInfo.bank_branch && (
                  <div>
                    <span className="font-medium text-gray-600">สาขา:</span>
                    <span className="ml-2 text-gray-800">{companyInfo.bank_branch}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ลายเซ็น */}
          <section className="mt-8 flex justify-between items-end">
            <div className="flex-1">
              {companyInfo.signature_url && (
                <div className="mb-2">
                  <img 
                    src={companyInfo.signature_url} 
                    alt="ลายเซ็น" 
                    className="h-16 object-contain"
                  />
                </div>
              )}
              <div className="border-t-2 border-gray-300 w-32">
                <p className="text-sm text-gray-600 mt-1">ลายเซ็นผู้มีอำนาจ</p>
              </div>
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm text-gray-600">วันที่: {new Date().toLocaleDateString('th-TH')}</p>
            </div>
          </section>

          <footer className="mt-12 border-t pt-6 text-gray-500 text-xs">
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
            width: ${pageSettings.pageSize === 'A4' ? '210mm' : 
                     pageSettings.pageSize === 'A5' ? '148mm' : 
                     pageSettings.pageSize === 'Letter' ? '8.5in' : '8.5in'};
            height: ${pageSettings.pageSize === 'A4' ? '297mm' : 
                      pageSettings.pageSize === 'A5' ? '210mm' : 
                      pageSettings.pageSize === 'Letter' ? '11in' : '14in'};
            font-family: 'Prompt', sans-serif;
            margin: 0;
            padding: ${pageSettings.margin === 'narrow' ? '10mm' : 
                      pageSettings.margin === 'wide' ? '30mm' : '20mm'};
            font-size: ${pageSettings.fontSize === 'small' ? '0.75rem' : 
                        pageSettings.fontSize === 'large' ? '1rem' : '0.875rem'};
            transform: ${pageSettings.orientation === 'landscape' ? 'rotate(90deg)' : 'none'};
            transform-origin: center;
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
