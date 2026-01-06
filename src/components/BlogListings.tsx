"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from "date-fns";
import { az } from "date-fns/locale";
import { 
  Clock, 
  Eye, 
  Calendar, 
  User, 
  Search,
  BookOpen,
  ChevronDown
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  h1_title: string | null;
  published_at: string | null;
  updated_at: string;
  reading_time_minutes: number | null;
  views: number | null;
  blog_authors: {
    id: string;
    name: string;
    slug: string;
    bio: string | null;
    avatar_url: string | null;
    website: string | null;
    twitter: string | null;
    linkedin: string | null;
  } | null;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

interface BlogListingsProps {
  selectedBlogId: string | null;
  onBlogSelect: (blog: Blog) => void;
}

const ITEMS_PER_PAGE = 20;

export default function BlogListings({ selectedBlogId, onBlogSelect }: BlogListingsProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch blogs
  const fetchBlogs = useCallback(async (pageNum: number, append: boolean = false) => {
    if (pageNum === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const { data, error } = await supabase
        .from("blogs")
        .select(`
          *,
          blog_authors (
            id,
            name,
            slug,
            bio,
            avatar_url,
            website,
            twitter,
            linkedin
          )
        `)
        .eq("is_published", true)
        .eq("is_active", true)
        .order("published_at", { ascending: false })
        .range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1);

      if (error) {
        console.error("Error fetching blogs:", error);
        return;
      }

      if (data) {
        if (append) {
          setBlogs(prev => [...prev, ...data]);
        } else {
          setBlogs(data);
        }
        setHasMore(data.length === ITEMS_PER_PAGE);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (!error && data) {
        setCategories(data);
      }
    };

    fetchCategories();
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchBlogs(0);
  }, [fetchBlogs]);

  // Load more
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBlogs(nextPage, true);
    }
  }, [loadingMore, hasMore, page, fetchBlogs]);

  // Filter blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [blogs, searchQuery]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Bu gün';
    if (diffDays === 2) return 'Dünən';
    if (diffDays <= 7) return `${diffDays - 1} gün əvvəl`;
    return format(date, "d MMM", { locale: az });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Məqalə axtar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        {/* Category filters - horizontal scroll */}
        {categories.length > 0 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            <Button
              variant={!selectedCategory ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="shrink-0 h-8 text-xs"
            >
              Hamısı
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="shrink-0 h-8 text-xs"
              >
                {category.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Blog List */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="divide-y divide-border">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : filteredBlogs.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Məqalə tapılmadı</h3>
              <p className="text-muted-foreground text-sm">
                Axtarış kriteriyalarınıza uyğun məqalə yoxdur.
              </p>
            </div>
          ) : (
            <>
              {filteredBlogs.map((blog) => (
                <article
                  key={blog.id}
                  onClick={() => onBlogSelect(blog)}
                  className={`p-4 cursor-pointer transition-all hover:bg-muted/50 ${
                    selectedBlogId === blog.id 
                      ? 'bg-primary/10 border-l-4 border-l-primary' 
                      : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    {blog.featured_image && (
                      <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                        <img
                          src={blog.featured_image}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h2 className="font-semibold text-foreground line-clamp-2 text-sm sm:text-base mb-1">
                        {blog.title}
                      </h2>

                      {/* Excerpt */}
                      {blog.excerpt && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                          {blog.excerpt}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {/* Author */}
                        {blog.blog_authors && (
                          <span className="flex items-center gap-1">
                            {blog.blog_authors.avatar_url ? (
                              <img
                                src={blog.blog_authors.avatar_url}
                                alt={blog.blog_authors.name}
                                className="w-4 h-4 rounded-full"
                              />
                            ) : (
                              <User className="w-3 h-3" />
                            )}
                            <span className="truncate max-w-[80px]">{blog.blog_authors.name}</span>
                          </span>
                        )}
                        
                        {/* Date */}
                        {blog.published_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(blog.published_at)}
                          </span>
                        )}

                        {/* Reading time */}
                        {blog.reading_time_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {blog.reading_time_minutes} dəq
                          </span>
                        )}

                        {/* Views */}
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {blog.views || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              {/* Load More */}
              {hasMore && (
                <div className="p-4 text-center">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="w-full"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        Yüklənir...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <ChevronDown className="w-4 h-4" />
                        Daha çox yüklə
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
