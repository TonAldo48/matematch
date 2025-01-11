/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.watchOptions = {
      aggregateTimeout: 300,
      poll: 1000,
    }
    
    config.optimization.splitChunks = {
      chunks: 'all',
      minSize: 20000,
      maxSize: 70000,
      cacheGroups: {
        default: false,
        vendors: {
          name: 'vendors',
          chunks: 'all',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          reuseExistingChunk: true,
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: 1,
          reuseExistingChunk: true,
        },
      },
    }
    
    return config
  },
  serverRuntimeConfig: {
    timeoutMs: 60000,
  },
  compress: true,
}

module.exports = nextConfig 