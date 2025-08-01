import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Printer, ZoomIn, ZoomOut, RotateCw, Settings, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useReactToPrint } from 'react-to-print';

const PaymentVoucherPreview = React.forwardRef(({ voucher, driver, companyInfo, onClose }, ref) => {
  const [logoSize, setLogoSize] = useState(48);
  const [showSettings, setShowSettings] = useState(false);
  const [sourceJobOrder, setSourceJobOrder] = useState(null);
  const [pageSettings, setPageSettings] = useState({
    pageSize: 'A4',
    orientation: 'portrait',
    margin: 'narrow',
    fontSize: 'small'
  });
  const [customSettings, setCustomSettings] = useState({
    documentTitle: 'ใบสำคัญจ่าย',
    companyName: companyInfo.name || '',
    logoSize: 64
  });

  const componentToPrintRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentToPrintRef.current,
    onAfterPrint: () => onClose(),
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '-';
    return numAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleLogoSizeChange = (newSize) => {
    const size = Math.max(32, Math.min(200, newSize));
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
      margin: 'narrow',
      fontSize: 'small'
    });
    setCustomSettings({
      documentTitle: 'ใบสำคัญจ่าย',
      companyName: companyInfo.name || '',
      logoSize: 48
    });
    setLogoSize(48);
  };

  const saveSettings = () => {
    const settingsToSave = {
      pageSettings,
      customSettings,
      documentType: 'payment_voucher'
    };
    localStorage.setItem('paymentVoucherPrintSettings', JSON.stringify(settingsToSave));
    toast({ title: "สำเร็จ!", description: "บันทึกการตั้งค่าเรียบร้อยแล้ว" });
  };

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('paymentVoucherPrintSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.documentType === 'payment_voucher') {
          setPageSettings(settings.pageSettings || pageSettings);
          setCustomSettings(settings.customSettings || customSettings);
          setLogoSize(settings.customSettings?.logoSize || 48);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  };

  useEffect(() => {
    loadSettings();
    
    // ดึงข้อมูลใบสั่งงานต้นฉบับถ้ามี
    if (voucher.sourceJobOrderId) {
      const savedJobOrders = JSON.parse(localStorage.getItem('jobOrders') || '[]');
      const jobOrder = savedJobOrders.find(jo => jo.id === voucher.sourceJobOrderId);
      if (jobOrder) {
        setSourceJobOrder(jobOrder);
      }
    }
  }, [voucher.sourceJobOrderId]);

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
      small: '0.875rem',
      normal: '1rem',
      large: '1.125rem'
    };
    
    return {
      ...styles[pageSettings.pageSize],
      margin: margins[pageSettings.margin],
      fontSize: fontSizes[pageSettings.fontSize],
      transform: pageSettings.orientation === 'landscape' ? 'rotate(90deg)' : 'none'
    };
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-start z-50 overflow-auto p-4 print:bg-white print:p-0">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl my-8 relative print:shadow-none print:my-0 print:rounded-none">
        <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-lg print:hidden">
          <h2 className="text-xl font-bold">ตัวอย่างใบสำคัญจ่าย</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="mr-2 h-4 w-4" /> ตั้งค่า
            </Button>
            <Button onClick={handlePrint}>
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
                  placeholder="เช่น: ใบสำคัญจ่าย"
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
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
              <div className="col-span-1">
                <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                  <strong>การตั้งค่าปัจจุบัน:</strong> {pageSettings.pageSize} | 
                  {pageSettings.orientation === 'portrait' ? 'แนวตั้ง' : 'แนวนอน'} | 
                  ขอบ: {pageSettings.margin === 'narrow' ? 'แคบ' : pageSettings.margin === 'wide' ? 'กว้าง' : 'ปกติ'} | 
                  ตัวอักษร: {pageSettings.fontSize === 'small' ? 'เล็ก' : pageSettings.fontSize === 'large' ? 'ใหญ่' : 'ปกติ'}
                </div>
              </div>
            </div>
          </div>
        )}

        <div 
          ref={componentToPrintRef} 
          className="payment-voucher-print-area font-sans"
          style={{
            ...getPageStyle(),
            padding: pageSettings.margin === 'narrow' ? '10mm' : 
                     pageSettings.margin === 'wide' ? '30mm' : '20mm',
            fontSize: pageSettings.fontSize === 'small' ? '0.875rem' : 
                     pageSettings.fontSize === 'large' ? '1.125rem' : '1rem',
            backgroundColor: 'white',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            margin: '0 auto',
            maxWidth: '100%'
          }}
        >
          <header className="flex justify-between items-start mb-8">
            <div>
              {companyInfo.logoUrl && (
                <img 
                  src={companyInfo.logoUrl} 
                  alt="Company Logo" 
                  style={{ height: `${logoSize}px`, maxWidth: '200px' }}
                  className="object-contain mb-4" 
                />
              )}
              <h1 className="text-lg font-bold text-gray-800">{customSettings.companyName || companyInfo.name}</h1>
              <p className="text-xs text-gray-500">{companyInfo.address}</p>
              <p className="text-xs text-gray-500">{companyInfo.city}</p>
              <p className="text-xs text-gray-500">เลขประจำตัวผู้เสียภาษี: {companyInfo.taxId}</p>
              <p className="text-xs text-gray-500">โทร: {companyInfo.phone}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold uppercase text-gray-800">
                {customSettings.documentTitle}
              </h2>
              <p className="text-xs text-gray-500">เลขที่: {voucher.voucherNumber}</p>
            </div>
          </header>
          
          <section className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">จ่ายให้</h3>
              <p className="text-sm font-bold text-gray-800">{driver?.name || 'ไม่ระบุ'}</p>
            </div>
            <div className="text-right">
              <div className="mb-1">
                <p className="text-xs font-semibold text-gray-500 uppercase">วันที่</p>
                <p className="text-sm text-gray-800">{formatDate(voucher.issueDate)}</p>
              </div>
            </div>
          </section>

          {/* แสดงข้อมูลใบสั่งงานต้นฉบับ */}
          {sourceJobOrder && (
            <section className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-xs font-semibold text-blue-800 uppercase mb-2">ข้อมูลใบสั่งงานต้นฉบับ (บวกยอดผิด)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-xs font-semibold text-blue-700">เลขที่ใบสั่งงาน:</span>
                  <p className="text-xs text-blue-600 font-medium">{sourceJobOrder.jobOrderNumber}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-blue-700">เล่มที่:</span>
                  <p className="text-xs text-blue-600">{sourceJobOrder.jobOrderVolume || '-'}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-blue-700">เบอร์ตู้:</span>
                  <p className="text-xs text-blue-600">{sourceJobOrder.containerNumber || '-'}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-blue-700">เบอร์ซีล:</span>
                  <p className="text-xs text-blue-600">{sourceJobOrder.sealNumber || '-'}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-blue-700">ขนาดตู้:</span>
                  <p className="text-xs text-blue-600">{sourceJobOrder.containerSize || '-'} ฟุต</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-blue-700">สถานที่รับตู้:</span>
                  <p className="text-xs text-blue-600">{sourceJobOrder.pickupLocation || '-'}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-blue-700">สถานที่ส่งตู้:</span>
                  <p className="text-xs text-blue-600">{sourceJobOrder.deliveryLocation || '-'}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-blue-700">สถานที่คืนตู้:</span>
                  <p className="text-xs text-blue-600">{sourceJobOrder.returnLocation || '-'}</p>
                </div>
              </div>
              
              {/* แสดงรายละเอียดค่าใช้จ่ายจากใบสั่งงาน */}
              <div className="mt-3 pt-3 border-t border-blue-200">
                <h4 className="text-xs font-semibold text-blue-800 mb-1">รายละเอียดค่าใช้จ่ายจากใบสั่งงาน:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                  <div>
                    <span className="font-semibold text-blue-700">ค่ารับตู้:</span>
                    <p className="text-blue-600">฿{(parseFloat(sourceJobOrder.pickupFee) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-700">ค่าคืนตู้:</span>
                    <p className="text-blue-600">฿{(parseFloat(sourceJobOrder.returnFee) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-700">ค่าปะยาง:</span>
                    <p className="text-blue-600">฿{(parseFloat(sourceJobOrder.tireFee) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-700">ค่าค้างคืน:</span>
                    <p className="text-blue-600">฿{(parseFloat(sourceJobOrder.overnightFee) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-700">ค่าฝากตู้:</span>
                    <p className="text-blue-600">฿{(parseFloat(sourceJobOrder.storageFee) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-700">ค่าน้ำมัน:</span>
                    <p className="text-blue-600">฿{(parseFloat(sourceJobOrder.fuelFee) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <div className="mt-1 pt-1 border-t border-blue-200">
                  <span className="text-xs font-bold text-blue-800">ยอดรวมจากใบสั่งงาน: ฿{((parseFloat(sourceJobOrder.pickupFee) || 0) + (parseFloat(sourceJobOrder.returnFee) || 0) + (parseFloat(sourceJobOrder.tireFee) || 0) + (parseFloat(sourceJobOrder.overnightFee) || 0) + (parseFloat(sourceJobOrder.storageFee) || 0) + (parseFloat(sourceJobOrder.fuelFee) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </section>
          )}

          <section className="mb-6">
            <table className="w-full border-collapse border border-gray-300 text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-1 text-center text-xs font-semibold">ลำดับ</th>
                  <th className="border border-gray-300 p-1 text-center text-xs font-semibold">วันที่</th>
                  <th className="border border-gray-300 p-1 text-center text-xs font-semibold">รายละเอียด</th>
                  <th className="border border-gray-300 p-1 text-center text-xs font-semibold">ขนาด</th>
                  <th className="border border-gray-300 p-1 text-center text-xs font-semibold">ราคา/เที่ยว</th>
                  <th className="border border-gray-300 p-1 text-center text-xs font-semibold">เงินเบิก</th>
                  <th className="border border-gray-300 p-1 text-center text-xs font-semibold">ค่ารับ+คืนตู้</th>
                  <th className="border border-gray-300 p-1 text-center text-xs font-semibold">ยอดรวม</th>
                </tr>
              </thead>
              <tbody>
                {voucher.items?.map((item, index) => {
                  const itemTotal = (parseFloat(item.pricePerTrip) || 0) + (parseFloat(item.pickupReturnFee) || 0);
                  return (
                    <tr key={index}>
                      <td className="border border-gray-300 p-1 text-center text-xs">{index + 1}</td>
                      <td className="border border-gray-300 p-1 text-center text-xs">{formatDate(item.date)}</td>
                      <td className="border border-gray-300 p-1 text-xs">{item.description}</td>
                      <td className="border border-gray-300 p-1 text-center text-xs">{item.size}</td>
                      <td className="border border-gray-300 p-1 text-right text-xs">{formatCurrency(item.pricePerTrip)}</td>
                      <td className="border border-gray-300 p-1 text-right text-xs">{formatCurrency(item.advancePayment)}</td>
                      <td className="border border-gray-300 p-1 text-right text-xs">{formatCurrency(item.pickupReturnFee)}</td>
                      <td className="border border-gray-300 p-1 text-right text-xs font-semibold">{formatCurrency(itemTotal)}</td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan="4" className="border border-gray-300 p-1 text-center text-xs">รวม</td>
                  <td className="border border-gray-300 p-1 text-right text-xs">{formatCurrency(voucher.subtotal)}</td>
                  <td className="border border-gray-300 p-1 text-right text-xs">{formatCurrency(voucher.totalAdvance)}</td>
                  <td className="border border-gray-300 p-1 text-right text-xs">{formatCurrency(voucher.totalPickupReturn)}</td>
                  <td className="border border-gray-300 p-1 text-right text-xs">{formatCurrency(voucher.subtotal)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="flex justify-end mb-6">
            <div className="w-full max-w-sm space-y-1 text-gray-700 text-xs">
              <div className="flex justify-between">
                <span>ยอดค่าขนส่งรวม:</span>
                <span>{formatCurrency(voucher.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>หัก 1% ค่าขนส่ง:</span>
                <span>-{formatCurrency(voucher.deduction)}</span>
              </div>
              <div className="flex justify-between">
                <span>เงินเบิก:</span>
                <span>-{formatCurrency(voucher.totalAdvance)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-gray-900 border-t-2 border-gray-800 pt-1">
                <span>ยอดจ่ายสุทธิ:</span>
                <span>฿{formatCurrency(voucher.netAmount)}</span>
              </div>
            </div>
          </section>
          
          {/* ข้อมูลธนาคารบริษัท */}
          {(companyInfo.bank_name || companyInfo.bank_account_name || companyInfo.bank_account_number) && (
            <section className="mt-6 p-3 border rounded-lg bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">ข้อมูลบัญชีธนาคารบริษัท</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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

          <footer className="mt-8 border-t pt-6 text-gray-500 text-xs">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p><strong>วิธีการชำระเงิน:</strong> {voucher.paymentMethod}</p>
                <p><strong>ธนาคาร:</strong> {voucher.bankName}</p>
                {sourceJobOrder && (
                  <>
                    <p><strong>อ้างอิงใบสั่งงาน:</strong> {sourceJobOrder.jobOrderNumber}</p>
                    <p><strong>วันที่ใบสั่งงาน:</strong> {formatDate(sourceJobOrder.date)}</p>
                  </>
                )}
              </div>
              <div className="text-right">
                {companyInfo.signature_url && (
                  <div className="mb-2">
                    <img 
                      src={companyInfo.signature_url} 
                      alt="ลายเซ็น" 
                      className="h-12 object-contain mx-auto"
                    />
                  </div>
                )}
                <p className="mt-8 border-t border-dotted border-gray-500 pt-1">ลงชื่อผู้จ่าย</p>
              </div>
            </div>
            {voucher.notes && <p className="mt-3"><strong>หมายเหตุ:</strong> {voucher.notes}</p>}
            
            {/* แสดงข้อมูลเพิ่มเติมสำหรับใบสำคัญจ่ายที่สร้างจากบวกยอดผิด */}
            {sourceJobOrder && (
              <div className="mt-4 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-600 mb-1"><strong>ข้อมูลเพิ่มเติม:</strong></p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs text-gray-600">
                  <p><strong>เบอร์บุ๊คกิ้ง:</strong> {sourceJobOrder.bookingNumber || '-'}</p>
                  <p><strong>เอเย่นต์:</strong> {sourceJobOrder.agent || '-'}</p>
                  <p><strong>วันที่รับตู้:</strong> {formatDate(sourceJobOrder.pickupDate)}</p>
                  <p><strong>วันที่ส่งตู้:</strong> {formatDate(sourceJobOrder.deliveryDate)}</p>
                  <p><strong>วันที่คืนตู้:</strong> {formatDate(sourceJobOrder.returnDate)}</p>
                  <p><strong>คำสั่งพิเศษ:</strong> {sourceJobOrder.specialInstructions || '-'}</p>
                </div>
              </div>
            )}
          </footer>
        </div>
      </div>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .payment-voucher-print-area, .payment-voucher-print-area * {
            visibility: visible;
          }
          .payment-voucher-print-area {
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
            font-size: ${pageSettings.fontSize === 'small' ? '0.875rem' : 
                        pageSettings.fontSize === 'large' ? '1.125rem' : '1rem'};
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

export default PaymentVoucherPreview; 