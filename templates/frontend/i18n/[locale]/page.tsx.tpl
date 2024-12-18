import { useTranslations } from 'next-intl';

export default function Homepage() {
  const t = useTranslations('common');

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm lg:flex">
        <h1 className="text-4xl font-bold">{t('welcome')}</h1>
        <p className="mt-4">{t('description')}</p>
      </div>
    </main>
  );
}