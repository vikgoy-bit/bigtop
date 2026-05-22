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
          <div className="hidden items-center gap-1.5 sm:flex">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-primary hover:bg-white/90">
              <Facebook className="h-3 w-3" fill="currentColor" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-primary hover:bg-white/90">
              <Youtube className="h-3 w-3" fill="currentColor" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-primary hover:bg-white/90">
              <Linkedin className="h-3 w-3" fill="currentColor" />
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
