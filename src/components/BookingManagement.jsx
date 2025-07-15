import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Package } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';
import BookingCard from '@/components/bookings/BookingCard';
import BookingForm from '@/components/bookings/BookingForm';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [formData, setFormData] = useState({
    containerNumber: '',
    customerId: '',
    driverId: '',
    vehicleId: '',
    pickupLocation: '',
    deliveryLocation: '',
    containerSize: '20',
    pickupFee: '',
    returnFee: '',
    bookingDate: '',
    status: 'pending'
  });

  useEffect(() => {
    const savedBookings = localStorage.getItem('bookings');
    const savedCustomers = localStorage.getItem('customers');
    const savedDrivers = localStorage.getItem('drivers');
    const savedVehicles = localStorage.getItem('vehicles');
    
    if (savedBookings) setBookings(JSON.parse(savedBookings));
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    if (savedDrivers) setDrivers(JSON.parse(savedDrivers));
    if (savedVehicles) setVehicles(JSON.parse(savedVehicles));
  }, []);

  const saveBookings = (updatedBookings) => {
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    setBookings(updatedBookings);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingBooking) {
      const updatedBookings = bookings.map(booking =>
        booking.id === editingBooking.id ? { ...formData, id: editingBooking.id } : booking
      );
      saveBookings(updatedBookings);
      toast({ title: "สำเร็จ!", description: "แก้ไขการจองเรียบร้อยแล้ว" });
    } else {
      const newBooking = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toLocaleDateString('th-TH')
      };
      saveBookings([...bookings, newBooking]);
      toast({ title: "สำเร็จ!", description: "เพิ่มการจองใหม่เรียบร้อยแล้ว" });
    }

    setFormData({ containerNumber: '', customerId: '', driverId: '', vehicleId: '', pickupLocation: '', deliveryLocation: '', containerSize: '20', pickupFee: '', returnFee: '', bookingDate: '', status: 'pending' });
    setEditingBooking(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (booking) => {
    setFormData(booking);
    setEditingBooking(booking);
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    const updatedBookings = bookings.filter(booking => booking.id !== id);
    saveBookings(updatedBookings);
    toast({ title: "สำเร็จ!", description: "ลบการจองเรียบร้อยแล้ว" });
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'ไม่ระบุ';
  };

  const getDriverName = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.name : 'ไม่ระบุ';
  };

  const getVehiclePlate = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? vehicle.licensePlate : 'ไม่ระบุ';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'รอดำเนินการ',
      in_progress: 'กำลังขนส่ง',
      completed: 'เสร็จสิ้น',
      cancelled: 'ยกเลิก'
    };
    return labels[status] || status;
  };

  const filteredBookings = bookings.filter(booking =>
    booking.containerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCustomerName(booking.customerId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="ระบบจองงาน (Booking)"
        description="บันทึกรายการขนส่ง เชื่อมโยงข้อมูลลูกค้าและพนักงานอัตโนมัติ"
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="ค้นหาการจอง (เบอร์ตู้, ชื่อลูกค้า)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setFormData({ containerNumber: '', customerId: '', driverId: '', vehicleId: '', pickupLocation: '', deliveryLocation: '', containerSize: '20', pickupFee: '', returnFee: '', bookingDate: '', status: 'pending' });
                setEditingBooking(null);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มการจองใหม่
            </Button>
          </DialogTrigger>
          <BookingForm 
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            editingBooking={editingBooking}
            customers={customers}
            drivers={drivers}
            vehicles={vehicles}
          />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBookings.map((booking, index) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            index={index}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getCustomerName={getCustomerName}
            getDriverName={getDriverName}
            getVehiclePlate={getVehiclePlate}
            getStatusLabel={getStatusLabel}
            getStatusColor={getStatusColor}
          />
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? 'ไม่พบการจองที่ค้นหา' : 'ยังไม่มีการจอง'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default BookingManagement;