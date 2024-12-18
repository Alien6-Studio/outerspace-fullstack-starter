import React from 'react';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getLocale} from 'next-intl/server';

type LocaleLayoutProps = {
  children: React.ReactNode;
};

export default async function LocaleLayout({ children }: LocaleLayoutProps) {
  const locale = await getLocale();
  const messages = await getMessages();
  
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return [
    ${LOCALES_ARRAY}
  ];
}