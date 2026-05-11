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
      <div className="bg-[#0b3a8c] text-white text-[11px] sm:text-xs">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-1 px-4 py-1.5 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <a href="tel:01268230230" className="flex items-center gap-1.5 hover:underline">
              <Phone className="h-3 w-3" />
              <span>01268 230 230</span>
            </a>
            <a
              href="mailto:hi@bigtopselfstorage.com"
              className="flex items-center gap-1.5 hover:underline"
            >
              <Mail className="h-3 w-3" />
              <span>hi@bigtopselfstorage.com</span>
            </a>
            <span className="hidden items-center gap-1.5 md:flex">
              <MapPin className="h-3 w-3" />
              Big Top Self Storage, Harvey Road, Basildon, SS13 1ET
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <Facebook className="h-3 w-3" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <Youtube className="h-3 w-3" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <Linkedin className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 sm:px-6">
          <Link to="/" className="flex items-center py-0.5" aria-label="Big Top Self Storage">
            <img
              src={bigtopLogo}
              alt="Big Top Self Storage"
              className="h-9 w-auto sm:h-10"
              width={549}
              height={162}
            />
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <a href={`${MARKETING}/about`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-foreground hover:text-[#0b3a8c]">
              About
            </a>
            <a href={`${MARKETING}/offers`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-foreground hover:text-[#0b3a8c]">
              Offers
            </a>
            <a href={`${MARKETING}/pricing`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-foreground hover:text-[#0b3a8c]">
              Pricing
            </a>
            <a href={`${MARKETING}/contact`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-foreground hover:text-[#0b3a8c]">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {user && (
              <>
                <span className="hidden text-sm text-muted-foreground lg:inline">
                  {user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  Sign out
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
