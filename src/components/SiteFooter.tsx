import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin } from "lucide-react";
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
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1877F2] transition hover:scale-110"
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
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#FF0000] transition hover:scale-110"
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
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0A66C2] transition hover:scale-110"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.3 18.3H5.7V9.8h2.6v8.5zM7 8.6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm11.3 9.7h-2.6v-4.1c0-1 0-2.3-1.4-2.3s-1.6 1.1-1.6 2.2v4.2h-2.6V9.8h2.5v1.2h.1c.4-.7 1.3-1.4 2.6-1.4 2.7 0 3.2 1.8 3.2 4.1v4.6z" />
              </svg>
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
