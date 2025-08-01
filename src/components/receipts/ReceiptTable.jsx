import React from 'react';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Edit, 
  Trash2, 
  DollarSign 
} from 'lucide-react';

const ReceiptTable = ({ 
  receipts, 
  onView, 
  onEdit, 
  onDelete, 
  getCustomerName, 
  getInvoiceNumber, 
  getStatusLabel, 
  getStatusColor 
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>เลขที่ใบเสร็จ</TableHead>
            <TableHead>ลูกค้า</TableHead>
            <TableHead>ใบแจ้งหนี้</TableHead>
            <TableHead>จำนวนเงิน</TableHead>
            <TableHead>วันที่ออก</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead>วิธีชำระ</TableHead>
            <TableHead className="text-right">การดำเนินการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receipts.map((receipt, index) => (
            <motion.tr
              key={receipt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="hover:bg-muted/50"
            >
              <TableCell className="font-medium">
                {receipt.receipt_number || 'ไม่มีเลขที่'}
              </TableCell>
              <TableCell>
                {getCustomerName(receipt.customer_id)}
              </TableCell>
              <TableCell>
                {receipt.invoice_id ? getInvoiceNumber(receipt.invoice_id) : '-'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-600">
                    {Number(receipt.total_amount || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {receipt.issue_date ? new Date(receipt.issue_date).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(receipt.status)}>
                  {getStatusLabel(receipt.status)}
                </Badge>
              </TableCell>
              <TableCell>
                {receipt.payment_method || '-'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(receipt)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(receipt)}
                  >
                    <Edit className="h-4 w-4" />
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
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReceiptTable; 