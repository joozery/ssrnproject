# ระบบจัดการใบเสร็จรับเงิน (Receipt Management)

## ภาพรวม
ระบบจัดการใบเสร็จรับเงินเป็นส่วนหนึ่งของระบบขนส่งที่ช่วยให้คุณสามารถสร้าง จัดการ และติดตามใบเสร็จรับเงินจากลูกค้าได้อย่างมีประสิทธิภาพ

## คุณสมบัติหลัก

### 1. การสร้างใบเสร็จรับเงิน
- สร้างใบเสร็จรับเงินใหม่
- เลือกลูกค้าจากรายชื่อที่มีอยู่
- เชื่อมโยงกับใบแจ้งหนี้ (ไม่บังคับ)
- ระบุวิธีชำระเงิน (เงินสด, โอนเงิน, เช็ค, บัตรเครดิต, อื่นๆ)
- กำหนดสถานะ (แบบร่าง, ออกแล้ว, ชำระแล้ว, ยกเลิก)

### 2. การแสดงผลข้อมูล
- **Card View**: แสดงข้อมูลในรูปแบบการ์ดที่สวยงาม
- **Table View**: แสดงข้อมูลในรูปแบบตารางที่ครบถ้วน
- ค้นหาด้วยเลขที่ใบเสร็จหรือชื่อลูกค้า
- เรียงลำดับตามวันที่ล่าสุด

### 3. การจัดการข้อมูล
- แก้ไขใบเสร็จรับเงิน
- ลบใบเสร็จรับเงิน
- ดูตัวอย่างใบเสร็จรับเงิน
- พิมพ์ใบเสร็จรับเงิน

### 4. สถิติและรายงาน
- ยอดชำระรวม
- จำนวนใบเสร็จที่ออกแล้ว
- จำนวนใบเสร็จทั้งหมด

## โครงสร้างไฟล์

### Frontend Components
```
src/components/receipts/
├── ReceiptManagement.jsx    # หน้าหลักจัดการใบเสร็จรับเงิน
├── ReceiptCard.jsx         # การ์ดแสดงข้อมูลใบเสร็จรับเงิน
├── ReceiptTable.jsx        # ตารางแสดงข้อมูลใบเสร็จรับเงิน
├── ReceiptForm.jsx         # ฟอร์มสร้าง/แก้ไขใบเสร็จรับเงิน
└── ReceiptPreview.jsx      # ตัวอย่างใบเสร็จรับเงิน
```

### Backend API
```
backendssr/routes/
└── receipts.js             # API endpoints สำหรับใบเสร็จรับเงิน

backendssr/db/
└── migration_add_receipts_table.sql  # Migration script
```

## API Endpoints

### GET /api/receipts
- ดึงข้อมูลใบเสร็จรับเงินทั้งหมด
- รวมข้อมูลลูกค้าและใบแจ้งหนี้

### GET /api/receipts/:id
- ดึงข้อมูลใบเสร็จรับเงินตาม ID

### POST /api/receipts
- สร้างใบเสร็จรับเงินใหม่

### PUT /api/receipts/:id
- อัปเดตข้อมูลใบเสร็จรับเงิน

### DELETE /api/receipts/:id
- ลบใบเสร็จรับเงิน

### GET /api/receipts/stats/overview
- ดึงสถิติใบเสร็จรับเงิน

## โครงสร้างฐานข้อมูล

### ตาราง receipts
```sql
CREATE TABLE receipts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  receipt_number VARCHAR(50) UNIQUE,
  customer_id INT NOT NULL,
  invoice_id INT,
  issue_date DATE,
  payment_date DATE,
  payment_method ENUM('cash', 'bank_transfer', 'check', 'credit_card', 'other'),
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  description TEXT,
  status ENUM('draft', 'issued', 'paid', 'cancelled') DEFAULT 'issued',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
);
```

## การใช้งาน

### 1. การเข้าถึงหน้าใบเสร็จรับเงิน
- คลิกที่เมนู "ใบเสร็จรับเงิน" ในแถบด้านข้าง

### 2. การสร้างใบเสร็จรับเงินใหม่
- คลิกปุ่ม "สร้างใบเสร็จใหม่"
- กรอกข้อมูลที่จำเป็น:
  - เลือกลูกค้า (บังคับ)
  - เลือกใบแจ้งหนี้ (ไม่บังคับ)
  - ระบุจำนวนเงิน (บังคับ)
  - เลือกวิธีชำระเงิน
  - กำหนดวันที่ออกและวันที่ชำระ
- คลิก "สร้าง" เพื่อบันทึก

### 3. การแก้ไขใบเสร็จรับเงิน
- คลิกปุ่ม "แก้ไข" ในการ์ดหรือตาราง
- แก้ไขข้อมูลที่ต้องการ
- คลิก "อัปเดต" เพื่อบันทึก

### 4. การดูตัวอย่างใบเสร็จรับเงิน
- คลิกปุ่ม "ดู" ในการ์ดหรือตาราง
- ดูตัวอย่างใบเสร็จรับเงินที่สวยงาม
- คลิก "พิมพ์" เพื่อพิมพ์ใบเสร็จรับเงิน

### 5. การลบใบเสร็จรับเงิน
- คลิกปุ่ม "ลบ" ในการ์ดหรือตาราง
- ยืนยันการลบ

## การติดตั้งและรัน Migration

### 1. รัน Migration Script
```bash
cd backendssr
node scripts/run-receipts-migration.js
```

### 2. ตรวจสอบการสร้างตาราง
```bash
mysql -u your_username -p your_database_name
SHOW TABLES LIKE 'receipts';
SELECT COUNT(*) FROM receipts;
```

## การปรับแต่ง

### 1. การเพิ่มวิธีชำระเงินใหม่
แก้ไขใน `ReceiptForm.jsx`:
```javascript
const paymentMethods = [
  { value: 'cash', label: 'เงินสด' },
  { value: 'bank_transfer', label: 'โอนเงิน' },
  { value: 'check', label: 'เช็ค' },
  { value: 'credit_card', label: 'บัตรเครดิต' },
  { value: 'other', label: 'อื่นๆ' },
  { value: 'new_method', label: 'วิธีใหม่' }  // เพิ่มตรงนี้
];
```

### 2. การเพิ่มสถานะใหม่
แก้ไขใน `ReceiptForm.jsx`:
```javascript
const statusOptions = [
  { value: 'draft', label: 'แบบร่าง' },
  { value: 'issued', label: 'ออกแล้ว' },
  { value: 'paid', label: 'ชำระแล้ว' },
  { value: 'cancelled', label: 'ยกเลิก' },
  { value: 'new_status', label: 'สถานะใหม่' }  // เพิ่มตรงนี้
];
```

## หมายเหตุ
- ระบบจะสร้างเลขที่ใบเสร็จอัตโนมัติในรูปแบบ `RCP-YYYYMMDD-XXX`
- การเชื่อมโยงกับใบแจ้งหนี้จะช่วยให้ระบบดึงข้อมูลลูกค้าและจำนวนเงินอัตโนมัติ
- ใบเสร็จรับเงินสามารถสร้างได้โดยไม่ต้องเชื่อมโยงกับใบแจ้งหนี้
- ระบบรองรับการพิมพ์ใบเสร็จรับเงินผ่าน browser print function 