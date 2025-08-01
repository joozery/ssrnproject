# การเปลี่ยนแปลงหน้าใบเสนอราคาเป็น Card View

## สรุปการเปลี่ยนแปลง

ได้เปลี่ยนหน้าใบเสนอราคาจากการแสดงผลแบบตารางเป็นแบบ **Card Layout** เหมือนกับ FlowAccount พร้อมกับเพิ่มความสามารถในการสลับระหว่าง Card View และ Table View

## 🎨 **คุณสมบัติใหม่**

### 1. **Card View (เริ่มต้น)**
- แสดงข้อมูลในรูปแบบการ์ดที่สวยงาม
- แสดงข้อมูลสำคัญ: เลขที่เอกสาร, วันที่, ชื่อลูกค้า, ยอดรวม, สถานะ
- มี dropdown menu สำหรับการดำเนินการ
- รองรับ responsive design (1-4 คอลัมน์ตามขนาดหน้าจอ)

### 2. **Table View**
- แสดงข้อมูลในรูปแบบตารางแบบเดิม
- มีการออกแบบที่สวยงามและใช้งานง่าย
- รองรับการแสดงข้อมูลเพิ่มเติม

### 3. **View Toggle**
- ปุ่มสลับระหว่าง Card View และ Table View
- เก็บสถานะการแสดงผลใน state
- UI ที่ใช้งานง่ายและเข้าใจได้

## 📁 **ไฟล์ที่สร้าง/แก้ไข**

### ไฟล์ใหม่:
1. **`src/components/quotations/QuotationCard.jsx`** - Card component สำหรับแสดงข้อมูล
2. **`src/components/quotations/QuotationTable.jsx`** - Table component สำหรับแสดงข้อมูล
3. **`src/components/ui/dropdown-menu.jsx`** - Dropdown menu component

### ไฟล์ที่แก้ไข:
1. **`src/components/QuotationManagement.jsx`** - เพิ่ม view toggle และ logic
2. **`src/index.css`** - เพิ่ม CSS utilities สำหรับ line-clamp

## 🎯 **การออกแบบ Card**

### Header Section:
- เลขที่เอกสารพร้อมไอคอน
- วันที่ออกเอกสาร
- Dropdown menu สำหรับการดำเนินการ

### Content Section:
- ชื่อลูกค้าพร้อมไอคอน
- เรื่อง/รายละเอียด (ถ้ามี)
- ยอดรวมสุทธิแบบตัวหนา
- สถานะพร้อมไอคอนและ badge
- ปุ่มการดำเนินการด่วน

### Footer Section (ถ้ามี):
- วันครบกำหนด
- หมายเหตุ (ถ้ามี)

## 🎨 **สีและสถานะ**

### สถานะเอกสาร:
- **Draft**: สีเทา + ไอคอนนาฬิกา
- **Sent**: สีน้ำเงิน + ไอคอนส่ง
- **Approved**: สีเขียว + ไอคอนเครื่องหมายถูก
- **Rejected**: สีแดง + ไอคอนเครื่องหมายผิด

### การออกแบบ:
- ใช้ Tailwind CSS สำหรับ styling
- รองรับ dark mode (ถ้ามี)
- Animation ด้วย Framer Motion
- Hover effects และ transitions

## 📱 **Responsive Design**

### Grid Layout:
- **Mobile**: 1 คอลัมน์
- **Tablet**: 2 คอลัมน์
- **Desktop**: 3 คอลัมน์
- **Large Desktop**: 4 คอลัมน์

### การปรับตัว:
- Cards ปรับขนาดตามหน้าจอ
- Text และ spacing ปรับตามขนาด
- Touch-friendly สำหรับมือถือ

## 🔧 **การใช้งาน**

### การสลับ View:
```javascript
// ใน QuotationManagement component
const [viewMode, setViewMode] = useState('card'); // 'card' หรือ 'table'

// สลับเป็น card view
setViewMode('card');

// สลับเป็น table view
setViewMode('table');
```

### การใช้ QuotationCard:
```javascript
<QuotationCard
  quotation={quotation}
  index={index}
  onView={handleView}
  onEdit={handleEdit}
  onDelete={handleDelete}
  getCustomerName={getCustomerName}
  getStatusLabel={getStatusLabel}
  getStatusColor={getStatusColor}
/>
```

### การใช้ QuotationTable:
```javascript
<QuotationTable
  quotations={filteredQuotations}
  onView={handleView}
  onEdit={handleEdit}
  onDelete={handleDelete}
  getCustomerName={getCustomerName}
  getStatusLabel={getStatusLabel}
  getStatusColor={getStatusColor}
/>
```

## 🎯 **ข้อดีของการเปลี่ยนแปลง**

### 1. **User Experience**
- ดูข้อมูลได้ง่ายขึ้น
- การดำเนินการสะดวกขึ้น
- หน้าตาสวยงามและทันสมัย

### 2. **Flexibility**
- ผู้ใช้สามารถเลือกวิธีดูข้อมูลได้
- รองรับการใช้งานที่หลากหลาย
- ปรับตัวได้ตามความต้องการ

### 3. **Performance**
- Lazy loading สำหรับ cards
- Animation ที่ลื่นไหล
- Optimized rendering

### 4. **Maintainability**
- แยก component ตามหน้าที่
- Code ที่อ่านง่ายและเข้าใจได้
- Reusable components

## 🚀 **การพัฒนาต่อ**

### ความเป็นไปได้ในการเพิ่มฟีเจอร์:
1. **Filtering**: กรองตามสถานะ, วันที่, ลูกค้า
2. **Sorting**: เรียงลำดับตามคอลัมน์ต่างๆ
3. **Bulk Actions**: เลือกหลายรายการและดำเนินการพร้อมกัน
4. **Export**: ส่งออกข้อมูลเป็น PDF หรือ Excel
5. **Search Enhancement**: ค้นหาขั้นสูง
6. **Pagination**: แบ่งหน้าเมื่อมีข้อมูลมาก

### การปรับปรุง UI/UX:
1. **Drag & Drop**: ลากเพื่อจัดเรียง
2. **Keyboard Navigation**: ใช้คีย์บอร์ดในการนำทาง
3. **Accessibility**: เพิ่มความเข้าถึงได้
4. **Customization**: ให้ผู้ใช้ปรับแต่งการแสดงผล

## 📋 **การทดสอบ**

### ทดสอบการแสดงผล:
1. เปิดหน้าใบเสนอราคา
2. ตรวจสอบ Card View (เริ่มต้น)
3. คลิกปุ่ม Table View
4. ตรวจสอบการสลับระหว่าง view
5. ทดสอบ responsive design

### ทดสอบฟังก์ชัน:
1. ค้นหาใบเสนอราคา
2. ดูรายละเอียด
3. แก้ไขใบเสนอราคา
4. ลบใบเสนอราคา
5. สร้างใบเสนอราคาใหม่

การเปลี่ยนแปลงนี้ทำให้หน้าใบเสนอราคามีความทันสมัยและใช้งานง่ายขึ้น เหมือนกับ FlowAccount ที่เป็นที่นิยมในตลาด! 