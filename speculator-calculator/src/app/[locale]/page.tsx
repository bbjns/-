import { redirect } from 'next/navigation';

export default function CalculatorHome({ params }: { params: { locale: string } }) {
  redirect(`/${params.locale}/calculator`);
}
