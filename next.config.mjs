/** @type {import("next").NextConfig} */
const nextConfig = {
  // Static export: the whole site ships as flat HTML/JS, no Node runtime.
  // This is what makes a Netlify Drop (or any bucket) deploy possible.
  output: "export",

  // The export target has no Image Optimisation server, so images are served
  // exactly as prepare-assets wrote them.
  images: { unoptimized: true },

  // Emits /order as /order/index.html, which every static host resolves.
  trailingSlash: true,

  reactStrictMode: true,
};

export default nextConfig;
