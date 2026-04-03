import { Link } from "@tanstack/react-router";
import { Home, Menu, X } from "lucide-react";
import { useState } from "react";
import { t } from "@/lib/i18n";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="p-4 flex items-center bg-parchment border-b border-cream-dark">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-cream rounded-lg transition-colors text-loam"
          aria-label={t("header.openMenu")}
        >
          <Menu size={24} />
        </button>
        <Link to="/" className="ml-4 no-underline">
          <span className="font-display text-2xl font-semibold text-sage leading-none">
            {t("header.title")}
          </span>
          <span className="block text-[10px] text-loam tracking-[0.06em] font-medium font-body">
            {t("header.subtitle")}
          </span>
        </Link>
      </header>

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-soil text-cream shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-loam">
          <h2 className="text-xl font-bold font-display">{t("header.nav")}</h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-loam rounded-lg transition-colors"
            aria-label={t("header.closeMenu")}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-loam transition-colors mb-2 text-cream no-underline"
            activeProps={{
              className:
                "flex items-center gap-3 p-3 rounded-lg bg-sage hover:bg-sage-dark transition-colors mb-2 text-cream no-underline",
            }}
          >
            <Home size={20} />
            <span className="font-medium font-body">{t("header.home")}</span>
          </Link>
        </nav>
      </aside>
    </>
  );
}
