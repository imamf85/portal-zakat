'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from '@/components/zakat-online/countdown-timer';
import { isZakatOpen } from '@/lib/zakat-config';

export function ZakatCountdownSection() {
  const [zakatOpen, setZakatOpen] = useState(isZakatOpen());

  return (
    <section className="mb-10">
      <div className="max-w-xl mx-auto">
        <CountdownTimer onExpired={() => setZakatOpen(false)} />

        {zakatOpen && (
          <div className="mt-4 text-center">
            <Link href="/zakat-online">
              <Button variant="primary" size="lg" className="gap-2">
                <Smartphone className="w-5 h-5" />
                Bayar Zakat Online
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
