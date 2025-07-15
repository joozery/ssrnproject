import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const BookingForm = ({ formData, setFormData, handleSubmit, editingBooking, customers, drivers, vehicles }) => {
  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {editingBooking ? 'แก้ไขการจอง' : 'เพิ่มการจองใหม่'}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="containerNumber">เบอร์ตู้</Label>
            <Input
              id="containerNumber"
              value={formData.containerNumber}
              onChange={(e) => setFormData({...formData, containerNumber: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="containerSize">ขนาดตู้</Label>
            <select
              id="containerSize"
              value={formData.containerSize}
              onChange={(e) => setFormData({...formData, containerSize: e.target.value})}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="20">20 ฟุต</option>
              <option value="40">40 ฟุต</option>
              <option value="45">45 ฟุต</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerId">ลูกค้า</Label>
            <select
              id="customerId"
              value={formData.customerId}
              onChange={(e) => setFormData({...formData, customerId: e.target.value})}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">เลือกลูกค้า</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="driverId">พนักงานขับรถ</Label>
            <select
              id="driverId"
              value={formData.driverId}
              onChange={(e) => setFormData({...formData, driverId: e.target.value})}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">เลือกพนักงานขับรถ</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.id}>{driver.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="vehicleId">รถ</Label>
          <select
            id="vehicleId"
            value={formData.vehicleId}
            onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          >
            <option value="">เลือกรถ</option>
            {vehicles.filter(v => v.status === 'active').map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>{vehicle.licensePlate}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="pickupLocation">สถานที่รับตู้</Label>
          <Input
            id="pickupLocation"
            value={formData.pickupLocation}
            onChange={(e) => setFormData({...formData, pickupLocation: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="deliveryLocation">สถานที่ส่งตู้</Label>
          <Input
            id="deliveryLocation"
            value={formData.deliveryLocation}
            onChange={(e) => setFormData({...formData, deliveryLocation: e.target.value})}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pickupFee">ค่ารับตู้</Label>
            <Input
              id="pickupFee"
              type="number"
              value={formData.pickupFee}
              onChange={(e) => setFormData({...formData, pickupFee: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="returnFee">ค่าคืนตู้</Label>
            <Input
              id="returnFee"
              type="number"
              value={formData.returnFee}
              onChange={(e) => setFormData({...formData, returnFee: e.target.value})}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bookingDate">วันที่จอง</Label>
            <Input
              id="bookingDate"
              type="date"
              value={formData.bookingDate}
              onChange={(e) => setFormData({...formData, bookingDate: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="status">สถานะ</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="pending">รอดำเนินการ</option>
              <option value="in_progress">กำลังขนส่ง</option>
              <option value="completed">เสร็จสิ้น</option>
              <option value="cancelled">ยกเลิก</option>
            </select>
          </div>
        </div>
        <Button type="submit" className="w-full">
          {editingBooking ? 'บันทึกการแก้ไข' : 'เพิ่มการจอง'}
        </Button>
      </form>
    </DialogContent>
  );
};

export default BookingForm;