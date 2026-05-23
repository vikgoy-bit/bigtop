import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  meta_desc: string;
  og_image: string | null;
  category: string;
  body_html: string;
  excerpt: string | null;
  published: boolean;
  date_published: string | null;
  author_email: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const RESERVED_SLUGS = new Set([
  "", "about", "admin", "api", "blog", "book", "boxes-and-packaging",
  "business-storage", "contact-us", "cookie-policy", "forgot-password",
  "get-a-quote", "how-self-storage-works", "login", "lovable", "offers",
  "personal-storage", "pricing", "privacy-policy", "refer-a-friend",
  "reset-password", "secure-storage", "self-storage-insurance", "services",
  "signup", "sitemap.xml", "smart-entry", "space-estimator", "special-conditions",
  "big-protect-insurance-policy", "storage-size", "student-storage",
  "terms-conditions", "email",
]);

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const postInput = z.object({
  slug: z.string().min(1).max(200).regex(slugRe, "Lowercase letters, numbers, and hyphens only"),
  title: z.string().min(1).max(300),
  meta_desc: z.string().max(300).default(""),
  og_image: z.string().url().nullish(),
  category: z.string().min(1).max(80).default("Blog"),
  body_html: z.string().default(""),
  excerpt: z.string().max(500).nullish(),
  published: z.boolean().default(false),
  date_published: z.string().nullish(),
  tags: z.array(z.string().min(1).max(60)).max(20).default([]),
});

// ------------- Public reads (anyone) -------------

export const listPublishedPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("blog_posts")
    .select("id, slug, title, meta_desc, og_image, category, date_published, excerpt")
    .eq("published", true)
    .order("date_published", { ascending: false, nullsFirst: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getPublishedPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { data: post, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return post as BlogPost | null;
  });

// ------------- Admin reads/writes -------------

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

export const adminListPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("id, slug, title, category, published, date_published, updated_at, author_email")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminGetPost = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: post, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return post as BlogPost;
  });

export const adminCreatePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => postInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    if (RESERVED_SLUGS.has(data.slug)) {
      throw new Error(`Slug "${data.slug}" is reserved (matches a site page).`);
    }
    const { data: post, error } = await supabaseAdmin
      .from("blog_posts")
      .insert({
        ...data,
        date_published: data.date_published || (data.published ? new Date().toISOString() : null),
        author_id: context.userId,
        author_email: context.claims?.email ?? null,
      })
      .select("id, slug")
      .single();
    if (error) throw new Error(error.message);
    return post;
  });

export const adminUpdatePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ id: z.string().uuid() }).merge(postInput).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { id, ...patch } = data;
    if (RESERVED_SLUGS.has(patch.slug)) {
      throw new Error(`Slug "${patch.slug}" is reserved.`);
    }
    // If publishing for the first time and no date set, stamp now
    const current = await supabaseAdmin
      .from("blog_posts")
      .select("published, date_published")
      .eq("id", id)
      .single();
    const date_published =
      patch.date_published ||
      (patch.published && !current.data?.date_published
        ? new Date().toISOString()
        : current.data?.date_published ?? null);

    const { data: post, error } = await supabaseAdmin
      .from("blog_posts")
      .update({ ...patch, date_published })
      .eq("id", id)
      .select("id, slug")
      .single();
    if (error) throw new Error(error.message);
    return post;
  });

export const adminDeletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("blog_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
