
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FilePlus, DollarSign } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';
import DataCard from '@/components/DataCard';
import InvoiceCard from '@/components/invoices/InvoiceCard';
import InvoiceEditor from '@/components/InvoiceEditor';

const QuotationManagement = ({ companyInfo }) => {
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list'); // 'list' or 'editor'
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  useEffect(() => {
    const savedDocs = localStorage.getItem('invoices'); // All docs are stored here
    const savedCustomers = localStorage.getItem('customers');
    
    if (savedDocs) {
      const allDocs = JSON.parse(savedDocs);
      setQuotations(allDocs.filter(doc => doc.type === 'quotation'));
    }
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
  }, []);

  const saveAllDocuments = (updatedDocs) => {
    localStorage.setItem('invoices', JSON.stringify(updatedDocs));
    const filteredQuotations = updatedDocs.filter(doc => doc.type === 'quotation');
    setQuotations(filteredQuotations);
  };
  
  const handleSaveQuotation = (quotationData) => {
    const allDocs = JSON.parse(localStorage.getItem('invoices') || '[]');
    const existingIndex = allDocs.findIndex(doc => doc.id === quotationData.id);

    if (existingIndex > -1) {
        const updatedDocs = [...allDocs];
        updatedDocs[existingIndex] = quotationData;
        saveAllDocuments(updatedDocs);
        toast({ title: "สำเร็จ!", description: "แก้ไขใบเสนอราคาเรียบร้อยแล้ว" });
    } else {
        saveAllDocuments([...allDocs, quotationData]);
        toast({ title: "สำเร็จ!", description: "สร้างใบเสนอราคาใหม่เรียบร้อยแล้ว" });
    }
    setView('list');
    setSelectedQuotation(null);
  };

  const handleAddNew = () => {
    setSelectedQuotation(null);
    setView('editor');
  };

  const handleEdit = (quotation) => {
    setSelectedQuotation(quotation);
    setView('editor');
  };
  
  const handleView = (quotation) => {
    setSelectedQuotation(quotation);
    setView('editor');
  };

  const handleDelete = (id) => {
    const allDocs = JSON.parse(localStorage.getItem('invoices') || '[]');
    const updatedDocs = allDocs.filter(doc => doc.id !== id);
    saveAllDocuments(updatedDocs);
    toast({ title: "สำเร็จ!", description: "ลบใบเสนอราคาเรียบร้อยแล้ว" });
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'ไม่ระบุ';
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.draft;
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'แบบร่าง',
      sent: 'ส่งแล้ว',
      approved: 'อนุมัติแล้ว',
      rejected: 'ปฏิเสธ'
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type) => {
    return 'ใบเสนอราคา';
  };

  const filteredQuotations = quotations.filter(q =>
    (q.docNumber || q.invoiceNumber).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCustomerName(q.customerId).toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));

  const totalApprovedValue = quotations
    .filter(q => q.status === 'approved')
    .reduce((sum, q) => sum + Number(q.amount), 0);

  const stats = [
    { title: 'มูลค่าที่อนุมัติแล้ว', value: `฿${totalApprovedValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: DollarSign, color: 'bg-green-500' },
    { title: 'รอการตอบกลับ', value: quotations.filter(q => q.status === 'sent').length, icon: FilePlus, color: 'bg-blue-500' },
    { title: 'ใบเสนอราคาทั้งหมด', value: quotations.length, icon: FilePlus, color: 'bg-purple-500' },
  ];

  if (view === 'editor') {
    return (
      <InvoiceEditor 
        selectedDocument={selectedQuotation}
        customers={customers}
        onSave={handleSaveQuotation}
        onBack={() => setView('list')}
        companyInfo={companyInfo}
        docType="quotation"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ใบเสนอราคา"
        description="สร้างและจัดการใบเสนอราคาสำหรับลูกค้าของคุณ"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            placeholder="ค้นหา (เลขที่, ชื่อลูกค้า)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          สร้างใบเสนอราคา
        </Button>
      </div>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
        {filteredQuotations.map((quotation, index) => (
          <InvoiceCard
            key={quotation.id}
            invoice={quotation}
            index={index}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getCustomerName={getCustomerName}
            getTypeLabel={getTypeLabel}
            getStatusLabel={getStatusLabel}
            getStatusColor={getStatusColor}
          />
        ))}
        </AnimatePresence>
      </motion.div>

      {filteredQuotations.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FilePlus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? 'ไม่พบใบเสนอราคาที่ค้นหา' : 'ยังไม่มีใบเสนอราคา'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default QuotationManagement;
