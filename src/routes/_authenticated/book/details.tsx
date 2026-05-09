import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/SiteHeader";
import { Stepper } from "@/components/booking/Stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatGBPRound } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/book/details")({
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
  const [tierId, setTierId] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
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

  // Pre-fill profile
  useEffect(() => {
    if (!user) return;
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
      return data as Tier[];
    },
  });

  // Auto-select first tier
  useEffect(() => {
    if (tiers && !tierId) setTierId(tiers[0].id);
  }, [tiers, tierId]);

  const tier = tiers?.find((t) => t.id === tierId);
  const total = (unit?.monthly_price_pence ?? 0) + (tier?.monthly_fee_pence ?? 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !unit || !moveInDate || !tierId) return;
    setSubmitting(true);

    // Save profile
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
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

    // Create booking with snapshot of the Storeganise unit
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        unit_id: unit.id,
        unit_snapshot: unit as never,
        protect_tier_id: tierId,
        move_in_date: format(moveInDate, "yyyy-MM-dd"),
        total_pence: total,
        status: "pending_payment",
      })
      .select("id")
      .single();

    setSubmitting(false);
    if (error) return toast.error(error.message);

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
              Step 2 of 4
            </span>
            <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
              Your details & move-in
            </h1>
          </header>

          {/* Move-in date */}
          <section className="space-y-2">
            <Label>Move-in date</Label>
            <Popover>
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
                  onSelect={setMoveInDate}
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
                <Input
                  id="postcode"
                  required
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address1">Address line 1</Label>
                <Input id="address1" required value={address1} onChange={(e) => setAddress1(e.target.value)} />
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
                          ? "No insurance — covered by other means"
                          : `Up to ${formatGBPRound(t.cover_value_pence)} of contents covered`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-base font-bold">
                      {t.monthly_fee_pence === 0 ? "Free" : `+${formatGBPRound(t.monthly_fee_pence)}`}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      per month
                    </div>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </section>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Saving…" : "Continue to payment"}
          </Button>
        </form>

        {/* Order summary */}
        <aside className="h-fit rounded-2xl border bg-card p-6 lg:sticky lg:top-24">
          <h3 className="font-display text-lg font-bold">Order summary</h3>
          {unit && (
            <div className="mt-4 space-y-3 text-sm">
              <Row label={`${unit.size_sqft} sq ft unit`} value={formatGBPRound(unit.monthly_price_pence)} />
              {tier && tier.monthly_fee_pence > 0 && (
                <Row
                  label={`BIGProtect (${tier.label})`}
                  value={`+${formatGBPRound(tier.monthly_fee_pence)}`}
                />
              )}
              <div className="border-t pt-3">
                <Row
                  label="Monthly total"
                  value={formatGBPRound(total)}
                  bold
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Includes 20% VAT. £1 for first 6 weeks where applicable.
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
