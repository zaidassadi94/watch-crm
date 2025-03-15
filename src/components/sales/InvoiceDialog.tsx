
import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from 'react-to-print';
import { Invoice } from './Invoice';
import { Sale } from '@/types/sales';

export function InvoiceDialog({
  open,
  setOpen,
  sale,
  saleItems
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  sale: Sale | null;
  saleItems: any[];
}) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    documentTitle: `Invoice-${sale?.invoice_number || ''}`,
    onAfterPrint: () => {
      console.log('Print completed');
    },
    contentRef: invoiceRef,
  });

  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Invoice {sale.invoice_number}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <div ref={invoiceRef} className="p-4">
            <Invoice sale={sale} saleItems={saleItems} forwardedRef={invoiceRef} />
          </div>
          
          <div className="flex justify-end mt-4">
            <Button onClick={() => handlePrint()}>Print Invoice</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
