
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const InvoiceCard = ({ invoice, index, onView, onEdit, onDelete, getCustomerName, getTypeLabel, getStatusLabel, getStatusColor }) => {
  const docNumber = invoice.docNumber || invoice.invoiceNumber;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="card-hover cursor-pointer" onClick={() => onView(invoice)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              {docNumber}
            </div>
            <div className="flex space-x-1">
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onView(invoice); }}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onEdit(invoice); }}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onDelete(invoice.id); }} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">{getTypeLabel(invoice.type)}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
              {getStatusLabel(invoice.status)}
            </span>
          </div>
          <div>
            <p className="text-lg font-bold">฿{Number(invoice.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            <p className="text-sm text-muted-foreground">ลูกค้า: {getCustomerName(invoice.customerId)}</p>
          </div>
          <div className="space-y-1 text-muted-foreground text-sm">
            <p>วันที่ออก: {new Date(invoice.issueDate).toLocaleDateString('th-TH')}</p>
            <p>ครบกำหนด: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('th-TH') : '-'}</p>
          </div>
          <div className="pt-2 border-t">
            <span className="text-xs text-muted-foreground">
              สร้างเมื่อ: {invoice.createdAt}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InvoiceCard;
