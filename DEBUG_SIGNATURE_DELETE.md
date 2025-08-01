# Debug ปัญหาการลบลายเซ็น

## ปัญหาที่พบ

เมื่อกดลบลายเซ็น รูปไม่ลบออกจาก Cloudinary และ table SQL

## การ Debug

### 1. ตรวจสอบ Frontend Console

เปิด Developer Tools (F12) และดู Console เพื่อตรวจสอบ:

```javascript
// ควรเห็น log เหล่านี้:
🔍 handleRemoveSignature called
🔍 settings.signature_public_id: ssrn-signatures/avago8ul1aeyrn54fuyv
🔍 Calling API endpoint: /company-info/delete-signature/ssrn-signatures/avago8ul1aeyrn54fuyv
```

### 2. ตรวจสอบ Network Tab

ใน Developer Tools > Network tab ดูว่า:

1. **OPTIONS request** - ควรได้ status 204
2. **DELETE request** - ควรได้ status 200 (ไม่ใช่ 404)

### 3. ตรวจสอบ Backend Logs

รันคำสั่งเพื่อดู Heroku logs:

```bash
heroku logs --tail --num 50
```

ควรเห็น log เหล่านี้:
```
🔍 DELETE /delete-signature/:publicId endpoint called
🔍 Request params: { publicId: 'ssrn-signatures/avago8ul1aeyrn54fuyv' }
🔍 Public ID: ssrn-signatures/avago8ul1aeyrn54fuyv
🔍 Attempting to delete from Cloudinary: ssrn-signatures/avago8ul1aeyrn54fuyv
✅ Cloudinary delete result: { result: 'ok' }
🔍 Updating database to remove signature URL
✅ Database update result: [ { affectedRows: 1 } ]
```

### 4. ตรวจสอบ API Endpoint

ทดสอบ API endpoint โดยตรง:

```bash
curl -X DELETE https://backendssr-app-664e1595c398.herokuapp.com/api/company-info/delete-signature/ssrn-signatures/avago8ul1aeyrn54fuyv
```

### 5. ตรวจสอบ Database

ตรวจสอบว่า signature_public_id ถูกเก็บในฐานข้อมูลหรือไม่:

```sql
SELECT signature_public_id, signature_url FROM company_info LIMIT 1;
```

## สาเหตุที่เป็นไปได้

### 1. Endpoint ไม่มีอยู่ (404 Error)
- **สาเหตุ**: Heroku ยังไม่ได้ deploy โค้ดล่าสุด
- **การแก้ไข**: Deploy โค้ดใหม่ไปยัง Heroku

### 2. Cloudinary Error
- **สาเหตุ**: Public ID ไม่ถูกต้อง หรือ Cloudinary credentials ผิด
- **การแก้ไข**: ตรวจสอบ Cloudinary configuration

### 3. Database Error
- **สาเหตุ**: SQL query ไม่ทำงาน หรือ connection error
- **การแก้ไข**: ตรวจสอบ database connection และ query

### 4. Frontend Error
- **สาเหตุ**: signature_public_id เป็น null หรือ undefined
- **การแก้ไข**: ตรวจสอบว่า data ถูกส่งมาจาก backend หรือไม่

## ขั้นตอนการแก้ไข

### 1. Deploy Backend ใหม่
```bash
cd backendssr
git add routes/companyInfo.js
git commit -m "Add debug logging to delete-signature endpoint"
git push heroku main
```

### 2. Restart Heroku
```bash
heroku restart
```

### 3. ตรวจสอบ Logs
```bash
heroku logs --tail
```

### 4. ทดสอบ API
```bash
curl -X GET https://backendssr-app-664e1595c398.herokuapp.com/api/health
```

## การทดสอบ

### 1. ทดสอบการลบลายเซ็น
1. ไปที่หน้าตั้งค่า
2. อัปโหลดลายเซ็นใหม่
3. กดปุ่มลบ (ไอคอน X)
4. ตรวจสอบ console log
5. ตรวจสอบ network tab

### 2. ทดสอบการอัปโหลดใหม่
1. อัปโหลดลายเซ็นแรก
2. อัปโหลดลายเซ็นใหม่ (ควรลบลายเซ็นเก่าอัตโนมัติ)
3. ตรวจสอบ console log

## ข้อมูล Debug

### Frontend Debug Info
- `settings.signature_public_id` - Public ID ของลายเซ็น
- `settings.signature_url` - URL ของลายเซ็น
- API endpoint ที่เรียก
- Response จาก API

### Backend Debug Info
- Request parameters
- Cloudinary delete result
- Database update result
- Error messages

## การแก้ไขปัญหาเฉพาะ

### ถ้าได้ 404 Error
```bash
# ตรวจสอบว่า endpoint มีอยู่จริง
git show HEAD:routes/companyInfo.js | grep -n "delete-signature"

# Deploy ใหม่
git push heroku main
heroku restart
```

### ถ้าได้ 500 Error
```bash
# ดู error logs
heroku logs --tail

# ตรวจสอบ Cloudinary credentials
heroku config | grep CLOUDINARY
```

### ถ้า Database ไม่อัปเดต
```bash
# ตรวจสอบ database connection
heroku logs --tail | grep "Database connected"

# ตรวจสอบ SQL query
# ดู log ที่มี "Database update result"
``` 