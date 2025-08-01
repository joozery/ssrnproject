import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search, User, Phone, CreditCard, Calendar, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';
import api from '@/lib/axios';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    id_card: '',
    license_number: '',
    license_expiry: '',
    address: '',
    emergency_contact: ''
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/drivers');
      if (response.data.success) {
        setDrivers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast({
        title: "ผิดพลาด!",
        description: "ไม่สามารถโหลดข้อมูลพนักงานขับรถได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingDriver) {
        const response = await api.put(`/drivers/${editingDriver.id}`, formData);
        if (response.data.success) {
          toast({ title: "สำเร็จ!", description: "แก้ไขข้อมูลพนักงานขับรถเรียบร้อยแล้ว" });
          fetchDrivers(); // Refresh the list
        }
      } else {
        const response = await api.post('/drivers', formData);
        if (response.data.success) {
          toast({ title: "สำเร็จ!", description: "เพิ่มพนักงานขับรถใหม่เรียบร้อยแล้ว" });
          fetchDrivers(); // Refresh the list
        }
      }

      setFormData({ name: '', phone: '', id_card: '', license_number: '', license_expiry: '', address: '', emergency_contact: '' });
      setEditingDriver(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving driver:', error);
      const errorMessage = error.response?.data?.error || 'ไม่สามารถบันทึกข้อมูลได้';
      toast({
        title: "ผิดพลาด!",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (driver) => {
    setFormData(driver);
    setEditingDriver(driver);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/drivers/${id}`);
      if (response.data.success) {
        toast({ title: "สำเร็จ!", description: "ลบข้อมูลพนักงานขับรถเรียบร้อยแล้ว" });
        fetchDrivers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting driver:', error);
      const errorMessage = error.response?.data?.error || 'ไม่สามารถลบข้อมูลได้';
      toast({
        title: "ผิดพลาด!",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (driver.license_number && driver.license_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (driver.id_card && driver.id_card.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="จัดการพนักงานขับรถ"
        description="ลงทะเบียนพนักงานขับรถและรถร่วม"
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="ค้นหาพนักงานขับรถ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setFormData({ name: '', phone: '', id_card: '', license_number: '', license_expiry: '', address: '', emergency_contact: '' });
                setEditingDriver(null);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มพนักงานขับรถ
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingDriver ? 'แก้ไขข้อมูลพนักงานขับรถ' : 'เพิ่มพนักงานขับรถใหม่'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">เบอร์โทร</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="id_card">เลขบัตรประชาชน</Label>
                  <Input
                    id="id_card"
                    value={formData.id_card}
                    onChange={(e) => setFormData({...formData, id_card: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="license_number">เลขใบขับขี่</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="license_expiry">วันหมดอายุใบขับขี่</Label>
                  <Input
                    id="license_expiry"
                    type="date"
                    value={formData.license_expiry}
                    onChange={(e) => setFormData({...formData, license_expiry: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">ที่อยู่</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="emergency_contact">เบอร์ติดต่อฉุกเฉิน</Label>
                <Input
                  id="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingDriver ? 'กำลังบันทึก...' : 'กำลังเพิ่ม...'}
                  </>
                ) : (
                  editingDriver ? 'บันทึกการแก้ไข' : 'เพิ่มพนักงานขับรถ'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">กำลังโหลดข้อมูล...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver, index) => (
          <motion.div
            key={driver.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="mr-2 h-5 w-5 text-primary" />
                    {driver.name}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(driver)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(driver.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    driver.type === 'employee' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {driver.type === 'employee' ? 'พนักงาน' : 'รถร่วม'}
                  </span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Phone className="mr-2 h-4 w-4 text-primary/70" />
                  <span className="text-sm">{driver.phone}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <CreditCard className="mr-2 h-4 w-4 text-primary/70" />
                  <span className="text-sm">{driver.license_number}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4 text-primary/70" />
                  <span className="text-sm">หมดอายุ: {new Date(driver.license_expiry).toLocaleDateString('th-TH')}</span>
                </div>
                {driver.emergency_contact && (
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="mr-2 h-4 w-4 text-destructive/70" />
                    <span className="text-sm">ฉุกเฉิน: {driver.emergency_contact}</span>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    ลงทะเบียนเมื่อ: {driver.createdAt}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        </div>
      )}

      {!isLoading && filteredDrivers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? 'ไม่พบพนักงานขับรถที่ค้นหา' : 'ยังไม่มีข้อมูลพนักงานขับรถ'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default DriverManagement;