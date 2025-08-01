
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileText, DollarSign, Loader2, Grid, List } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';
import DataCard from '@/components/DataCard';
import InvoiceCard from '@/components/invoices/InvoiceCard';
import InvoiceTable from '@/components/invoices/InvoiceTable';
import InvoiceEditor from '@/components/InvoiceEditor';
import api from '@/lib/axios';

const InvoiceManagement = ({ companyInfo }) => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list'); // 'list' or 'editor'
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Debug - Fetching invoices...');
      
      // ใช้ API ใหม่สำหรับใบแจ้งหนี้และใบเสร็จรับเงิน
      const response = await api.get('/invoices');
      console.log('🔍 Debug - API Response:', response.data);
      
      if (response.data.success) {
        // แสดงข้อมูลทั้งใบแจ้งหนี้และใบเสร็จรับเงิน
        setInvoices(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      console.error('Error details:', error.response?.data);
      toast({
        title: "ผิดพลาด!",
        description: "ไม่สามารถโหลดข้อมูลใบแจ้งหนี้ได้",
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
  
  const handleSaveInvoice = async (invoiceData) => {
    try {
      setIsSubmitting(true);
      
      console.log('🔍 Debug - Saving invoice document type:', invoiceData.documentType || invoiceData.type);
      
      // ตรวจสอบประเภทเอกสาร
      const documentType = invoiceData.documentType || invoiceData.type;
      
      // Convert frontend field names to backend field names
      const formatDateForAPI = (dateString) => {
        if (!dateString) return null;
        // If it's already in YYYY-MM-DD format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          return dateString;
        }
        // If it's ISO format, extract the date part
        if (dateString.includes('T')) {
          return dateString.split('T')[0];
        }
        return dateString;
      };

      const apiData = {
        invoice_number: invoiceData.invoiceNumber || invoiceData.docNumber || '',
        customer_id: invoiceData.customerId || '',
        issue_date: formatDateForAPI(invoiceData.issueDate),
        due_date: formatDateForAPI(invoiceData.dueDate),
        subject: invoiceData.subject || '',
        notes: invoiceData.notes || '',
        internal_notes: invoiceData.internalNotes || '',
        subtotal: parseFloat(invoiceData.subtotal) || 0,
        vat_amount: parseFloat(invoiceData.vatAmount) || 0,
        withholding_tax: parseFloat(invoiceData.withholdingTax) || 0,
        total_amount: parseFloat(invoiceData.totalAmount || invoiceData.amount) || 0,
        status: invoiceData.status || 'pending',
        type: documentType, // ใช้ประเภทเอกสารที่เลือก
        payment_method: invoiceData.paymentMethod || 'โอนเข้าบัญชี',
        payment_date: formatDateForAPI(invoiceData.paymentDate),
        reference_number: invoiceData.referenceNumber || '',
        items: (invoiceData.items || []).map(item => ({
          description: item.description || '',
          details: item.details || '',
          quantity: parseFloat(item.quantity) || 1,
          unit: item.unit || 'หน่วย',
          unit_price: parseFloat(item.unitPrice || item.unit_price) || 0,
          discount: parseFloat(item.discount) || 0,
          amount: parseFloat(item.amount) || 0
        }))
      };

      console.log('🔍 Debug - Frontend invoiceData:', invoiceData);
      console.log('🔍 Debug - API data being sent:', apiData);

      if (selectedInvoice) {
        const response = await api.put(`/invoices/${selectedInvoice.id}`, apiData);
        if (response.data.success) {
          const successMessage = documentType === 'receipt' ? 'แก้ไขใบเสร็จรับเงินเรียบร้อยแล้ว' : 'แก้ไขใบแจ้งหนี้เรียบร้อยแล้ว';
          toast({ title: "สำเร็จ!", description: successMessage });
          fetchInvoices();
        }
      } else {
        const response = await api.post('/invoices', apiData);
        if (response.data.success) {
          const successMessage = documentType === 'receipt' ? 'สร้างใบเสร็จรับเงินใหม่เรียบร้อยแล้ว' : 'สร้างใบแจ้งหนี้ใหม่เรียบร้อยแล้ว';
          toast({ title: "สำเร็จ!", description: successMessage });
          fetchInvoices();
        }
      }
      
      setView('list');
      setSelectedInvoice(null);
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.response?.data?.error || "ไม่สามารถบันทึกเอกสารได้",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNew = () => {
    setSelectedInvoice(null);
    setView('editor');
  };

  const handleEdit = async (invoice) => {
    try {
      setIsLoadingDetail(true);
      // Fetch detailed invoice data including items
      const response = await api.get(`/invoices/${invoice.id}`);
      if (response.data.success) {
        const detailedInvoice = response.data.data;
        
        // Convert backend data structure to frontend structure
        const convertedInvoice = {
          id: detailedInvoice.id,
          docNumber: detailedInvoice.invoice_number || detailedInvoice.docNumber,
          customerId: detailedInvoice.customer_id,
          issueDate: detailedInvoice.issue_date ? detailedInvoice.issue_date.split('T')[0] : '',
          dueDate: detailedInvoice.due_date ? detailedInvoice.due_date.split('T')[0] : '',
          subject: detailedInvoice.subject,
          notes: detailedInvoice.notes,
          internalNotes: detailedInvoice.internal_notes,
          subtotal: detailedInvoice.subtotal,
          vatAmount: detailedInvoice.vat_amount,
          withholdingTax: detailedInvoice.withholding_tax,
          totalAmount: detailedInvoice.total_amount,
          status: detailedInvoice.status,
          type: detailedInvoice.type,
          paymentMethod: detailedInvoice.payment_method,
          paymentDate: detailedInvoice.payment_date ? detailedInvoice.payment_date.split('T')[0] : '',
          referenceNumber: detailedInvoice.reference_number,
          items: detailedInvoice.items || [],
          includeVat: true,
          createdAt: detailedInvoice.created_at
        };
        
        console.log('🔍 Debug - Detailed invoice data:', detailedInvoice);
        console.log('🔍 Debug - Converted invoice:', convertedInvoice);
        
        setSelectedInvoice(convertedInvoice);
        setView('editor');
      }
    } catch (error) {
      console.error('Error fetching detailed invoice:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลใบแจ้งหนี้ได้",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };
  
  const handleView = async (invoice) => {
    try {
      setIsLoadingDetail(true);
      // Fetch detailed invoice data including items
      const response = await api.get(`/invoices/${invoice.id}`);
      if (response.data.success) {
        const detailedInvoice = response.data.data;
        
        // Convert backend data structure to frontend structure
        const convertedInvoice = {
          id: detailedInvoice.id,
          docNumber: detailedInvoice.invoice_number || detailedInvoice.docNumber,
          customerId: detailedInvoice.customer_id,
          issueDate: detailedInvoice.issue_date ? detailedInvoice.issue_date.split('T')[0] : '',
          dueDate: detailedInvoice.due_date ? detailedInvoice.due_date.split('T')[0] : '',
          subject: detailedInvoice.subject,
          notes: detailedInvoice.notes,
          internalNotes: detailedInvoice.internal_notes,
          subtotal: detailedInvoice.subtotal,
          vatAmount: detailedInvoice.vat_amount,
          withholdingTax: detailedInvoice.withholding_tax,
          totalAmount: detailedInvoice.total_amount,
          status: detailedInvoice.status,
          type: detailedInvoice.type,
          paymentMethod: detailedInvoice.payment_method,
          paymentDate: detailedInvoice.payment_date ? detailedInvoice.payment_date.split('T')[0] : '',
          referenceNumber: detailedInvoice.reference_number,
          items: detailedInvoice.items || [],
          includeVat: true,
          createdAt: detailedInvoice.created_at
        };
        
        console.log('🔍 Debug - Detailed invoice data (view):', detailedInvoice);
        console.log('🔍 Debug - Converted invoice (view):', convertedInvoice);
        
        setSelectedInvoice(convertedInvoice);
        setView('editor');
      }
    } catch (error) {
      console.error('Error fetching detailed invoice:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลใบแจ้งหนี้ได้",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/invoices/${id}`);
      if (response.data.success) {
        toast({ title: "สำเร็จ!", description: "ลบเอกสารเรียบร้อยแล้ว" });
        fetchInvoices();
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.response?.data?.error || "ไม่สามารถลบเอกสารได้",
        variant: "destructive"
      });
    }
  };

  const getCustomerName = (customerId) => {
    if (!customerId || !customers || customers.length === 0) {
      return 'ไม่ระบุ';
    }
    const customer = customers.find(c => c && c.id === customerId);
    return customer && customer.name ? customer.name : 'ไม่ระบุ';
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

  const filteredInvoices = invoices.filter(invoice => {
    if (!invoice) return false;
    
    const invoiceNumber = (invoice.invoice_number || invoice.invoiceNumber || invoice.docNumber || '').toLowerCase();
    const customerName = getCustomerName(invoice.customer_id || invoice.customerId || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return invoiceNumber.includes(searchLower) || customerName.includes(searchLower);
  }).sort((a, b) => {
    const dateA = a.issue_date || a.issueDate;
    const dateB = b.issue_date || b.issueDate;
    if (!dateA || !dateB) return 0;
    return new Date(dateB) - new Date(dateA);
  });

  const totalPending = invoices
    .filter(invoice => invoice && invoice.status === 'pending')
    .reduce((sum, invoice) => sum + Number(invoice.total_amount || invoice.amount || 0), 0);

  const totalPaid = invoices
    .filter(invoice => invoice && invoice.status === 'paid')
    .reduce((sum, invoice) => sum + Number(invoice.total_amount || invoice.amount || 0), 0);

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
        isSubmitting={isSubmitting}
        isLoadingDetail={isLoadingDetail}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ใบแจ้งหนี้/ใบเสร็จรับเงิน"
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

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('card')}
              className="h-8 px-3"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            สร้างเอกสารใหม่
          </Button>
        </div>
      </div>

      {isLoading || isLoadingDetail ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">
            {isLoadingDetail ? 'กำลังโหลดข้อมูลรายละเอียด...' : 'กำลังโหลดข้อมูลใบแจ้งหนี้...'}
          </span>
        </div>
      ) : viewMode === 'card' ? (
        <>
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                getStatusLabel={getStatusLabel}
                getStatusColor={getStatusColor}
              />
            ))}
            </AnimatePresence>
          </motion.div>

          {!isLoading && filteredInvoices.length === 0 && (
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
        </>
      ) : (
        <InvoiceTable
          invoices={filteredInvoices}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          getCustomerName={getCustomerName}
          getStatusLabel={getStatusLabel}
          getStatusColor={getStatusColor}
        />
      )}
    </div>
  );
};

export default InvoiceManagement;
