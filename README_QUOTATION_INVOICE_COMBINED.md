# การรวมข้อมูลใบเสนอราคาและใบแจ้งหนี้

## สรุปการเปลี่ยนแปลง

หน้าใบเสนอราคา (QuotationManagement) ได้รับการปรับปรุงให้แสดงข้อมูลทั้งใบเสนอราคาและใบแจ้งหนี้ในหน้าเดียว

## การทำงานใหม่

### 📊 **การดึงข้อมูล**
```javascript
// ดึงข้อมูลจากทั้งสองตาราง
const quotationsResponse = await api.get('/quotations');
const invoicesResponse = await api.get('/invoices');

// รวมข้อมูลและแปลงให้มี format เดียวกัน
let allDocuments = [];

// แปลงข้อมูลจาก quotations
const quotations = quotationsResponse.data.data.map(q => ({
  ...q,
  docNumber: q.quotation_number,
  invoiceNumber: q.quotation_number,
  source: 'quotations'
}));

// แปลงข้อมูลจาก invoices
const invoices = invoicesResponse.data.data.map(inv => ({
  ...inv,
  quotation_number: inv.invoice_number,
  docNumber: inv.invoice_number,
  invoiceNumber: inv.invoice_number,
  source: 'invoices'
}));

allDocuments = [...quotations, ...invoices];
```

### 🔧 **การจัดการเอกสาร**

#### การแก้ไข (Edit)
```javascript
// ตรวจสอบว่าเอกสารมาจากตารางไหน
const isFromInvoices = quotation.source === 'invoices';
const endpoint = isFromInvoices ? `/invoices/${quotation.id}` : `/quotations/${quotation.id}`;
```

#### การลบ (Delete)
```javascript
// ตรวจสอบและลบจากตารางที่ถูกต้อง
const isFromInvoices = quotation.source === 'invoices';
const endpoint = isFromInvoices ? `/invoices/${quotation.id}` : `/quotations/${quotation.id}`;
```

#### การบันทึก (Save)
```javascript
// สร้างเอกสารใหม่
if (documentType === 'invoice') {
  // บันทึกลงตาราง invoices
  await api.post('/invoices', invoiceApiData);
} else {
  // บันทึกลงตาราง quotations
  await api.post('/quotations', apiData);
}

// แก้ไขเอกสาร
const isFromInvoices = selectedQuotation?.source === 'invoices';
const endpoint = isFromInvoices ? `/invoices/${selectedQuotation.id}` : `/quotations/${selectedQuotation.id}`;
```

### 🎨 **การแสดงผล**

#### สถิติ
- **มูลค่าที่อนุมัติแล้ว**: รวมจากเอกสารที่มี status = 'approved'
- **มูลค่าที่ชำระแล้ว**: รวมจากเอกสารที่มี status = 'paid'
- **เอกสารทั้งหมด**: จำนวนเอกสารทั้งหมด

#### สถานะ
```javascript
const getStatusColor = (status) => {
  const colors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || colors.draft;
};
```

#### ประเภทเอกสาร
```javascript
const getTypeLabel = (type) => {
  const typeLabels = {
    quotation: 'ใบเสนอราคา',
    invoice: 'ใบแจ้งหนี้',
    receipt: 'ใบเสร็จรับเงิน'
  };
  return typeLabels[type] || 'ใบเสนอราคา';
};
```

## โครงสร้างข้อมูล

### ข้อมูลที่รวม
```javascript
{
  id: "quo_001",
  quotation_number: "QUO202412001",
  invoice_number: "QUO202412001", // สำหรับ invoices
  docNumber: "QUO202412001",
  customer_id: "cust_001",
  issue_date: "2024-12-01",
  due_date: "2024-12-31",
  subject: "บริการขนส่งสินค้า",
  notes: "บริการขนส่งสินค้าจากท่าเรือไปยังโกดัง",
  subtotal: 50000.00,
  vat_amount: 3500.00,
  total_amount: 53500.00,
  status: "approved",
  type: "quotation",
  source: "quotations", // หรือ "invoices"
  items: [...]
}
```

## ประโยชน์

1. **แสดงข้อมูลครบถ้วน**: ผู้ใช้เห็นทั้งใบเสนอราคาและใบแจ้งหนี้ในหน้าเดียว
2. **การจัดการง่าย**: แก้ไข ลบ ดูข้อมูลได้จากหน้าเดียว
3. **ติดตามสถานะ**: เห็นการเปลี่ยนแปลงจากใบเสนอราคาเป็นใบแจ้งหนี้
4. **สถิติรวม**: มูลค่าและจำนวนเอกสารรวมทั้งหมด

## การใช้งาน

1. **สร้างเอกสารใหม่**: คลิก "สร้างเอกสาร" และเลือกประเภท
2. **แก้ไขเอกสาร**: คลิกปุ่มแก้ไขบนการ์ดเอกสาร
3. **ดูรายละเอียด**: คลิกปุ่มดูบนการ์ดเอกสาร
4. **ลบเอกสาร**: คลิกปุ่มลบบนการ์ดเอกสาร
5. **ค้นหา**: ใช้ช่องค้นหาเพื่อหาตามเลขที่หรือชื่อลูกค้า

## หมายเหตุ

- ข้อมูลจะถูกเรียงตามวันที่ล่าสุด
- การแสดงผลจะแยกประเภทเอกสารด้วยสีและป้ายกำกับ
- การบันทึกจะไปยังตารางที่ถูกต้องตามประเภทเอกสาร
- การแก้ไขและลบจะทำงานกับตารางต้นฉบับของเอกสารนั้น 