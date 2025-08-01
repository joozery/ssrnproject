import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search, Building, Loader2, Eye, Calendar, MapPin, Phone, Mail, User, Hash } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';
import api from '@/lib/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    tax_id: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/customers');
      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "ผิดพลาด!",
        description: "ไม่สามารถโหลดข้อมูลลูกค้าได้",
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
      if (editingCustomer) {
        const response = await api.put(`/customers/${editingCustomer.id}`, formData);
        if (response.data.success) {
          toast({ title: "สำเร็จ!", description: "แก้ไขข้อมูลลูกค้าเรียบร้อยแล้ว" });
          fetchCustomers(); // Refresh the list
        }
      } else {
        const response = await api.post('/customers', formData);
        if (response.data.success) {
          toast({ title: "สำเร็จ!", description: "เพิ่มลูกค้าใหม่เรียบร้อยแล้ว" });
          fetchCustomers(); // Refresh the list
        }
      }

      setFormData({ name: '', contact_person: '', phone: '', email: '', address: '', tax_id: '' });
      setEditingCustomer(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving customer:', error);
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

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setIsDetailDialogOpen(true);
  };

  const handleEdit = (customer) => {
    setFormData(customer);
    setEditingCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/customers/${id}`);
      if (response.data.success) {
        toast({ title: "สำเร็จ!", description: "ลบข้อมูลลูกค้าเรียบร้อยแล้ว" });
        fetchCustomers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      const errorMessage = error.response?.data?.error || 'ไม่สามารถลบข้อมูลได้';
      toast({
        title: "ผิดพลาด!",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.contact_person && customer.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
    customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
       <PageHeader 
        title="จัดการลูกค้า"
        description="ลงทะเบียนและแก้ไขข้อมูลลูกค้า"
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="ค้นหาลูกค้า..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setFormData({ name: '', contact_person: '', phone: '', email: '', address: '', tax_id: '' });
                setEditingCustomer(null);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มลูกค้าใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact_person">ผู้ติดต่อ</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                  />
                </div>
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
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                <Label htmlFor="tax_id">เลขประจำตัวผู้เสียภาษี</Label>
                <Input
                  id="tax_id"
                  value={formData.tax_id}
                  onChange={(e) => setFormData({...formData, tax_id: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingCustomer ? 'กำลังบันทึก...' : 'กำลังเพิ่ม...'}
                  </>
                ) : (
                  editingCustomer ? 'บันทึกการแก้ไข' : 'เพิ่มลูกค้า'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">กำลังโหลดข้อมูล...</span>
            </div>
          ) : (
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัสลูกค้า</TableHead>
                <TableHead>ชื่อ-นามสกุล</TableHead>
                <TableHead>ผู้ติดต่อ</TableHead>
                <TableHead>เบอร์โทร</TableHead>
                <TableHead>อีเมล</TableHead>
                <TableHead>ที่อยู่</TableHead>
                <TableHead>เลขประจำตัวผู้เสียภาษี</TableHead>
                <TableHead>วันที่สร้าง</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-mono text-sm text-gray-600">{customer.id}</TableCell>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.contact_person || '-'}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell className="max-w-xs truncate" title={customer.address}>
                      {customer.address || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{customer.tax_id || '-'}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(customer.created_at).toLocaleDateString('th-TH')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDetails(customer)}
                          title="ดูรายละเอียด"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(customer)}
                          title="แก้ไข"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(customer.id)}
                          className="text-destructive hover:text-destructive"
                          title="ลบ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    {searchTerm ? 'ไม่พบลูกค้าที่ค้นหา' : 'ยังไม่มีข้อมูลลูกค้า'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      {/* Customer Detail Modal */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              รายละเอียดลูกค้า
            </DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer ID */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Hash className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">รหัสลูกค้า</p>
                  <p className="font-mono font-medium">{selectedCustomer.id}</p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <User className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600">ชื่อ-นามสกุล</p>
                    <p className="font-medium">{selectedCustomer.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <User className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600">ผู้ติดต่อ</p>
                    <p className="font-medium">{selectedCustomer.contact_person || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                  <Phone className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-orange-600">เบอร์โทรศัพท์</p>
                    <p className="font-medium">{selectedCustomer.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                  <Mail className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600">อีเมล</p>
                    <p className="font-medium">{selectedCustomer.email || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                <MapPin className="h-4 w-4 text-yellow-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-600">ที่อยู่</p>
                  <p className="font-medium whitespace-pre-wrap">{selectedCustomer.address || '-'}</p>
                </div>
              </div>

              {/* Tax ID */}
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                <Hash className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm text-red-600">เลขประจำตัวผู้เสียภาษี</p>
                  <p className="font-mono font-medium">{selectedCustomer.tax_id || '-'}</p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">วันที่สร้าง</p>
                    <p className="font-medium">
                      {new Date(selectedCustomer.created_at).toLocaleString('th-TH')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">วันที่อัปเดต</p>
                    <p className="font-medium">
                      {new Date(selectedCustomer.updated_at).toLocaleString('th-TH')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerManagement;