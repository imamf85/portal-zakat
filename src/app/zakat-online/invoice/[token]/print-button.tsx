'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button onClick={handlePrint} variant="outline">
      <Printer className="w-4 h-4 mr-2" />
      Cetak Invoice
    </Button>
  );
}
