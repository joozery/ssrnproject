# ปัญหาใบเสนอราคา - การเรียกใช้ฐานข้อมูล

## สรุปปัญหา

หน้าใบเสนอราคาไม่ได้แสดงข้อมูลจากฐานข้อมูล เนื่องจาก:

1. **โครงสร้างฐานข้อมูล**: มีตาราง `quotations` ที่เก็บทั้งใบเสนอราคาและใบแจ้งหนี้ (แยกตาม field `type`)
2. **การเรียกใช้ API**: หน้าใบเสนอราคาเรียกใช้ `/quotations?type=quotation` ซึ่งถูกต้อง
3. **ข้อมูลในฐานข้อมูล**: อาจไม่มีข้อมูลตัวอย่างในตาราง `quotations`

## โครงสร้างฐานข้อมูล

### ตาราง quotations
```sql
CREATE TABLE quotations (
    id VARCHAR(50) PRIMARY KEY,
    quotation_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id VARCHAR(50),
    issue_date DATE NOT NULL,
    due_date DATE,
    subject VARCHAR(255),
    notes TEXT,
    internal_notes TEXT,
    subtotal DECIMAL(10,2) DEFAULT 0,
    vat_amount DECIMAL(10,2) DEFAULT 0,
    withholding_tax DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    status ENUM('draft', 'sent', 'approved', 'rejected') DEFAULT 'draft',
    type ENUM('quotation', 'invoice', 'receipt') DEFAULT 'quotation',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### ตาราง invoices (แยกต่างหาก)
```sql
CREATE TABLE invoices (
    id VARCHAR(50) PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id VARCHAR(50),
    issue_date DATE NOT NULL,
    due_date DATE,
    subject VARCHAR(255),
    notes TEXT,
    internal_notes TEXT,
    subtotal DECIMAL(10,2) DEFAULT 0,
    vat_amount DECIMAL(10,2) DEFAULT 0,
    withholding_tax DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
    type ENUM('invoice', 'receipt') DEFAULT 'invoice',
    payment_method VARCHAR(50) DEFAULT 'โอนเข้าบัญชี',
    payment_date DATE,
    reference_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## การเรียกใช้ API

### หน้าใบเสนอราคา (QuotationManagement.jsx)
```javascript
// เรียกใช้ API เพื่อดึงข้อมูลใบเสนอราคา
const response = await api.get('/quotations?type=quotation');
```

### หน้าใบแจ้งหนี้ (InvoiceManagement.jsx)
```javascript
// เรียกใช้ API เพื่อดึงข้อมูลใบแจ้งหนี้
const response = await api.get('/invoices');
```

## วิธีแก้ไข

### 1. ตรวจสอบข้อมูลในฐานข้อมูล
```bash
cd backendssr
node scripts/check-quotations.js
```

### 2. เพิ่มข้อมูลตัวอย่าง
```bash
cd backendssr
node scripts/add-sample-quotations.js
```

### 3. ทดสอบ API
```bash
cd backendssr
node scripts/test-quotations-api.js
```

### 4. รัน Migration (ถ้าจำเป็น)
```bash
cd backendssr
node scripts/run-migration.js
```

## สาเหตุที่เป็นไปได้

1. **ไม่มีข้อมูลในตาราง quotations**: ต้องเพิ่มข้อมูลตัวอย่าง
2. **API ไม่ทำงาน**: ตรวจสอบ backend server
3. **การเชื่อมต่อฐานข้อมูล**: ตรวจสอบการเชื่อมต่อ MySQL
4. **CORS issues**: ตรวจสอบการตั้งค่า CORS ใน backend

## การตรวจสอบ

### ตรวจสอบข้อมูลในตาราง
```sql
-- ตรวจสอบใบเสนอราคา
SELECT * FROM quotations WHERE type = 'quotation';

-- ตรวจสอบใบแจ้งหนี้ในตาราง quotations
SELECT * FROM quotations WHERE type = 'invoice';

-- ตรวจสอบใบแจ้งหนี้ในตาราง invoices
SELECT * FROM invoices;
```

### ตรวจสอบ API Response
```bash
curl http://localhost:3001/quotations?type=quotation
curl http://localhost:3001/invoices
```

## หมายเหตุ

- ตาราง `quotations` ใช้เก็บทั้งใบเสนอราคาและใบแจ้งหนี้ (แยกตาม field `type`)
- ตาราง `invoices` เป็นตารางแยกสำหรับใบแจ้งหนี้
- หน้าใบเสนอราคาควรเรียกใช้ `/quotations?type=quotation`
- หน้าใบแจ้งหนี้ควรเรียกใช้ `/invoices` 