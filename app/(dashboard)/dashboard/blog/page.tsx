"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAdminBlogPosts, useDeleteBlogPost } from "@/src/modules/blog";
import BlogList from "@/app/_components/_dashboard/Blog/BlogList";
import { toast } from "sonner";

import ViewsSmallArea from "@/app/_components/_dashboard/Blog/Charts/ViewsSmallArea";
import NewSubsBar from "@/app/_components/_dashboard/Blog/Charts/NewSubsBar";
import EngagementRadial from "@/app/_components/_dashboard/Blog/Charts/EngagementRadial";
import CommentsSpark from "@/app/_components/_dashboard/Blog/Charts/CommentsSpark";
import TrafficComposed from "@/app/_components/_dashboard/Blog/Charts/TrafficComposed";
import SessionsDonut from "@/app/_components/_dashboard/Blog/Charts/SessionsDonut";

export default function BlogDashboardPage() {
  const [page, setPage] = useState(1);
  const filters = { page } as any;

  const { data, isLoading } = useAdminBlogPosts(filters);
  const posts = data?.data ?? [];
  const deleteMutation = useDeleteBlogPost();

  const [pendingIds, setPendingIds] = useState<string[]>([]);

  const handleDelete = async (post: any) => {
    if (!window.confirm(`Delete post ${post.title}?`)) return;
    setPendingIds((s) => (s.includes(post.id) ? s : [...s, post.id]));
    try {
      await deleteMutation.mutateAsync(post.id);
      toast.success("Post deleted");
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete post");
    } finally {
      setPendingIds((s) => s.filter((id) => id !== post.id));
    }
  };

  return (
    <div className="mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Blog</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage blog posts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/blog/new" className="rounded-lg bg-primary-blue text-white px-4 py-2 text-sm">Create Post</Link>
        </div>
      </div>

      {/* KPIs Section - static data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-surface-elevated border border-border-subtle rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-text-secondary">Total Posts</p>
              <p className="text-2xl font-bold text-text-primary">124</p>
            </div>
            <div className="p-2 rounded-lg bg-primary-cyan/10 text-primary-cyan">▲</div>
          </div>
          <div className="text-sm text-text-muted mt-3">Updated today</div>
        </div>

        <div className="bg-surface-elevated border border-border-subtle rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-text-secondary">Published</p>
              <p className="text-2xl font-bold text-text-primary">78</p>
            </div>
            <div className="p-2 rounded-lg bg-green-100 text-green-700">✔</div>
          </div>
          <div className="text-sm text-text-muted mt-3">Visible on site</div>
        </div>

        <div className="bg-surface-elevated border border-border-subtle rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-text-secondary">Drafts</p>
              <p className="text-2xl font-bold text-text-primary">46</p>
            </div>
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">✎</div>
          </div>
          <div className="text-sm text-text-muted mt-3">Work in progress</div>
        </div>

        <div className="bg-surface-elevated border border-border-subtle rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-text-secondary">Avg Read Time</p>
              <p className="text-2xl font-bold text-text-primary">4 min</p>
            </div>
            <div className="p-2 rounded-lg bg-primary-blue/10 text-primary-blue">⏱</div>
          </div>
          <div className="text-sm text-text-muted mt-3">Site average</div>
        </div>
      </div>

      {/* Charts Section - distinct small charts with different designs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <ViewsSmallArea />
        <NewSubsBar />
        <EngagementRadial />
        <CommentsSpark />
      </div>

      {/* Large Charts Section - two bigger charts placed before the real data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          {/* Traffic composed chart (area + bars + line) */}
          <div className="bg-surface-elevated border border-border-subtle rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-text-secondary">Traffic Overview</p>
                <p className="text-2xl font-semibold text-text-primary">82,400 <span className="text-sm text-text-muted">visits</span></p>
              </div>
              <div className="text-sm text-text-muted">+6.2% vs last 30d</div>
            </div>
            <div className="px-2">
              <TrafficComposed />
            </div>
          </div>
        </div>

        <div>
          {/* Sessions donut */}
          <SessionsDonut />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <BlogList
          posts={posts}
          onEdit={(p: any) => (window.location.href = `/dashboard/blog/${p.id}/edit`)}
          onDelete={handleDelete}
          busyIds={pendingIds}
        />
      )}

      {/* Simple pagination controls when meta present */}
      {data?.meta && data.meta.lastPage > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((v) => Math.max(1, v - 1))}
            className="rounded-lg border border-border-subtle px-4 py-2 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-text-secondary">Page {data.meta.page} of {data.meta.lastPage}</span>
          <button
            disabled={page >= data.meta.lastPage}
            onClick={() => setPage((v) => v + 1)}
            className="rounded-lg border border-border-subtle px-4 py-2 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
