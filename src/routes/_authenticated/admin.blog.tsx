import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { adminListPosts, adminDeletePost, checkIsAdmin } from "@/lib/blog.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/blog")({
  head: () => ({ meta: [{ title: "Blog admin — Big Top Self Storage" }] }),
  component: AdminBlogList,
});

function AdminBlogList() {
  const router = useRouter();
  const checkAdmin = useServerFn(checkIsAdmin);
  const listFn = useServerFn(adminListPosts);
  const deleteFn = useServerFn(adminDeletePost);

  const adminCheck = useQuery({ queryKey: ["is-admin"], queryFn: () => checkAdmin() });
  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: () => listFn(),
    enabled: adminCheck.data?.isAdmin === true,
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Post deleted");
      refetch();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  if (adminCheck.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="p-10 text-center text-muted-foreground">Checking access…</div>
      </div>
    );
  }

  if (adminCheck.data && !adminCheck.data.isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-md p-10 text-center">
          <h1 className="font-display text-2xl font-bold">Access denied</h1>
          <p className="mt-2 text-muted-foreground">
            Your account doesn't have admin access. Log in with a
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-sm">@bigtopselfstorage.com</code>
            email to manage the blog.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Back to site</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold">Blog</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {posts ? `${posts.length} posts` : "Loading…"} · Logged in as admin
            </p>
          </div>
          <Button onClick={() => router.navigate({ to: "/admin/blog/new" })}>
            <Plus className="mr-2 h-4 w-4" /> New post
          </Button>
        </div>

        <div className="mt-8 overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              )}
              {posts?.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">
                    <Link
                      to="/admin/blog/$id"
                      params={{ id: p.id }}
                      className="hover:underline"
                    >
                      {p.title}
                    </Link>
                    <div className="mt-0.5 text-xs text-muted-foreground">/{p.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3">
                    {p.published ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                        <Eye className="h-3 w-3" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                        <EyeOff className="h-3 w-3" /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.date_published
                      ? new Date(p.date_published).toLocaleDateString("en-GB")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {p.published && (
                        <Button asChild size="sm" variant="ghost" title="View live">
                          <a href={`/${p.slug}`} target="_blank" rel="noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button asChild size="sm" variant="ghost" title="Edit">
                        <Link to="/admin/blog/$id" params={{ id: p.id }}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Delete"
                        onClick={() => {
                          if (confirm(`Delete "${p.title}"? This cannot be undone.`)) {
                            del.mutate(p.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts && posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    No posts yet. Click "New post" to write your first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
