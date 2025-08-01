
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import CustomerManagement from '@/components/CustomerManagement';
import DriverManagement from '@/components/DriverManagement';
import VehicleManagement from '@/components/VehicleManagement';
import BookingManagement from '@/components/BookingManagement';
import JobOrderManagement from '@/components/JobOrderManagement';
import FinanceManagement from '@/components/FinanceManagement';
import InvoiceManagement from '@/components/InvoiceManagement';
import ReportManagement from '@/components/ReportManagement';
import SettingsManagement from '@/components/SettingsManagement';
import LoginPage from '@/pages/LoginPage';
import { Toaster } from '@/components/ui/toaster';
import QuotationManagement from '@/components/QuotationManagement';
import PaymentVoucherManagement from '@/components/PaymentVoucherManagement';
import api from '@/lib/axios';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('job_orders');
  const [companyInfo, setCompanyInfo] = useState({
    name: 'บริษัทของคุณ',
    address: 'ที่อยู่บริษัท',
    city: 'จังหวัด',
    phone: 'เบอร์โทรศัพท์',
    taxId: 'เลขผู้เสียภาษี',
    email: 'อีเมล',
    logoUrl: ''
  });
  const [isLoadingCompanyInfo, setIsLoadingCompanyInfo] = useState(true);

  // Fetch company info from API
  const fetchCompanyInfo = async () => {
    try {
      const response = await api.get('/company-info');
      const apiData = response.data;
      
      // Update state with API data
      setCompanyInfo(apiData);
      
      // Save to localStorage as backup
      localStorage.setItem('companyInfo', JSON.stringify(apiData));
      
      console.log('✅ Company info loaded from API:', apiData);
    } catch (error) {
      console.error('❌ Error fetching company info from API:', error);
      
      // Fallback to localStorage
      const savedCompanyInfo = localStorage.getItem('companyInfo');
      if (savedCompanyInfo) {
        try {
          const parsedInfo = JSON.parse(savedCompanyInfo);
          setCompanyInfo(parsedInfo);
          console.log('📦 Company info loaded from localStorage:', parsedInfo);
        } catch (parseError) {
          console.error('❌ Error parsing localStorage company info:', parseError);
        }
      } else {
        console.log('⚠️ No company info found in localStorage, using defaults');
      }
    } finally {
      setIsLoadingCompanyInfo(false);
    }
  };

  useEffect(() => {
    const loggedInUser = localStorage.getItem('isAuthenticated');
    if (loggedInUser === 'true') {
      setIsAuthenticated(true);
    }

    // Fetch company info when component mounts
    fetchCompanyInfo();
  }, []);

  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  const handleSaveSettings = (newInfo) => {
    setCompanyInfo(newInfo);
    localStorage.setItem('companyInfo', JSON.stringify(newInfo));
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} companyInfo={companyInfo} />;
  }

  // Show loading state while fetching company info
  if (isLoadingCompanyInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลดข้อมูลบริษัท...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'customers':
        return <CustomerManagement />;
      case 'drivers':
        return <DriverManagement />;
      case 'vehicles':
        return <VehicleManagement />;
      case 'bookings':
        return <BookingManagement />;
      case 'job_orders':
        return <JobOrderManagement companyInfo={companyInfo} />;
      case 'finance':
        return <FinanceManagement />;
      case 'invoices':
        return <InvoiceManagement companyInfo={companyInfo} />;
      case 'quotations':
        return <QuotationManagement 
          companyInfo={companyInfo} 
          onNavigateToInvoices={() => setActiveTab('invoices')}
        />;
      case 'payment_vouchers':
        return <PaymentVoucherManagement companyInfo={companyInfo} />;

      case 'reports':
        return <ReportManagement />;
      case 'settings':
        return <SettingsManagement companyInfo={companyInfo} onSave={handleSaveSettings} />;
      default:
        return <Dashboard />;
    }
  };

  const PageWrapper = ({ children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-8"
    >
      {children}
    </motion.div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        companyName={companyInfo.name}
        companyInfo={companyInfo}
        onLogout={handleLogout}
      />
      
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <PageWrapper key={activeTab}>
            {renderContent()}
          </PageWrapper>
        </AnimatePresence>
      </main>
      
      <Toaster />
    </div>
  );
}

export default App;
