import { useEffect, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { BlogEditor } from "@/components/BlogEditor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Upload, X } from "lucide-react";

export interface BlogFormValues {
  slug: string;
  title: string;
  meta_desc: string;
  og_image: string | null;
  category: string;
  body_html: string;
  excerpt: string | null;
  published: boolean;
  date_published: string | null;
  tags: string[];
}

interface Props {
  initial?: Partial<BlogFormValues>;
  saving: boolean;
  onSubmit: (values: BlogFormValues) => Promise<void> | void;
  submitLabel?: string;
}

const slugify = (s: string) =>
  s.toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export function BlogPostForm({ initial, saving, onSubmit, submitLabel = "Save" }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<BlogFormValues>({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    meta_desc: initial?.meta_desc ?? "",
    og_image: initial?.og_image ?? null,
    category: initial?.category ?? "Blog",
    body_html: initial?.body_html ?? "",
    excerpt: initial?.excerpt ?? "",
    published: initial?.published ?? false,
    date_published: initial?.date_published ?? null,
    tags: initial?.tags ?? [],
  });
  const [autoSlug, setAutoSlug] = useState(!initial?.slug);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (autoSlug && values.title) {
      setValues((v) => ({ ...v, slug: slugify(v.title) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.title, autoSlug]);

  const set = <K extends keyof BlogFormValues>(k: K, v: BlogFormValues[K]) =>
    setValues((s) => ({ ...s, [k]: v }));

  const uploadOgImage = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `og/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
      const { error } = await supabase.storage.from("blog-images").upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
      set("og_image", data.publicUrl);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.slug || !values.title) {
      return toast.error("Title and slug are required");
    }
    await onSubmit(values);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || values.tags.includes(t)) return;
    set("tags", [...values.tags, t]);
    setTagInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Button type="button" variant="ghost" onClick={() => router.navigate({ to: "/admin/blog" })}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <Switch checked={values.published} onCheckedChange={(v) => set("published", v)} />
            {values.published ? "Published" : "Draft"}
          </label>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : submitLabel}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div>
            <Input
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Post title"
              className="h-auto border-0 bg-transparent p-0 font-display text-3xl font-extrabold leading-tight focus-visible:ring-0 sm:text-4xl"
              required
            />
          </div>

          <BlogEditor value={values.body_html} onChange={(html) => set("body_html", html)} />
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <Field label="URL slug" hint={`/${values.slug || "your-post-url"}`}>
            <Input
              value={values.slug}
              onChange={(e) => {
                setAutoSlug(false);
                set("slug", slugify(e.target.value));
              }}
              placeholder="my-post-url"
              required
            />
            <label className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={autoSlug}
                onChange={(e) => setAutoSlug(e.target.checked)}
              />
              Auto-generate from title
            </label>
          </Field>

          <Field label="Category">
            <Input
              value={values.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="Blog, Guides, News…"
            />
          </Field>

          <Field
            label="Meta description"
            hint={`${values.meta_desc.length}/160 — shown in search results`}
          >
            <Textarea
              value={values.meta_desc}
              onChange={(e) => set("meta_desc", e.target.value.slice(0, 200))}
              rows={3}
              placeholder="Concise summary for Google & social shares."
            />
          </Field>

          <Field label="Featured image (OG)">
            {values.og_image ? (
              <div className="relative overflow-hidden rounded-md border">
                <img src={values.og_image} alt="" className="aspect-video w-full object-cover" />
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute right-2 top-2 h-7 w-7"
                  onClick={() => set("og_image", null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground hover:bg-muted/30">
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading…" : "Upload image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadOgImage(f);
                  }}
                />
              </label>
            )}
            <Input
              value={values.og_image ?? ""}
              onChange={(e) => set("og_image", e.target.value || null)}
              placeholder="…or paste an image URL"
              className="mt-2"
            />
          </Field>

          <Field label="Publish date" hint="Leave blank to use now when publishing">
            <Input
              type="datetime-local"
              value={values.date_published ? values.date_published.slice(0, 16) : ""}
              onChange={(e) =>
                set("date_published", e.target.value ? new Date(e.target.value).toISOString() : null)
              }
            />
          </Field>

          <Field label="Excerpt" hint="Optional teaser shown on the index">
            <Textarea
              value={values.excerpt ?? ""}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={3}
              placeholder="Short summary…"
            />
          </Field>

          <Field label="Tags">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag and press Enter"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            {values.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {values.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => set("tags", values.tags.filter((x) => x !== t))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Field>
        </aside>
      </div>
    </form>
  );
}

function Field({
  label, hint, children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
