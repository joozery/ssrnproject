import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileText, Printer } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';
import JobOrderForm from '@/components/job_orders/JobOrderForm';
import JobOrderCard from '@/components/job_orders/JobOrderCard';
import JobOrderPreview from '@/components/job_orders/JobOrderPreview';
import PaymentVoucherForm from '@/components/payment_vouchers/PaymentVoucherForm';
import { useReactToPrint } from 'react-to-print';
import api from '@/lib/axios';

const JobOrderManagement = ({ companyInfo }) => {
  const [jobOrders, setJobOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJobOrder, setEditingJobOrder] = useState(null);
  const [previewingJobOrder, setPreviewingJobOrder] = useState(null);
  const [isPaymentVoucherFormOpen, setIsPaymentVoucherFormOpen] = useState(false);
  const [selectedJobOrderForPayment, setSelectedJobOrderForPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const componentToPrintRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentToPrintRef.current,
  });

  useEffect(() => {
    fetchJobOrders();
    fetchCustomers();
    fetchDrivers();
    fetchVehicles();
  }, []);

  const fetchJobOrders = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/job-orders');
      if (response.data.success) {
        setJobOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching job orders:', error);
      toast({
        title: "ผิดพลาด!",
        description: "ไม่สามารถโหลดข้อมูลใบสั่งงานได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "ผิดพลาด!",
        description: "ไม่สามารถโหลดข้อมูลลูกค้าได้",
        variant: "destructive",
      });
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      if (response.data.success) {
        setDrivers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast({
        title: "ผิดพลาด!",
        description: "ไม่สามารถโหลดข้อมูลพนักงานขับรถได้",
        variant: "destructive",
      });
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      if (response.data.success) {
        setVehicles(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: "ผิดพลาด!",
        description: "ไม่สามารถโหลดข้อมูลรถได้",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (jobOrderData) => {
    try {
      setIsSubmitting(true);
      
      // Convert frontend field names to backend field names
      const apiData = {
        job_order_number: jobOrderData.jobOrderNumber,
        job_order_volume: jobOrderData.jobOrderVolume,
        date: jobOrderData.date,
        customer_id: jobOrderData.customerId,
        container_number: jobOrderData.containerNumber,
        seal_number: jobOrderData.sealNumber,
        agent: jobOrderData.agent,
        booking_number: jobOrderData.bookingNumber,
        container_size: jobOrderData.containerSize,
        pickup_location: jobOrderData.pickupLocation,
        pickup_date: jobOrderData.pickupDate,
        delivery_location: jobOrderData.deliveryLocation,
        delivery_date: jobOrderData.deliveryDate,
        return_location: jobOrderData.returnLocation,
        return_date: jobOrderData.returnDate,
        special_instructions: jobOrderData.specialInstructions,
        driver_id: jobOrderData.driverId,
        vehicle_id: jobOrderData.vehicleId,
        invoice_address: jobOrderData.invoiceAddress,
        pickup_fee: jobOrderData.pickupFee || 0,
        return_fee: jobOrderData.returnFee || 0,
        tire_fee: jobOrderData.tireFee || 0,
        overnight_fee: jobOrderData.overnightFee || 0,
        storage_fee: jobOrderData.storageFee || 0,
        fuel_fee: jobOrderData.fuelFee || 0,
        status: jobOrderData.status || 'pending'
      };

      if (editingJobOrder) {
        const response = await api.put(`/job-orders/${editingJobOrder.id}`, apiData);
        if (response.data.success) {
          toast({ title: "สำเร็จ!", description: "แก้ไขใบสั่งงานเรียบร้อยแล้ว" });
          fetchJobOrders();
        }
      } else {
        const response = await api.post('/job-orders', apiData);
        if (response.data.success) {
          toast({ title: "สำเร็จ!", description: "สร้างใบสั่งงานใหม่เรียบร้อยแล้ว" });
          fetchJobOrders();
        }
      }
      
      setEditingJobOrder(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving job order:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.response?.data?.error || "ไม่สามารถบันทึกใบสั่งงานได้",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (jobOrder) => {
    setEditingJobOrder(jobOrder);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/job-orders/${id}`);
      if (response.data.success) {
        toast({ title: "สำเร็จ!", description: "ลบใบสั่งงานเรียบร้อยแล้ว" });
        fetchJobOrders();
      }
    } catch (error) {
      console.error('Error deleting job order:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.response?.data?.error || "ไม่สามารถลบใบสั่งงานได้",
        variant: "destructive"
      });
    }
  };

  const handlePreview = (jobOrder) => {
    setPreviewingJobOrder(jobOrder);
  };

  const handleCreatePaymentVoucher = (jobOrder) => {
    setSelectedJobOrderForPayment(jobOrder);
    setIsPaymentVoucherFormOpen(true);
  };

  const handleSavePaymentVoucher = (voucherData) => {
    // บันทึกใบสำคัญจ่ายใหม่
    const savedVouchers = JSON.parse(localStorage.getItem('paymentVouchers') || '[]');
    const newVoucher = {
      ...voucherData,
      id: `PV-${Date.now()}`,
      createdAt: new Date().toISOString(),
      sourceJobOrderId: selectedJobOrderForPayment.id, // เพิ่มการอ้างอิงถึงใบสั่งงานต้นฉบับ
    };
    
    localStorage.setItem('paymentVouchers', JSON.stringify([...savedVouchers, newVoucher]));
    toast({ title: "สำเร็จ!", description: "สร้างใบสำคัญจ่ายใหม่เรียบร้อยแล้ว" });
    
    setIsPaymentVoucherFormOpen(false);
    setSelectedJobOrderForPayment(null);
  };

  const getCustomer = (id) => customers.find(c => c.id === id);
  const getDriver = (id) => drivers.find(d => d.id === id);
  const getVehicle = (id) => vehicles.find(v => v.id === id);

  const filteredJobOrders = jobOrders.filter(jo =>
    (jo.job_order_number && jo.job_order_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (getCustomer(jo.customer_id)?.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isFormOpen || editingJobOrder) {
    return (
      <JobOrderForm
        initialData={editingJobOrder}
        customers={customers}
        drivers={drivers}
        vehicles={vehicles}
        onSave={handleSave}
        onBack={() => {
          setIsFormOpen(false);
          setEditingJobOrder(null);
        }}
        isSubmitting={isSubmitting}
      />
    );
  }

  if (isPaymentVoucherFormOpen && selectedJobOrderForPayment) {
    // คำนวณยอดรวมจากใบสั่งงาน
    const totalFromJobOrder = (parseFloat(selectedJobOrderForPayment.pickup_fee) || 0) + 
                             (parseFloat(selectedJobOrderForPayment.return_fee) || 0) + 
                             (parseFloat(selectedJobOrderForPayment.tire_fee) || 0) + 
                             (parseFloat(selectedJobOrderForPayment.overnight_fee) || 0) + 
                             (parseFloat(selectedJobOrderForPayment.storage_fee) || 0) + 
                             (parseFloat(selectedJobOrderForPayment.fuel_fee) || 0);

    // สร้างข้อมูลเริ่มต้นสำหรับใบสำคัญจ่ายจากใบสั่งงาน
    const initialVoucherData = {
      voucherNumber: '',
      driverId: selectedJobOrderForPayment.driver_id,
      issueDate: new Date().toISOString().split('T')[0],
      items: [{
        date: selectedJobOrderForPayment.date,
        description: `งานขนส่ง ${selectedJobOrderForPayment.container_number || ''} ${selectedJobOrderForPayment.delivery_location || ''} (${selectedJobOrderForPayment.job_order_number})`,
        size: selectedJobOrderForPayment.container_size,
        pricePerTrip: 0,
        advancePayment: 0,
        pickupReturnFee: totalFromJobOrder
      }],
      notes: `สร้างจากใบสั่งงาน ${selectedJobOrderForPayment.job_order_number} - เล่มที่ ${selectedJobOrderForPayment.job_order_volume || ''} - เบอร์ตู้ ${selectedJobOrderForPayment.container_number || ''} - เบอร์ซีล ${selectedJobOrderForPayment.seal_number || ''}`,
      status: 'pending',
      paymentMethod: 'โอนเข้าบัญชี',
      bankName: 'kbank'
    };

    return (
      <PaymentVoucherForm
        initialData={initialVoucherData}
        drivers={drivers}
        onSave={handleSavePaymentVoucher}
        onBack={() => {
          setIsPaymentVoucherFormOpen(false);
          setSelectedJobOrderForPayment(null);
        }}
        companyInfo={companyInfo}
      />
    );
  }

  if (previewingJobOrder) {
    return (
      <JobOrderPreview
        ref={componentToPrintRef}
        jobOrder={previewingJobOrder}
        customer={getCustomer(previewingJobOrder.customer_id)}
        driver={getDriver(previewingJobOrder.driver_id)}
        vehicle={getVehicle(previewingJobOrder.vehicle_id)}
        companyInfo={companyInfo}
        onPrint={handlePrint}
        onClose={() => setPreviewingJobOrder(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="ใบสั่งงาน (Job Orders)"
        description="จัดการและสร้างใบสั่งงานสำหรับการขนส่ง"
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="ค้นหาใบสั่งงาน (เลขที่, ชื่อลูกค้า)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          สร้างใบสั่งงานใหม่
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">กำลังโหลดข้อมูลใบสั่งงาน...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobOrders.map((jo, index) => (
          <JobOrderCard
            key={jo.id}
            jobOrder={jo}
            index={index}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPreview={handlePreview}
            onCreatePaymentVoucher={handleCreatePaymentVoucher}
            customerName={getCustomer(jo.customer_id)?.name || 'N/A'}
            driverName={getDriver(jo.driver_id)?.name || 'N/A'}
          />
        ))}
      </div>
      )}

      {!isLoading && filteredJobOrders.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? 'ไม่พบใบสั่งงานที่ค้นหา' : 'ยังไม่มีใบสั่งงาน'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default JobOrderManagement;