
import React from 'react';
import { format } from 'date-fns';
import { useSettings } from '@/hooks/useSettings';
import { calculateGST } from './saleFormSchema';
import { Sale } from '@/types/sales';

interface InvoiceProps {
  sale: Sale;
  saleItems: any[];
  forwardedRef?: React.Ref<HTMLDivElement>;
}

export function Invoice({ sale, saleItems, forwardedRef }: InvoiceProps) {
  const { settings, currencySymbol, formatDate } = useSettings();
  const gstPercentage = settings.gst_percentage || 18;
  const gstCalculation = calculateGST(sale.total_amount, gstPercentage);

  return (
    <div 
      ref={forwardedRef} 
      className="w-full bg-white p-8 shadow-sm max-w-4xl mx-auto"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      {/* Invoice Header */}
      <div className="flex justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{settings.company_name}</h1>
          {settings.gst_number && (
            <p className="text-gray-600">GST: {settings.gst_number}</p>
          )}
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-gray-800">INVOICE</h2>
          <p className="text-gray-600">#{sale.invoice_number || sale.id.substring(0, 8)}</p>
          <p className="text-gray-600">Date: {formatDate(sale.created_at)}</p>
        </div>
      </div>

      {/* Client Information */}
      <div className="flex justify-between mb-8">
        <div>
          <h3 className="font-bold text-gray-800 mb-1">Bill To:</h3>
          <p className="font-semibold">{sale.customer_name}</p>
          {sale.customer_email && <p className="text-gray-600">{sale.customer_email}</p>}
          {sale.customer_phone && <p className="text-gray-600">{sale.customer_phone}</p>}
        </div>
        <div className="text-right">
          <h3 className="font-bold text-gray-800 mb-1">Status:</h3>
          <p className="capitalize font-semibold">{sale.status}</p>
          {sale.payment_method && (
            <>
              <h3 className="font-bold text-gray-800 mt-2 mb-1">Payment Method:</h3>
              <p className="capitalize">{sale.payment_method}</p>
            </>
          )}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 text-left border border-gray-200">Item</th>
            <th className="py-2 px-4 text-center border border-gray-200">Qty</th>
            <th className="py-2 px-4 text-right border border-gray-200">Unit Price</th>
            <th className="py-2 px-4 text-right border border-gray-200">Amount</th>
          </tr>
        </thead>
        <tbody>
          {saleItems.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="py-2 px-4 border border-gray-200">{item.product_name}</td>
              <td className="py-2 px-4 text-center border border-gray-200">{item.quantity}</td>
              <td className="py-2 px-4 text-right border border-gray-200">
                {currencySymbol}{item.price.toFixed(2)}
              </td>
              <td className="py-2 px-4 text-right border border-gray-200">
                {currencySymbol}{(item.quantity * item.price).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span className="font-semibold">Subtotal:</span>
            <span>{currencySymbol}{gstCalculation.amountBeforeGST.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="font-semibold">GST ({gstPercentage}%):</span>
            <span>{currencySymbol}{gstCalculation.gstAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 font-bold text-lg">
            <span>Total:</span>
            <span>{currencySymbol}{gstCalculation.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {sale.notes && (
        <div className="mb-8">
          <h3 className="font-bold text-gray-800 mb-1">Notes:</h3>
          <p className="text-gray-700">{sale.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm pt-8 mt-8 border-t border-gray-200">
        <p>Thank you for your business!</p>
        <p>{settings.company_name} • Generated on {format(new Date(), 'PPP')}</p>
      </div>
    </div>
  );
}
