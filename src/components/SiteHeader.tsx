import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Facebook, Youtube, Linkedin, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import bigtopLogo from "@/assets/bigtop-logo.svg";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/how-self-storage-works", label: "How it works" },
  { to: "/offers", label: "Offers" },
  { to: "/get-a-quote", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/contact-us", label: "Contact" },
] as const;

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background">
      {/* Top contact bar */}
      <div className="bg-primary text-primary-foreground text-[11px] sm:text-xs">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-1 px-4 py-1.5 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <a href="tel:01268230230" className="flex items-center gap-1.5 hover:underline">
              <Phone className="h-3 w-3" />
              <span>01268 230 230</span>
            </a>
            <a href="mailto:hi@bigtopselfstorage.com" className="flex items-center gap-1.5 hover:underline">
              <Mail className="h-3 w-3" />
              <span>hi@bigtopselfstorage.com</span>
            </a>
            <span className="hidden items-center gap-1.5 md:flex">
              <MapPin className="h-3 w-3" />
              Harvey Road, Basildon, SS13 1ET
            </span>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#1877F2] transition hover:scale-110"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.7c0-.9.3-1.6 1.6-1.6h1.7V4.2c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.6H7.7V14h2.7v8h3.1z" />
              </svg>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#FF0000] transition hover:scale-110"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5 3-5 3z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#0A66C2] transition hover:scale-110"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.3 18.3H5.7V9.8h2.6v8.5zM7 8.6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm11.3 9.7h-2.6v-4.1c0-1 0-2.3-1.4-2.3s-1.6 1.1-1.6 2.2v4.2h-2.6V9.8h2.5v1.2h.1c.4-.7 1.3-1.4 2.6-1.4 2.7 0 3.2 1.8 3.2 4.1v4.6z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 sm:px-6">
          <Link to="/" className="flex items-center py-0.5" aria-label="Big Top Self Storage">
            <img src={bigtopLogo} alt="Big Top Self Storage" className="h-9 w-auto sm:h-10" width={549} height={162} />
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-primary" }}
                className="text-sm font-semibold text-foreground hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="bg-red-600 text-white hover:bg-red-700">
              <Link to="/get-a-quote">Get a quote</Link>
            </Button>
            {user && (
              <Button variant="ghost" size="sm" onClick={signOut} className="hidden lg:inline-flex">
                Sign out
              </Button>
            )}
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-muted md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-border bg-background md:hidden">
            <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{ className: "bg-secondary text-primary" }}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/get-a-quote"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-md bg-accent px-3 py-2 text-center text-sm font-semibold text-accent-foreground"
              >
                Get a quote
              </Link>
              {user && (
                <button
                  type="button"
                  onClick={() => { setOpen(false); signOut(); }}
                  className="mt-1 rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted"
                >
                  Sign out
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
