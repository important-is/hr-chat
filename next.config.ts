import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'standalone',
  devIndicators: { appIsrStatus: false, buildActivity: false },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Disable Cloudflare Rocket Loader — it breaks Next.js hydration
          { key: 'cf-edge-cache', value: 'no-store' },
        ],
      },
    ];
  },
};

export default config;
