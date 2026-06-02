import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Le Dossier FDS — bulletin des écoles primaires du CSSPO",
  description:
    "Où va l'argent des levées de fonds et des dons dans les écoles primaires du Centre de services scolaire des Portages-de-l'Outaouais (Gatineau)? Un bulletin de A à F.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CA">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,900&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&family=Spline+Sans+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
        >
          Aller au contenu
        </a>
        <header className="border-b-2 border-ink/80">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
            <Link href="/" className="group flex items-baseline gap-3">
              <span className="font-display text-xl font-semibold tracking-tight">Le Dossier&nbsp;FDS</span>
              <span className="eyebrow hidden sm:inline">Fonds à destination spéciale</span>
            </Link>
            <Nav />
          </div>
        </header>

        <main id="content" className="mx-auto max-w-6xl px-5 py-10">{children}</main>

        <footer className="mt-16 border-t border-rule">
          <div className="mx-auto max-w-6xl px-5 py-8 text-sm text-inksoft">
            <p className="max-w-2xl">
              Données obtenues par demande d'accès à l'information auprès du{" "}
              <span className="font-medium text-ink">CSS des Portages-de-l'Outaouais</span>.
              Projet citoyen indépendant, sans affiliation avec le centre de services scolaire.
            </p>
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-pen">
              Gatineau · Outaouais · {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
