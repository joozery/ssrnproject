import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, DollarSign, Calendar, User, FileText } from 'lucide-react';

const PaymentVoucherCard = ({ voucher, index, onEdit, onDelete, onPreview, driverName }) => {
  const [sourceJobOrder, setSourceJobOrder] = useState(null);

  useEffect(() => {
    // ดึงข้อมูลใบสั่งงานต้นฉบับถ้ามี
    if (voucher.sourceJobOrderId) {
      const savedJobOrders = JSON.parse(localStorage.getItem('jobOrders') || '[]');
      const jobOrder = savedJobOrders.find(jo => jo.id === voucher.sourceJobOrderId);
      if (jobOrder) {
        setSourceJobOrder(jobOrder);
      }
    }
  }, [voucher.sourceJobOrderId]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'รอจ่าย',
      paid: 'จ่ายแล้ว',
      cancelled: 'ยกเลิก'
    };
    return labels[status] || status;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{voucher.voucherNumber}</h3>
              <p className="text-sm text-muted-foreground">{driverName}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(voucher.status)}`}>
              {getStatusLabel(voucher.status)}
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(voucher.issueDate)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>จ่ายให้: {driverName}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>ยอดจ่าย: ฿{Number(voucher.netAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          
          {/* แสดงข้อมูลใบสั่งงานต้นฉบับ */}
          {sourceJobOrder && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-blue-700 mb-2">
                <FileText className="h-4 w-4" />
                <span className="font-semibold">สร้างจากใบสั่งงาน (บวกยอดผิด)</span>
              </div>
              <div className="text-xs text-blue-600 space-y-1">
                <p><strong>เลขที่:</strong> {sourceJobOrder.jobOrderNumber}</p>
                <p><strong>เล่มที่:</strong> {sourceJobOrder.jobOrderVolume || '-'}</p>
                <p><strong>เบอร์ตู้:</strong> {sourceJobOrder.containerNumber || '-'}</p>
                <p><strong>เบอร์ซีล:</strong> {sourceJobOrder.sealNumber || '-'}</p>
                <p><strong>สถานที่ส่ง:</strong> {sourceJobOrder.deliveryLocation || '-'}</p>
                <p><strong>ยอดรวมจากใบสั่งงาน:</strong> ฿{((parseFloat(sourceJobOrder.pickupFee) || 0) + (parseFloat(sourceJobOrder.returnFee) || 0) + (parseFloat(sourceJobOrder.tireFee) || 0) + (parseFloat(sourceJobOrder.overnightFee) || 0) + (parseFloat(sourceJobOrder.storageFee) || 0) + (parseFloat(sourceJobOrder.fuelFee) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            <p>รายการ: {voucher.items?.length || 0} รายการ</p>
            <p>วิธีการชำระ: {voucher.paymentMethod}</p>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => onPreview(voucher)} className="flex-1">
              <Eye className="mr-1 h-4 w-4" />
              ดู
            </Button>
            <Button variant="outline" size="sm" onClick={() => onEdit(voucher)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(voucher.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PaymentVoucherCard; 