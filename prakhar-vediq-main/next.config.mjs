/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['ffmpeg-static', 'fluent-ffmpeg'],
  outputFileTracingIncludes: {
    '/api/transcribe-video': ['./node_modules/ffmpeg-static/**/*'],
  },
}

export default nextConfig
