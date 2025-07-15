
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, LayoutDashboard, Users, Truck, Package, DollarSign, BarChart2, FileSpreadsheet, Settings, LogOut, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = ({ activeTab, setActiveTab, companyName, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard },
    { id: 'job_orders', label: 'ใบสั่งงาน', icon: FileSpreadsheet },
    { id: 'bookings', label: 'จองงาน', icon: Package },
    { id: 'quotations', label: 'ใบเสนอราคา', icon: FilePlus },
    { id: 'invoices', label: 'ใบแจ้งหนี้', icon: FileText },
    { id: 'customers', label: 'ลูกค้า', icon: Users },
    { id: 'drivers', label: 'พนักงานขับรถ', icon: Truck },
    { id: 'vehicles', label: 'รถ', icon: Truck },
    { id: 'finance', label: 'การเงิน', icon: DollarSign },
    { id: 'reports', label: 'รายงาน', icon: BarChart2 },
    { id: 'settings', label: 'ตั้งค่า', icon: Settings },
  ];

  const NavLink = ({ item }) => (
    <button
      onClick={() => {
        setActiveTab(item.id);
        setIsMenuOpen(false);
      }}
      className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
        activeTab === item.id ? 'text-primary' : 'text-muted-foreground hover:text-primary'
      }`}
    >
      <div className="flex items-center">
        <item.icon className="mr-2 h-4 w-4" />
        {item.label}
      </div>
      {activeTab === item.id && (
        <motion.div
          layoutId="underline"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          initial={false}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </button>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <FileText className="h-6 w-6 mr-3 text-primary" />
          <h1 className="text-xl font-bold truncate">{companyName || 'ระบบจัดการขนส่ง'}</h1>
        </div>

        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map(item => (
            <NavLink key={item.id} item={item} />
          ))}
           <Button variant="ghost" size="icon" onClick={onLogout} className="ml-2">
            <LogOut className="h-5 w-5 text-muted-foreground hover:text-primary" />
          </Button>
        </nav>

        <div className="md:hidden flex items-center">
           <Button variant="ghost" size="icon" onClick={onLogout} className="mr-2">
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </Button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          >
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'} />
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  activeTab === item.id ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;
