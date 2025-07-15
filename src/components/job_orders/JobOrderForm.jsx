import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';

const JobOrderForm = ({ initialData, customers, drivers, vehicles, onSave, onBack }) => {
  const [formData, setFormData] = useState({
    jobOrderNumber: '',
    jobOrderVolume: '',
    date: new Date().toISOString().split('T')[0],
    customerId: '',
    containerNumber: '',
    sealNumber: '',
    agent: '',
    bookingNumber: '',
    containerSize: '20',
    pickupLocation: '',
    pickupDate: '',
    deliveryLocation: '',
    deliveryDate: '',
    returnLocation: '',
    returnDate: '',
    specialInstructions: '',
    driverId: '',
    vehicleId: '',
    invoiceAddress: '',
    pickupFee: 0,
    returnFee: 0,
    tireFee: 0,
    overnightFee: 0,
    storageFee: 0,
    fuelFee: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    } else {
      // Set default job order number for new forms
      setFormData(prev => ({ ...prev, jobOrderNumber: `JO-${Date.now()}` }));
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFeeChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> กลับ
        </Button>
        <h1 className="text-2xl font-bold">
          {initialData ? 'แก้ไขใบสั่งงาน' : 'สร้างใบสั่งงานใหม่'}
        </h1>
        <Button onClick={handleSubmit}>
          <Save className="mr-2 h-4 w-4" /> บันทึก
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลทั่วไป</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="jobOrderVolume">เล่มที่</Label>
              <Input id="jobOrderVolume" name="jobOrderVolume" value={formData.jobOrderVolume} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="jobOrderNumber">เลขที่</Label>
              <Input id="jobOrderNumber" name="jobOrderNumber" value={formData.jobOrderNumber} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="date">วันที่</Label>
              <Input id="date" name="date" type="date" value={formData.date} onChange={handleInputChange} required />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลการขนส่ง</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerId">ลูกค้า</Label>
                <select id="customerId" name="customerId" value={formData.customerId} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                  <option value="">เลือกลูกค้า</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="invoiceAddress">ที่อยู่ออกใบเสร็จ</Label>
                <Input id="invoiceAddress" name="invoiceAddress" value={formData.invoiceAddress} onChange={handleInputChange} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="containerNumber">เบอร์ตู้</Label>
                <Input id="containerNumber" name="containerNumber" value={formData.containerNumber} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="sealNumber">เบอร์ซีล</Label>
                <Input id="sealNumber" name="sealNumber" value={formData.sealNumber} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="bookingNumber">เบอร์บุ๊คกิ้ง</Label>
                <Input id="bookingNumber" name="bookingNumber" value={formData.bookingNumber} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="containerSize">ขนาดตู้</Label>
                <select id="containerSize" name="containerSize" value={formData.containerSize} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="20">20 ฟุต</option>
                  <option value="40">40 ฟุต</option>
                  <option value="45">45 ฟุต</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="agent">เอเย่นต์</Label>
                <Input id="agent" name="agent" value={formData.agent} onChange={handleInputChange} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <Label htmlFor="pickupLocation">สถานที่รับตู้</Label>
                <Input id="pickupLocation" name="pickupLocation" value={formData.pickupLocation} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="pickupDate">วันที่รับ</Label>
                <Input id="pickupDate" name="pickupDate" type="date" value={formData.pickupDate} onChange={handleInputChange} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <Label htmlFor="deliveryLocation">สถานที่ส่งตู้</Label>
                <Input id="deliveryLocation" name="deliveryLocation" value={formData.deliveryLocation} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="deliveryDate">วันที่ส่ง</Label>
                <Input id="deliveryDate" name="deliveryDate" type="date" value={formData.deliveryDate} onChange={handleInputChange} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <Label htmlFor="returnLocation">สถานที่คืนตู้</Label>
                <Input id="returnLocation" name="returnLocation" value={formData.returnLocation} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="returnDate">วันที่คืน</Label>
                <Input id="returnDate" name="returnDate" type="date" value={formData.returnDate} onChange={handleInputChange} />
              </div>
            </div>
            <div>
              <Label htmlFor="specialInstructions">คำสั่งพิเศษ</Label>
              <Textarea id="specialInstructions" name="specialInstructions" value={formData.specialInstructions} onChange={handleInputChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="driverId">พนักงานขับรถ</Label>
                <select id="driverId" name="driverId" value={formData.driverId} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                  <option value="">เลือกพนักงานขับรถ</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="vehicleId">ทะเบียนรถ</Label>
                <select id="vehicleId" name="vehicleId" value={formData.vehicleId} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                  <option value="">เลือกรถ</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.licensePlate}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ค่าใช้จ่าย</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="pickupFee">ค่ารับตู้</Label>
              <Input id="pickupFee" name="pickupFee" type="number" value={formData.pickupFee} onChange={handleFeeChange} />
            </div>
            <div>
              <Label htmlFor="returnFee">ค่าคืนตู้</Label>
              <Input id="returnFee" name="returnFee" type="number" value={formData.returnFee} onChange={handleFeeChange} />
            </div>
            <div>
              <Label htmlFor="tireFee">ค่าปะยาง</Label>
              <Input id="tireFee" name="tireFee" type="number" value={formData.tireFee} onChange={handleFeeChange} />
            </div>
            <div>
              <Label htmlFor="overnightFee">ค่าค้างคืน</Label>
              <Input id="overnightFee" name="overnightFee" type="number" value={formData.overnightFee} onChange={handleFeeChange} />
            </div>
            <div>
              <Label htmlFor="storageFee">ค่าฝากตู้</Label>
              <Input id="storageFee" name="storageFee" type="number" value={formData.storageFee} onChange={handleFeeChange} />
            </div>
            <div>
              <Label htmlFor="fuelFee">ค่าน้ำมัน</Label>
              <Input id="fuelFee" name="fuelFee" type="number" value={formData.fuelFee} onChange={handleFeeChange} />
            </div>
          </CardContent>
        </Card>
      </form>
    </motion.div>
  );
};

export default JobOrderForm;