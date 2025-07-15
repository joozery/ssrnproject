import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search, DollarSign, TrendingUp, TrendingDown, Fuel, Car, Users, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';
import DataCard from '@/components/DataCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FinanceManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    type: 'fuel',
    description: '',
    amount: '',
    date: '',
    vehicleId: '',
    category: 'operational'
  });

  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    
    const savedInvoices = localStorage.getItem('invoices');
    if (savedInvoices) setInvoices(JSON.parse(savedInvoices));

    const savedCustomers = localStorage.getItem('customers');
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
  }, []);

  const saveExpenses = (updatedExpenses) => {
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    setExpenses(updatedExpenses);
  };

  const saveInvoices = (updatedInvoices) => {
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
    setInvoices(updatedInvoices);
  };

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    
    if (editingExpense) {
      const updatedExpenses = expenses.map(expense =>
        expense.id === editingExpense.id ? { ...formData, id: editingExpense.id } : expense
      );
      saveExpenses(updatedExpenses);
      toast({ title: "สำเร็จ!", description: "แก้ไขรายการค่าใช้จ่ายเรียบร้อยแล้ว" });
    } else {
      const newExpense = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toLocaleDateString('th-TH')
      };
      saveExpenses([...expenses, newExpense]);
      toast({ title: "สำเร็จ!", description: "เพิ่มรายการค่าใช้จ่ายใหม่เรียบร้อยแล้ว" });
    }

    setFormData({ type: 'fuel', description: '', amount: '', date: '', vehicleId: '', category: 'operational' });
    setEditingExpense(null);
    setIsExpenseDialogOpen(false);
  };

  const handleEditExpense = (expense) => {
    setFormData(expense);
    setEditingExpense(expense);
    setIsExpenseDialogOpen(true);
  };

  const handleDeleteExpense = (id) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    saveExpenses(updatedExpenses);
    toast({ title: "สำเร็จ!", description: "ลบรายการค่าใช้จ่ายเรียบร้อยแล้ว" });
  };

  const handleMarkAsPaid = (invoiceId) => {
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoiceId ? { ...inv, status: 'paid' } : inv
    );
    saveInvoices(updatedInvoices);
    toast({ title: "สำเร็จ!", description: "บันทึกการชำระเงินเรียบร้อยแล้ว" });
  };

  const getExpenseTypeLabel = (type) => ({
      fuel: 'ค่าน้ำมัน',
      toll: 'ค่าทางด่วน',
      tire_repair: 'ปะยาง',
      tire_change: 'เปลี่ยนยาง',
      maintenance: 'ซ่อมบำรุง',
      other: 'อื่นๆ'
    }[type] || type);

  const getExpenseIcon = (type) => ({
      fuel: Fuel,
      toll: Car,
      tire_repair: Car,
      tire_change: Car,
      maintenance: Car,
      other: DollarSign
    }[type] || DollarSign);

  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getExpenseTypeLabel(expense.type).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const accountsReceivable = invoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue');

  const filteredAccountsReceivable = accountsReceivable.filter(inv => {
    const customer = customers.find(c => c.id === inv.customerId);
    return inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (customer && customer.name.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const totalReceivable = accountsReceivable.reduce((sum, inv) => sum + Number(inv.amount), 0);

  const stats = [
    { title: 'ค่าใช้จ่ายทั้งหมด', value: `฿${totalExpenses.toLocaleString()}`, icon: TrendingDown, color: 'bg-red-500' },
    { title: 'ลูกหนี้คงค้าง', value: `฿${totalReceivable.toLocaleString()}`, icon: Users, color: 'bg-orange-500' },
    { title: 'รายการค่าใช้จ่าย', value: expenses.length, icon: TrendingUp, color: 'bg-blue-500' },
  ];

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'ไม่ระบุ';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ระบบการเงินและบัญชี"
        description="จัดการค่าใช้จ่าย ดูบัญชีลูกหนี้ และการทำจ่าย"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <DataCard
            key={stat.title}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            color={stat.color}
            index={index}
          />
        ))}
      </div>

      <Tabs defaultValue="expenses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expenses">ค่าใช้จ่าย</TabsTrigger>
          <TabsTrigger value="receivables">บัญชีลูกหนี้</TabsTrigger>
        </TabsList>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="ค้นหา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setFormData({ type: 'fuel', description: '', amount: '', date: '', vehicleId: '', category: 'operational' });
                  setEditingExpense(null);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                เพิ่มรายการค่าใช้จ่าย
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingExpense ? 'แก้ไขรายการค่าใช้จ่าย' : 'เพิ่มรายการค่าใช้จ่ายใหม่'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleExpenseSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="type">ประเภทค่าใช้จ่าย</Label>
                  <select id="type" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="fuel">ค่าน้ำมัน</option>
                    <option value="toll">ค่าทางด่วน</option>
                    <option value="tire_repair">ปะยาง</option>
                    <option value="tire_change">เปลี่ยนยาง</option>
                    <option value="maintenance">ซ่อมบำรุง</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="description">รายละเอียด</Label>
                  <Input id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">จำนวนเงิน</Label>
                    <Input id="amount" type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                  </div>
                  <div>
                    <Label htmlFor="date">วันที่</Label>
                    <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">หมวดหมู่</Label>
                  <select id="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="operational">ค่าใช้จ่ายดำเนินงาน</option>
                    <option value="maintenance">ค่าซ่อมบำรุง</option>
                    <option value="administrative">ค่าใช้จ่ายบริหาร</option>
                  </select>
                </div>
                <Button type="submit" className="w-full">{editingExpense ? 'บันทึกการแก้ไข' : 'เพิ่มรายการ'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="expenses">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExpenses.map((expense, index) => {
              const Icon = getExpenseIcon(expense.type);
              return (
                <motion.div key={expense.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                  <Card className="card-hover">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-foreground flex items-center justify-between">
                        <div className="flex items-center"><Icon className="mr-2 h-5 w-5 text-primary" />{getExpenseTypeLabel(expense.type)}</div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => handleEditExpense(expense)}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteExpense(expense.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-lg font-bold">฿{Number(expense.amount).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{expense.description}</p>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-sm">{new Date(expense.date).toLocaleDateString('th-TH')}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${expense.category === 'operational' ? 'bg-blue-100 text-blue-800' : expense.category === 'maintenance' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'}`}>{expense.category === 'operational' ? 'ดำเนินงาน' : expense.category === 'maintenance' ? 'ซ่อมบำรุง' : 'บริหาร'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
          {filteredExpenses.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{searchTerm ? 'ไม่พบรายการค่าใช้จ่ายที่ค้นหา' : 'ยังไม่มีรายการค่าใช้จ่าย'}</p>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="receivables">
          <Card>
            <CardHeader>
              <CardTitle>รายการลูกหนี้คงค้าง</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAccountsReceivable.length > 0 ? (
                  filteredAccountsReceivable.map((invoice) => (
                    <div key={invoice.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-secondary rounded-lg">
                      <div className="flex-1 mb-4 sm:mb-0">
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-muted-foreground text-sm">{getCustomerName(invoice.customerId)}</p>
                        <p className="text-muted-foreground text-xs">ครบกำหนด: {new Date(invoice.dueDate).toLocaleDateString('th-TH')}</p>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <p className="font-bold text-lg flex-1 sm:flex-none">฿{(Number(invoice.amount) || 0).toLocaleString()}</p>
                        <Button size="sm" onClick={() => handleMarkAsPaid(invoice.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" /> ทำจ่าย
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">ไม่มีรายการลูกหนี้คงค้าง</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceManagement;