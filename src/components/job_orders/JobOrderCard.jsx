import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Edit, Trash2, Printer, User, Truck } from 'lucide-react';

const JobOrderCard = ({ jobOrder, index, onEdit, onDelete, onPreview, customerName, driverName }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="card-hover flex flex-col h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="truncate">{jobOrder.jobOrderNumber}</span>
            </div>
            <div className="flex space-x-1">
              <Button size="icon" variant="ghost" onClick={() => onPreview(jobOrder)}>
                <Printer className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => onEdit(jobOrder)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => onDelete(jobOrder.id)} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 flex-grow">
          <div className="text-sm space-y-2">
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4 text-muted-foreground" />
              <p className="font-medium truncate">ลูกค้า: {customerName}</p>
            </div>
            <div className="flex items-center">
              <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
              <p className="text-muted-foreground truncate">คนขับ: {driverName}</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>เบอร์ตู้: {jobOrder.containerNumber || '-'}</p>
            <p>สถานที่ส่ง: {jobOrder.deliveryLocation || '-'}</p>
          </div>
        </CardContent>
        <div className="p-6 pt-0 mt-auto">
          <span className="text-xs text-muted-foreground">
            วันที่: {new Date(jobOrder.date).toLocaleDateString('th-TH')}
          </span>
        </div>
      </Card>
    </motion.div>
  );
};

export default JobOrderCard;