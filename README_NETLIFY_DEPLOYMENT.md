# 🚀 Netlify Deployment Guide

## การตั้งค่า Environment Variables ใน Netlify

### 1. เข้าไปที่ Netlify Dashboard
1. ไปที่ [netlify.com](https://netlify.com)
2. เลือกโปรเจคของคุณ
3. ไปที่ **Site settings** > **Environment variables**

### 2. เพิ่ม Environment Variable
เพิ่มตัวแปรต่อไปนี้:

| Variable Name | Value |
|---------------|-------|
| `VITE_API_URL` | `https://backendssr-app-664e1595c398.herokuapp.com/api` |

### 3. การตั้งค่า Build Settings
ใน **Site settings** > **Build & deploy** > **Build settings**:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `18` (หรือตามที่ระบุใน `.nvmrc`)

### 4. การตั้งค่า Deploy Settings
ใน **Site settings** > **Build & deploy** > **Deploy contexts**:

- **Production branch**: `main` (หรือ `master`)
- **Branch deploys**: เปิดใช้งาน
- **Deploy previews**: เปิดใช้งาน

## 🔧 การแก้ไขปัญหา

### ปัญหา: ชื่อบริษัทและโลโก้ไม่แสดง
**สาเหตุ**: ไม่มีการตั้งค่า `VITE_API_URL` ใน Netlify

**วิธีแก้**:
1. เพิ่ม environment variable `VITE_API_URL` ใน Netlify
2. Redeploy ไซต์
3. Clear browser cache

### ปัญหา: API ไม่สามารถเชื่อมต่อได้
**สาเหตุ**: Backend server ไม่ทำงานหรือ URL ไม่ถูกต้อง

**วิธีแก้**:
1. ตรวจสอบว่า backend server ทำงานอยู่
2. ตรวจสอบ URL ใน environment variable
3. ตรวจสอบ CORS settings ใน backend

### ปัญหา: ข้อมูลไม่ถูกบันทึก
**สาเหตุ**: Database connection error

**วิธีแก้**:
1. ตรวจสอบ database connection
2. ตรวจสอบ environment variables ใน backend
3. ตรวจสอบ logs ใน Heroku

## 📝 การทดสอบ

### 1. ทดสอบ API Connection
เปิด Developer Tools > Console และดู log:
```
🌐 API URL: https://backendssr-app-664e1595c398.herokuapp.com/api
✅ Company info loaded from API: {...}
```

### 2. ทดสอบ Company Info
1. ไปที่หน้า Settings
2. แก้ไขข้อมูลบริษัท
3. บันทึก
4. Refresh หน้าเว็บ
5. ตรวจสอบว่าข้อมูลยังอยู่

### 3. ทดสอบ Logo Upload
1. อัปโหลดโลโก้ใหม่
2. ตรวจสอบว่าแสดงในหน้า Settings
3. ตรวจสอบว่าแสดงใน Header

## 🔄 การ Redeploy

หากมีการเปลี่ยนแปลง environment variables:

1. ไปที่ **Deploys** tab
2. คลิก **Trigger deploy** > **Deploy site**
3. รอให้ build เสร็จ
4. ทดสอบฟีเจอร์ที่เกี่ยวข้อง

## 📞 การติดต่อ

หากมีปัญหาเพิ่มเติม:
1. ตรวจสอบ logs ใน Netlify
2. ตรวจสอบ logs ใน Heroku
3. ตรวจสอบ browser console
4. ติดต่อทีมพัฒนา 