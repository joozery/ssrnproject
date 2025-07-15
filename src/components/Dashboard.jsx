import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Truck, Calendar, DollarSign, TrendingUp, Package } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import DataCard from '@/components/DataCard';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const stats = [
    {
      title: 'ลูกค้าทั้งหมด',
      value: '156',
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'รถในระบบ',
      value: '24',
      icon: Truck,
      color: 'bg-green-500',
      change: '+3%'
    },
    {
      title: 'งานเดือนนี้',
      value: '89',
      icon: Calendar,
      color: 'bg-purple-500',
      change: '+18%'
    },
    {
      title: 'รายได้เดือนนี้',
      value: '฿2,450,000',
      icon: DollarSign,
      color: 'bg-orange-500',
      change: '+25%'
    }
  ];

  const recentBookings = [
    { id: 'BK001', customer: 'บริษัท ABC จำกัด', container: 'TCLU1234567', status: 'กำลังขนส่ง' },
    { id: 'BK002', customer: 'บริษัท XYZ จำกัด', container: 'MSKU9876543', status: 'เสร็จสิ้น' },
    { id: 'BK003', customer: 'บริษัท DEF จำกัด', container: 'GESU5555555', status: 'รอดำเนินการ' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'เสร็จสิ้น': return 'bg-green-100 text-green-800';
      case 'กำลังขนส่ง': return 'bg-blue-100 text-blue-800';
      case 'รอดำเนินการ': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="แดชบอร์ด"
        description="ภาพรวมระบบจัดการขนส่ง"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <DataCard 
            key={stat.title}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            color={stat.color}
            index={index}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5 text-primary" />
                งานล่าสุด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{booking.customer}</p>
                      <p className="text-sm text-muted-foreground">{booking.container}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                สถิติรายได้
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">รายได้วันนี้</span>
                  <span className="text-foreground font-bold">฿125,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">รายได้สัปดาห์นี้</span>
                  <span className="text-foreground font-bold">฿875,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">รายได้เดือนนี้</span>
                  <span className="text-foreground font-bold">฿2,450,000</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{width: '75%'}}></div>
                </div>
                <p className="text-sm text-muted-foreground">75% ของเป้าหมายเดือน</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;