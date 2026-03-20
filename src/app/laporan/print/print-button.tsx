'use client';

import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function PrintButton() {
  const router = useRouter();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </Button>
      <Button onClick={handlePrint} className="gap-2">
        <Printer className="w-4 h-4" />
        Cetak / Save PDF
      </Button>
    </div>
  );
}
