import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Truck, 
  Car, 
  Calendar, 
  DollarSign, 
  FileText, 
  BarChart3,
  Home,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'แดชบอร์ด', icon: Home },
    { id: 'customers', label: 'ลูกค้า', icon: Users },
    { id: 'drivers', label: 'พนักงานขับรถ', icon: Truck },
    { id: 'vehicles', label: 'ข้อมูลรถ', icon: Car },
    { id: 'bookings', label: 'จองงาน', icon: Calendar },
    { id: 'finance', label: 'การเงิน', icon: DollarSign },
    { id: 'invoices', label: 'ใบแจ้งหนี้/ใบเสร็จรับเงิน', icon: FileText },

    { id: 'reports', label: 'รายงาน', icon: BarChart3 },
  ];

  return (
    <motion.div 
      className="w-64 sidebar-gradient text-white p-6 min-h-screen"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">ระบบขนส่ง</h1>
        <p className="text-purple-200 text-sm">จัดการงานขนส่งอย่างมืออาชีพ</p>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start text-left ${
                  activeTab === item.id 
                    ? 'bg-white text-purple-600 hover:bg-white/90' 
                    : 'text-white hover:bg-white/10'
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            </motion.div>
          );
        })}
      </nav>
    </motion.div>
  );
};

export default Sidebar;