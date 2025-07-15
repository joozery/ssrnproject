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
import { useReactToPrint } from 'react-to-print';

const JobOrderManagement = ({ companyInfo }) => {
  const [jobOrders, setJobOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJobOrder, setEditingJobOrder] = useState(null);
  const [previewingJobOrder, setPreviewingJobOrder] = useState(null);

  const componentToPrintRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentToPrintRef.current,
  });

  useEffect(() => {
    const savedJobOrders = localStorage.getItem('jobOrders');
    const savedCustomers = localStorage.getItem('customers');
    const savedDrivers = localStorage.getItem('drivers');
    const savedVehicles = localStorage.getItem('vehicles');
    
    if (savedJobOrders) setJobOrders(JSON.parse(savedJobOrders));
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    if (savedDrivers) setDrivers(JSON.parse(savedDrivers));
    if (savedVehicles) setVehicles(JSON.parse(savedVehicles));
  }, []);

  const saveData = (data) => {
    localStorage.setItem('jobOrders', JSON.stringify(data));
    setJobOrders(data);
  };

  const handleSave = (jobOrderData) => {
    if (editingJobOrder) {
      const updatedJobOrders = jobOrders.map(jo =>
        jo.id === editingJobOrder.id ? { ...jobOrderData, id: editingJobOrder.id } : jo
      );
      saveData(updatedJobOrders);
      toast({ title: "สำเร็จ!", description: "แก้ไขใบสั่งงานเรียบร้อยแล้ว" });
    } else {
      const newJobOrder = {
        ...jobOrderData,
        id: `JO-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      saveData([...jobOrders, newJobOrder]);
      toast({ title: "สำเร็จ!", description: "สร้างใบสั่งงานใหม่เรียบร้อยแล้ว" });
    }
    setEditingJobOrder(null);
    setIsFormOpen(false);
  };

  const handleEdit = (jobOrder) => {
    setEditingJobOrder(jobOrder);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    const updatedJobOrders = jobOrders.filter(jo => jo.id !== id);
    saveData(updatedJobOrders);
    toast({ title: "สำเร็จ!", description: "ลบใบสั่งงานเรียบร้อยแล้ว" });
  };

  const handlePreview = (jobOrder) => {
    setPreviewingJobOrder(jobOrder);
  };

  const getCustomer = (id) => customers.find(c => c.id === id);
  const getDriver = (id) => drivers.find(d => d.id === id);
  const getVehicle = (id) => vehicles.find(v => v.id === id);

  const filteredJobOrders = jobOrders.filter(jo =>
    (jo.jobOrderNumber && jo.jobOrderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (getCustomer(jo.customerId)?.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
      />
    );
  }

  if (previewingJobOrder) {
    return (
      <JobOrderPreview
        ref={componentToPrintRef}
        jobOrder={previewingJobOrder}
        customer={getCustomer(previewingJobOrder.customerId)}
        driver={getDriver(previewingJobOrder.driverId)}
        vehicle={getVehicle(previewingJobOrder.vehicleId)}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobOrders.map((jo, index) => (
          <JobOrderCard
            key={jo.id}
            jobOrder={jo}
            index={index}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPreview={handlePreview}
            customerName={getCustomer(jo.customerId)?.name || 'N/A'}
            driverName={getDriver(jo.driverId)?.name || 'N/A'}
          />
        ))}
      </div>

      {filteredJobOrders.length === 0 && (
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