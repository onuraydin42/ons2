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

  // A second dev server (a preview beside your own `npm run dev`) must not
  // share .next with the first; NEXT_DIST_DIR gives it its own. Unset, this
  // is the usual .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
