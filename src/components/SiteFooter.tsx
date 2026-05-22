import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Facebook, Youtube, Linkedin } from "lucide-react";
import bigtopLogo from "@/assets/bigtop-logo.svg";

const COL = "text-sm text-primary-foreground/80 hover:text-primary-foreground transition";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <Link to="/" aria-label="Big Top Self Storage" className="inline-block rounded-md bg-white/95 p-2">
            <img src={bigtopLogo} alt="Big Top Self Storage" className="h-10 w-auto" />
          </Link>
          <p className="mt-4 text-sm text-primary-foreground/80">
            The Greatest Space on Earth. Modern, secure self storage in Basildon with smart-entry access.
          </p>
          <div className="mt-4 flex gap-2">
            <a aria-label="Facebook" href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary hover:bg-white/90">
              <Facebook className="h-4 w-4" fill="currentColor" />
            </a>
            <a aria-label="YouTube" href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary hover:bg-white/90">
              <Youtube className="h-4 w-4" fill="currentColor" />
            </a>
            <a aria-label="LinkedIn" href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary hover:bg-white/90">
              <Linkedin className="h-4 w-4" fill="currentColor" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary-foreground/60">Storage</h3>
          <ul className="mt-4 space-y-2">
            <li><Link to="/get-a-quote" className={COL}>Get a quote</Link></li>
            <li><Link to="/personal-storage" className={COL}>Personal storage</Link></li>
            <li><Link to="/business-storage" className={COL}>Business storage</Link></li>
            <li><Link to="/student-storage" className={COL}>Student storage</Link></li>
            <li><Link to="/boxes-and-packaging" className={COL}>Boxes & packaging</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary-foreground/60">Company</h3>
          <ul className="mt-4 space-y-2">
            <li><Link to="/about" className={COL}>About</Link></li>
            <li><Link to="/how-self-storage-works" className={COL}>How it works</Link></li>
            <li><Link to="/smart-entry" className={COL}>Smart entry</Link></li>
            <li><Link to="/offers" className={COL}>Offers</Link></li>
            <li><Link to="/contact-us" className={COL}>Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary-foreground/60">Visit us</h3>
          <address className="mt-4 not-italic text-sm text-primary-foreground/80">
            <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /><span>Harvey Road, Basildon, Essex, SS13 1ET</span></div>
            <div className="mt-3 flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /><a href="tel:01268230230" className="hover:text-primary-foreground">01268 230 230</a></div>
            <div className="mt-2 flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /><a href="mailto:hi@bigtopselfstorage.com" className="hover:text-primary-foreground">hi@bigtopselfstorage.com</a></div>
            <div className="mt-3 text-xs text-primary-foreground/60">Open every day · 08:00–20:00</div>
          </address>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-primary-foreground/60 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Big Top Self Storage. All rights reserved.</p>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <Link to="/privacy-policy" className="hover:text-primary-foreground">Privacy</Link>
            <Link to="/cookie-policy" className="hover:text-primary-foreground">Cookies</Link>
            <Link to="/terms-conditions" className="hover:text-primary-foreground">Terms</Link>
            <Link to="/self-storage-insurance" className="hover:text-primary-foreground">Insurance</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
