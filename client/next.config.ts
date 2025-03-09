import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Prevent bundling node modules that require native bindings
  serverComponentsExternalPackages: [
    'ssh2',
    'dockerode',
    'docker-modem',
    'child_process',
    'fs',
    'path',
    'crypto'
  ],
  // Add webpack configuration to handle native modules
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark these packages as external so Next.js doesn't try to bundle them
      config.externals.push(
        'ssh2',
        'dockerode',
        'docker-modem'
      );
    }
    return config;
  },
};

export default nextConfig;