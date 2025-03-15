
import React, { useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Printer, Download, Share2 } from 'lucide-react';
import { Sale } from '@/types/sales';
import { Invoice } from './Invoice';
import { useReactToPrint } from 'react-to-print';

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  saleItems: any[];
}

export function InvoiceDialog({ open, onOpenChange, sale, saleItems }: InvoiceDialogProps) {
  const { toast } = useToast();
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    documentTitle: `Invoice-${sale?.invoice_number || sale?.id?.substring(0, 8) || 'Unknown'}`,
    onPrintError: () => {
      toast({
        title: "Print error",
        description: "There was an error printing the invoice",
        variant: "destructive",
      });
    },
    content: () => invoiceRef.current,
  });

  const handleShare = async () => {
    if (!navigator.share) {
      toast({
        title: "Sharing not supported",
        description: "Your browser doesn't support the Web Share API",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.share({
        title: `Invoice ${sale?.invoice_number || sale?.id?.substring(0, 8)}`,
        text: `Invoice for ${sale?.customer_name}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (!sale) return null;

  // Only allow printing for completed sales
  const isPrintable = sale.status === 'completed';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice #{sale.invoice_number || sale.id.substring(0, 8)}</DialogTitle>
          <DialogDescription>
            View {isPrintable ? 'and print ' : ''}invoice for {sale.customer_name}
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 border rounded-md overflow-hidden">
          <Invoice 
            sale={sale} 
            saleItems={saleItems} 
            forwardedRef={invoiceRef} 
          />
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" className="sm:mr-auto" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          {isPrintable && (
            <Button onClick={() => handlePrint()}>
              <Printer className="w-4 h-4 mr-2" />
              Print Invoice
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
