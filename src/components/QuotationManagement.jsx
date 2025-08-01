
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FilePlus, DollarSign, Loader2, Grid, List } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';
import DataCard from '@/components/DataCard';
import QuotationCard from '@/components/quotations/QuotationCard';
import QuotationTable from '@/components/quotations/QuotationTable';
import InvoiceEditor from '@/components/InvoiceEditor';
import api from '@/lib/axios';
import Swal from 'sweetalert2';

const QuotationManagement = ({ companyInfo, onNavigateToInvoices }) => {
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list'); // 'list' or 'editor'
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    fetchQuotations();
    fetchCustomers();
  }, []);

  const fetchQuotations = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Debug - Fetching quotations...');
      
      // ดึงข้อมูลใบเสนอราคาจากตาราง quotations โดยกรองเฉพาะ type = 'quotation'
      const response = await api.get('/quotations?type=quotation');
      console.log('🔍 Debug - API Response:', response.data);
      
      if (response.data.success) {
        setQuotations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
      console.error('Error details:', error.response?.data);
      
      // แสดง SweetAlert ข้อผิดพลาด
      Swal.fire({
        title: 'ผิดพลาด!',
        text: 'ไม่สามารถโหลดข้อมูลใบเสนอราคาได้',
        icon: 'error',
        confirmButtonText: 'ตกลง'
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
      
      // แสดง SweetAlert ข้อผิดพลาด
      Swal.fire({
        title: 'ผิดพลาด!',
        text: 'ไม่สามารถโหลดข้อมูลลูกค้าได้',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  };
  
  const handleSaveQuotation = async (quotationData) => {
    try {
      setIsSubmitting(true);
      
      console.log('🔍 Debug - Saving document type:', quotationData.documentType || quotationData.type);
      
      // ตรวจสอบประเภทเอกสาร
      const documentType = quotationData.documentType || quotationData.type;
      
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
        quotation_number: quotationData.quotationNumber || quotationData.docNumber || '',
        customer_id: quotationData.customerId || '',
        issue_date: formatDateForAPI(quotationData.issueDate),
        due_date: formatDateForAPI(quotationData.dueDate),
        subject: quotationData.subject || '',
        notes: quotationData.notes || '',
        internal_notes: quotationData.internalNotes || '',
        subtotal: parseFloat(quotationData.subtotal) || 0,
        vat_amount: parseFloat(quotationData.vatAmount) || 0,
        withholding_tax: parseFloat(quotationData.withholdingTax) || 0,
        total_amount: parseFloat(quotationData.totalAmount || quotationData.amount) || 0,
        status: quotationData.status || 'draft',
        type: documentType, // ใช้ประเภทเอกสารที่เลือก
        items: (quotationData.items || []).map(item => ({
          description: item.description || '',
          details: item.details || '',
          quantity: parseFloat(item.quantity) || 1,
          unit: item.unit || 'หน่วย',
          unit_price: parseFloat(item.unitPrice || item.unit_price) || 0,
          discount: parseFloat(item.discount) || 0,
          amount: parseFloat(item.amount) || 0
        }))
      };

      console.log('🔍 Debug - Frontend quotationData:', quotationData);
      console.log('🔍 Debug - API data being sent:', apiData);

      if (selectedQuotation) {
        // การแก้ไข - บันทึกไปทั้งสองตาราง
        try {
          // 1. แก้ไขในตาราง quotations
          const quotationResponse = await api.put(`/quotations/${selectedQuotation.id}`, apiData);
          
          // 2. แก้ไขในตาราง invoices (ถ้ามี)
          const invoiceApiData = {
            invoice_number: apiData.quotation_number,
            customer_id: apiData.customer_id,
            issue_date: apiData.issue_date,
            due_date: apiData.due_date,
            subject: apiData.subject,
            notes: apiData.notes,
            internal_notes: apiData.internal_notes,
            subtotal: apiData.subtotal,
            vat_amount: apiData.vat_amount,
            withholding_tax: apiData.withholding_tax,
            total_amount: apiData.total_amount,
            status: 'pending', // ใบแจ้งหนี้เริ่มต้นเป็น pending
            type: 'invoice',
            payment_method: 'โอนเข้าบัญชี',
            items: apiData.items
          };

          // ตรวจสอบว่ามีใบแจ้งหนี้อยู่แล้วหรือไม่
          try {
            const existingInvoiceResponse = await api.get(`/invoices?invoice_number=${apiData.quotation_number}`);
            if (existingInvoiceResponse.data.success && existingInvoiceResponse.data.data.length > 0) {
              // ถ้ามีแล้ว ให้อัปเดต
              const invoiceId = existingInvoiceResponse.data.data[0].id;
              await api.put(`/invoices/${invoiceId}`, invoiceApiData);
            } else {
              // ถ้ายังไม่มี ให้สร้างใหม่
              await api.post('/invoices', invoiceApiData);
            }
          } catch (invoiceError) {
            console.log('ไม่สามารถบันทึกในตาราง invoices:', invoiceError);
          }

          if (quotationResponse.data.success) {
            // แสดง SweetAlert สำเร็จ
            Swal.fire({
              title: 'สำเร็จ!',
              text: 'แก้ไขใบเสนอราคาและใบแจ้งหนี้เรียบร้อยแล้ว',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            
            fetchQuotations();
          }
        } catch (error) {
          console.error('Error updating documents:', error);
          throw error;
        }
      } else {
        // การสร้างใหม่ - บันทึกไปทั้งสองตาราง
        try {
          // 1. สร้างในตาราง quotations
          const quotationResponse = await api.post('/quotations', apiData);
          
          // 2. สร้างในตาราง invoices
          const invoiceApiData = {
            invoice_number: apiData.quotation_number,
            customer_id: apiData.customer_id,
            issue_date: apiData.issue_date,
            due_date: apiData.due_date,
            subject: apiData.subject,
            notes: apiData.notes,
            internal_notes: apiData.internal_notes,
            subtotal: apiData.subtotal,
            vat_amount: apiData.vat_amount,
            withholding_tax: apiData.withholding_tax,
            total_amount: apiData.total_amount,
            status: 'pending', // ใบแจ้งหนี้เริ่มต้นเป็น pending
            type: 'invoice',
            payment_method: 'โอนเข้าบัญชี',
            items: apiData.items
          };

          try {
            await api.post('/invoices', invoiceApiData);
          } catch (invoiceError) {
            console.log('ไม่สามารถสร้างในตาราง invoices:', invoiceError);
          }

          if (quotationResponse.data.success) {
            // แสดง SweetAlert สำเร็จ
            Swal.fire({
              title: 'สำเร็จ!',
              text: 'สร้างใบเสนอราคาและใบแจ้งหนี้เรียบร้อยแล้ว',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            
            fetchQuotations();
          }
        } catch (error) {
          console.error('Error creating documents:', error);
          throw error;
        }
      }
      
      setView('list');
      setSelectedQuotation(null);
    } catch (error) {
      console.error('Error saving quotation:', error);
      
      // แสดง SweetAlert ข้อผิดพลาด
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: error.response?.data?.error || "ไม่สามารถบันทึกเอกสารได้",
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNew = () => {
    setSelectedQuotation(null);
    setView('editor');
  };

  const handleBackToList = async () => {
    // ถ้ามีการแก้ไขข้อมูล ให้ยืนยันก่อนออก
    if (selectedQuotation) {
      const result = await Swal.fire({
        title: 'ยืนยันการออก',
        text: 'คุณมีข้อมูลที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ออก',
        cancelButtonText: 'ยกเลิก'
      });

      if (result.isConfirmed) {
        setView('list');
        setSelectedQuotation(null);
      }
    } else {
      setView('list');
      setSelectedQuotation(null);
    }
  };

  const handleEdit = async (quotation) => {
    try {
      setIsLoadingDetail(true);
      
      console.log('🔍 Debug - Editing quotation:', quotation.id);
      
      // Fetch detailed quotation data including items
      const response = await api.get(`/quotations/${quotation.id}`);
      if (response.data.success) {
        const detailedQuotation = response.data.data;
        
        // Convert backend data structure to frontend structure
        const convertedQuotation = {
          id: detailedQuotation.id,
          docNumber: detailedQuotation.quotation_number || detailedQuotation.docNumber,
          customerId: detailedQuotation.customer_id,
          issueDate: detailedQuotation.issue_date ? detailedQuotation.issue_date.split('T')[0] : '',
          dueDate: detailedQuotation.due_date ? detailedQuotation.due_date.split('T')[0] : '',
          subject: detailedQuotation.subject,
          notes: detailedQuotation.notes,
          internalNotes: detailedQuotation.internal_notes,
          subtotal: detailedQuotation.subtotal,
          vatAmount: detailedQuotation.vat_amount,
          withholdingTax: detailedQuotation.withholding_tax,
          totalAmount: detailedQuotation.total_amount,
          status: detailedQuotation.status,
          type: 'quotation',
          items: detailedQuotation.items || [],
          includeVat: true,
          createdAt: detailedQuotation.created_at
        };
        
        console.log('🔍 Debug - Detailed quotation data:', detailedQuotation);
        console.log('🔍 Debug - Converted quotation:', convertedQuotation);
        
        setSelectedQuotation(convertedQuotation);
        setView('editor');
      }
    } catch (error) {
      console.error('Error fetching detailed quotation:', error);
      
      // แสดง SweetAlert ข้อผิดพลาด
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดข้อมูลใบเสนอราคาได้',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };
  
  const handleView = async (quotation) => {
    try {
      setIsLoadingDetail(true);
      
      console.log('🔍 Debug - Viewing quotation:', quotation.id);
      
      // Fetch detailed quotation data including items
      const response = await api.get(`/quotations/${quotation.id}`);
      if (response.data.success) {
        const detailedQuotation = response.data.data;
        
        // แสดง SweetAlert รายละเอียดใบเสนอราคา
        const customerName = getCustomerName(detailedQuotation.customer_id);
        const statusLabel = getStatusLabel(detailedQuotation.status);
        
        let itemsHtml = '';
        if (detailedQuotation.items && detailedQuotation.items.length > 0) {
          itemsHtml = `
            <div class="mt-4">
              <h4 class="font-semibold mb-2">รายการสินค้า:</h4>
              <div class="max-h-40 overflow-y-auto">
                ${detailedQuotation.items.map((item, index) => `
                  <div class="border-b border-gray-200 py-2">
                    <div class="font-medium">${item.description || 'ไม่ระบุ'}</div>
                    <div class="text-sm text-gray-600">
                      จำนวน: ${item.quantity} ${item.unit} | ราคา: ฿${item.unit_price?.toLocaleString() || 0} | รวม: ฿${item.amount?.toLocaleString() || 0}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }
        
        Swal.fire({
          title: `ใบเสนอราคา - ${detailedQuotation.quotation_number}`,
          html: `
            <div class="text-left">
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <strong>ลูกค้า:</strong> ${customerName}
                </div>
                <div>
                  <strong>สถานะ:</strong> <span class="px-2 py-1 rounded text-sm ${getStatusColor(detailedQuotation.status)}">${statusLabel}</span>
                </div>
                <div>
                  <strong>วันที่ออก:</strong> ${detailedQuotation.issue_date || 'ไม่ระบุ'}
                </div>
                <div>
                  <strong>วันครบกำหนด:</strong> ${detailedQuotation.due_date || 'ไม่ระบุ'}
                </div>
              </div>
              <div class="mb-4">
                <strong>เรื่อง:</strong> ${detailedQuotation.subject || 'ไม่ระบุ'}
              </div>
              <div class="mb-4">
                <strong>หมายเหตุ:</strong> ${detailedQuotation.notes || 'ไม่มี'}
              </div>
              <div class="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <strong>ยอดรวม:</strong> ฿${detailedQuotation.subtotal?.toLocaleString() || 0}
                </div>
                <div>
                  <strong>ภาษีมูลค่าเพิ่ม:</strong> ฿${detailedQuotation.vat_amount?.toLocaleString() || 0}
                </div>
                <div>
                  <strong>ยอดรวมทั้งสิ้น:</strong> ฿${detailedQuotation.total_amount?.toLocaleString() || 0}
                </div>
              </div>
              ${itemsHtml}
            </div>
          `,
          width: '800px',
          confirmButtonText: 'ปิด',
          showCloseButton: true,
          customClass: {
            container: 'swal2-custom-container',
            popup: 'swal2-custom-popup'
          }
        });
      }
    } catch (error) {
      console.error('Error fetching detailed quotation:', error);
      
      // แสดง SweetAlert ข้อผิดพลาด
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดข้อมูลใบเสนอราคาได้',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleDelete = async (quotation) => {
    try {
      // แสดง SweetAlert ยืนยันการลบ
      const result = await Swal.fire({
        title: 'ยืนยันการลบ',
        text: `คุณต้องการลบใบเสนอราคา "${quotation.quotation_number}" ใช่หรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        reverseButtons: true
      });

      if (result.isConfirmed) {
        // แสดง loading
        Swal.fire({
          title: 'กำลังลบ...',
          text: 'กรุณารอสักครู่',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        console.log('🔍 Debug - Deleting quotation:', quotation.id);
        
        const response = await api.delete(`/quotations/${quotation.id}`);
        if (response.data.success) {
          // แสดง SweetAlert สำเร็จ
          Swal.fire({
            title: 'สำเร็จ!',
            text: 'ลบใบเสนอราคาเรียบร้อยแล้ว',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          
          fetchQuotations();
        }
      }
    } catch (error) {
      console.error('Error deleting quotation:', error);
      
      // แสดง SweetAlert ข้อผิดพลาด
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: error.response?.data?.error || "ไม่สามารถลบใบเสนอราคาได้",
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
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
    const typeLabels = {
      quotation: 'ใบเสนอราคา',
      invoice: 'ใบแจ้งหนี้',
      receipt: 'ใบเสร็จรับเงิน'
    };
    return typeLabels[type] || 'ใบเสนอราคา';
  };

  const filteredQuotations = quotations.filter(q =>
    (q.quotation_number || q.docNumber || q.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCustomerName(q.customer_id).toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.issue_date || b.issueDate) - new Date(a.issue_date || a.issueDate));

  const totalApprovedValue = quotations
    .filter(q => q.status === 'approved')
    .reduce((sum, q) => sum + Number(q.total_amount || q.amount || 0), 0);

  const stats = [
    { title: 'มูลค่าที่อนุมัติแล้ว', value: `฿${totalApprovedValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: DollarSign, color: 'bg-green-500' },
    { title: 'รอการตอบกลับ', value: quotations.filter(q => q.status === 'sent').length, icon: FilePlus, color: 'bg-blue-500' },
    { title: 'ใบเสนอราคาทั้งหมด', value: quotations.length, icon: FilePlus, color: 'bg-purple-500' },
  ];

  if (view === 'editor') {
    console.log('🔍 Debug - selectedQuotation:', selectedQuotation);
    console.log('🔍 Debug - customers:', customers);
    console.log('🔍 Debug - companyInfo:', companyInfo);
    
    return (
      <InvoiceEditor 
        selectedDocument={selectedQuotation}
        customers={customers}
        onSave={handleSaveQuotation}
        onBack={handleBackToList}
        companyInfo={companyInfo}
        docType="quotation"
        isSubmitting={isSubmitting}
        isLoadingDetail={isLoadingDetail}
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
            สร้างใบเสนอราคา
          </Button>
        </div>
      </div>

      {isLoading || isLoadingDetail ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">
            {isLoadingDetail ? 'กำลังโหลดข้อมูลรายละเอียด...' : 'กำลังโหลดข้อมูลใบเสนอราคา...'}
          </span>
        </div>
      ) : viewMode === 'card' ? (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
          {filteredQuotations.map((quotation, index) => (
          <QuotationCard
            key={quotation.id}
            quotation={quotation}
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
      ) : (
        <QuotationTable
          quotations={filteredQuotations}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          getCustomerName={getCustomerName}
          getStatusLabel={getStatusLabel}
          getStatusColor={getStatusColor}
        />
      )}

      {!isLoading && filteredQuotations.length === 0 && (
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
