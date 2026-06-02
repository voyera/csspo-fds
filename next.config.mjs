/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export", // build produit un dossier `out/` 100 % statique
  images: { unoptimized: true },
  trailingSlash: true, // /ecole/008/ -> index.html, sert bien sur un CDN statique
};

export default nextConfig;
