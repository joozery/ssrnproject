import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileText, DollarSign, Users, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';
import DataCard from '@/components/DataCard';
import PaymentVoucherForm from '@/components/payment_vouchers/PaymentVoucherForm';
import PaymentVoucherCard from '@/components/payment_vouchers/PaymentVoucherCard';
import PaymentVoucherPreview from '@/components/payment_vouchers/PaymentVoucherPreview';

const PaymentVoucherManagement = ({ companyInfo }) => {
  const [paymentVouchers, setPaymentVouchers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [previewingVoucher, setPreviewingVoucher] = useState(null);

  useEffect(() => {
    const savedVouchers = localStorage.getItem('paymentVouchers');
    const savedDrivers = localStorage.getItem('drivers');
    
    if (savedVouchers) setPaymentVouchers(JSON.parse(savedVouchers));
    if (savedDrivers) setDrivers(JSON.parse(savedDrivers));
  }, []);

  const saveData = (data) => {
    localStorage.setItem('paymentVouchers', JSON.stringify(data));
    setPaymentVouchers(data);
  };

  const handleSave = (voucherData) => {
    if (editingVoucher) {
      const updatedVouchers = paymentVouchers.map(v =>
        v.id === editingVoucher.id ? { ...voucherData, id: editingVoucher.id } : v
      );
      saveData(updatedVouchers);
      toast({ title: "สำเร็จ!", description: "แก้ไขใบสำคัญจ่ายเรียบร้อยแล้ว" });
    } else {
      const newVoucher = {
        ...voucherData,
        id: `PV-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      saveData([...paymentVouchers, newVoucher]);
      toast({ title: "สำเร็จ!", description: "สร้างใบสำคัญจ่ายใหม่เรียบร้อยแล้ว" });
    }
    setEditingVoucher(null);
    setIsFormOpen(false);
  };

  const handleEdit = (voucher) => {
    setEditingVoucher(voucher);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    const updatedVouchers = paymentVouchers.filter(v => v.id !== id);
    saveData(updatedVouchers);
    toast({ title: "สำเร็จ!", description: "ลบใบสำคัญจ่ายเรียบร้อยแล้ว" });
  };

  const handlePreview = (voucher) => {
    setPreviewingVoucher(voucher);
  };

  const getDriver = (id) => drivers.find(d => d.id === id);

  const filteredVouchers = paymentVouchers.filter(v =>
    (v.voucherNumber && v.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (getDriver(v.driverId)?.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalAmount = paymentVouchers.reduce((sum, v) => sum + Number(v.netAmount || 0), 0);
  const totalPaid = paymentVouchers.filter(v => v.status === 'paid').reduce((sum, v) => sum + Number(v.netAmount || 0), 0);
  const totalPending = paymentVouchers.filter(v => v.status === 'pending').reduce((sum, v) => sum + Number(v.netAmount || 0), 0);

  const stats = [
    { title: 'ยอดรวมทั้งหมด', value: `฿${totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: DollarSign, color: 'bg-blue-500' },
    { title: 'จ่ายแล้ว', value: `฿${totalPaid.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: DollarSign, color: 'bg-green-500' },
    { title: 'รอจ่าย', value: `฿${totalPending.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: DollarSign, color: 'bg-yellow-500' },
    { title: 'ใบสำคัญจ่ายทั้งหมด', value: paymentVouchers.length, icon: FileText, color: 'bg-purple-500' },
  ];

  if (isFormOpen || editingVoucher) {
    return (
      <PaymentVoucherForm
        initialData={editingVoucher}
        drivers={drivers}
        onSave={handleSave}
        onBack={() => {
          setIsFormOpen(false);
          setEditingVoucher(null);
        }}
        companyInfo={companyInfo}
      />
    );
  }

  if (previewingVoucher) {
    return (
      <PaymentVoucherPreview
        voucher={previewingVoucher}
        driver={getDriver(previewingVoucher.driverId)}
        companyInfo={companyInfo}
        onClose={() => setPreviewingVoucher(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="ใบสำคัญจ่าย (Payment Voucher)"
        description="สร้างและจัดการใบสำคัญจ่ายสำหรับพนักงานขับรถ"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <DataCard
            key={stat.title}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            color={stat.color}
            index={index}
          />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="ค้นหาใบสำคัญจ่าย (เลขที่, ชื่อพนักงาน)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          สร้างใบสำคัญจ่ายใหม่
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVouchers.map((voucher, index) => (
          <PaymentVoucherCard
            key={voucher.id}
            voucher={voucher}
            index={index}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPreview={handlePreview}
            driverName={getDriver(voucher.driverId)?.name || 'N/A'}
          />
        ))}
      </div>

      {filteredVouchers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? 'ไม่พบใบสำคัญจ่ายที่ค้นหา' : 'ยังไม่มีใบสำคัญจ่าย'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default PaymentVoucherManagement; 