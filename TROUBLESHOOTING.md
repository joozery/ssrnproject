# การแก้ไขปัญหา (Troubleshooting)

## ปัญหา: หน้าจอขาว (White Screen)

### สาเหตุและวิธีแก้ไข:

#### 1. 404 Error สำหรับ ReceiptManagement
**สาเหตุ:** Import path ไม่ถูกต้อง

**วิธีแก้ไข:**
```javascript
// ผิด
import ReceiptManagement from '@/components/ReceiptManagement';

// ถูก
import ReceiptManagement from '@/components/receipts/ReceiptManagement';
```

#### 2. 404 Error สำหรับ vite.svg
**สาเหตุ:** ไฟล์ vite.svg หายไปจาก public folder

**วิธีแก้ไข:**
1. สร้างไฟล์ `public/vite.svg`
2. หรือเปลี่ยน favicon ใน `index.html`:
```html
<link rel="icon" type="image/svg+xml" href="/favicon.ico" />
```

#### 3. Backend Server ไม่ทำงาน
**สาเหตุ:** API server ไม่ได้รัน

**วิธีแก้ไข:**
```bash
# Terminal 1: รัน Backend
cd backendssr
npm start

# Terminal 2: รัน Frontend
cd ..
npm run dev
```

#### 4. Database Connection Error
**สาเหตุ:** ไม่สามารถเชื่อมต่อฐานข้อมูลได้

**วิธีแก้ไข:**
1. ตรวจสอบไฟล์ `.env` ใน backendssr
2. ตรวจสอบการเชื่อมต่อ MySQL
3. รัน migration script:
```bash
cd backendssr
node scripts/create-receipts-table-only.js
```

#### 5. CORS Error
**สาเหตุ:** Frontend ไม่สามารถเรียก API ได้

**วิธีแก้ไข:**
ตรวจสอบ CORS configuration ใน `backendssr/server.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:5173', // หรือ URL ของ frontend
  credentials: true
}));
```

## ขั้นตอนการตรวจสอบ:

### 1. เปิด Developer Tools (F12)
- ดู Console tab สำหรับ errors
- ดู Network tab สำหรับ failed requests

### 2. ตรวจสอบ Terminal
- Backend terminal: ดู API logs
- Frontend terminal: ดู build errors

### 3. ตรวจสอบไฟล์
```bash
# ตรวจสอบโครงสร้างไฟล์
ls -la src/components/receipts/
ls -la public/

# ตรวจสอบ import paths
grep -r "ReceiptManagement" src/
```

### 4. ตรวจสอบ Database
```sql
-- ตรวจสอบตาราง receipts
SHOW TABLES LIKE 'receipts';

-- ตรวจสอบข้อมูล
SELECT COUNT(*) FROM receipts;
```

## คำสั่งสำหรับ Restart:

```bash
# Stop all processes
pkill -f "node"
pkill -f "vite"

# Start backend
cd backendssr
npm start &

# Start frontend
cd ..
npm run dev
```

## การ Debug เพิ่มเติม:

### 1. เพิ่ม Console Logs
```javascript
// ใน App.jsx
console.log('App loaded, activeTab:', activeTab);
console.log('ReceiptManagement component:', ReceiptManagement);
```

### 2. ตรวจสอบ Environment Variables
```bash
# Backend
cat backendssr/.env

# Frontend
cat .env
```

### 3. Clear Browser Cache
- Ctrl+Shift+R (Hard Refresh)
- Clear browser cache
- Disable browser extensions

## หากยังไม่แก้ไข:

1. **Restart ทั้งระบบ:**
   ```bash
   # Stop everything
   pkill -f node
   pkill -f vite
   
   # Clear node_modules
   rm -rf node_modules
   rm -rf backendssr/node_modules
   
   # Reinstall
   npm install
   cd backendssr && npm install
   
   # Start again
   npm start &
   cd .. && npm run dev
   ```

2. **ตรวจสอบ Ports:**
   ```bash
   # Check if ports are in use
   lsof -i :5000
   lsof -i :5173
   ```

3. **ตรวจสอบไฟล์ .env:**
   ```bash
   # Backend
   cat backendssr/.env
   
   # Frontend
   cat .env
   ``` 