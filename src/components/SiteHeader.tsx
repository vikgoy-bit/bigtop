import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Facebook, Youtube, Linkedin } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import bigtopLogo from "@/assets/bigtop-logo.svg";

const MARKETING = "https://www.bigtopselfstorage.com";

export function SiteHeader() {
  const { user, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-40 bg-background">
      {/* Top contact bar */}
      <div className="bg-[#0b3a8c] text-white text-xs sm:text-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-2 px-4 py-2 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <a href="tel:01268230230" className="flex items-center gap-2 hover:underline">
              <Phone className="h-4 w-4" />
              <span>01268 230 230</span>
            </a>
            <a
              href="mailto:hi@bigtopselfstorage.com"
              className="flex items-center gap-2 hover:underline"
            >
              <Mail className="h-4 w-4" />
              <span>hi@bigtopselfstorage.com</span>
            </a>
            <span className="hidden items-center gap-2 md:flex">
              <MapPin className="h-4 w-4" />
              Big Top Self Storage, Harvey Road, Basildon, SS13 1ET
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <Facebook className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <Youtube className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <Linkedin className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center" aria-label="Big Top Self Storage">
            <img
              src={bigtopLogo}
              alt="Big Top Self Storage"
              className="h-12 w-auto sm:h-14"
              width={1100}
              height={327}
            />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href={`${MARKETING}/about`} className="text-sm font-semibold text-foreground hover:text-[#0b3a8c]">
              About
            </a>
            <a href={`${MARKETING}/offers`} className="text-sm font-semibold text-foreground hover:text-[#0b3a8c]">
              Offers
            </a>
            <a href={`${MARKETING}/pricing`} className="text-sm font-semibold text-foreground hover:text-[#0b3a8c]">
              Pricing
            </a>
            <a href={`${MARKETING}/contact`} className="text-sm font-semibold text-foreground hover:text-[#0b3a8c]">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden text-sm text-muted-foreground lg:inline">
                  {user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <Button asChild size="sm" className="bg-[#0b3a8c] hover:bg-[#092e6f] text-white font-bold tracking-wide">
                <Link to="/">GET A QUOTE</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
