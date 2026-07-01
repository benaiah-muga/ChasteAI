/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@chaste-ai/db", "@chaste-ai/ai", "@chaste-ai/ui", "@chaste-ai/channels"],
  serverExternalPackages: ["@whiskeysockets/baileys"],
}

export default nextConfig
