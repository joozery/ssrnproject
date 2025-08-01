# การเพิ่ม SweetAlert2 ในหน้าใบเสนอราคา

## สรุปการเปลี่ยนแปลง

ได้เพิ่ม SweetAlert2 เพื่อปรับปรุงประสบการณ์ผู้ใช้ในการแจ้งเตือนและยืนยันการทำงานต่างๆ

## การติดตั้ง

```bash
npm install sweetalert2
```

## ฟีเจอร์ที่เพิ่ม

### 🗑️ **การยืนยันการลบเอกสาร**
```javascript
const result = await Swal.fire({
  title: 'ยืนยันการลบ',
  text: `คุณต้องการลบ${quotation.source === 'invoices' ? 'ใบแจ้งหนี้' : 'ใบเสนอราคา'} "${quotation.quotation_number || quotation.invoice_number}" ใช่หรือไม่?`,
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#d33',
  cancelButtonColor: '#3085d6',
  confirmButtonText: 'ลบ',
  cancelButtonText: 'ยกเลิก',
  reverseButtons: true
});
```

**คุณสมบัติ:**
- แสดงชื่อเอกสารที่จะลบ
- แยกประเภทเอกสาร (ใบเสนอราคา/ใบแจ้งหนี้)
- ปุ่มยืนยันสีแดง ปุ่มยกเลิกสีน้ำเงิน
- Loading indicator ขณะลบ

### ✅ **การแจ้งเตือนสำเร็จ**
```javascript
Swal.fire({
  title: 'สำเร็จ!',
  text: 'สร้างใบเสนอราคาใหม่เรียบร้อยแล้ว',
  icon: 'success',
  timer: 2000,
  showConfirmButton: false
});
```

**คุณสมบัติ:**
- แสดงไอคอนสำเร็จสีเขียว
- หายไปอัตโนมัติหลัง 2 วินาที
- ไม่ต้องคลิกปุ่มตกลง

### ❌ **การแจ้งเตือนข้อผิดพลาด**
```javascript
Swal.fire({
  title: 'เกิดข้อผิดพลาด',
  text: error.response?.data?.error || "ไม่สามารถบันทึกเอกสารได้",
  icon: 'error',
  confirmButtonText: 'ตกลง'
});
```

**คุณสมบัติ:**
- แสดงไอคอนข้อผิดพลาดสีแดง
- แสดงข้อความข้อผิดพลาดจาก API
- ต้องคลิกปุ่มตกลง

### 📋 **การแสดงรายละเอียดเอกสาร**
```javascript
Swal.fire({
  title: `${typeLabel} - ${documentNumber}`,
  html: `
    <div class="text-left">
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div><strong>ลูกค้า:</strong> ${customerName}</div>
        <div><strong>สถานะ:</strong> <span class="px-2 py-1 rounded text-sm ${statusColor}">${statusLabel}</span></div>
        <div><strong>วันที่ออก:</strong> ${issueDate}</div>
        <div><strong>วันครบกำหนด:</strong> ${dueDate}</div>
      </div>
      <div class="mb-4"><strong>เรื่อง:</strong> ${subject}</div>
      <div class="mb-4"><strong>หมายเหตุ:</strong> ${notes}</div>
      <div class="grid grid-cols-3 gap-4 mb-4">
        <div><strong>ยอดรวม:</strong> ฿${subtotal}</div>
        <div><strong>ภาษีมูลค่าเพิ่ม:</strong> ฿${vatAmount}</div>
        <div><strong>ยอดรวมทั้งสิ้น:</strong> ฿${totalAmount}</div>
      </div>
      ${itemsHtml}
    </div>
  `,
  width: '800px',
  confirmButtonText: 'ปิด',
  showCloseButton: true
});
```

**คุณสมบัติ:**
- แสดงข้อมูลครบถ้วนในรูปแบบตาราง
- รายการสินค้าพร้อมรายละเอียด
- ขนาด popup กว้าง 800px
- ปุ่มปิดและปุ่ม X

### ⚠️ **การยืนยันการออกจากหน้า**
```javascript
const result = await Swal.fire({
  title: 'ยืนยันการออก',
  text: 'คุณมีข้อมูลที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้หรือไม่?',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'ออก',
  cancelButtonText: 'ยกเลิก'
});
```

**คุณสมบัติ:**
- แสดงเมื่อมีข้อมูลที่ยังไม่ได้บันทึก
- ปุ่มออกสีน้ำเงิน ปุ่มยกเลิกสีแดง
- ป้องกันการสูญเสียข้อมูล

## การปรับแต่ง CSS

### Custom Styles
```css
/* SweetAlert2 Custom Styles */
.swal2-custom-container {
  z-index: 9999;
}

.swal2-custom-popup {
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.swal2-custom-popup .swal2-title {
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
}

.swal2-custom-popup .swal2-confirm {
  background-color: #3b82f6;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
}

.swal2-custom-popup .swal2-cancel {
  background-color: #ef4444;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
}
```

## ประเภทการแจ้งเตือน

### 1. **Success (สำเร็จ)**
- ไอคอน: ✅ สีเขียว
- ใช้สำหรับ: การบันทึก, การลบ, การสร้างเอกสาร
- หายไปอัตโนมัติหลัง 2 วินาที

### 2. **Error (ข้อผิดพลาด)**
- ไอคอน: ❌ สีแดง
- ใช้สำหรับ: ข้อผิดพลาด API, การโหลดข้อมูลล้มเหลว
- ต้องคลิกปุ่มตกลง

### 3. **Warning (คำเตือน)**
- ไอคอน: ⚠️ สีส้ม
- ใช้สำหรับ: การยืนยันการลบ, การยืนยันการออก
- มีปุ่มยืนยันและยกเลิก

### 4. **Info (ข้อมูล)**
- ไอคอน: ℹ️ สีน้ำเงิน
- ใช้สำหรับ: การแสดงรายละเอียดเอกสาร
- ขนาดใหญ่ แสดงข้อมูลครบถ้วน

## ประโยชน์

1. **UX ที่ดีขึ้น**: แจ้งเตือนสวยงามและใช้งานง่าย
2. **ความปลอดภัย**: ยืนยันการทำงานที่สำคัญ
3. **ข้อมูลครบถ้วน**: แสดงรายละเอียดเอกสารในรูปแบบที่อ่านง่าย
4. **การป้องกันข้อผิดพลาด**: ป้องกันการสูญเสียข้อมูล
5. **ความสม่ำเสมอ**: ใช้รูปแบบเดียวกันทั้งระบบ

## การใช้งาน

### การลบเอกสาร
1. คลิกปุ่มลบบนการ์ดเอกสาร
2. SweetAlert จะแสดงข้อความยืนยัน
3. คลิก "ลบ" เพื่อยืนยัน หรือ "ยกเลิก" เพื่อยกเลิก
4. แสดง loading ขณะลบ
5. แสดงข้อความสำเร็จเมื่อลบเสร็จ

### การดูรายละเอียด
1. คลิกปุ่มดูบนการ์ดเอกสาร
2. SweetAlert จะแสดงรายละเอียดครบถ้วน
3. คลิก "ปิด" หรือ X เพื่อปิด

### การออกจากหน้า
1. คลิกปุ่มกลับในหน้า editor
2. ถ้ามีข้อมูลที่ยังไม่ได้บันทึก จะแสดง SweetAlert ยืนยัน
3. คลิก "ออก" เพื่อออก หรือ "ยกเลิก" เพื่ออยู่ต่อ 