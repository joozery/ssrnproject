import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Edit, Trash2, MapPin, DollarSign, Calendar } from 'lucide-react';

const BookingCard = ({ booking, index, onEdit, onDelete, getCustomerName, getDriverName, getVehiclePlate, getStatusLabel, getStatusColor }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="card-hover">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="mr-2 h-5 w-5 text-primary" />
              {booking.containerNumber}
            </div>
            <div className="flex space-x-1">
              <Button size="sm" variant="ghost" onClick={() => onEdit(booking)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDelete(booking.id)} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">ตู้ {booking.containerSize} ฟุต</span>
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
              {getStatusLabel(booking.status)}
            </span>
          </div>
          <div className="text-sm">
            <p className="font-medium">ลูกค้า: {getCustomerName(booking.customerId)}</p>
            <p className="text-muted-foreground">คนขับ: {getDriverName(booking.driverId)}</p>
            <p className="text-muted-foreground">รถ: {getVehiclePlate(booking.vehicleId)}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-start">
              <MapPin className="mr-2 h-4 w-4 text-primary/70 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p>รับ: {booking.pickupLocation}</p>
                <p>ส่ง: {booking.deliveryLocation}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <div className="flex items-center">
              <DollarSign className="mr-1 h-4 w-4 text-green-600" />
              <span className="text-sm">รับ: ฿{Number(booking.pickupFee).toLocaleString()}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="mr-1 h-4 w-4 text-green-600" />
              <span className="text-sm">คืน: ฿{Number(booking.returnFee).toLocaleString()}</span>
            </div>
          </div>
          {booking.bookingDate && (
            <div className="flex items-center text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4 text-primary/70" />
              <span className="text-sm">วันที่: {new Date(booking.bookingDate).toLocaleDateString('th-TH')}</span>
            </div>
          )}
          <div className="pt-2 border-t">
            <span className="text-xs text-muted-foreground">
              สร้างเมื่อ: {booking.createdAt}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BookingCard;