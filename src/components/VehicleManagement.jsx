import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search, Truck, Calendar, Settings, FileText } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    licensePlate: '',
    type: 'truck',
    brand: '',
    model: '',
    year: '',
    capacity: '',
    registrationExpiry: '',
    insuranceExpiry: '',
    lastMaintenance: '',
    status: 'active'
  });

  useEffect(() => {
    const savedVehicles = localStorage.getItem('vehicles');
    if (savedVehicles) {
      setVehicles(JSON.parse(savedVehicles));
    }
  }, []);

  const saveVehicles = (updatedVehicles) => {
    localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
    setVehicles(updatedVehicles);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingVehicle) {
      const updatedVehicles = vehicles.map(vehicle =>
        vehicle.id === editingVehicle.id ? { ...formData, id: editingVehicle.id } : vehicle
      );
      saveVehicles(updatedVehicles);
      toast({ title: "สำเร็จ!", description: "แก้ไขข้อมูลรถเรียบร้อยแล้ว" });
    } else {
      const newVehicle = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toLocaleDateString('th-TH')
      };
      saveVehicles([...vehicles, newVehicle]);
      toast({ title: "สำเร็จ!", description: "เพิ่มรถใหม่เรียบร้อยแล้ว" });
    }

    setFormData({ licensePlate: '', type: 'truck', brand: '', model: '', year: '', capacity: '', registrationExpiry: '', insuranceExpiry: '', lastMaintenance: '', status: 'active' });
    setEditingVehicle(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (vehicle) => {
    setFormData(vehicle);
    setEditingVehicle(vehicle);
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    const updatedVehicles = vehicles.filter(vehicle => vehicle.id !== id);
    saveVehicles(updatedVehicles);
    toast({ title: "สำเร็จ!", description: "ลบข้อมูลรถเรียบร้อยแล้ว" });
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getVehicleTypeLabel = (type) => {
    const types = {
      truck: 'รถบรรทุก',
      trailer: 'รถพ่วง',
      container: 'รถตู้คอนเทนเนอร์'
    };
    return types[type] || type;
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
                setFormData({ licensePlate: '', type: 'truck', brand: '', model: '', year: '', capacity: '', registrationExpiry: '', insuranceExpiry: '', lastMaintenance: '', status: 'active' });
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
                  <Label htmlFor="licensePlate">ทะเบียนรถ</Label>
                  <Input
                    id="licensePlate"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">ประเภทรถ</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="truck">รถบรรทุก</option>
                    <option value="trailer">รถพ่วง</option>
                    <option value="container">รถตู้คอนเทนเนอร์</option>
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
                  <Label htmlFor="registrationExpiry">วันหมดอายุทะเบียน</Label>
                  <Input
                    id="registrationExpiry"
                    type="date"
                    value={formData.registrationExpiry}
                    onChange={(e) => setFormData({...formData, registrationExpiry: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="insuranceExpiry">วันหมดอายุประกัน</Label>
                  <Input
                    id="insuranceExpiry"
                    type="date"
                    value={formData.insuranceExpiry}
                    onChange={(e) => setFormData({...formData, insuranceExpiry: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="lastMaintenance">วันที่ซ่อมบำรุงล่าสุด</Label>
                <Input
                  id="lastMaintenance"
                  type="date"
                  value={formData.lastMaintenance}
                  onChange={(e) => setFormData({...formData, lastMaintenance: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingVehicle ? 'บันทึกการแก้ไข' : 'เพิ่มรถ'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
                    {vehicle.licensePlate}
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
                  <span className="text-muted-foreground text-sm">{getVehicleTypeLabel(vehicle.type)}</span>
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
                {vehicle.registrationExpiry && (
                  <div className="flex items-center text-muted-foreground">
                    <FileText className="mr-2 h-4 w-4 text-primary/70" />
                    <span className="text-sm">ทะเบียนหมดอายุ: {new Date(vehicle.registrationExpiry).toLocaleDateString('th-TH')}</span>
                  </div>
                )}
                {vehicle.insuranceExpiry && (
                  <div className="flex items-center text-muted-foreground">
                    <FileText className="mr-2 h-4 w-4 text-primary/70" />
                    <span className="text-sm">ประกันหมดอายุ: {new Date(vehicle.insuranceExpiry).toLocaleDateString('th-TH')}</span>
                  </div>
                )}
                {vehicle.lastMaintenance && (
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4 text-primary/70" />
                    <span className="text-sm">ซ่อมบำรุงล่าสุด: {new Date(vehicle.lastMaintenance).toLocaleDateString('th-TH')}</span>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    ลงทะเบียนเมื่อ: {vehicle.createdAt}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
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