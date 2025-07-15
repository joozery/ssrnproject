import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { LogIn, FileText } from 'lucide-react';

const LoginPage = ({ onLogin, companyInfo }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'password') {
      onLogin();
      toast({
        title: 'เข้าสู่ระบบสำเร็จ',
        description: 'ยินดีต้อนรับกลับสู่ระบบจัดการขนส่ง',
      });
    } else {
      toast({
        title: 'เข้าสู่ระบบไม่สำเร็จ',
        description: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            {companyInfo.logoUrl ? (
              <img src={companyInfo.logoUrl} alt="Company Logo" className="h-16 object-contain mx-auto mb-4" />
            ) : (
              <FileText className="h-12 w-12 mx-auto text-primary mb-4" />
            )}
            <CardTitle className="text-2xl">{companyInfo.name || 'ระบบจัดการขนส่ง'}</CardTitle>
            <CardDescription>กรุณาเข้าสู่ระบบเพื่อใช้งาน</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">ชื่อผู้ใช้</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-center text-muted-foreground pt-2">
                (ใช้ username: <strong>admin</strong> และ password: <strong>password</strong> เพื่อเข้าสู่ระบบ)
              </p>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                <LogIn className="mr-2 h-4 w-4" />
                เข้าสู่ระบบ
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;