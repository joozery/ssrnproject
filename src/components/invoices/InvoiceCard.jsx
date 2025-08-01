
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  DollarSign,
  FileText,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const InvoiceCard = ({ 
  invoice, 
  index, 
  onView, 
  onEdit, 
  onDelete, 
  getCustomerName, 
  getStatusLabel, 
  getStatusColor 
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'ไม่ระบุ';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'overdue':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'cancelled':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'invoice':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'receipt':
        return <CreditCard className="h-4 w-4 text-green-600" />;
      default:
        return <FileText className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'invoice':
        return 'ใบแจ้งหนี้';
      case 'receipt':
        return 'ใบเสร็จรับเงิน';
      default:
        return 'เอกสาร';
    }
  };

  const customerName = getCustomerName(invoice.customer_id);
  const statusLabel = getStatusLabel(invoice.status);
  const documentNumber = invoice.invoice_number || invoice.docNumber || invoice.invoiceNumber;
  const totalAmount = invoice.total_amount || invoice.amount || 0;
  const issueDate = invoice.issue_date || invoice.issueDate;
  const documentType = invoice.type || 'invoice';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getTypeIcon(documentType)}
              <span className="font-semibold text-gray-900 text-sm">
                {documentNumber}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                {getTypeLabel(documentType)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(issueDate)}</span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onView(invoice)}>
                <Eye className="mr-2 h-4 w-4" />
                ดูรายละเอียด
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(invoice)}>
                <Edit className="mr-2 h-4 w-4" />
                แก้ไข
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(invoice.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                ลบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Customer Info */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-900 text-sm">
              {customerName}
            </span>
          </div>
          {invoice.subject && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {invoice.subject}
            </p>
          )}
        </div>

        {/* Amount */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-bold text-lg text-gray-900">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(invoice.status)}
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(invoice.status)}`}>
              {statusLabel}
            </span>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(invoice)}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(invoice)}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer - Additional Info */}
      {(invoice.notes || invoice.due_date || invoice.payment_date) && (
        <div className="px-4 pb-4">
          {invoice.due_date && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Calendar className="h-3 w-3" />
              <span>ครบกำหนด: {formatDate(invoice.due_date)}</span>
            </div>
          )}
          {invoice.payment_date && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <CreditCard className="h-3 w-3" />
              <span>วันที่ชำระ: {formatDate(invoice.payment_date)}</span>
            </div>
          )}
          {invoice.notes && (
            <p className="text-xs text-gray-500 line-clamp-2">
              {invoice.notes}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default InvoiceCard;
