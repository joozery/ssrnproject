import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Edit, 
  Trash2, 
  DollarSign, 
  Calendar,
  User,
  FileText
} from 'lucide-react';

const ReceiptCard = ({ 
  receipt, 
  index, 
  onView, 
  onEdit, 
  onDelete, 
  getCustomerName, 
  getInvoiceNumber, 
  getStatusLabel, 
  getStatusColor 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold">
                {receipt.receipt_number || 'ไม่มีเลขที่'}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                ใบเสร็จรับเงิน
              </p>
            </div>
            <Badge className={getStatusColor(receipt.status)}>
              {getStatusLabel(receipt.status)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Customer Info */}
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">ลูกค้า:</span>
            <span>{getCustomerName(receipt.customer_id)}</span>
          </div>

          {/* Invoice Info */}
          {receipt.invoice_id && (
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">ใบแจ้งหนี้:</span>
              <span>{getInvoiceNumber(receipt.invoice_id)}</span>
            </div>
          )}

          {/* Amount */}
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">จำนวนเงิน:</span>
            <span className="text-lg font-semibold text-green-600">
              ฿{Number(receipt.total_amount || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">วันที่ออก:</span>
            <span>
              {receipt.issue_date ? new Date(receipt.issue_date).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
            </span>
          </div>

          {/* Payment Method */}
          {receipt.payment_method && (
            <div className="text-sm">
              <span className="font-medium">วิธีชำระ:</span>
              <span className="ml-2">{receipt.payment_method}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(receipt)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              ดู
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(receipt)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              แก้ไข
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(receipt)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReceiptCard; 