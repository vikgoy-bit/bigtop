import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogPostForm, type BlogFormValues } from "@/components/BlogPostForm";
import { adminCreatePost } from "@/lib/blog.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/blog/new")({
  head: () => ({ meta: [{ title: "New post — Big Top Self Storage" }] }),
  component: NewPostPage,
});

function NewPostPage() {
  const router = useRouter();
  const create = useServerFn(adminCreatePost);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (values: BlogFormValues) => {
    setSaving(true);
    try {
      const post = await create({ data: values });
      toast.success("Post created");
      router.navigate({ to: "/admin/blog/$id", params: { id: post.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <BlogPostForm saving={saving} onSubmit={handleSubmit} submitLabel="Create post" />
    </div>
  );
}
