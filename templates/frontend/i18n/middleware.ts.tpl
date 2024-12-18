import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  locales: [${LOCALES_LIST}],
  defaultLocale: '${DEFAULT_LOCALE}'
});
 
export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};