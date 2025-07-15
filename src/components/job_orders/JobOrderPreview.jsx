import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Printer } from 'lucide-react';

const JobOrderPreview = React.forwardRef(({ jobOrder, customer, driver, vehicle, companyInfo, onPrint, onClose }, ref) => {

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '-';
    return amount.toLocaleString('th-TH');
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-start z-50 overflow-auto p-4 print:bg-white print:p-0">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl my-8 relative print:shadow-none print:my-0 print:rounded-none">
        <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-lg print:hidden">
          <h2 className="text-xl font-bold">ตัวอย่างใบสั่งงาน</h2>
          <div className="flex items-center gap-2">
            <Button onClick={onPrint}>
              <Printer className="mr-2 h-4 w-4" /> ยืนยันการพิมพ์
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div ref={ref} className="p-8 md:p-12 job-order-print-area font-sans text-sm">
          <header className="grid grid-cols-3 gap-4 mb-6">
            <div className="col-span-1">
              {companyInfo.logoUrl && <img src={companyInfo.logoUrl} alt="Company Logo" className="h-16 object-contain" />}
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
            <p><strong>เล่มที่:</strong> {jobOrder.jobOrderVolume || '....................'}</p>
            <p><strong>เลขที่:</strong> {jobOrder.jobOrderNumber || '....................'}</p>
            <p><strong>วันที่:</strong> {formatDate(jobOrder.date)}</p>
          </div>

          <div className="border-2 border-gray-300 p-4 rounded-md">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <p><strong>ลูกค้า:</strong> {customer?.name || '....................'}</p>
              <p><strong>เบอร์ซีล:</strong> {jobOrder.sealNumber || '....................'}</p>
              <p><strong>เบอร์ตู้:</strong> {jobOrder.containerNumber || '....................'}</p>
              <p><strong>ขนาดตู้:</strong> {jobOrder.containerSize ? `${jobOrder.containerSize} ฟุต` : '....................'}</p>
              <p><strong>เอเย่นต์:</strong> {jobOrder.agent || '....................'}</p>
              <p><strong>เบอร์บุ๊คกิ้ง:</strong> {jobOrder.bookingNumber || '....................'}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2">
              <p><strong>สถานที่รับตู้:</strong> {jobOrder.pickupLocation || '....................'}</p>
              <p><strong>วันที่:</strong> {formatDate(jobOrder.pickupDate)}</p>
              <p><strong>สถานที่ส่งตู้:</strong> {jobOrder.deliveryLocation || '....................'}</p>
              <p><strong>วันที่:</strong> {formatDate(jobOrder.deliveryDate)}</p>
              <p><strong>สถานที่คืนตู้:</strong> {jobOrder.returnLocation || '....................'}</p>
              <p><strong>วันที่:</strong> {formatDate(jobOrder.returnDate)}</p>
            </div>
            <div className="mt-2">
              <p><strong>คำสั่งพิเศษ:</strong> {jobOrder.specialInstructions || '....................'}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2">
              <p><strong>พนักงานขับรถ:</strong> {driver?.name || '....................'}</p>
              <p><strong>ทะเบียนรถ:</strong> {vehicle?.licensePlate || '....................'}</p>
            </div>
            <div className="mt-2">
              <p><strong>ที่อยู่ออกใบเสร็จ:</strong> {jobOrder.invoiceAddress || '....................'}</p>
            </div>
          </div>

          <div className="mt-4 border-2 border-gray-300 rounded-md">
            <h3 className="text-center font-bold bg-gray-200 p-1 rounded-t-md">โปรดกรอกค่าใช้จ่าย</h3>
            <div className="p-4 grid grid-cols-3 gap-x-8 gap-y-2">
              <p><strong>ค่ารับตู้:</strong> {formatCurrency(jobOrder.pickupFee)}</p>
              <p><strong>ค่าคืนตู้:</strong> {formatCurrency(jobOrder.returnFee)}</p>
              <p><strong>ค่าปะยาง:</strong> {formatCurrency(jobOrder.tireFee)}</p>
              <p><strong>ค่าค้างคืน:</strong> {formatCurrency(jobOrder.overnightFee)}</p>
              <p><strong>ค่าฝากตู้:</strong> {formatCurrency(jobOrder.storageFee)}</p>
              <p><strong>ค่าน้ำมัน:</strong> {formatCurrency(jobOrder.fuelFee)}</p>
            </div>
          </div>

          <footer className="mt-12 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="mt-12 border-t border-dotted border-gray-500 pt-1">ลงชื่อพนักงานขับรถ</p>
            </div>
            <div>
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
            position: absolute; left: 0; top: 0; width: 100%; height: auto; 
            font-family: 'Prompt', sans-serif;
          }
        }
      `}</style>
    </div>
  );
});

export default JobOrderPreview;