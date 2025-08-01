
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, LayoutDashboard, Users, Truck, Package, DollarSign, BarChart2, FileSpreadsheet, Settings, LogOut, FilePlus, ChevronDown, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = ({ activeTab, setActiveTab, companyName, companyInfo, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [logoError, setLogoError] = useState(false);

  // ปิด dropdown เมื่อคลิกนอกเมนู
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // Reset logo error when companyInfo changes
  React.useEffect(() => {
    setLogoError(false);
  }, [companyInfo?.logoUrl]);

  const navItems = [
    { id: 'dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard },
    { id: 'job_orders', label: 'ใบสั่งงาน', icon: FileSpreadsheet },
    { id: 'bookings', label: 'จองงาน', icon: Package },
    { 
      id: 'documents', 
      label: 'เอกสาร', 
      icon: FileText,
      dropdown: [
        { id: 'quotations', label: 'ใบเสนอราคา', icon: FilePlus },
        { id: 'invoices', label: 'ใบแจ้งหนี้/ใบเสร็จรับเงิน', icon: FileText },

        { id: 'payment_vouchers', label: 'ใบสำคัญจ่าย', icon: DollarSign },
      ]
    },
    { 
      id: 'management', 
      label: 'จัดการ', 
      icon: Users,
      dropdown: [
        { id: 'customers', label: 'ลูกค้า', icon: Users },
        { id: 'drivers', label: 'พนักงานขับรถ', icon: Truck },
        { id: 'vehicles', label: 'รถ', icon: Truck },
      ]
    },
    { id: 'finance', label: 'การเงิน', icon: DollarSign },
    { id: 'reports', label: 'รายงาน', icon: BarChart2 },
    { id: 'settings', label: 'ตั้งค่า', icon: Settings },
  ];

  const NavLink = ({ item }) => {
    const isActive = activeTab === item.id || (item.dropdown && item.dropdown.some(subItem => subItem.id === activeTab));
    
    if (item.dropdown) {
      return (
        <div className="relative dropdown-container">
          <button
            onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
            className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center ${
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
            <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`} />
          </button>
          {isActive && (
            <motion.div
              layoutId="underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              initial={false}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          
          {openDropdown === item.id && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
            >
              {item.dropdown.map(subItem => (
                <button
                  key={subItem.id}
                  onClick={() => {
                    setActiveTab(subItem.id);
                    setOpenDropdown(null);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left flex items-center px-4 py-2 text-sm hover:bg-gray-50 ${
                    activeTab === subItem.id ? 'bg-primary/10 text-primary' : 'text-gray-700'
                  }`}
                >
                  <subItem.icon className="mr-3 h-4 w-4" />
                  {subItem.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      );
    }

    return (
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
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4">
        <div className="flex items-center">
          {companyInfo?.logoUrl && !logoError ? (
            <div className="relative group">
                          <img 
              src={companyInfo.logoUrl} 
              alt="Company Logo" 
              className="h-12 w-12 md:h-16 md:w-16 mr-3 md:mr-4 object-contain rounded-lg md:rounded-xl shadow-md border-2 border-gray-100 hover:border-primary/30 transition-all duration-200 hover:shadow-lg"
              onError={() => setLogoError(true)}
            />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-lg md:rounded-xl transition-all duration-200"></div>
            </div>
          ) : (
            <div className="h-12 w-12 md:h-16 md:w-16 mr-3 md:mr-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg md:rounded-xl flex items-center justify-center border-2 border-gray-100 hover:border-primary/30 transition-all duration-200 shadow-md hover:shadow-lg">
              <FileText className="h-7 w-7 md:h-9 md:w-9 text-primary" />
            </div>
          )}
          <h1 className="text-base md:text-lg font-semibold truncate text-gray-800">
            {companyName || 'ระบบจัดการขนส่ง'}
          </h1>
        </div>

        <nav className="hidden md:flex items-center space-x-2">
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
            {navItems.map(item => {
              if (item.dropdown) {
                return (
                  <div key={item.id}>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                      className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-md text-base font-medium ${
                        activeTab === item.id || item.dropdown.some(subItem => subItem.id === activeTab) 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.label}
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`} />
                    </button>
                    {openDropdown === item.id && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.dropdown.map(subItem => (
                          <button
                            key={subItem.id}
                            onClick={() => {
                              setActiveTab(subItem.id);
                              setOpenDropdown(null);
                              setIsMenuOpen(false);
                            }}
                            className={`w-full text-left flex items-center px-3 py-2 rounded-md text-sm ${
                              activeTab === subItem.id ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <subItem.icon className="mr-3 h-4 w-4" />
                            {subItem.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
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
              );
            })}
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;
