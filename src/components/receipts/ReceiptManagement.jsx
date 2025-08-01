import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { 
  Plus, 
  Search, 
  FileText, 
  DollarSign, 
  Calendar,
  Grid,
  List,
  Eye,
  Edit,
  Trash2,
  Download
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import DataCard from '@/components/DataCard';
import ReceiptCard from './ReceiptCard';
import ReceiptTable from './ReceiptTable';
import ReceiptForm from './ReceiptForm';
import ReceiptPreview from './ReceiptPreview';
import api from '@/lib/axios';

const ReceiptManagement = ({ companyInfo }) => {
  const [receipts, setReceipts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('card');
  const [view, setView] = useState('list'); // 'list', 'form', 'preview'
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch receipts
  const fetchReceipts = async () => {
    try {
      const response = await api.get('/receipts');
      setReceipts(response.data);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      toast({
        title: "ผิดพลาด!",
        description: "ไม่สามารถโหลดข้อมูลใบเสร็จรับเงินได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Fetch invoices
  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices');
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  useEffect(() => {
    fetchReceipts();
    fetchCustomers();
    fetchInvoices();
  }, []);

  const handleSaveReceipt = async (receiptData) => {
    setIsSubmitting(true);
    try {
      let response;
      if (receiptData.id) {
        // Update existing receipt
        response = await api.put(`/receipts/${receiptData.id}`, receiptData);
        toast({
          title: "สำเร็จ!",
          description: "อัปเดตใบเสร็จรับเงินเรียบร้อยแล้ว",
        });
      } else {
        // Create new receipt
        response = await api.post('/receipts', receiptData);
        toast({
          title: "สำเร็จ!",
          description: "สร้างใบเสร็จรับเงินเรียบร้อยแล้ว",
        });
      }

      await fetchReceipts();
      setView('list');
      setSelectedReceipt(null);
    } catch (error) {
      console.error('Error saving receipt:', error);
      toast({
        title: "ผิดพลาด!",
        description: "ไม่สามารถบันทึกใบเสร็จรับเงินได้",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReceipt = async (receipt) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบใบเสร็จรับเงินนี้?')) {
      return;
    }

    try {
      await api.delete(`/receipts/${receipt.id}`);
      await fetchReceipts();
      toast({
        title: "สำเร็จ!",
        description: "ลบใบเสร็จรับเงินเรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error('Error deleting receipt:', error);
      toast({
        title: "ผิดพลาด!",
        description: "ไม่สามารถลบใบเสร็จรับเงินได้",
        variant: "destructive",
      });
    }
  };

  const handleView = (receipt) => {
    setSelectedReceipt(receipt);
    setView('preview');
  };

  const handleEdit = (receipt) => {
    setSelectedReceipt(receipt);
    setView('form');
  };

  const handleAddNew = () => {
    setSelectedReceipt(null);
    setView('form');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedReceipt(null);
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'ไม่ระบุ';
  };

  const getInvoiceNumber = (invoiceId) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    return invoice ? (invoice.invoice_number || invoice.invoiceNumber || 'ไม่ระบุ') : 'ไม่ระบุ';
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'แบบร่าง',
      issued: 'ออกแล้ว',
      paid: 'ชำระแล้ว',
      cancelled: 'ยกเลิก'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-500',
      issued: 'bg-blue-500',
      paid: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const filteredReceipts = receipts.filter(receipt =>
    (receipt.receipt_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCustomerName(receipt.customer_id).toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date));

  const totalPaidAmount = receipts
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + Number(r.total_amount || 0), 0);

  const stats = [
    { 
      title: 'ยอดชำระรวม', 
      value: `฿${totalPaidAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 
      icon: DollarSign, 
      color: 'bg-green-500' 
    },
    { 
      title: 'ใบเสร็จที่ออกแล้ว', 
      value: receipts.filter(r => r.status === 'issued').length, 
      icon: FileText, 
      color: 'bg-blue-500' 
    },
    { 
      title: 'ใบเสร็จทั้งหมด', 
      value: receipts.length, 
      icon: FileText, 
      color: 'bg-purple-500' 
    },
  ];

  if (view === 'form') {
    return (
      <ReceiptForm
        receipt={selectedReceipt}
        customers={customers}
        invoices={invoices}
        onSave={handleSaveReceipt}
        onBack={handleBackToList}
        companyInfo={companyInfo}
        isSubmitting={isSubmitting}
      />
    );
  }

  if (view === 'preview') {
    return (
      <ReceiptPreview
        receipt={selectedReceipt}
        customer={customers.find(c => c.id === selectedReceipt?.customer_id)}
        invoice={invoices.find(i => i.id === selectedReceipt?.invoice_id)}
        companyInfo={companyInfo}
        onBack={handleBackToList}
        onPrint={() => {
          // Handle print functionality
          window.print();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ใบเสร็จรับเงิน"
        description="สร้างและจัดการใบเสร็จรับเงินสำหรับลูกค้า"
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
            สร้างใบเสร็จใหม่
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredReceipts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">ไม่มีใบเสร็จรับเงิน</h3>
            <p className="text-muted-foreground mb-4">
              เริ่มต้นสร้างใบเสร็จรับเงินแรกของคุณ
            </p>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              สร้างใบเสร็จใหม่
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReceipts.map((receipt, index) => (
                <ReceiptCard
                  key={receipt.id}
                  receipt={receipt}
                  index={index}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDeleteReceipt}
                  getCustomerName={getCustomerName}
                  getInvoiceNumber={getInvoiceNumber}
                  getStatusLabel={getStatusLabel}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          ) : (
            <ReceiptTable
              receipts={filteredReceipts}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteReceipt}
              getCustomerName={getCustomerName}
              getInvoiceNumber={getInvoiceNumber}
              getStatusLabel={getStatusLabel}
              getStatusColor={getStatusColor}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ReceiptManagement; 