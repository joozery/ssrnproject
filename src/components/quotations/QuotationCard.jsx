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
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const QuotationCard = ({ 
  quotation, 
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
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'sent':
        return <Send className="h-4 w-4 text-blue-600" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-gray-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'sent':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'draft':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const customerName = getCustomerName(quotation.customer_id);
  const statusLabel = getStatusLabel(quotation.status);
  const documentNumber = quotation.quotation_number || quotation.docNumber || quotation.invoiceNumber;
  const totalAmount = quotation.total_amount || quotation.amount || 0;
  const issueDate = quotation.issue_date || quotation.issueDate;

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
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-gray-900 text-sm">
                {documentNumber}
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
              <DropdownMenuItem onClick={() => onView(quotation)}>
                <Eye className="mr-2 h-4 w-4" />
                ดูรายละเอียด
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(quotation)}>
                <Edit className="mr-2 h-4 w-4" />
                แก้ไข
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(quotation)}
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
          {quotation.subject && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {quotation.subject}
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
            {getStatusIcon(quotation.status)}
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(quotation.status)}`}>
              {statusLabel}
            </span>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(quotation)}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(quotation)}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer - Additional Info */}
      {(quotation.notes || quotation.due_date) && (
        <div className="px-4 pb-4">
          {quotation.due_date && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Calendar className="h-3 w-3" />
              <span>ครบกำหนด: {formatDate(quotation.due_date)}</span>
            </div>
          )}
          {quotation.notes && (
            <p className="text-xs text-gray-500 line-clamp-2">
              {quotation.notes}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default QuotationCard; 