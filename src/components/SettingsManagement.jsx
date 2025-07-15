import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Save, UploadCloud, X } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const SettingsManagement = ({ companyInfo, onSave }) => {
  const [settings, setSettings] = useState(companyInfo);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, logoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
        toast({
            title: "ผิดพลาด!",
            description: "กรุณาเลือกไฟล์รูปภาพเท่านั้น",
            variant: "destructive",
        });
    }
  };

  const handleRemoveLogo = () => {
    setSettings(prev => ({ ...prev, logoUrl: '' }));
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(settings);
    toast({
      title: "สำเร็จ!",
      description: "บันทึกข้อมูลบริษัทเรียบร้อยแล้ว",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <PageHeader
        title="ตั้งค่าระบบ"
        description="จัดการข้อมูลบริษัทและโลโก้สำหรับเอกสารต่างๆ"
      />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลบริษัท</CardTitle>
            <CardDescription>
              ข้อมูลนี้จะถูกนำไปใช้ในหัวกระดาษของใบสั่งงานและใบแจ้งหนี้
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">ชื่อบริษัท</Label>
                <Input id="name" name="name" value={settings.name} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="taxId">เลขประจำตัวผู้เสียภาษี</Label>
                <Input id="taxId" name="taxId" value={settings.taxId} onChange={handleInputChange} />
              </div>
            </div>
            <div>
              <Label htmlFor="address">ที่อยู่</Label>
              <Input id="address" name="address" value={settings.address} onChange={handleInputChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">จังหวัด/เมือง</Label>
                <Input id="city" name="city" value={settings.city} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                <Input id="phone" name="phone" value={settings.phone} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="email">อีเมล</Label>
                <Input id="email" name="email" type="email" value={settings.email} onChange={handleInputChange} />
              </div>
            </div>
            <div className="space-y-2">
                <Label>โลโก้บริษัท</Label>
                {settings.logoUrl ? (
                    <div className="mt-2 p-4 border rounded-md flex flex-col items-center bg-muted/50 relative">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={handleRemoveLogo}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        <p className="text-sm font-medium mb-2">ตัวอย่างโลโก้</p>
                        <img src={settings.logoUrl} alt="Logo Preview" className="h-24 max-w-full object-contain rounded-md" />
                    </div>
                ) : (
                    <div 
                        className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 cursor-pointer hover:border-primary transition-colors"
                        onClick={() => fileInputRef.current.click()}
                    >
                        <div className="text-center">
                            <UploadCloud className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                            <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                <p className="pl-1">คลิกเพื่ออัปโหลด</p>
                            </div>
                            <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF ขนาดไม่เกิน 10MB</p>
                        </div>
                        <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                    </div>
                )}
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end mt-6">
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            บันทึกการเปลี่ยนแปลง
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default SettingsManagement;