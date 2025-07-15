import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Package, Calendar, Download } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';
import DataCard from '@/components/DataCard';

const ReportManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const savedBookings = localStorage.getItem('bookings');
    const savedExpenses = localStorage.getItem('expenses');
    
    if (savedBookings) setBookings(JSON.parse(savedBookings));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
  }, []);

  const filterByDateRange = (items, dateField) => {
    return items.filter(item => {
      const itemDate = new Date(item[dateField]);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  const filteredBookings = filterByDateRange(bookings, 'bookingDate');
  const filteredExpenses = filterByDateRange(expenses, 'date');

  const totalRevenue = filteredBookings.reduce((sum, booking) => 
    sum + Number(booking.pickupFee || 0) + Number(booking.returnFee || 0), 0
  );

  const totalExpenses = filteredExpenses.reduce((sum, expense) => 
    sum + Number(expense.amount || 0), 0
  );

  const totalProfit = totalRevenue - totalExpenses;

  const completedTrips = filteredBookings.filter(booking => booking.status === 'completed').length;
  const inProgressTrips = filteredBookings.filter(booking => booking.status === 'in_progress').length;
  const pendingTrips = filteredBookings.filter(booking => booking.status === 'pending').length;

  const getMonthlyData = () => {
    const monthlyRevenue = {};
    const monthlyExpensesData = {};
    
    filteredBookings.forEach(booking => {
      const month = new Date(booking.bookingDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short' });
      const revenue = Number(booking.pickupFee || 0) + Number(booking.returnFee || 0);
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + revenue;
    });

    filteredExpenses.forEach(expense => {
      const month = new Date(expense.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short' });
      monthlyExpensesData[month] = (monthlyExpensesData[month] || 0) + Number(expense.amount || 0);
    });

    return { monthlyRevenue, monthlyExpenses: monthlyExpensesData };
  };

  const { monthlyRevenue, monthlyExpenses } = getMonthlyData();

  const exportReport = () => {
    toast({ title: "🚧 ฟีเจอร์นี้ยังไม่ได้ใช้งาน—แต่ไม่ต้องกังวล! คุณสามารถขอได้ในพรอมต์ถัดไป! 🚀" });
  };
  
  const getStatusLabel = (status) => ({
      completed: 'เสร็จสิ้น',
      in_progress: 'กำลังขนส่ง',
      pending: 'รอดำเนินการ',
    }[status] || status);

  const getStatusColor = (status) => ({
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
    }[status] || 'bg-gray-100 text-gray-800');


  return (
    <div className="space-y-6">
      <PageHeader
        title="ระบบรายงาน"
        description="รายงานรายได้ ค่าใช้จ่าย กำไรเบื้องต้น และรายงานเที่ยวรถ"
      />

      <Card>
        <CardHeader>
          <CardTitle>ช่วงเวลารายงาน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="startDate">วันที่เริ่มต้น</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate">วันที่สิ้นสุด</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              />
            </div>
            <Button onClick={exportReport}>
              <Download className="mr-2 h-4 w-4" />
              ส่งออกรายงาน
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="financial" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="financial">รายงานการเงิน</TabsTrigger>
          <TabsTrigger value="trips">รายงานเที่ยวรถ</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DataCard index={0} icon={TrendingUp} title="รายได้รวม" value={`฿${totalRevenue.toLocaleString()}`} color="bg-green-500" />
            <DataCard index={1} icon={TrendingDown} title="ค่าใช้จ่ายรวม" value={`฿${totalExpenses.toLocaleString()}`} color="bg-red-500" />
            <DataCard index={2} icon={DollarSign} title="กำไรเบื้องต้น" value={`฿${totalProfit.toLocaleString()}`} color={totalProfit >= 0 ? "bg-green-500" : "bg-red-500"}/>
            <DataCard index={3} icon={BarChart3} title="อัตรากำไร" value={`${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%`} color="bg-blue-500"/>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>รายได้รายเดือน</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(monthlyRevenue).map(([month, revenue]) => (
                    <div key={month} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{month}</span>
                      <span className="font-bold">฿{revenue.toLocaleString()}</span>
                    </div>
                  ))}
                  {Object.keys(monthlyRevenue).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">ไม่มีข้อมูลรายได้ในช่วงเวลาที่เลือก</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>ค่าใช้จ่ายรายเดือน</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(monthlyExpenses).map(([month, expense]) => (
                    <div key={month} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{month}</span>
                      <span className="font-bold">฿{expense.toLocaleString()}</span>
                    </div>
                  ))}
                  {Object.keys(monthlyExpenses).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">ไม่มีข้อมูลค่าใช้จ่ายในช่วงเวลาที่เลือก</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trips" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DataCard index={0} icon={Package} title="เที่ยวเสร็จสิ้น" value={completedTrips} color="bg-green-500"/>
            <DataCard index={1} icon={Package} title="กำลังขนส่ง" value={inProgressTrips} color="bg-blue-500"/>
            <DataCard index={2} icon={Calendar} title="รอดำเนินการ" value={pendingTrips} color="bg-yellow-500"/>
          </div>

          <Card>
            <CardHeader><CardTitle>รายละเอียดเที่ยวรถ</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{booking.containerNumber}</p>
                        <p className="text-muted-foreground text-sm">
                          {booking.pickupLocation} → {booking.deliveryLocation}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(booking.bookingDate).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          ฿{(Number(booking.pickupFee || 0) + Number(booking.returnFee || 0)).toLocaleString()}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">ไม่มีข้อมูลเที่ยวรถในช่วงเวลาที่เลือก</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportManagement;