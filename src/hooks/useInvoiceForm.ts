
import { useState, useEffect } from 'react';

export const initialFormData = {
  invoice_number: '',
  contact_id: '',
  invoice_type: 'sale' as 'sale' | 'purchase',
  invoice_date: new Date().toISOString().split('T')[0],
  due_date: '',
  subtotal: 0,
  tax_amount: 0,
  total_amount: 0,
  notes: ''
};

export function useInvoiceForm(initialState = initialFormData) {
  const [formData, setFormData] = useState(initialState);

  const generateInvoiceNumber = () => {
    const type = formData.invoice_type === 'sale' ? 'V' : 'C';
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setFormData(prev => ({
      ...prev,
      invoice_number: `${type}-${year}${month}-${random}`
    }));
  };
  
  useEffect(() => {
    const total = Number(formData.subtotal) + Number(formData.tax_amount);
    if (total !== formData.total_amount) {
        setFormData(prev => ({ ...prev, total_amount: total }));
    }
  }, [formData.subtotal, formData.tax_amount, formData.total_amount]);


  const resetForm = () => {
    setFormData({
        ...initialFormData,
        invoice_date: new Date().toISOString().split('T')[0],
    });
  }

  return {
    formData,
    setFormData,
    generateInvoiceNumber,
    resetForm,
  };
}
