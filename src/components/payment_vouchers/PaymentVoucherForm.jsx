import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Plus, X, Eye, FileText } from 'lucide-react';

const PaymentVoucherForm = ({ initialData, drivers, onSave, onBack, companyInfo }) => {
  const [formData, setFormData] = useState({
    voucherNumber: '',
    driverId: '',
    issueDate: new Date().toISOString().split('T')[0],
    items: [{ 
      date: '', 
      description: '', 
      size: '', 
      pricePerTrip: 0, 
      advancePayment: 0, 
      pickupReturnFee: 0 
    }],
    notes: '',
    status: 'pending',
    paymentMethod: 'โอนเข้าบัญชี',
    bankName: 'kbank'
  });

  const [sourceJobOrder, setSourceJobOrder] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
      
      // ถ้ามีการอ้างอิงถึงใบสั่งงานต้นฉบับ ให้ดึงข้อมูลมาแสดง
      if (initialData.sourceJobOrderId) {
        const savedJobOrders = JSON.parse(localStorage.getItem('jobOrders') || '[]');
        const jobOrder = savedJobOrders.find(jo => jo.id === initialData.sourceJobOrderId);
        if (jobOrder) {
          setSourceJobOrder(jobOrder);
        }
      }
    } else {
      // Set default voucher number for new forms
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const count = Math.floor(Math.random() * 1000) + 1;
      setFormData(prev => ({ 
        ...prev, 
        voucherNumber: `SSPAY-${year}/${month}-${String(count).padStart(2, '0')}` 
      }));
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const items = [...formData.items];
    items[index][name] = name.includes('Price') || name.includes('Fee') || name.includes('Payment') ? 
      parseFloat(value) || 0 : value;
    setFormData({ ...formData, items });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { 
        date: '', 
        description: '', 
        size: '', 
        pricePerTrip: 0, 
        advancePayment: 0, 
        pickupReturnFee: 0 
      }],
    });
  };

  const removeItem = (index) => {
    const items = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items });
  };

  const calculateItemTotal = (item) => {
    const pricePerTrip = parseFloat(item.pricePerTrip) || 0;
    const pickupReturnFee = parseFloat(item.pickupReturnFee) || 0;
    return pricePerTrip + pickupReturnFee;
  };

  const calculateTotals = () => {
    // คำนวณยอดรวมจากราคา/เที่ยว + ค่ารับ+คืนตู้
    const subtotal = formData.items.reduce((sum, item) => {
      const itemTotal = calculateItemTotal(item);
      return sum + itemTotal;
    }, 0);
    
    // คำนวณยอดรวมเฉพาะราคา/เที่ยว (สำหรับหัก 1%)
    const totalPricePerTrip = formData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.pricePerTrip) || 0);
    }, 0);
    
    const totalAdvance = formData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.advancePayment) || 0);
    }, 0);
    
    const totalPickupReturn = formData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.pickupReturnFee) || 0);
    }, 0);
    
    // หัก 1% จากราคา/เที่ยวเท่านั้น (ไม่รวมค่ารับ+คืนตู้)
    const deduction = totalPricePerTrip * 0.01;
    
    // ยอดจ่ายสุทธิ = ยอดรวม - หัก 1% - เงินเบิก
    const netAmount = subtotal - deduction - totalAdvance;

    return {
      subtotal,
      totalPricePerTrip,
      totalAdvance,
      totalPickupReturn,
      deduction,
      netAmount
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totals = calculateTotals();
    onSave({ ...formData, ...totals });
  };

  const totals = calculateTotals();

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> กลับ
        </Button>
        <h1 className="text-2xl font-bold">
          {initialData ? 'แก้ไขใบสำคัญจ่าย' : 'สร้างใบสำคัญจ่ายใหม่'}
        </h1>
        <Button onClick={handleSubmit}>
          <Save className="mr-2 h-4 w-4" /> บันทึก
        </Button>
      </div>

                {/* แสดงข้อมูลใบสั่งงานต้นฉบับ */}
          {sourceJobOrder && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <FileText className="h-5 w-5" />
                  ข้อมูลใบสั่งงานต้นฉบับ (บวกยอดผิด)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">เลขที่ใบสั่งงาน:</span>
                    <p className="text-blue-700 font-medium">{sourceJobOrder.jobOrderNumber}</p>
                  </div>
                  <div>
                    <span className="font-semibold">เล่มที่:</span>
                    <p className="text-blue-700">{sourceJobOrder.jobOrderVolume || '-'}</p>
                  </div>
                  <div>
                    <span className="font-semibold">เบอร์ตู้:</span>
                    <p className="text-blue-700">{sourceJobOrder.containerNumber || '-'}</p>
                  </div>
                  <div>
                    <span className="font-semibold">เบอร์ซีล:</span>
                    <p className="text-blue-700">{sourceJobOrder.sealNumber || '-'}</p>
                  </div>
                  <div>
                    <span className="font-semibold">ขนาดตู้:</span>
                    <p className="text-blue-700">{sourceJobOrder.containerSize || '-'} ฟุต</p>
                  </div>
                  <div>
                    <span className="font-semibold">สถานที่รับตู้:</span>
                    <p className="text-blue-700">{sourceJobOrder.pickupLocation || '-'}</p>
                  </div>
                  <div>
                    <span className="font-semibold">สถานที่ส่งตู้:</span>
                    <p className="text-blue-700">{sourceJobOrder.deliveryLocation || '-'}</p>
                  </div>
                  <div>
                    <span className="font-semibold">สถานที่คืนตู้:</span>
                    <p className="text-blue-700">{sourceJobOrder.returnLocation || '-'}</p>
                  </div>
                </div>
                
                {/* แสดงรายละเอียดค่าใช้จ่ายจากใบสั่งงาน */}
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">รายละเอียดค่าใช้จ่ายจากใบสั่งงาน:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-blue-700">ค่ารับตู้:</span>
                      <p className="text-blue-600">฿{(parseFloat(sourceJobOrder.pickupFee) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-700">ค่าคืนตู้:</span>
                      <p className="text-blue-600">฿{(parseFloat(sourceJobOrder.returnFee) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-700">ค่าปะยาง:</span>
                      <p className="text-blue-600">฿{(parseFloat(sourceJobOrder.tireFee) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-700">ค่าค้างคืน:</span>
                      <p className="text-blue-600">฿{(parseFloat(sourceJobOrder.overnightFee) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-700">ค่าฝากตู้:</span>
                      <p className="text-blue-600">฿{(parseFloat(sourceJobOrder.storageFee) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-700">ค่าน้ำมัน:</span>
                      <p className="text-blue-600">฿{(parseFloat(sourceJobOrder.fuelFee) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <span className="font-bold text-blue-800">ยอดรวมจากใบสั่งงาน: ฿{((parseFloat(sourceJobOrder.pickupFee) || 0) + (parseFloat(sourceJobOrder.returnFee) || 0) + (parseFloat(sourceJobOrder.tireFee) || 0) + (parseFloat(sourceJobOrder.overnightFee) || 0) + (parseFloat(sourceJobOrder.storageFee) || 0) + (parseFloat(sourceJobOrder.fuelFee) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลทั่วไป</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="voucherNumber">เลขที่ใบสำคัญจ่าย</Label>
              <Input 
                id="voucherNumber" 
                name="voucherNumber" 
                value={formData.voucherNumber} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="driverId">จ่ายให้</Label>
              <select 
                id="driverId" 
                name="driverId" 
                value={formData.driverId} 
                onChange={handleInputChange} 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                required
              >
                <option value="">เลือกพนักงานขับรถ</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="issueDate">วันที่</Label>
              <Input 
                id="issueDate" 
                name="issueDate" 
                type="date" 
                value={formData.issueDate} 
                onChange={handleInputChange} 
                required 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>รายการค่าใช้จ่าย</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left text-sm font-semibold text-muted-foreground">ลำดับ</th>
                    <th className="p-2 text-left text-sm font-semibold text-muted-foreground">วันที่</th>
                    <th className="p-2 text-left text-sm font-semibold text-muted-foreground">รายละเอียด</th>
                    <th className="p-2 text-left text-sm font-semibold text-muted-foreground">ขนาด</th>
                    <th className="p-2 text-right text-sm font-semibold text-muted-foreground">ราคา/เที่ยว</th>
                    <th className="p-2 text-right text-sm font-semibold text-muted-foreground">เงินเบิก</th>
                    <th className="p-2 text-right text-sm font-semibold text-muted-foreground">ค่ารับ+คืนตู้</th>
                    <th className="p-2 text-right text-sm font-semibold text-muted-foreground">ยอดรวม</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="p-2 align-top">{index + 1}</td>
                      <td className="p-2 align-top">
                        <Input 
                          type="date" 
                          name="date" 
                          value={item.date} 
                          onChange={(e) => handleItemChange(index, e)} 
                          className="w-32"
                        />
                      </td>
                      <td className="p-2 align-top">
                        <Textarea 
                          name="description" 
                          value={item.description} 
                          onChange={(e) => handleItemChange(index, e)} 
                          placeholder="รายละเอียดงานขนส่ง"
                          rows={2}
                          className="w-48"
                        />
                      </td>
                      <td className="p-2 align-top">
                        <Input 
                          name="size" 
                          value={item.size} 
                          onChange={(e) => handleItemChange(index, e)} 
                          placeholder="เช่น 1X40"
                          className="w-20"
                        />
                      </td>
                      <td className="p-2 align-top">
                        <Input 
                          type="number" 
                          name="pricePerTrip" 
                          value={item.pricePerTrip} 
                          onChange={(e) => handleItemChange(index, e)} 
                          className="w-24 text-right"
                        />
                      </td>
                      <td className="p-2 align-top">
                        <Input 
                          type="number" 
                          name="advancePayment" 
                          value={item.advancePayment} 
                          onChange={(e) => handleItemChange(index, e)} 
                          className="w-24 text-right"
                        />
                      </td>
                      <td className="p-2 align-top">
                        <Input 
                          type="number" 
                          name="pickupReturnFee" 
                          value={item.pickupReturnFee} 
                          onChange={(e) => handleItemChange(index, e)} 
                          className="w-24 text-right"
                        />
                      </td>
                      <td className="p-2 align-top text-right font-semibold">
                        {calculateItemTotal(item).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 align-top">
                        <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button variant="outline" onClick={addItem} className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> เพิ่มรายการ
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สรุปยอด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notes">หมายเหตุ</Label>
                  <Textarea 
                    id="notes" 
                    name="notes" 
                    value={formData.notes} 
                    onChange={handleInputChange} 
                    placeholder="หมายเหตุเพิ่มเติม"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paymentMethod">วิธีการชำระเงิน</Label>
                    <select 
                      id="paymentMethod" 
                      name="paymentMethod" 
                      value={formData.paymentMethod} 
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="โอนเข้าบัญชี">โอนเข้าบัญชี</option>
                      <option value="เงินสด">เงินสด</option>
                      <option value="เช็ค">เช็ค</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="bankName">ธนาคาร</Label>
                    <select 
                      id="bankName" 
                      name="bankName" 
                      value={formData.bankName} 
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="kbank">kbank</option>
                      <option value="bbl">bbl</option>
                      <option value="scb">scb</option>
                      <option value="ktb">ktb</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-right">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ยอดค่าขนส่งรวม:</span>
                  <span>{totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">หัก 1% ค่าขนส่ง:</span>
                  <span>-{totals.deduction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">เงินเบิก:</span>
                  <span>-{totals.totalAdvance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-primary border-t pt-2">
                  <span>ยอดจ่ายสุทธิ:</span>
                  <span>฿{totals.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </motion.div>
  );
};

export default PaymentVoucherForm; 