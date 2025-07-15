
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileText, DollarSign } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';
import DataCard from '@/components/DataCard';
import InvoiceCard from '@/components/invoices/InvoiceCard';
import InvoiceEditor from '@/components/InvoiceEditor';

const InvoiceManagement = ({ companyInfo }) => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list'); // 'list' or 'editor'
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoices');
    const savedCustomers = localStorage.getItem('customers');
    
    if (savedInvoices) {
      const allDocs = JSON.parse(savedInvoices);
      setInvoices(allDocs.filter(doc => doc.type === 'invoice' || doc.type === 'receipt'));
    }
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
  }, []);

  const saveAllDocuments = (updatedDocs) => {
    localStorage.setItem('invoices', JSON.stringify(updatedDocs));
    const filteredInvoices = updatedDocs.filter(doc => doc.type === 'invoice' || doc.type === 'receipt');
    setInvoices(filteredInvoices);
  };
  
  const handleSaveInvoice = (invoiceData) => {
    const allDocs = JSON.parse(localStorage.getItem('invoices') || '[]');
    const existingIndex = allDocs.findIndex(inv => inv.id === invoiceData.id);

    if (existingIndex > -1) {
        const updatedDocs = [...allDocs];
        updatedDocs[existingIndex] = invoiceData;
        saveAllDocuments(updatedDocs);
        toast({ title: "สำเร็จ!", description: "แก้ไขเอกสารเรียบร้อยแล้ว" });
    } else {
        saveAllDocuments([...allDocs, invoiceData]);
        toast({ title: "สำเร็จ!", description: "สร้างเอกสารใหม่เรียบร้อยแล้ว" });
    }
    setView('list');
    setSelectedInvoice(null);
  };

  const handleAddNew = () => {
    setSelectedInvoice(null);
    setView('editor');
  };

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setView('editor');
  };
  
  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setView('editor');
  };

  const handleDelete = (id) => {
    const allDocs = JSON.parse(localStorage.getItem('invoices') || '[]');
    const updatedDocs = allDocs.filter(doc => doc.id !== id);
    saveAllDocuments(updatedDocs);
    toast({ title: "สำเร็จ!", description: "ลบเอกสารเรียบร้อยแล้ว" });
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'ไม่ระบุ';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'รอชำระ',
      paid: 'ชำระแล้ว',
      overdue: 'เกินกำหนด',
      cancelled: 'ยกเลิก'
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type) => {
    const labels = {
      invoice: 'ใบแจ้งหนี้',
      receipt: 'ใบเสร็จรับเงิน'
    };
    return labels[type] || type;
  };

  const filteredInvoices = invoices.filter(invoice =>
    (invoice.invoiceNumber || invoice.docNumber).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCustomerName(invoice.customerId).toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));

  const totalPending = invoices
    .filter(invoice => invoice.status === 'pending')
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0);

  const totalPaid = invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0);

  const stats = [
    { title: 'ยอดรอชำระ', value: `฿${totalPending.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: DollarSign, color: 'bg-yellow-500' },
    { title: 'ยอดชำระแล้ว (30 วัน)', value: `฿${totalPaid.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: DollarSign, color: 'bg-green-500' },
    { title: 'เอกสารทั้งหมด', value: invoices.length, icon: FileText, color: 'bg-blue-500' },
  ];

  if (view === 'editor') {
    return (
      <InvoiceEditor 
        selectedDocument={selectedInvoice}
        customers={customers}
        onSave={handleSaveInvoice}
        onBack={() => setView('list')}
        companyInfo={companyInfo}
        docType={selectedInvoice ? selectedInvoice.type : 'invoice'}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ใบแจ้งหนี้ / ใบเสร็จ"
        description="สร้างและจัดการเอกสารทางการเงินทั้งหมดของคุณ"
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
          สร้างเอกสารใหม่
        </Button>
      </div>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
        {filteredInvoices.map((invoice, index) => (
          <InvoiceCard
            key={invoice.id}
            invoice={invoice}
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

      {filteredInvoices.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? 'ไม่พบเอกสารที่ค้นหา' : 'ยังไม่มีเอกสาร'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default InvoiceManagement;
