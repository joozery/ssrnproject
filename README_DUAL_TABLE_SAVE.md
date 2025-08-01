# API สำหรับบันทึกข้อมูลพร้อมกัน (Dual Table Save)

API นี้ถูกออกแบบมาเพื่อบันทึกข้อมูลไปยังทั้งตาราง `invoices` และ `quotations` พร้อมกับ items ของทั้งสองตารางในครั้งเดียว โดยใช้ Database Transaction เพื่อให้แน่ใจว่าข้อมูลจะถูกบันทึกทั้งหมดหรือไม่ถูกบันทึกเลย

## Endpoints ที่เพิ่มเข้ามา

### 1. POST /api/invoices/dual-save
สร้าง Invoice และ Quotation พร้อมกัน

**Request Body:**
```json
{
  // Invoice data
  "invoice_number": "INV202412001",
  "customer_id": "cust_001",
  "issue_date": "2024-12-01",
  "due_date": "2024-12-31",
  "subject": "ใบแจ้งหนี้บริการขนส่ง",
  "notes": "ใบแจ้งหนี้สำหรับบริการขนส่งสินค้า",
  "internal_notes": "หมายเหตุภายใน",
  "subtotal": 53500.00,
  "vat_amount": 3745.00,
  "withholding_tax": 0,
  "total_amount": 57245.00,
  "status": "pending",
  "type": "invoice",
  "payment_method": "โอนเข้าบัญชี",
  "payment_date": null,
  "reference_number": null,
  "invoice_items": [
    {
      "description": "บริการขนส่งสินค้า",
      "details": "ขนส่งสินค้าจากท่าเรือไปยังโกดัง",
      "quantity": 1,
      "unit": "ครั้ง",
      "unit_price": 53500.00,
      "discount": 0,
      "amount": 53500.00
    }
  ],
  
  // Quotation data
  "quotation_number": "QUO202412001",
  "quotation_subject": "บริการขนส่งสินค้า",
  "quotation_notes": "บริการขนส่งสินค้าจากท่าเรือไปยังโกดัง",
  "quotation_internal_notes": "หมายเหตุภายในสำหรับใบเสนอราคา",
  "quotation_subtotal": 50000.00,
  "quotation_vat_amount": 3500.00,
  "quotation_withholding_tax": 0,
  "quotation_total_amount": 53500.00,
  "quotation_status": "draft",
  "quotation_type": "quotation",
  "quotation_items": [
    {
      "description": "บริการขนส่งสินค้า",
      "details": "ขนส่งสินค้าจากท่าเรือไปยังโกดัง",
      "quantity": 1,
      "unit": "ครั้ง",
      "unit_price": 50000.00,
      "discount": 0,
      "amount": 50000.00
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "invoice": {
      "id": "uuid-invoice-id",
      "invoice_number": "INV202412001",
      "customer_id": "cust_001",
      "customer_name": "บริษัท เอ.บี.ซี. จำกัด",
      "issue_date": "2024-12-01",
      "due_date": "2024-12-31",
      "subject": "ใบแจ้งหนี้บริการขนส่ง",
      "notes": "ใบแจ้งหนี้สำหรับบริการขนส่งสินค้า",
      "internal_notes": "หมายเหตุภายใน",
      "subtotal": 53500.00,
      "vat_amount": 3745.00,
      "withholding_tax": 0,
      "total_amount": 57245.00,
      "status": "pending",
      "type": "invoice",
      "payment_method": "โอนเข้าบัญชี",
      "payment_date": null,
      "reference_number": null,
      "created_at": "2024-12-01T00:00:00.000Z",
      "updated_at": "2024-12-01T00:00:00.000Z",
      "items": [
        {
          "id": 1,
          "invoice_id": "uuid-invoice-id",
          "description": "บริการขนส่งสินค้า",
          "details": "ขนส่งสินค้าจากท่าเรือไปยังโกดัง",
          "quantity": 1,
          "unit": "ครั้ง",
          "unit_price": 53500.00,
          "discount": 0,
          "amount": 53500.00,
          "created_at": "2024-12-01T00:00:00.000Z"
        }
      ]
    },
    "quotation": {
      "id": "uuid-quotation-id",
      "quotation_number": "QUO202412001",
      "customer_id": "cust_001",
      "customer_name": "บริษัท เอ.บี.ซี. จำกัด",
      "issue_date": "2024-12-01",
      "due_date": "2024-12-31",
      "subject": "บริการขนส่งสินค้า",
      "notes": "บริการขนส่งสินค้าจากท่าเรือไปยังโกดัง",
      "internal_notes": "หมายเหตุภายในสำหรับใบเสนอราคา",
      "subtotal": 50000.00,
      "vat_amount": 3500.00,
      "withholding_tax": 0,
      "total_amount": 53500.00,
      "status": "draft",
      "type": "quotation",
      "created_at": "2024-12-01T00:00:00.000Z",
      "updated_at": "2024-12-01T00:00:00.000Z",
      "items": [
        {
          "id": 1,
          "quotation_id": "uuid-quotation-id",
          "description": "บริการขนส่งสินค้า",
          "details": "ขนส่งสินค้าจากท่าเรือไปยังโกดัง",
          "quantity": 1,
          "unit": "ครั้ง",
          "unit_price": 50000.00,
          "discount": 0,
          "amount": 50000.00,
          "created_at": "2024-12-01T00:00:00.000Z"
        }
      ]
    }
  },
  "message": "Invoice and quotation created successfully"
}
```

### 2. PUT /api/invoices/dual-update/:invoiceId/:quotationId
อัปเดต Invoice และ Quotation พร้อมกัน

**URL Parameters:**
- `invoiceId`: ID ของ Invoice ที่ต้องการอัปเดต
- `quotationId`: ID ของ Quotation ที่ต้องการอัปเดต

**Request Body:** เหมือนกับ POST แต่ไม่จำเป็นต้องส่งข้อมูลทั้งหมด

**Response:** เหมือนกับ POST แต่จะอัปเดตข้อมูลที่มีอยู่

## คุณสมบัติพิเศษ

### 1. Database Transaction
- ใช้ MySQL Transaction เพื่อให้แน่ใจว่าข้อมูลจะถูกบันทึกทั้งหมดหรือไม่ถูกบันทึกเลย
- หากเกิดข้อผิดพลาดในขั้นตอนใดๆ ระบบจะ rollback การเปลี่ยนแปลงทั้งหมด

### 2. การตรวจสอบข้อมูล
- ตรวจสอบว่า Invoice Number และ Quotation Number ไม่ซ้ำกับที่มีอยู่
- ตรวจสอบว่าข้อมูลที่จำเป็นถูกส่งมาครบถ้วน
- ตรวจสอบว่า Invoice และ Quotation ที่ต้องการอัปเดตมีอยู่จริง

### 3. การจัดการ Items
- ลบ Items เก่าทั้งหมดและเพิ่ม Items ใหม่
- รองรับการส่ง Items เป็น array ว่างได้

### 4. การจัดการวันที่
- รองรับทั้งรูปแบบ ISO string และ YYYY-MM-DD
- แปลงวันที่ให้เข้ากับรูปแบบ MySQL

## ตัวอย่างการใช้งาน

### การสร้างข้อมูลใหม่
```javascript
const response = await fetch('/api/invoices/dual-save', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    invoice_number: 'INV202412001',
    quotation_number: 'QUO202412001',
    customer_id: 'cust_001',
    issue_date: '2024-12-01',
    due_date: '2024-12-31',
    subject: 'บริการขนส่งสินค้า',
    notes: 'บริการขนส่งสินค้าจากท่าเรือไปยังโกดัง',
    subtotal: 53500.00,
    vat_amount: 3745.00,
    total_amount: 57245.00,
    invoice_items: [
      {
        description: 'บริการขนส่งสินค้า',
        details: 'ขนส่งสินค้าจากท่าเรือไปยังโกดัง',
        quantity: 1,
        unit: 'ครั้ง',
        unit_price: 53500.00,
        amount: 53500.00
      }
    ],
    quotation_items: [
      {
        description: 'บริการขนส่งสินค้า',
        details: 'ขนส่งสินค้าจากท่าเรือไปยังโกดัง',
        quantity: 1,
        unit: 'ครั้ง',
        unit_price: 50000.00,
        amount: 50000.00
      }
    ]
  })
});

const result = await response.json();
console.log(result);
```

### การอัปเดตข้อมูล
```javascript
const response = await fetch('/api/invoices/dual-update/inv_001/quo_001', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    invoice_number: 'INV202412001',
    quotation_number: 'QUO202412001',
    customer_id: 'cust_001',
    issue_date: '2024-12-01',
    due_date: '2024-12-31',
    subject: 'บริการขนส่งสินค้า (อัปเดต)',
    notes: 'บริการขนส่งสินค้าจากท่าเรือไปยังโกดัง (อัปเดต)',
    subtotal: 60000.00,
    vat_amount: 4200.00,
    total_amount: 64200.00,
    invoice_items: [
      {
        description: 'บริการขนส่งสินค้า (อัปเดต)',
        details: 'ขนส่งสินค้าจากท่าเรือไปยังโกดัง (อัปเดต)',
        quantity: 1,
        unit: 'ครั้ง',
        unit_price: 60000.00,
        amount: 60000.00
      }
    ],
    quotation_items: [
      {
        description: 'บริการขนส่งสินค้า (อัปเดต)',
        details: 'ขนส่งสินค้าจากท่าเรือไปยังโกดัง (อัปเดต)',
        quantity: 1,
        unit: 'ครั้ง',
        unit_price: 55000.00,
        amount: 55000.00
      }
    ]
  })
});

const result = await response.json();
console.log(result);
```

## ข้อควรระวัง

1. **ข้อมูลที่จำเป็น:** ต้องส่ง `invoice_number`, `quotation_number`, `issue_date`, และ `customer_id` มาเสมอ
2. **การตรวจสอบซ้ำ:** ระบบจะตรวจสอบว่า Invoice Number และ Quotation Number ไม่ซ้ำกับที่มีอยู่
3. **Transaction Safety:** หากเกิดข้อผิดพลาด ข้อมูลทั้งหมดจะถูก rollback
4. **Items Management:** Items เก่าจะถูกลบทั้งหมดและเพิ่ม Items ใหม่แทน

## Error Handling

API จะส่งกลับ error response ในรูปแบบต่อไปนี้:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error message"
}
```

ตัวอย่าง Error Cases:
- Invoice number already exists
- Quotation number already exists
- Invoice not found (สำหรับ PUT)
- Quotation not found (สำหรับ PUT)
- Required fields missing
- Database connection error 