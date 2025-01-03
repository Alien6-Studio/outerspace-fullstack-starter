import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const baseConfig: NextConfig = {
  /* config options here */
};

export default withNextIntl(baseConfig);