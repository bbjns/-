"use client";
import { useTranslations } from 'next-intl';

export default function PricingPage() {
  const t = useTranslations('nav');
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-2xl font-semibold">{t('pricing')}</h1>
      <div className="card p-4 mt-4">
        <p className="text-sm text-muted-foreground">Coming soon: Alipay (Stripe) & USDT (Coinbase Commerce) test integrations.</p>
      </div>
    </div>
  );
}
