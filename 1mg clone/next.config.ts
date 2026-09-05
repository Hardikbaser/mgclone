import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	devIndicators: false,
	images: {
		remotePatterns: [
			{ protocol: 'https', hostname: 'onemg.gumlet.io' },
			{ protocol: 'https', hostname: '**.1mg.com' },
			{ protocol: 'https', hostname: 'images.1mg.com' },
		],
	},
	compiler: {
		reactRemoveProperties: process.env.NODE_ENV === 'production',
	},
};
export default nextConfig;
