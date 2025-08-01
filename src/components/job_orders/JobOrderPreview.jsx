import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Printer, ZoomIn, ZoomOut, RotateCw, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const JobOrderPreview = React.forwardRef(({ jobOrder, customer, driver, vehicle, companyInfo, onPrint, onClose }, ref) => {
  const [logoSize, setLogoSize] = useState(96); // ขนาดโลโก้เริ่มต้น (px)
  const [showSettings, setShowSettings] = useState(false);
  
  // Convert backend field names to frontend field names for display
  const convertJobOrderData = (data) => {
    if (!data) return {};
    return {
      jobOrderNumber: data.job_order_number,
      jobOrderVolume: data.job_order_volume,
      date: data.date,
      customerId: data.customer_id,
      containerNumber: data.container_number,
      sealNumber: data.seal_number,
      agent: data.agent,
      bookingNumber: data.booking_number,
      containerSize: data.container_size,
      pickupLocation: data.pickup_location,
      pickupDate: data.pickup_date,
      deliveryLocation: data.delivery_location,
      deliveryDate: data.delivery_date,
      returnLocation: data.return_location,
      returnDate: data.return_date,
      specialInstructions: data.special_instructions,
      driverId: data.driver_id,
      vehicleId: data.vehicle_id,
      invoiceAddress: data.invoice_address,
      pickupFee: data.pickup_fee,
      returnFee: data.return_fee,
      tireFee: data.tire_fee,
      overnightFee: data.overnight_fee,
      storageFee: data.storage_fee,
      fuelFee: data.fuel_fee,
      status: data.status
    };
  };
  
  const [previewData, setPreviewData] = useState(convertJobOrderData(jobOrder));
  const [pageSettings, setPageSettings] = useState({
    pageSize: 'A4',
    orientation: 'portrait',
    margin: 'normal',
    fontSize: 'normal'
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '-';
    return amount.toLocaleString('th-TH');
  };

  const handleLogoSizeChange = (newSize) => {
    setLogoSize(Math.max(48, Math.min(300, newSize))); // จำกัดขนาดระหว่าง 48-300px
  };

  const handleDataChange = (field, value) => {
    setPreviewData(prev => ({ ...prev, [field]: value }));
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
  };

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
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl my-8 relative print:shadow-none print:my-0 print:rounded-none">
        <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-lg print:hidden">
          <h2 className="text-xl font-bold">ตัวอย่างใบสั่งงาน</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="mr-2 h-4 w-4" /> ตั้งค่า
            </Button>
            <Button onClick={onPrint}>
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
              <Button variant="outline" size="sm" onClick={resetPageSettings}>
                <RotateCw className="mr-2 h-4 w-4" /> รีเซ็ต
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="logoSize">ขนาดโลโก้ (px)</Label>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleLogoSizeChange(logoSize - 12)}
                    disabled={logoSize <= 48}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Input 
                    id="logoSize" 
                    type="number" 
                    value={logoSize} 
                    onChange={(e) => handleLogoSizeChange(parseInt(e.target.value) || 96)}
                    className="w-20 text-center"
                    min="48"
                    max="300"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleLogoSizeChange(logoSize + 12)}
                    disabled={logoSize >= 300}
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
                  ตัวอักษร: {pageSettings.fontSize === 'small' ? 'เล็ก' : pageSettings.fontSize === 'large' ? 'ใหญ่' : 'ปกติ'}
                </div>
              </div>
              <div>
                <Label htmlFor="jobOrderNumber">เลขที่ใบสั่งงาน</Label>
                <Input 
                  id="jobOrderNumber" 
                  value={previewData.jobOrderNumber || ''} 
                  onChange={(e) => handleDataChange('jobOrderNumber', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="jobOrderVolume">เล่มที่</Label>
                <Input 
                  id="jobOrderVolume" 
                  value={previewData.jobOrderVolume || ''} 
                  onChange={(e) => handleDataChange('jobOrderVolume', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="containerNumber">เบอร์ตู้</Label>
                <Input 
                  id="containerNumber" 
                  value={previewData.containerNumber || ''} 
                  onChange={(e) => handleDataChange('containerNumber', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div>
                <Label htmlFor="sealNumber">เบอร์ซีล</Label>
                <Input 
                  id="sealNumber" 
                  value={previewData.sealNumber || ''} 
                  onChange={(e) => handleDataChange('sealNumber', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bookingNumber">เบอร์บุ๊คกิ้ง</Label>
                <Input 
                  id="bookingNumber" 
                  value={previewData.bookingNumber || ''} 
                  onChange={(e) => handleDataChange('bookingNumber', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="agent">เอเย่นต์</Label>
                <Input 
                  id="agent" 
                  value={previewData.agent || ''} 
                  onChange={(e) => handleDataChange('agent', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="invoiceAddress">ที่อยู่ออกใบเสร็จ</Label>
                <Input 
                  id="invoiceAddress" 
                  value={previewData.invoiceAddress || ''} 
                  onChange={(e) => handleDataChange('invoiceAddress', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        <div 
          ref={ref} 
          className="job-order-print-area font-sans"
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
          <header className="grid grid-cols-3 gap-4 mb-6">
            <div className="col-span-1">
              {companyInfo.logoUrl && (
                <img 
                  src={companyInfo.logoUrl} 
                  alt="Company Logo" 
                  style={{ height: `${logoSize}px` }}
                  className="object-contain" 
                />
              )}
            </div>
            <div className="col-span-2 text-left">
              <h1 className="text-lg font-bold">{companyInfo.name}</h1>
              <p>{companyInfo.address}, {companyInfo.city}</p>
              <p>โทร: {companyInfo.phone} เลขประจำตัวผู้เสียภาษี: {companyInfo.taxId}</p>
              <p>EMAIL: {companyInfo.email}</p>
            </div>
          </header>
          
          <div className="text-center mb-4 border-y-2 border-black py-1">
            <h2 className="text-xl font-bold">ใบสั่งงาน / JOB ORDER</h2>
          </div>

          <div className="grid grid-cols-3 gap-x-4 mb-4">
            <p><strong>เล่มที่:</strong> {previewData.jobOrderVolume || '....................'}</p>
            <p><strong>เลขที่:</strong> {previewData.jobOrderNumber || '....................'}</p>
            <p><strong>วันที่:</strong> {formatDate(previewData.date)}</p>
          </div>

          <div className="border-2 border-gray-300 p-4 rounded-md">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <p><strong>ลูกค้า:</strong> {customer?.name || '....................'}</p>
              <p><strong>เบอร์ซีล:</strong> {previewData.sealNumber || '....................'}</p>
              <p><strong>เบอร์ตู้:</strong> {previewData.containerNumber || '....................'}</p>
              <p><strong>ขนาดตู้:</strong> {previewData.containerSize ? `${previewData.containerSize} ฟุต` : '....................'}</p>
              <p><strong>เอเย่นต์:</strong> {previewData.agent || '....................'}</p>
              <p><strong>เบอร์บุ๊คกิ้ง:</strong> {previewData.bookingNumber || '....................'}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2">
              <p><strong>สถานที่รับตู้:</strong> {previewData.pickupLocation || '....................'}</p>
              <p><strong>วันที่:</strong> {formatDate(previewData.pickupDate)}</p>
              <p><strong>สถานที่ส่งตู้:</strong> {previewData.deliveryLocation || '....................'}</p>
              <p><strong>วันที่:</strong> {formatDate(previewData.deliveryDate)}</p>
              <p><strong>สถานที่คืนตู้:</strong> {previewData.returnLocation || '....................'}</p>
              <p><strong>วันที่:</strong> {formatDate(previewData.returnDate)}</p>
            </div>
            <div className="mt-2">
              <p><strong>คำสั่งพิเศษ:</strong> {previewData.specialInstructions || '....................'}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2">
              <p><strong>พนักงานขับรถ:</strong> {driver?.name || '....................'}</p>
              <p><strong>ทะเบียนรถ:</strong> {vehicle?.license_plate || '....................'}</p>
            </div>
            <div className="mt-2">
              <p><strong>ที่อยู่ออกใบเสร็จ:</strong> {previewData.invoiceAddress || '....................'}</p>
            </div>
          </div>

          <div className="mt-4 border-2 border-gray-300 rounded-md">
            <h3 className="text-center font-bold bg-gray-200 p-1 rounded-t-md">โปรดกรอกค่าใช้จ่าย</h3>
            <div className="p-4 grid grid-cols-3 gap-x-8 gap-y-2">
              <p><strong>ค่ารับตู้:</strong> {formatCurrency(previewData.pickupFee)}</p>
              <p><strong>ค่าคืนตู้:</strong> {formatCurrency(previewData.returnFee)}</p>
              <p><strong>ค่าปะยาง:</strong> {formatCurrency(previewData.tireFee)}</p>
              <p><strong>ค่าค้างคืน:</strong> {formatCurrency(previewData.overnightFee)}</p>
              <p><strong>ค่าฝากตู้:</strong> {formatCurrency(previewData.storageFee)}</p>
              <p><strong>ค่าน้ำมัน:</strong> {formatCurrency(previewData.fuelFee)}</p>
            </div>
          </div>

          {/* ข้อมูลธนาคาร */}
          {(companyInfo.bank_name || companyInfo.bank_account_name || companyInfo.bank_account_number) && (
            <div className="mt-6 p-3 border rounded-md bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">ข้อมูลการชำระเงิน</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
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
            </div>
          )}

          <footer className="mt-12 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="mt-12 border-t border-dotted border-gray-500 pt-1">ลงชื่อพนักงานขับรถ</p>
            </div>
            <div>
              {companyInfo.signature_url && (
                <div className="mb-2">
                  <img 
                    src={companyInfo.signature_url} 
                    alt="ลายเซ็น" 
                    className="h-12 object-contain mx-auto"
                  />
                </div>
              )}
              <p className="mt-12 border-t border-dotted border-gray-500 pt-1">ลงชื่อผู้สั่งงาน</p>
            </div>
            <div>
              <p className="mt-12 border-t border-dotted border-gray-500 pt-1">ลูกค้า/ตัวแทน</p>
            </div>
          </footer>
        </div>
      </div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .job-order-print-area, .job-order-print-area * { visibility: visible; }
          .job-order-print-area { 
            position: absolute; left: 0; top: 0; 
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
        }
      `}</style>
    </div>
  );
});

export default JobOrderPreview;