import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search, Truck, Calendar, Settings, FileText, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';
import api from '@/lib/axios';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    license_plate: '',
    brand: '',
    model: '',
    year: '',
    capacity: '',
    fuel_type: '',
    registration_expiry: '',
    insurance_expiry: '',
    status: 'active'
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/vehicles');
      if (response.data.success) {
        setVehicles(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลรถได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      if (editingVehicle) {
        const response = await api.put(`/vehicles/${editingVehicle.id}`, formData);
        if (response.data.success) {
          toast({ title: "สำเร็จ!", description: "แก้ไขข้อมูลรถเรียบร้อยแล้ว" });
          fetchVehicles();
        }
      } else {
        const response = await api.post('/vehicles', formData);
        if (response.data.success) {
          toast({ title: "สำเร็จ!", description: "เพิ่มรถใหม่เรียบร้อยแล้ว" });
          fetchVehicles();
        }
      }

      setFormData({ license_plate: '', brand: '', model: '', year: '', capacity: '', fuel_type: '', registration_expiry: '', insurance_expiry: '', status: 'active' });
      setEditingVehicle(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.response?.data?.error || "ไม่สามารถบันทึกข้อมูลรถได้",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (vehicle) => {
    setFormData(vehicle);
    setEditingVehicle(vehicle);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/vehicles/${id}`);
      if (response.data.success) {
        toast({ title: "สำเร็จ!", description: "ลบข้อมูลรถเรียบร้อยแล้ว" });
        fetchVehicles();
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.response?.data?.error || "ไม่สามารถลบข้อมูลรถได้",
        variant: "destructive"
      });
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFuelTypeLabel = (fuelType) => {
    const types = {
      diesel: 'ดีเซล',
      gasoline: 'เบนซิน',
      lpg: 'LPG',
      cng: 'CNG',
      electric: 'ไฟฟ้า'
    };
    return types[fuelType] || fuelType;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.active;
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: 'ใช้งานได้',
      maintenance: 'ซ่อมบำรุง',
      inactive: 'ไม่ใช้งาน'
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="จัดการข้อมูลรถ"
        description="ลงทะเบียนและจัดการข้อมูลรถ ทะเบียน ประเภท และประวัติการใช้งาน"
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="ค้นหารถ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setFormData({ license_plate: '', brand: '', model: '', year: '', capacity: '', fuel_type: '', registration_expiry: '', insurance_expiry: '', status: 'active' });
                setEditingVehicle(null);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มรถใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingVehicle ? 'แก้ไขข้อมูลรถ' : 'เพิ่มรถใหม่'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="license_plate">ทะเบียนรถ</Label>
                  <Input
                    id="license_plate"
                    value={formData.license_plate}
                    onChange={(e) => setFormData({...formData, license_plate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fuel_type">ประเภทเชื้อเพลิง</Label>
                  <select
                    id="fuel_type"
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({...formData, fuel_type: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">เลือกประเภทเชื้อเพลิง</option>
                    <option value="diesel">ดีเซล</option>
                    <option value="gasoline">เบนซิน</option>
                    <option value="lpg">LPG</option>
                    <option value="cng">CNG</option>
                    <option value="electric">ไฟฟ้า</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="brand">ยี่ห้อ</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="model">รุ่น</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="year">ปี</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacity">ความจุ (ตัน)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="status">สถานะ</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="active">ใช้งานได้</option>
                    <option value="maintenance">ซ่อมบำรุง</option>
                    <option value="inactive">ไม่ใช้งาน</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registration_expiry">วันหมดอายุทะเบียน</Label>
                  <Input
                    id="registration_expiry"
                    type="date"
                    value={formData.registration_expiry}
                    onChange={(e) => setFormData({...formData, registration_expiry: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="insurance_expiry">วันหมดอายุประกัน</Label>
                  <Input
                    id="insurance_expiry"
                    type="date"
                    value={formData.insurance_expiry}
                    onChange={(e) => setFormData({...formData, insurance_expiry: e.target.value})}
                  />
                </div>
              </div>
                              <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingVehicle ? 'กำลังบันทึก...' : 'กำลังเพิ่ม...'}
                    </>
                  ) : (
                    editingVehicle ? 'บันทึกการแก้ไข' : 'เพิ่มรถ'
                  )}
                </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">กำลังโหลดข้อมูลรถ...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle, index) => (
          <motion.div
            key={vehicle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center justify-between">
                  <div className="flex items-center">
                    <Truck className="mr-2 h-5 w-5 text-primary" />
                    {vehicle.license_plate}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(vehicle)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(vehicle.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">{vehicle.fuel_type ? getFuelTypeLabel(vehicle.fuel_type) : '-'}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(vehicle.status)}`}>
                    {getStatusLabel(vehicle.status)}
                  </span>
                </div>
                <div className="text-muted-foreground">
                  <p className="text-sm font-medium text-foreground">{vehicle.brand} {vehicle.model}</p>
                  <p className="text-xs">ปี {vehicle.year}</p>
                </div>
                {vehicle.capacity && (
                  <div className="flex items-center text-muted-foreground">
                    <Settings className="mr-2 h-4 w-4 text-primary/70" />
                    <span className="text-sm">ความจุ: {vehicle.capacity} ตัน</span>
                  </div>
                )}
                {vehicle.registration_expiry && (
                  <div className="flex items-center text-muted-foreground">
                    <FileText className="mr-2 h-4 w-4 text-primary/70" />
                    <span className="text-sm">ทะเบียนหมดอายุ: {new Date(vehicle.registration_expiry).toLocaleDateString('th-TH')}</span>
                  </div>
                )}
                {vehicle.insurance_expiry && (
                  <div className="flex items-center text-muted-foreground">
                    <FileText className="mr-2 h-4 w-4 text-primary/70" />
                    <span className="text-sm">ประกันหมดอายุ: {new Date(vehicle.insurance_expiry).toLocaleDateString('th-TH')}</span>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    ลงทะเบียนเมื่อ: {new Date(vehicle.created_at).toLocaleDateString('th-TH')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      )}

      {!isLoading && filteredVehicles.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Truck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? 'ไม่พบรถที่ค้นหา' : 'ยังไม่มีข้อมูลรถ'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default VehicleManagement;