# การแก้ไขปัญหาการอัปโหลดลายเซ็น

## ปัญหาที่พบ

ผู้ใช้ไม่สามารถอัปโหลดลายเซ็นใหม่ได้ เนื่องจากระบบไม่ได้ลบลายเซ็นเก่าก่อนอัปโหลดใหม่

## การแก้ไข

### 1. ปรับปรุงฟังก์ชัน `handleSignatureFileChange`

**ปัญหาที่แก้ไข:**
- ระบบไม่ได้ลบลายเซ็นเก่าก่อนอัปโหลดใหม่
- ไม่มีการจัดการ error ที่เหมาะสม
- ไม่มีการแสดงสถานะการอัปโหลด

**การแก้ไข:**
```javascript
const handleSignatureFileChange = async (e) => {
  // ... validation code ...

  setIsUploadingSignature(true);
  try {
    // ลบลายเซ็นเก่าก่อน (ถ้ามี)
    if (settings.signature_public_id) {
      try {
        await api.delete(`/company-info/delete-signature/${settings.signature_public_id}`);
        console.log('Old signature deleted successfully');
      } catch (deleteError) {
        console.warn('Warning: Could not delete old signature:', deleteError);
        // ไม่หยุดการทำงานถ้าลบลายเซ็นเก่าไม่สำเร็จ
      }
    }

    // อัปโหลดลายเซ็นใหม่
    const formData = new FormData();
    formData.append('signature', file);

    const response = await api.post('/company-info/upload-signature', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    setSettings(prev => ({ 
      ...prev, 
      signature_url: response.data.signatureUrl,
      signature_public_id: response.data.publicId 
    }));
    
    toast({
      title: "สำเร็จ!",
      description: settings.signature_url ? "อัปโหลดลายเซ็นใหม่เรียบร้อยแล้ว" : "อัปโหลดลายเซ็นเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error('Error uploading signature:', error);
    toast({
      title: "ผิดพลาด!",
      description: "ไม่สามารถอัปโหลดลายเซ็นได้ กรุณาลองใหม่อีกครั้ง",
      variant: "destructive",
    });
  } finally {
    setIsUploadingSignature(false);
    if (signatureFileInputRef.current) {
      signatureFileInputRef.current.value = "";
    }
  }
};
```

### 2. ปรับปรุงฟังก์ชัน `handleRemoveSignature`

**การแก้ไข:**
- เพิ่มการจัดการ error ที่ดีขึ้น
- ลบข้อมูลใน state แม้ว่าจะลบไฟล์ไม่สำเร็จ

```javascript
const handleRemoveSignature = async () => {
  if (!settings.signature_public_id) {
    setSettings(prev => ({ ...prev, signature_url: '', signature_public_id: null }));
    toast({
      title: "สำเร็จ!",
      description: "ลบลายเซ็นเรียบร้อยแล้ว",
    });
    return;
  }

  try {
    await api.delete(`/company-info/delete-signature/${settings.signature_public_id}`);

    setSettings(prev => ({ ...prev, signature_url: '', signature_public_id: null }));
    toast({
      title: "สำเร็จ!",
      description: "ลบลายเซ็นเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error('Error deleting signature:', error);
    // ถ้าลบไม่สำเร็จ ให้ลบข้อมูลใน state ไปก่อน
    setSettings(prev => ({ ...prev, signature_url: '', signature_public_id: null }));
    toast({
      title: "สำเร็จ!",
      description: "ลบลายเซ็นเรียบร้อยแล้ว (อาจมีไฟล์เก่าค้างในระบบ)",
    });
  }
};
```

### 3. ปรับปรุง UI

**เพิ่มปุ่มอัปโหลดใหม่:**
- เพิ่มปุ่มอัปโหลดใหม่ในส่วนที่แสดงลายเซ็นปัจจุบัน
- แสดงสถานะการอัปโหลด (loading spinner)
- เพิ่มข้อความแนะนำการใช้งาน

```jsx
<div className="absolute top-2 right-2 flex gap-1">
  <Button 
    variant="ghost" 
    size="icon" 
    className="h-6 w-6"
    onClick={() => signatureFileInputRef.current?.click()}
    disabled={isUploadingSignature}
    title="อัปโหลดใหม่"
  >
    {isUploadingSignature ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <UploadCloud className="h-4 w-4" />
    )}
  </Button>
  <Button 
    variant="ghost" 
    size="icon" 
    className="h-6 w-6"
    onClick={handleRemoveSignature}
    disabled={isUploadingSignature}
    title="ลบลายเซ็น"
  >
    <X className="h-4 w-4" />
  </Button>
</div>
```

## ฟีเจอร์ใหม่

### 1. การอัปโหลดลายเซ็นใหม่
- **อัตโนมัติลบลายเซ็นเก่า** - ระบบจะลบลายเซ็นเก่าก่อนอัปโหลดใหม่
- **ปุ่มอัปโหลดใหม่** - คลิกไอคอนอัปโหลดเพื่ออัปโหลดลายเซ็นใหม่
- **การจัดการ Error** - แสดงข้อความ error ที่ชัดเจน

### 2. การแสดงสถานะ
- **Loading Spinner** - แสดงเมื่อกำลังอัปโหลด
- **ข้อความสถานะ** - แสดงข้อความ "กำลังอัปโหลดลายเซ็นใหม่..."
- **Opacity Effect** - ลดความเข้มของรูปภาพเมื่อกำลังอัปโหลด

### 3. การจัดการ Error
- **Graceful Degradation** - ระบบยังทำงานได้แม้ว่าจะลบลายเซ็นเก่าไม่สำเร็จ
- **User-Friendly Messages** - ข้อความ error ที่เข้าใจง่าย
- **Console Logging** - บันทึก log สำหรับการ debug

## วิธีการใช้งาน

### 1. อัปโหลดลายเซ็นใหม่
1. ไปที่หน้าตั้งค่า
2. ในส่วน "ลายเซ็น" คลิกไอคอนอัปโหลด (ไอคอนเมฆ) ด้านบนขวา
3. เลือกไฟล์ลายเซ็นใหม่
4. รอการอัปโหลดเสร็จสิ้น

### 2. ลบลายเซ็น
1. คลิกไอคอน X ด้านบนขวา
2. ยืนยันการลบ

### 3. ตรวจสอบสถานะ
- ดูไอคอน loading spinner เมื่อกำลังอัปโหลด
- อ่านข้อความสถานะด้านล่างรูปภาพ

## การทดสอบ

### 1. ทดสอบการอัปโหลดลายเซ็นใหม่
```bash
# 1. อัปโหลดลายเซ็นแรก
# 2. อัปโหลดลายเซ็นใหม่
# 3. ตรวจสอบว่าลายเซ็นเก่าถูกลบแล้ว
# 4. ตรวจสอบว่าลายเซ็นใหม่แสดงผลถูกต้อง
```

### 2. ทดสอบการจัดการ Error
```bash
# 1. ลองอัปโหลดไฟล์ที่ไม่ใช่รูปภาพ
# 2. ลองอัปโหลดไฟล์ขนาดใหญ่เกิน 5MB
# 3. ตรวจสอบข้อความ error ที่แสดง
```

### 3. ทดสอบการลบลายเซ็น
```bash
# 1. ลบลายเซ็นที่มีอยู่
# 2. ตรวจสอบว่าลายเซ็นหายไป
# 3. ลองลบลายเซ็นที่ไม่มีอยู่
```

## ข้อควรระวัง

1. **ขนาดไฟล์** - ลายเซ็นต้องมีขนาดไม่เกิน 5MB
2. **รูปแบบไฟล์** - รองรับเฉพาะ PNG และ JPG
3. **การเชื่อมต่อ** - ต้องมีการเชื่อมต่ออินเทอร์เน็ตสำหรับอัปโหลด
4. **Cloudinary** - ต้องมีการตั้งค่า Cloudinary ที่ถูกต้อง

## การแก้ไขปัญหา

### ลายเซ็นไม่อัปโหลด
1. ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
2. ตรวจสอบการตั้งค่า Cloudinary
3. ตรวจสอบขนาดและรูปแบบไฟล์
4. ดู console log สำหรับ error details

### ลายเซ็นเก่าไม่หาย
1. ตรวจสอบการเชื่อมต่อกับ Cloudinary
2. ตรวจสอบ public_id ของลายเซ็น
3. ลองลบลายเซ็นด้วยตนเองใน Cloudinary dashboard

### Error ในการลบ
1. ตรวจสอบ network connection
2. ตรวจสอบ API endpoint
3. ตรวจสอบ database connection 