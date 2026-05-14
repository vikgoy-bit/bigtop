import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendTransactionalEmailServer } from "@/lib/email/send.server";

const ABANDON_AFTER_MIN = 15;

function fmtGBP(pence?: number | null) {
  if (pence == null) return undefined;
  return `£${(pence / 100).toFixed(2)}`;
}

async function processAbandonedCarts() {
  const cutoff = new Date(Date.now() - ABANDON_AFTER_MIN * 60_000).toISOString();

  const { data: bookings, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "id, user_id, unit_id, move_in_date, total_pence, created_at, unit_snapshot, protect_tier_id, status, abandoned_email_sent_at",
    )
    .eq("status", "pending_payment")
    .is("abandoned_email_sent_at", null)
    .lt("created_at", cutoff)
    .limit(50);

  if (error) throw new Error(error.message);
  if (!bookings || bookings.length === 0) return { processed: 0 };

  let sent = 0;
  for (const b of bookings) {
    try {
      const [{ data: profile }, { data: tier }, { data: authUser }] = await Promise.all([
        supabaseAdmin
          .from("profiles")
          .select("full_name, phone, address_line1, address_line2, city, postcode")
          .eq("id", b.user_id)
          .maybeSingle(),
        b.protect_tier_id
          ? supabaseAdmin
              .from("protect_tiers")
              .select("label")
              .eq("id", b.protect_tier_id)
              .maybeSingle()
          : Promise.resolve({ data: null as { label: string } | null }),
        supabaseAdmin.auth.admin.getUserById(b.user_id),
      ]);

      const snap = (b.unit_snapshot ?? {}) as Record<string, any>;
      let unitName = snap.name ?? snap.title ?? snap.unitName;
      let unitSize = snap.size_sqft ? `${snap.size_sqft} sqft` : snap.size;
      let monthlyPence = snap.monthly_price_pence ?? snap.monthlyPrice;

      if (!unitName || !monthlyPence) {
        const { data: unit } = await supabaseAdmin
          .from("units")
          .select("name, size_sqft, monthly_price_pence")
          .eq("id", b.unit_id)
          .maybeSingle();
        if (unit) {
          unitName = unitName ?? unit.name;
          unitSize = unitSize ?? `${unit.size_sqft} sqft`;
          monthlyPence = monthlyPence ?? unit.monthly_price_pence;
        }
      }

      const addressParts = [
        profile?.address_line1,
        profile?.address_line2,
        profile?.city,
        profile?.postcode,
      ].filter(Boolean);

      const minutesSince = Math.round(
        (Date.now() - new Date(b.created_at).getTime()) / 60_000,
      );

      const result = await sendTransactionalEmailServer({
        templateName: "abandoned-cart",
        idempotencyKey: `abandoned-${b.id}`,
        templateData: {
          customerName: profile?.full_name ?? undefined,
          customerEmail: authUser?.user?.email ?? undefined,
          customerPhone: profile?.phone ?? undefined,
          address: addressParts.length ? addressParts.join(", ") : undefined,
          unitName,
          unitSize,
          monthlyPrice: fmtGBP(monthlyPence),
          moveInDate: b.move_in_date,
          tierLabel: tier?.label,
          bookingId: b.id,
          bookingRef: b.id.slice(0, 8).toUpperCase(),
          createdAt: new Date(b.created_at).toISOString().replace("T", " ").slice(0, 16),
          minutesSince,
        },
      });

      if (result.ok) {
        await supabaseAdmin
          .from("bookings")
          .update({ abandoned_email_sent_at: new Date().toISOString() })
          .eq("id", b.id);
        sent++;
      } else {
        console.error("abandoned-cart send failed", b.id, result);
      }
    } catch (e) {
      console.error("abandoned-cart loop error", b.id, e);
    }
  }

  return { processed: bookings.length, sent };
}

export const Route = createFileRoute("/api/public/hooks/abandoned-cart")({
  server: {
    handlers: {
      GET: async () => {
        const result = await processAbandonedCarts();
        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json" },
        });
      },
      POST: async () => {
        const result = await processAbandonedCarts();
        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
