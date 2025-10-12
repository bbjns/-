"use client";
import {useTranslations} from 'next-intl';
import { Calculator } from '@/components/calculator/Calculator';

export default function CalculatorRoute() {
  const t = useTranslations('calculator');
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
      </div>
      <Calculator />
    </div>
  );
}
