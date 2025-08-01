import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Save, UploadCloud, X, Loader2, CreditCard, PenTool } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import api from '@/lib/axios';

const SettingsManagement = ({ companyInfo, onSave }) => {
  const [settings, setSettings] = useState(companyInfo);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingSignature, setIsUploadingSignature] = useState(false);
  const fileInputRef = useRef(null);
  const signatureFileInputRef = useRef(null);

  const fetchCompanyInfo = useCallback(async () => {
    let isMounted = true;
    try {
      const response = await api.get('/company-info');
      if (isMounted) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error fetching company info:', error);
      // If API is not available, use the passed companyInfo prop
      if (companyInfo && isMounted) {
        setSettings(companyInfo);
      }
      if (isMounted) {
        toast({
          title: "คำเตือน",
          description: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ ใช้ข้อมูลจาก localStorage",
          variant: "default",
        });
      }
    }
    return () => {
      isMounted = false;
    };
  }, [companyInfo]);

  // Load company info from API on component mount
  useEffect(() => {
    fetchCompanyInfo();
  }, [fetchCompanyInfo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "ผิดพลาด!",
        description: "กรุณาเลือกไฟล์รูปภาพเท่านั้น",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({
        title: "ผิดพลาด!",
        description: "ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 10MB)",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await api.post('/company-info/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSettings(prev => ({ 
        ...prev, 
        logoUrl: response.data.logoUrl,
        logoPublicId: response.data.publicId 
      }));
      toast({
        title: "สำเร็จ!",
        description: "อัปโหลดโลโก้เรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "ผิดพลาด!",
        description: "ไม่สามารถอัปโหลดโลโก้ได้",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveLogo = async () => {
    if (!settings.logoPublicId) {
      setSettings(prev => ({ ...prev, logoUrl: '' }));
      return;
    }

    try {
      const response = await api.delete(`/company-info/delete-logo/${settings.logoPublicId}`);

      setSettings(prev => ({ ...prev, logoUrl: '', logoPublicId: null }));
      toast({
        title: "สำเร็จ!",
        description: "ลบโลโก้เรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error('Error deleting logo:', error);
      toast({
        title: "ผิดพลาด!",
        description: "ไม่สามารถลบโลโก้ได้",
        variant: "destructive",
      });
    }
  };

  const handleSignatureFileChange = async (e) => {
    console.log('🔍 handleSignatureFileChange called');
    
    const file = e.target.files[0];
    if (!file) return;

    console.log('🔍 File selected:', file.name, file.size, file.type);

    if (!file.type.startsWith('image/')) {
      toast({
        title: "ผิดพลาด!",
        description: "กรุณาเลือกไฟล์รูปภาพเท่านั้น",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast({
        title: "ผิดพลาด!",
        description: "ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingSignature(true);
    try {
      // ลบลายเซ็นเก่าก่อน (ถ้ามี)
      if (settings.signature_public_id) {
        console.log('🔍 Deleting old signature:', settings.signature_public_id);
        try {
          const deleteEndpoint = `/company-info/delete-signature/${settings.signature_public_id}`;
          console.log('🔍 Calling delete endpoint:', deleteEndpoint);
          
          const deleteResponse = await api.delete(deleteEndpoint);
          console.log('✅ Old signature deleted successfully:', deleteResponse.data);
        } catch (deleteError) {
          console.warn('⚠️ Warning: Could not delete old signature:', deleteError);
          console.warn('⚠️ Delete error response:', deleteError.response?.data);
          // ไม่หยุดการทำงานถ้าลบลายเซ็นเก่าไม่สำเร็จ
        }
      }

      console.log('🔍 Uploading new signature...');
      const formData = new FormData();
      formData.append('signature', file);

      const response = await api.post('/company-info/upload-signature', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Upload response:', response.data);

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
      console.error('❌ Error uploading signature:', error);
      console.error('❌ Upload error response:', error.response?.data);
      console.error('❌ Upload error status:', error.response?.status);
      
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

  const handleRemoveSignature = async () => {
    console.log('🔍 handleRemoveSignature called');
    console.log('🔍 settings.signature_public_id:', settings.signature_public_id);
    
    if (!settings.signature_public_id) {
      console.log('🔍 No signature_public_id, clearing state only');
      setSettings(prev => ({ ...prev, signature_url: '', signature_public_id: null }));
      toast({
        title: "สำเร็จ!",
        description: "ลบลายเซ็นเรียบร้อยแล้ว",
      });
      return;
    }

    try {
      const endpoint = `/company-info/delete-signature/${settings.signature_public_id}`;
      console.log('🔍 Calling API endpoint:', endpoint);
      
      const response = await api.delete(endpoint);
      console.log('✅ API response:', response.data);

      setSettings(prev => ({ ...prev, signature_url: '', signature_public_id: null }));
      toast({
        title: "สำเร็จ!",
        description: "ลบลายเซ็นเรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error('❌ Error deleting signature:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      // ถ้าลบไม่สำเร็จ ให้ลบข้อมูลใน state ไปก่อน
      setSettings(prev => ({ ...prev, signature_url: '', signature_public_id: null }));
      toast({
        title: "สำเร็จ!",
        description: "ลบลายเซ็นเรียบร้อยแล้ว (อาจมีไฟล์เก่าค้างในระบบ)",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.put('/company-info', settings);

      const updatedData = response.data;
      setSettings(updatedData);
      if (onSave) onSave(updatedData);
      toast({
        title: "สำเร็จ!",
        description: "บันทึกข้อมูลบริษัทเรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error('Error saving company info:', error);
      toast({
        title: "ผิดพลาด!",
        description: "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
                <Input 
                  id="name" 
                  name="name" 
                  value={settings.name || ''} 
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="taxId">เลขประจำตัวผู้เสียภาษี</Label>
                <Input 
                  id="taxId" 
                  name="taxId" 
                  value={settings.taxId || ''} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">ที่อยู่</Label>
              <Input 
                id="address" 
                name="address" 
                value={settings.address || ''} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">จังหวัด/เมือง</Label>
                <Input 
                  id="city" 
                  name="city" 
                  value={settings.city || ''} 
                  onChange={handleInputChange} 
                />
              </div>
              <div>
                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={settings.phone || ''} 
                  onChange={handleInputChange} 
                />
              </div>
              <div>
                <Label htmlFor="email">อีเมล</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={settings.email || ''} 
                  onChange={handleInputChange} 
                />
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
                            disabled={isUploading}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        <p className="text-sm font-medium mb-2">ตัวอย่างโลโก้</p>
                        <img src={settings.logoUrl} alt="Logo Preview" className="h-24 max-w-full object-contain rounded-md" />
                    </div>
                ) : (
                    <div 
                        className={`mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 cursor-pointer hover:border-primary transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                    >
                        <div className="text-center">
                            {isUploading ? (
                                <Loader2 className="mx-auto h-12 w-12 text-gray-300 animate-spin" />
                            ) : (
                                <UploadCloud className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                            )}
                            <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                <p className="pl-1">
                                    {isUploading ? 'กำลังอัปโหลด...' : 'คลิกเพื่ออัปโหลด'}
                                </p>
                            </div>
                            <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF ขนาดไม่เกิน 10MB</p>
                        </div>
                        <input 
                            ref={fileInputRef} 
                            id="file-upload" 
                            name="file-upload" 
                            type="file" 
                            className="sr-only" 
                            onChange={handleFileChange} 
                            accept="image/*"
                            disabled={isUploading}
                        />
                    </div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* ข้อมูลธนาคาร */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              ข้อมูลธนาคาร
            </CardTitle>
            <CardDescription>
              ข้อมูลบัญชีธนาคารสำหรับการชำระเงิน
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bank_name">ชื่อธนาคาร</Label>
                <Input 
                  id="bank_name" 
                  name="bank_name" 
                  value={settings.bank_name || ''} 
                  onChange={handleInputChange}
                  placeholder="เช่น ธนาคารกรุงเทพ จำกัด (มหาชน)"
                />
              </div>
              <div>
                <Label htmlFor="bank_account_name">ชื่อบัญชี</Label>
                <Input 
                  id="bank_account_name" 
                  name="bank_account_name" 
                  value={settings.bank_account_name || ''} 
                  onChange={handleInputChange}
                  placeholder="ชื่อบัญชีธนาคาร"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bank_account_number">เลขบัญชี</Label>
                <Input 
                  id="bank_account_number" 
                  name="bank_account_number" 
                  value={settings.bank_account_number || ''} 
                  onChange={handleInputChange}
                  placeholder="เช่น 123-4-56789-0"
                />
              </div>
              <div>
                <Label htmlFor="bank_branch">สาขา</Label>
                <Input 
                  id="bank_branch" 
                  name="bank_branch" 
                  value={settings.bank_branch || ''} 
                  onChange={handleInputChange}
                  placeholder="เช่น สาขาลาดกระบัง"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ลายเซ็น */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              ลายเซ็น
            </CardTitle>
            <CardDescription>
              ลายเซ็นสำหรับเอกสารต่างๆ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label>ลายเซ็น</Label>
                {settings.signature_url ? (
                    <div className="mt-2 p-4 border rounded-md flex flex-col items-center bg-muted/50 relative">
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
                        <p className="text-sm font-medium mb-2">
                            {isUploadingSignature ? 'กำลังอัปโหลดลายเซ็นใหม่...' : 'ตัวอย่างลายเซ็น'}
                        </p>
                        <img 
                            src={settings.signature_url} 
                            alt="Signature Preview" 
                            className={`h-16 max-w-full object-contain rounded-md ${isUploadingSignature ? 'opacity-50' : ''}`} 
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            {isUploadingSignature 
                                ? 'กรุณารอสักครู่...' 
                                : 'คลิกไอคอนด้านบนขวาเพื่ออัปโหลดใหม่หรือลบ'
                            }
                        </p>
                        {/* Debug info */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="text-xs text-gray-400 mt-2 p-2 bg-gray-100 rounded">
                                <p>Debug: signature_public_id = {settings.signature_public_id || 'null'}</p>
                                <p>Debug: signature_url = {settings.signature_url ? 'exists' : 'null'}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div 
                        className={`mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 cursor-pointer hover:border-primary transition-colors ${isUploadingSignature ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !isUploadingSignature && signatureFileInputRef.current?.click()}
                    >
                        <div className="text-center">
                            {isUploadingSignature ? (
                                <Loader2 className="mx-auto h-12 w-12 text-gray-300 animate-spin" />
                            ) : (
                                <PenTool className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                            )}
                            <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                <p className="pl-1">
                                    {isUploadingSignature ? 'กำลังอัปโหลด...' : 'คลิกเพื่ออัปโหลดลายเซ็น'}
                                </p>
                            </div>
                            <p className="text-xs leading-5 text-gray-600">PNG, JPG ขนาดไม่เกิน 5MB</p>
                        </div>
                        <input 
                            ref={signatureFileInputRef} 
                            id="signature-upload" 
                            name="signature-upload" 
                            type="file" 
                            className="sr-only" 
                            onChange={handleSignatureFileChange} 
                            accept="image/*"
                            disabled={isUploadingSignature}
                        />
                    </div>
                )}
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default SettingsManagement;