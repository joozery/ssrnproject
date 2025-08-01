# การแก้ไขหน้าใบเสนอราคาให้แสดงเฉพาะข้อมูลใบเสนอราคา

## สรุปการเปลี่ยนแปลง

ได้แก้ไขหน้าใบเสนอราคา (QuotationManagement) ให้แสดงเฉพาะข้อมูลใบเสนอราคาเท่านั้น ไม่รวมข้อมูลใบแจ้งหนี้

## การเปลี่ยนแปลงหลัก

### 📊 **การดึงข้อมูล**
```javascript
// เดิม: ดึงข้อมูลจากทั้งสองตาราง
const quotationsResponse = await api.get('/quotations');
const invoicesResponse = await api.get('/invoices');

// ใหม่: ดึงเฉพาะใบเสนอราคา
const response = await api.get('/quotations?type=quotation');
```

### 🔧 **การจัดการเอกสาร**

#### การแก้ไข (Edit)
```javascript
// เดิม: ตรวจสอบแหล่งข้อมูล
const isFromInvoices = quotation.source === 'invoices';
const endpoint = isFromInvoices ? `/invoices/${quotation.id}` : `/quotations/${quotation.id}`;

// ใหม่: ใช้เฉพาะ quotations
const response = await api.get(`/quotations/${quotation.id}`);
```

#### การลบ (Delete)
```javascript
// เดิม: ตรวจสอบแหล่งข้อมูล
const isFromInvoices = quotation.source === 'invoices';
const endpoint = isFromInvoices ? `/invoices/${quotation.id}` : `/quotations/${quotation.id}`;

// ใหม่: ใช้เฉพาะ quotations
const response = await api.delete(`/quotations/${quotation.id}`);
```

#### การบันทึก (Save)
```javascript
// เดิม: รองรับทั้งใบเสนอราคาและใบแจ้งหนี้
if (documentType === 'invoice') {
  await api.post('/invoices', invoiceApiData);
} else {
  await api.post('/quotations', apiData);
}

// ใหม่: สร้างเฉพาะใบเสนอราคา
const response = await api.post('/quotations', apiData);
```

### 🎨 **การแสดงผล**

#### UI Elements
```javascript
// เดิม
title: "เอกสาร"
description: "สร้างและจัดการใบเสนอราคาและใบแจ้งหนี้สำหรับลูกค้าของคุณ"
button: "สร้างเอกสาร"

// ใหม่
title: "ใบเสนอราคา"
description: "สร้างและจัดการใบเสนอราคาสำหรับลูกค้าของคุณ"
button: "สร้างใบเสนอราคา"
```

#### สถิติ
```javascript
// เดิม
{ title: 'มูลค่าที่ชำระแล้ว', value: totalPaidValue }
{ title: 'เอกสารทั้งหมด', value: quotations.length }

// ใหม่
{ title: 'รอการตอบกลับ', value: quotations.filter(q => q.status === 'sent').length }
{ title: 'ใบเสนอราคาทั้งหมด', value: quotations.length }
```

#### สถานะ
```javascript
// เดิม: รองรับสถานะของใบแจ้งหนี้
pending: 'รอชำระ',
paid: 'ชำระแล้ว',
overdue: 'เกินกำหนด',
cancelled: 'ยกเลิก'

// ใหม่: เฉพาะสถานะของใบเสนอราคา
draft: 'แบบร่าง',
sent: 'ส่งแล้ว',
approved: 'อนุมัติแล้ว',
rejected: 'ปฏิเสธ'
```

### 📋 **การแสดงรายละเอียด**
```javascript
// เดิม: รองรับทั้งสองประเภท
title: `${typeLabel} - ${documentNumber}`

// ใหม่: เฉพาะใบเสนอราคา
title: `ใบเสนอราคา - ${quotationNumber}`
```

## ประโยชน์

1. **ความชัดเจน**: หน้าใบเสนอราคาแสดงเฉพาะข้อมูลที่เกี่ยวข้อง
2. **ประสิทธิภาพ**: ลดการโหลดข้อมูลที่ไม่จำเป็น
3. **ความเรียบง่าย**: UI และ UX ที่เข้าใจง่าย
4. **การแยกหน้าที่**: หน้าใบเสนอราคาและใบแจ้งหนี้แยกกันชัดเจน

## การทำงานใหม่

### การดึงข้อมูล
- เรียกใช้ API `/quotations?type=quotation`
- แสดงเฉพาะข้อมูลที่มี `type = 'quotation'`
- ไม่รวมข้อมูลจากตาราง `invoices`

### การจัดการ
- **สร้าง**: สร้างในตาราง `quotations` เท่านั้น
- **แก้ไข**: แก้ไขในตาราง `quotations` เท่านั้น
- **ลบ**: ลบจากตาราง `quotations` เท่านั้น
- **ดู**: แสดงรายละเอียดจากตาราง `quotations` เท่านั้น

### การแสดงผล
- **ชื่อหน้า**: "ใบเสนอราคา"
- **ปุ่ม**: "สร้างใบเสนอราคา"
- **สถิติ**: มูลค่าที่อนุมัติแล้ว, รอการตอบกลับ, ใบเสนอราคาทั้งหมด
- **สถานะ**: แบบร่าง, ส่งแล้ว, อนุมัติแล้ว, ปฏิเสธ

## หมายเหตุ

- หน้าใบแจ้งหนี้ (InvoiceManagement) ยังคงแสดงเฉพาะข้อมูลใบแจ้งหนี้
- การแยกหน้าที่ทำให้ระบบมีความชัดเจนและใช้งานง่าย
- SweetAlert2 ยังคงทำงานเหมือนเดิม แต่แสดงข้อความเฉพาะใบเสนอราคา 