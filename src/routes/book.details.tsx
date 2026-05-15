import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, ShieldCheck, UserPlus, LogIn, Search, Loader2, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/SiteHeader";
import { GoogleIcon, AppleIcon } from "@/components/auth/ProviderIcons";
import { Stepper } from "@/components/booking/Stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatGBPRound } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/book/details")({
  head: () => ({ meta: [{ title: "Your details — Big Top Self Storage" }] }),
  component: DetailsPage,
});

type Unit = {
  id: string;
  title: string;
  size_sqft: number;
  monthly_price_pence: number;
  weekly_price_pence: number;
  groupCode?: string;
  groupTitle?: string;
};
type Tier = {
  id: string;
  label: string;
  cover_value_pence: number;
  monthly_fee_pence: number;
};

function DetailsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [unit, setUnit] = useState<Unit | null>(null);
  const [moveInDate, setMoveInDate] = useState<Date | undefined>(new Date());
  const [dateOpen, setDateOpen] = useState(false);
  const [tierId, setTierId] = useState<string | null>(null);
  const [showExcVat, setShowExcVat] = useState(false);

  // Auth fields (only used when no current user)
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");

  // Address autocomplete (free OpenStreetMap Nominatim)
  type AddrSuggestion = {
    display_name: string;
    address?: {
      house_number?: string;
      building?: string;
      shop?: string;
      amenity?: string;
      road?: string;
      pedestrian?: string;
      footway?: string;
      residential?: string;
      neighbourhood?: string;
      hamlet?: string;
      suburb?: string;
      village?: string;
      town?: string;
      city?: string;
      municipality?: string;
      county?: string;
      state?: string;
      postcode?: string;
      country?: string;
    };
  };
  const [addrQuery, setAddrQuery] = useState("");
  const [addrSuggestions, setAddrSuggestions] = useState<AddrSuggestion[]>([]);
  const [addrOpen, setAddrOpen] = useState(false);
  const [addrLoading, setAddrLoading] = useState(false);
  const [pcLoading, setPcLoading] = useState(false);
  const suggestionsRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const q = addrQuery.trim();
    if (q.length < 3) {
      setAddrSuggestions([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setAddrLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=gb&limit=6&q=${encodeURIComponent(q)}`;
        const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" } });
        if (res.ok) {
          const data = (await res.json()) as AddrSuggestion[];
          setAddrSuggestions(data);
          setAddrOpen(true);
        }
      } catch {
        /* ignore */
      } finally {
        setAddrLoading(false);
      }
    }, 350);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [addrQuery]);

  const pickSuggestion = (s: AddrSuggestion) => {
    const a = s.address ?? {};
    // Parse display_name as a reliable fallback. Nominatim returns it as
    // "Building/House, Road, Suburb, City, County, Postcode, Country".
    const parts = s.display_name.split(",").map((p) => p.trim()).filter(Boolean);
    // Drop trailing country and postcode-ish parts so we can find the city.
    const isPostcode = (v: string) => /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i.test(v);

    const road = a.road ?? a.pedestrian ?? a.footway ?? a.residential ?? "";
    const houseOrName = a.house_number ?? a.building ?? a.shop ?? a.amenity ?? "";
    let line1 = [houseOrName, road].filter(Boolean).join(" ").trim();
    if (!line1) line1 = parts[0] ?? "";
    // If road is present but no house number, and parts[0] looks like a name/number, prepend it.
    if (road && !a.house_number && parts[0] && parts[0] !== road && !line1.includes(parts[0])) {
      line1 = `${parts[0]} ${road}`.trim();
    }

    const line2 = a.neighbourhood ?? a.suburb ?? a.hamlet ?? "";

    const cityFromAddr = a.city ?? a.town ?? a.village ?? a.municipality ?? a.county ?? "";
    let cityVal = cityFromAddr;
    if (!cityVal) {
      // Walk display_name parts from the end, skip country + postcode, take next.
      const trimmed = [...parts];
      if (trimmed.length && a.country && trimmed[trimmed.length - 1] === a.country) trimmed.pop();
      while (trimmed.length && (isPostcode(trimmed[trimmed.length - 1]) || /^\d/.test(trimmed[trimmed.length - 1]))) {
        trimmed.pop();
      }
      cityVal = trimmed[trimmed.length - 1] ?? "";
    }

    setAddress1(line1);
    setAddress2(line2 && line2 !== line1 ? line2 : "");
    setCity(cityVal);
    if (a.postcode) setPostcode(a.postcode);
    setAddrQuery(line1);
    setAddrOpen(false);
    setAddrSuggestions([]);
  };

  const lookupPostcode = async () => {
    const pc = postcode.trim();
    if (!pc) return toast.error("Enter a postcode first");
    setPcLoading(true);
    try {
      const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(pc)}`);
      const json = await res.json();
      if (!res.ok || json.status !== 200) {
        toast.error("Postcode not found");
        return;
      }
      const r = json.result;
      setCity(r.post_town ?? r.admin_district ?? "");
      setPostcode(r.postcode);
      toast.success(`Found ${r.post_town}. Add your house number/street above.`);
    } catch {
      toast.error("Lookup failed");
    } finally {
      setPcLoading(false);
    }
  };
  const [submitting, setSubmitting] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("pending_unit");
    if (raw) {
      try {
        setUnit(JSON.parse(raw) as Unit);
      } catch {
        // ignore
      }
    }
  }, []);

  // Pre-fill profile when already signed in
  useEffect(() => {
    if (!user) return;
    setEmail(user.email ?? "");
    supabase
      .from("profiles")
      .select("full_name,phone,address_line1,address_line2,city,postcode")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setFullName(data.full_name ?? "");
          setPhone(data.phone ?? "");
          setAddress1(data.address_line1 ?? "");
          setAddress2(data.address_line2 ?? "");
          setCity(data.city ?? "");
          setPostcode(data.postcode ?? "");
        }
      });
  }, [user]);

  const { data: tiers } = useQuery({
    queryKey: ["tiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("protect_tiers")
        .select("id,label,cover_value_pence,monthly_fee_pence")
        .order("sort_order");
      if (error) throw error;
      // Move "no cover" (cover_value_pence === 0) to the bottom of the list
      const rows = (data as Tier[]) ?? [];
      return [
        ...rows.filter((t) => t.cover_value_pence !== 0),
        ...rows.filter((t) => t.cover_value_pence === 0),
      ];
    },
  });

  useEffect(() => {
    if (tiers && !tierId) {
      // Default to the £4,000 cover tier (lowest available), otherwise first non-zero tier
      const defaultTier =
        tiers.find((t) => t.cover_value_pence === 400000) ??
        tiers.find((t) => t.cover_value_pence !== 0) ??
        tiers[0];
      if (defaultTier) setTierId(defaultTier.id);
    }
  }, [tiers, tierId]);

  const tier = tiers?.find((t) => t.id === tierId);
  const PROMO_FIRST_CHARGE_PENCE = 100; // £1 for first 6 weeks
  const monthlyTotal = (unit?.monthly_price_pence ?? 0) + (tier?.monthly_fee_pence ?? 0);
  const firstChargeTotal = PROMO_FIRST_CHARGE_PENCE + (tier?.monthly_fee_pence ?? 0);
  const isNoCover = tier?.cover_value_pence === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unit || !moveInDate || !tierId) return;
    if (isNoCover && !coverFile) {
      return toast.error("Please upload a copy of your existing cover.");
    }
    setSubmitting(true);

    // 1. Authenticate (sign up new account or sign in)
    let userId = user?.id ?? null;
    if (!userId) {
      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/book/details`,
            data: { full_name: fullName },
          },
        });
        if (error) {
          setSubmitting(false);
          return toast.error(error.message);
        }
        userId = data.user?.id ?? null;
        if (!userId) {
          setSubmitting(false);
          return toast.error("Account created. Please check your email and try again.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setSubmitting(false);
          return toast.error(error.message);
        }
        userId = data.user?.id ?? null;
      }
    }
    if (!userId) {
      setSubmitting(false);
      return toast.error("Could not sign you in. Please try again.");
    }

    // 2. Save profile
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: fullName,
      phone,
      address_line1: address1,
      address_line2: address2,
      city,
      postcode,
    });
    if (profileError) {
      setSubmitting(false);
      return toast.error(profileError.message);
    }

    // 3. Upload cover proof if "no cover required" is selected
    let coverPath: string | null = null;
    if (isNoCover && coverFile) {
      const ext = coverFile.name.split(".").pop() ?? "pdf";
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("cover-documents")
        .upload(path, coverFile, { upsert: false });
      if (upErr) {
        setSubmitting(false);
        return toast.error(upErr.message);
      }
      coverPath = path;
    }

    // 4. Create booking
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        user_id: userId,
        unit_id: unit.id,
        unit_snapshot: unit as never,
        protect_tier_id: tierId,
        move_in_date: format(moveInDate, "yyyy-MM-dd"),
        total_pence: firstChargeTotal,
        status: "pending_payment",
        cover_document_path: coverPath,
      })
      .select("id")
      .single();

    setSubmitting(false);
    if (error) return toast.error(error.message);

    // Notify ops about uploaded insurance proof (no-cover flow)
    if (isNoCover && coverPath) {
      try {
        const { data: signed } = await supabase.storage
          .from("cover-documents")
          .createSignedUrl(coverPath, 60 * 60 * 24 * 7);
        const { sendTransactionalEmail } = await import("@/lib/email/send");
        await sendTransactionalEmail({
          templateName: "insurance-cover",
          recipientEmail: "hi@bigtopselfstorage.com",
          idempotencyKey: `insurance-cover-${booking.id}`,
          templateData: {
            customerName: fullName,
            customerEmail: email || user?.email,
            customerPhone: phone,
            unitTitle: `${unit.size_sqft} sq ft (${unit.title})`,
            moveInDate: format(moveInDate, "yyyy-MM-dd"),
            downloadUrl: signed?.signedUrl,
          },
        });
      } catch (err) {
        console.error("Failed to send insurance cover email", err);
      }
    }

    sessionStorage.setItem("pending_booking_id", booking.id);
    navigate({ to: "/book/payment" });
  };

  if (!unit) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-md p-10 text-center">
          <h1 className="font-display text-xl font-bold">Pick a unit first</h1>
          <Button className="mt-4" onClick={() => navigate({ to: "/" })}>
            Back to units
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Stepper current="details" />

      <div className="mx-auto grid max-w-5xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} className="space-y-8 rounded-2xl border bg-card p-6 sm:p-8">
          <header>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              Step 2 of 5
            </span>
            <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
              Your details & move-in
            </h1>
          </header>

          {/* Account (only when not signed in) */}
          {!user && (
            <section className="space-y-4 rounded-xl border bg-secondary/30 p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-lg font-bold">
                  {authMode === "signup" ? "Create your account" : "Sign in to your account"}
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAuthMode(authMode === "signup" ? "signin" : "signup")}
                  className="gap-1.5"
                >
                  {authMode === "signup" ? (
                    <>
                      <LogIn className="h-3.5 w-3.5" /> I have an account
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3.5 w-3.5" /> Create one instead
                    </>
                  )}
                </Button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={async () => {
                    const result = await lovable.auth.signInWithOAuth("google", {
                      redirect_uri: window.location.origin + "/book/details",
                    });
                    if (result.error) toast.error("Google sign-in failed");
                  }}
                >
                  <GoogleIcon /> Continue with Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={async () => {
                    const result = await lovable.auth.signInWithOAuth("apple", {
                      redirect_uri: window.location.origin + "/book/details",
                    });
                    if (result.error) toast.error("Apple sign-in failed");
                  }}
                >
                  <AppleIcon /> Continue with Apple
                </Button>
              </div>
              <div className="flex items-center gap-3 text-xs uppercase text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                or {authMode === "signup" ? "sign up" : "sign in"} with email
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </section>
          )}

          {/* Move-in date */}
          <section className="space-y-3">
            <Label className="block">Move-in date</Label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal sm:w-72",
                    !moveInDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {moveInDate ? format(moveInDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={moveInDate}
                  onSelect={(d) => {
                    setMoveInDate(d);
                    if (d) setDateOpen(false);
                  }}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </section>

          {/* Contact details */}
          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold">Contact details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="postcode">Postcode</Label>
                <div className="flex gap-2">
                  <Input
                    id="postcode"
                    required
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                    placeholder="e.g. SS13 1ET"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={lookupPostcode}
                    disabled={pcLoading}
                    className="shrink-0"
                  >
                    {pcLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    <span className="ml-1 hidden sm:inline">Find</span>
                  </Button>
                </div>
              </div>
              <div className="relative sm:col-span-2">
                <Label htmlFor="address1">Address line 1</Label>
                <Input
                  id="address1"
                  required
                  value={address1}
                  placeholder="Start typing your street or postcode…"
                  onChange={(e) => {
                    setAddress1(e.target.value);
                    setAddrQuery(e.target.value);
                  }}
                 onFocus={() => addrSuggestions.length > 0 && setAddrOpen(true)}
                  onBlur={(e) => {
                    // Don't close if focus moved into the suggestions list
                    const next = e.relatedTarget as Node | null;
                    if (next && suggestionsRef.current?.contains(next)) return;
                    setTimeout(() => setAddrOpen(false), 150);
                  }}
                  autoComplete="off"
                />
                {addrLoading && (
                  <Loader2 className="absolute right-3 top-9 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {addrOpen && addrSuggestions.length > 0 && (
                  <ul
                    ref={suggestionsRef}
                    className="absolute left-0 right-0 z-50 mt-1 max-h-72 overflow-auto rounded-lg border bg-popover p-1 shadow-lg"
                    onMouseDown={(e) => e.preventDefault()}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    {addrSuggestions.map((s, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => pickSuggestion(s)}
                          className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                        >
                          {s.display_name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Tip: enter your postcode then click <strong>Find</strong>, or type your street here. Address search by{" "}
                  <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    OpenStreetMap
                  </a>
                </p>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address2">Address line 2 (optional)</Label>
                <Input id="address2" value={address2} onChange={(e) => setAddress2(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" required value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
            </div>
          </section>

          {/* BIGProtect */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <h2 className="font-display text-lg font-bold">BIGProtect goods cover</h2>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="More info about BIGProtect goods cover"
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-sm">
                    A tailored protection policy designed specifically to cover your goods while they are in self-storage. More info available at{" "}
                    <a
                      href="https://www.bigtopselfstorage.com/self-storage-insurance/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      bigtopselfstorage.com/self-storage-insurance
                    </a>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose the cover level that matches the value of items you're storing. The fee
              is added to your monthly bill.
            </p>
            <RadioGroup value={tierId ?? ""} onValueChange={setTierId} className="grid gap-2">
              {tiers?.map((t) => (
                <Label
                  key={t.id}
                  htmlFor={t.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl border bg-background p-4 transition",
                    tierId === t.id && "border-accent ring-2 ring-accent/40"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem id={t.id} value={t.id} />
                    <div>
                      <div className="font-medium">{t.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.cover_value_pence === 0
                          ? "Covered elsewhere. Please upload a copy of your cover and ensure it states the cover is for Big Top Self Storage Basildon. If you don't have this ready, select the relevant cover above — we'll pro-rata refund the fee once you supply it."
                          : `Up to ${formatGBPRound(t.cover_value_pence)} of contents covered`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-base font-bold">
                      {t.monthly_fee_pence === 0 ? "£0" : `+${formatGBPRound(t.monthly_fee_pence)}`}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      per month
                    </div>
                  </div>
                </Label>
              ))}
            </RadioGroup>

            {isNoCover && (
              <div className="space-y-2 rounded-xl border border-accent/40 bg-accent/5 p-4">
                <Label htmlFor="coverDoc" className="text-sm font-semibold">
                  Upload your cover document <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  PDF, JPG or PNG. Must state the cover is for Big Top Self Storage Basildon.
                </p>
                <label
                  htmlFor="coverDoc"
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-accent/50 bg-background px-4 py-6 text-center transition hover:border-accent hover:bg-accent/5"
                >
                  <Upload className="h-6 w-6 text-accent" />
                  <span className="text-sm font-medium text-foreground">
                    {coverFile ? "Change file" : "Click here to choose a file"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    or drag and drop — PDF, JPG or PNG
                  </span>
                </label>
                <Input
                  id="coverDoc"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                  className="sr-only"
                  onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                />
                {coverFile && (
                  <p className="text-xs text-foreground">Selected: {coverFile.name}</p>
                )}
              </div>
            )}
          </section>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Saving…" : "Continue to payment"}
          </Button>
        </form>

        {/* Order summary */}
        <aside className="h-fit rounded-2xl border bg-card p-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold">Order summary</h3>
            <div className="inline-flex rounded-full border bg-muted/40 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setShowExcVat(false)}
                className={cn(
                  "rounded-full px-2.5 py-1 transition",
                  !showExcVat ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                )}
              >
                inc VAT
              </button>
              <button
                type="button"
                onClick={() => setShowExcVat(true)}
                className={cn(
                  "rounded-full px-2.5 py-1 transition",
                  showExcVat ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                )}
              >
                exc VAT
              </button>
            </div>
          </div>
          {unit && (
            <div className="mt-4 space-y-3 text-sm">
              <Row
                label={`${unit.size_sqft} sq ft unit`}
                value={formatGBPRound(showExcVat ? Math.round(unit.monthly_price_pence / 1.2) : unit.monthly_price_pence)}
              />
              {tier && tier.monthly_fee_pence > 0 && (
                <Row
                  label={`BIGProtect (${tier.label})`}
                  value={`+${formatGBPRound(showExcVat ? Math.round(tier.monthly_fee_pence / 1.2) : tier.monthly_fee_pence)}`}
                />
              )}
              <div className="border-t pt-3">
                <Row
                  label={`Standard monthly (${showExcVat ? "exc" : "inc"} VAT)`}
                  value={formatGBPRound(showExcVat ? Math.round(monthlyTotal / 1.2) : monthlyTotal)}
                />
              </div>

              <div className="rounded-xl bg-accent/10 p-3 ring-1 ring-accent/30">
                <div className="text-xs font-semibold uppercase tracking-wider text-accent">
                  £1 first 6 weeks offer
                </div>
                <div className="mt-2 space-y-1.5">
                  <Row label="Unit (first month)" value="£1.00" />
                  {tier && tier.monthly_fee_pence > 0 && (
                    <Row
                      label="BIGProtect (first month)"
                      value={`+${formatGBPRound(showExcVat ? Math.round(tier.monthly_fee_pence / 1.2) : tier.monthly_fee_pence)}`}
                    />
                  )}
                </div>
                <div className="mt-2 border-t border-accent/30 pt-2">
                  <Row
                    label="Pay today"
                    value={formatGBPRound(showExcVat ? Math.round(firstChargeTotal / 1.2) : firstChargeTotal)}
                    bold
                  />
                </div>
                <p className="mt-2 inline-flex items-flex-start gap-1 text-[11px] leading-snug text-muted-foreground">
                  <span>
                    Monthly billing of {formatGBPRound(monthlyTotal)} begins after the promotional period, next month will be a prorata bill. Cancel anytime
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="ml-1 inline-flex align-middle text-muted-foreground hover:text-foreground" aria-label="Cancellation notice">
                            <Info className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">1 month notice required</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className={cn("text-muted-foreground", bold && "text-foreground font-medium")}>
        {label}
      </span>
      <span className={cn("font-medium", bold && "font-display text-lg font-extrabold")}>
        {value}
      </span>
    </div>
  );
}
