import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/SiteHeader";
import { GoogleIcon } from "@/components/auth/ProviderIcons";
import { Sparkles, Mail } from "lucide-react";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — Big Top Self Storage" }] }),
  validateSearch: searchSchema,
  component: LoginPage,
});

const STAFF_DOMAIN = "@bigtopselfstorage.com";

function LoginPage() {
  const { redirect: redirectTo } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showStaff, setShowStaff] = useState(false);
  const [magicEmail, setMagicEmail] = useState("");
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    window.location.assign(redirectTo && redirectTo.startsWith("/") ? redirectTo : "/");
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + (redirectTo ?? "/"),
    });
    if (result.error) toast.error("Google sign-in failed");
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = magicEmail.trim().toLowerCase();
    if (!normalized.endsWith(STAFF_DOMAIN)) {
      return toast.error(`Magic links are only available for ${STAFF_DOMAIN} email addresses.`);
    }
    setMagicLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: {
        emailRedirectTo: window.location.origin + "/admin/blog",
      },
    });
    setMagicLoading(false);
    if (error) return toast.error(error.message);
    setMagicSent(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-10">
        <div className="w-full rounded-2xl border bg-card p-8 shadow-sm">
          {!showStaff ? (
            <>
              <h1 className="font-display text-2xl font-bold">Welcome back</h1>
              <p className="mt-1 text-sm text-muted-foreground">Log in to continue your booking.</p>

              <Button type="button" variant="outline" className="mt-6 w-full gap-2" onClick={handleGoogle}>
                <GoogleIcon /> Continue with Google
              </Button>

              <div className="my-6 flex items-center gap-3 text-xs uppercase text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-xs font-medium text-foreground underline-offset-2 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in…" : "Log in"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                New here?{" "}
                <Link to="/signup" search={{ redirect: redirectTo }} className="font-medium text-foreground underline-offset-2 hover:underline">
                  Create an account
                </Link>
              </p>

              <button
                type="button"
                onClick={() => setShowStaff(true)}
                className="mt-6 flex w-full items-center justify-center gap-2 border-t pt-4 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <Sparkles className="h-3 w-3" /> Big Top staff sign-in
              </button>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold">Staff sign-in</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Magic link login for the Big Top marketing team.
              </p>

              {magicSent ? (
                <div className="mt-6 rounded-lg border bg-muted/30 p-5 text-center">
                  <Mail className="mx-auto h-8 w-8 text-primary" />
                  <h2 className="mt-3 font-display text-lg font-bold">Check your inbox</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We sent a magic link to <strong>{magicEmail}</strong>. Click it to sign in.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setMagicSent(false); setMagicEmail(""); }}
                    className="mt-4 text-xs font-medium text-primary hover:underline"
                  >
                    Use a different email
                  </button>
                </div>
              ) : (
                <form onSubmit={handleMagicLink} className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="magic-email">Work email</Label>
                    <Input
                      id="magic-email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder={`you${STAFF_DOMAIN}`}
                      value={magicEmail}
                      onChange={(e) => setMagicEmail(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Only <code className="rounded bg-muted px-1">{STAFF_DOMAIN}</code> emails are eligible.
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={magicLoading}>
                    {magicLoading ? "Sending…" : "Send magic link"}
                  </Button>
                </form>
              )}

              <button
                type="button"
                onClick={() => setShowStaff(false)}
                className="mt-6 w-full border-t pt-4 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                ← Back to customer login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
