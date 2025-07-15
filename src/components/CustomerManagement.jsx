import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search, Building } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';
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
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    address: '',
    taxId: ''
  });

  useEffect(() => {
    const savedCustomers = localStorage.getItem('customers');
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }
  }, []);

  const saveCustomers = (updatedCustomers) => {
    localStorage.setItem('customers', JSON.stringify(updatedCustomers));
    setCustomers(updatedCustomers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingCustomer) {
      const updatedCustomers = customers.map(customer =>
        customer.id === editingCustomer.id ? { ...formData, id: editingCustomer.id } : customer
      );
      saveCustomers(updatedCustomers);
      toast({ title: "สำเร็จ!", description: "แก้ไขข้อมูลลูกค้าเรียบร้อยแล้ว" });
    } else {
      const newCustomer = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toLocaleDateString('th-TH')
      };
      saveCustomers([...customers, newCustomer]);
      toast({ title: "สำเร็จ!", description: "เพิ่มลูกค้าใหม่เรียบร้อยแล้ว" });
    }

    setFormData({ name: '', company: '', phone: '', email: '', address: '', taxId: '' });
    setEditingCustomer(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (customer) => {
    setFormData(customer);
    setEditingCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    const updatedCustomers = customers.filter(customer => customer.id !== id);
    saveCustomers(updatedCustomers);
    toast({ title: "สำเร็จ!", description: "ลบข้อมูลลูกค้าเรียบร้อยแล้ว" });
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                setFormData({ name: '', company: '', phone: '', email: '', address: '', taxId: '' });
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
                  <Label htmlFor="company">บริษัท</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    required
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
                <Label htmlFor="taxId">เลขประจำตัวผู้เสียภาษี</Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingCustomer ? 'บันทึกการแก้ไข' : 'เพิ่มลูกค้า'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ-นามสกุล</TableHead>
                <TableHead>บริษัท</TableHead>
                <TableHead>เบอร์โทร</TableHead>
                <TableHead>อีเมล</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.company}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(customer.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {searchTerm ? 'ไม่พบลูกค้าที่ค้นหา' : 'ยังไม่มีข้อมูลลูกค้า'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerManagement;