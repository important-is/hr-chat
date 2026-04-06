import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'standalone',
  devIndicators: { appIsrStatus: false, buildActivity: false },
};

export default config;
