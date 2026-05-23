import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogPostForm, type BlogFormValues } from "@/components/BlogPostForm";
import { adminGetPost, adminUpdatePost } from "@/lib/blog.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/blog/$id")({
  head: () => ({ meta: [{ title: "Edit post — Big Top Self Storage" }] }),
  component: EditPostPage,
});

function EditPostPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const getFn = useServerFn(adminGetPost);
  const updateFn = useServerFn(adminUpdatePost);
  const [saving, setSaving] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-post", id],
    queryFn: () => getFn({ data: { id } }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="p-10 text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="p-10 text-center text-muted-foreground">Post not found</div>
      </div>
    );
  }

  const handleSubmit = async (values: BlogFormValues) => {
    setSaving(true);
    try {
      await updateFn({ data: { id, ...values } });
      toast.success("Post saved");
      router.invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <BlogPostForm
        initial={{
          slug: data.slug,
          title: data.title,
          meta_desc: data.meta_desc,
          og_image: data.og_image,
          category: data.category,
          body_html: data.body_html,
          excerpt: data.excerpt,
          published: data.published,
          date_published: data.date_published,
          tags: data.tags,
        }}
        saving={saving}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
    </div>
  );
}
