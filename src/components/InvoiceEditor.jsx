
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { X, Plus, Save, ArrowLeft, Printer, Send } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useReactToPrint } from 'react-to-print';
import InvoicePreview from '@/components/invoices/InvoicePreview';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

const InvoiceEditor = ({
  selectedDocument,
  customers,
  onSave,
  onBack,
  companyInfo,
  docType = 'invoice',
}) => {
  const [documentData, setDocumentData] = useState({
    docNumber: '',
    customerId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [{ description: '', details: '', quantity: 1, unit: '', unitPrice: 0, discount: 0 }],
    notes: '',
    internalNotes: '',
    type: docType,
    status: docType === 'quotation' ? 'draft' : 'pending',
    includeVat: true,
    withholdingTax: 0,
  });

  const [showPreview, setShowPreview] = useState(false);
  const componentToPrintRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentToPrintRef.current,
    onAfterPrint: () => setShowPreview(false),
  });

  const typeLabels = {
    invoice: 'ใบแจ้งหนี้',
    receipt: 'ใบเสร็จรับเงิน',
    quotation: 'ใบเสนอราคา',
  };

  const typePrefix = {
    invoice: 'INV',
    receipt: 'REC',
    quotation: 'QUO',
  };

  useEffect(() => {
    if (selectedDocument) {
      setDocumentData({ 
        ...{
          includeVat: true,
          withholdingTax: 0,
          notes: '',
          internalNotes: '',
        },
        ...selectedDocument,
        docNumber: selectedDocument.docNumber || selectedDocument.invoiceNumber,
      });
    } else {
      const generateDocNumber = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const count = Math.floor(Math.random() * 1000) + 1;
        return `${typePrefix[docType] || 'DOC'}${year}${month}${String(count).padStart(4, '0')}`;
      };
      setDocumentData(prev => ({...prev, docNumber: generateDocNumber(), type: docType, status: docType === 'quotation' ? 'draft' : 'pending' }))
    }
  }, [selectedDocument, docType]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDocumentData({ ...documentData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const items = [...documentData.items];
    items[index][name] = value;
    setDocumentData({ ...documentData, items });
  };

  const addItem = () => {
    setDocumentData({
      ...documentData,
      items: [...documentData.items, { description: '', details: '', quantity: 1, unit: '', unitPrice: 0, discount: 0 }],
    });
  };

  const removeItem = (index) => {
    const items = [...documentData.items];
    items.splice(index, 1);
    setDocumentData({ ...documentData, items });
  };

  const subtotal = documentData.items.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  const totalDiscount = documentData.items.reduce((acc, item) => acc + ((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0) * (Number(item.discount) || 0) / 100), 0);
  const priceAfterDiscount = subtotal - totalDiscount;
  const vatAmount = documentData.includeVat ? priceAfterDiscount * 0.07 : 0;
  const grandTotalBeforeWht = priceAfterDiscount + vatAmount;
  const withholdingTaxAmount = grandTotalBeforeWht * ((Number(documentData.withholdingTax) || 0) / 100);
  const total = grandTotalBeforeWht - withholdingTaxAmount;

  const handleSave = () => {
    const finalDocData = {
        ...documentData,
        invoiceNumber: documentData.docNumber, // for backward compatibility
        amount: total,
        id: selectedDocument ? selectedDocument.id : Date.now().toString(),
        createdAt: selectedDocument ? selectedDocument.createdAt : new Date().toLocaleDateString('th-TH')
    };
    onSave(finalDocData);
  };

  const handleSendEmail = () => {
    toast({
      title: "🚧 ฟีเจอร์นี้ยังไม่ได้ใช้งาน",
      description: "แต่ไม่ต้องกังวล! คุณสามารถขอได้ในพรอมต์ถัดไป! 🚀",
    });
  }
  
  const selectedCustomer = customers.find(c => c.id === documentData.customerId);

  if (showPreview) {
    const totals = {
      subtotal: subtotal,
      totalDiscount: totalDiscount,
      priceAfterDiscount: priceAfterDiscount,
      vat: vatAmount,
      wht: withholdingTaxAmount,
      grandTotal: total,
    };

    return (
      <InvoicePreview
        ref={componentToPrintRef}
        invoiceData={documentData}
        customer={selectedCustomer}
        companyInfo={companyInfo}
        totals={totals}
        onPrint={handlePrint}
        onClose={() => setShowPreview(false)}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> กลับไปที่รายการ
        </Button>
        <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">
                {selectedDocument ? 'แก้ไข' : 'สร้าง'}{typeLabels[documentData.type]}
            </h1>
            <span className="text-lg text-muted-foreground">{documentData.docNumber}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Printer className="mr-2 h-4 w-4" /> พิมพ์
          </Button>
          <Button variant="outline" onClick={handleSendEmail}>
            <Send className="mr-2 h-4 w-4" /> ส่งอีเมล
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> บันทึก
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-foreground">จาก</h3>
                        <p className="text-muted-foreground">{companyInfo.name}</p>
                        <p className="text-muted-foreground">{companyInfo.address}</p>
                        <p className="text-muted-foreground">{companyInfo.city}</p>
                        <p className="text-muted-foreground">เลขประจำตัวผู้เสียภาษี: {companyInfo.taxId}</p>
                    </div>
                    <div>
                        <Label htmlFor="customer">ลูกค้า</Label>
                        <select
                            id="customer"
                            name="customerId"
                            value={documentData.customerId}
                            onChange={handleInputChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="">เลือกลูกค้า</option>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>{customer.name}</option>
                            ))}
                        </select>
                        {selectedCustomer && (
                            <div className="mt-2 text-sm text-muted-foreground">
                                <p>{selectedCustomer.company}</p>
                                <p>{selectedCustomer.address}</p>
                                <p>เลขประจำตัวผู้เสียภาษี: {selectedCustomer.taxId}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4 md:col-span-2">
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <Label htmlFor="type">ประเภทเอกสาร</Label>
                            <select id="type" name="type" value={documentData.type} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="quotation">ใบเสนอราคา</option>
                                <option value="invoice">ใบแจ้งหนี้</option>
                                <option value="receipt">ใบเสร็จรับเงิน</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="status">สถานะ</Label>
                            <select id="status" name="status" value={documentData.status} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                {docType === 'quotation' ? (
                                    <>
                                        <option value="draft">แบบร่าง</option>
                                        <option value="sent">ส่งแล้ว</option>
                                        <option value="approved">อนุมัติแล้ว</option>
                                        <option value="rejected">ปฏิเสธ</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="pending">รอชำระ</option>
                                        <option value="paid">ชำระแล้ว</option>
                                        <option value="overdue">เกินกำหนด</option>
                                        <option value="cancelled">ยกเลิก</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="issueDate">วันที่ออก</Label>
                            <Input type="date" id="issueDate" name="issueDate" value={documentData.issueDate} onChange={handleInputChange} />
                        </div>
                        <div>
                            <Label htmlFor="dueDate">ครบกำหนด</Label>
                            <Input type="date" id="dueDate" name="dueDate" value={documentData.dueDate} onChange={handleInputChange} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-2 text-left text-sm font-semibold text-muted-foreground w-2/5">ชื่อสินค้า / รายละเอียด</th>
                                <th className="p-2 text-left text-sm font-semibold text-muted-foreground">จำนวน</th>
                                <th className="p-2 text-left text-sm font-semibold text-muted-foreground">หน่วย</th>
                                <th className="p-2 text-right text-sm font-semibold text-muted-foreground">ราคาต่อหน่วย</th>
                                <th className="p-2 text-right text-sm font-semibold text-muted-foreground">ส่วนลด (%)</th>
                                <th className="p-2 text-right text-sm font-semibold text-muted-foreground">ราคารวม</th>
                                <th className="p-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {documentData.items.map((item, index) => (
                            <tr key={index}>
                                <td className="p-2 align-top">
                                    <Input name="description" placeholder="ชื่อสินค้า" value={item.description} onChange={(e) => handleItemChange(index, e)} className="mb-1"/>
                                    <Textarea name="details" placeholder="รายละเอียด (กด Shift+Enter เพื่อขึ้นบรรทัดใหม่)" value={item.details} onChange={(e) => handleItemChange(index, e)} rows={1} />
                                </td>
                                <td className="p-2 align-top"><Input type="number" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(index, e)} className="w-20 text-right"/></td>
                                <td className="p-2 align-top"><Input name="unit" placeholder="หน่วย" value={item.unit} onChange={(e) => handleItemChange(index, e)} className="w-24"/></td>
                                <td className="p-2 align-top"><Input type="number" name="unitPrice" value={item.unitPrice} onChange={(e) => handleItemChange(index, e)} className="w-28 text-right"/></td>
                                <td className="p-2 align-top"><Input type="number" name="discount" value={item.discount} onChange={(e) => handleItemChange(index, e)} className="w-24 text-right"/></td>
                                <td className="p-2 align-top text-right">
                                    {((item.quantity || 0) * (item.unitPrice || 0) * (1 - (item.discount || 0) / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="p-2 align-top">
                                    <Button variant="ghost" size="icon" onClick={() => removeItem(index)}><X className="h-4 w-4" /></Button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Button variant="outline" onClick={addItem} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" /> เพิ่มแถวรายการ
                </Button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <Label htmlFor="notes">หมายเหตุ</Label>
                    <Textarea id="notes" name="notes" value={documentData.notes} onChange={handleInputChange} placeholder="หมายเหตุสำหรับลูกค้า" />
                    <div className="mt-4">
                        <Label htmlFor="internalNotes">โน้ตภายในบริษัท</Label>
                        <Textarea id="internalNotes" name="internalNotes" value={documentData.internalNotes} onChange={handleInputChange} placeholder="โน้ตสำหรับทีมงาน (ลูกค้าไม่เห็น)" />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">รวมเป็นเงิน</span>
                        <span>{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">ส่วนลดรวม</span>
                        <span>{totalDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">ราคาหลังหักส่วนลด</span>
                        <span>{priceAfterDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Checkbox id="includeVat" name="includeVat" checked={documentData.includeVat} onCheckedChange={(checked) => setDocumentData({...documentData, includeVat: checked})} />
                            <Label htmlFor="includeVat">ภาษีมูลค่าเพิ่ม 7%</Label>
                        </div>
                        <span>{vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold">
                        <span>จำนวนเงินรวมทั้งสิ้น</span>
                        <span>{grandTotalBeforeWht.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-2">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="withholdingTax">หักภาษี ณ ที่จ่าย (%)</Label>
                            <Input type="number" id="withholdingTax" name="withholdingTax" value={documentData.withholdingTax} onChange={handleInputChange} className="w-20 text-right" />
                        </div>
                        <span>- {withholdingTaxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg text-primary border-t pt-2">
                        <span>ยอดชำระ</span>
                        <span>฿{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InvoiceEditor;
