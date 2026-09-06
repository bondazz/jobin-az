"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format } from "date-fns";
import { az } from "date-fns/locale";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  FileText,
  User,
  Tag,
  ExternalLink,
  Link as LinkIcon,
  Clock,
  Calendar,
} from "lucide-react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import ImageUpload from "@/components/ImageUpload";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  author_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  h1_title: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  schema_type: string | null;
  is_published: boolean | null;
  published_at: string | null;
  reading_time_minutes: number | null;
  views: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  blog_authors: {
    id: string;
    name: string;
  } | null;
}

interface Author {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  twitter: string | null;
  linkedin: string | null;
  is_active: boolean | null;
}

interface BlogLink {
  id: string;
  blog_id: string;
  url: string;
  anchor_text: string | null;
  link_type: "internal" | "external";
  rel_attributes: string[];
  is_dofollow: boolean;
}

const emptyBlog = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featured_image: "",
  author_id: "",
  seo_title: "",
  seo_description: "",
  seo_keywords: [] as string[],
  h1_title: "",
  canonical_url: "",
  og_title: "",
  og_description: "",
  og_image: "",
  twitter_title: "",
  twitter_description: "",
  schema_type: "Article",
  is_published: false,
  is_active: true,
};

const emptyAuthor = {
  name: "",
  slug: "",
  bio: "",
  avatar_url: "",
  website: "",
  twitter: "",
  linkedin: "",
  is_active: true,
};

export default function AdminBlogsClient() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Blog Dialog
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [blogForm, setBlogForm] = useState(emptyBlog);
  const [keywordsInput, setKeywordsInput] = useState("");

  // Author Dialog
  const [authorDialogOpen, setAuthorDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [authorForm, setAuthorForm] = useState(emptyAuthor);

  // Delete Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingBlog, setDeletingBlog] = useState<Blog | null>(null);
  const [deletingAuthor, setDeletingAuthor] = useState<Author | null>(null);

  // Current tab
  const [activeTab, setActiveTab] = useState("blogs");

  useEffect(() => {
    fetchBlogs();
    fetchAuthors();
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select(`
          *,
          blog_authors (
            id,
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Bloqlar yüklənərkən xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthors = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_authors")
        .select("*")
        .order("name");

      if (error) throw error;
      setAuthors(data || []);
    } catch (error) {
      console.error("Error fetching authors:", error);
    }
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ə/g, "e")
      .replace(/ü/g, "u")
      .replace(/ö/g, "o")
      .replace(/ğ/g, "g")
      .replace(/ı/g, "i")
      .replace(/ç/g, "c")
      .replace(/ş/g, "s")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Blog CRUD
  const openBlogDialog = (blog?: Blog) => {
    if (blog) {
      setEditingBlog(blog);
      setBlogForm({
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt || "",
        content: blog.content,
        featured_image: blog.featured_image || "",
        author_id: blog.author_id || "",
        seo_title: blog.seo_title || "",
        seo_description: blog.seo_description || "",
        seo_keywords: blog.seo_keywords || [],
        h1_title: blog.h1_title || "",
        canonical_url: blog.canonical_url || "",
        og_title: blog.og_title || "",
        og_description: blog.og_description || "",
        og_image: blog.og_image || "",
        twitter_title: blog.twitter_title || "",
        twitter_description: blog.twitter_description || "",
        schema_type: blog.schema_type || "Article",
        is_published: blog.is_published ?? false,
        is_active: blog.is_active ?? true,
      });
      setKeywordsInput(blog.seo_keywords?.join(", ") || "");
    } else {
      setEditingBlog(null);
      setBlogForm(emptyBlog);
      setKeywordsInput("");
    }
    setBlogDialogOpen(true);
  };

  const saveBlog = async () => {
    try {
      const keywords = keywordsInput
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const blogData = {
        ...blogForm,
        seo_keywords: keywords,
        author_id: blogForm.author_id || null,
        published_at: blogForm.is_published && !editingBlog?.published_at
          ? new Date().toISOString()
          : editingBlog?.published_at || null,
      };

      if (editingBlog) {
        const { error } = await supabase
          .from("blogs")
          .update(blogData)
          .eq("id", editingBlog.id);

        if (error) throw error;
        toast.success("Bloq yeniləndi");
      } else {
        const { error } = await supabase
          .from("blogs")
          .insert([blogData]);

        if (error) throw error;
        toast.success("Bloq əlavə edildi");
      }

      setBlogDialogOpen(false);
      fetchBlogs();
    } catch (error: any) {
      console.error("Error saving blog:", error);
      toast.error(error.message || "Xəta baş verdi");
    }
  };

  const deleteBlog = async () => {
    if (!deletingBlog) return;

    try {
      const { error } = await supabase
        .from("blogs")
        .delete()
        .eq("id", deletingBlog.id);

      if (error) throw error;
      toast.success("Bloq silindi");
      setDeleteDialogOpen(false);
      setDeletingBlog(null);
      fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Silinərkən xəta baş verdi");
    }
  };

  // Author CRUD
  const openAuthorDialog = (author?: Author) => {
    if (author) {
      setEditingAuthor(author);
      setAuthorForm({
        name: author.name,
        slug: author.slug,
        bio: author.bio || "",
        avatar_url: author.avatar_url || "",
        website: author.website || "",
        twitter: author.twitter || "",
        linkedin: author.linkedin || "",
        is_active: author.is_active ?? true,
      });
    } else {
      setEditingAuthor(null);
      setAuthorForm(emptyAuthor);
    }
    setAuthorDialogOpen(true);
  };

  const saveAuthor = async () => {
    try {
      if (editingAuthor) {
        const { error } = await supabase
          .from("blog_authors")
          .update(authorForm)
          .eq("id", editingAuthor.id);

        if (error) throw error;
        toast.success("Müəllif yeniləndi");
      } else {
        const { error } = await supabase
          .from("blog_authors")
          .insert([authorForm]);

        if (error) throw error;
        toast.success("Müəllif əlavə edildi");
      }

      setAuthorDialogOpen(false);
      fetchAuthors();
    } catch (error: any) {
      console.error("Error saving author:", error);
      toast.error(error.message || "Xəta baş verdi");
    }
  };

  const deleteAuthor = async () => {
    if (!deletingAuthor) return;

    try {
      const { error } = await supabase
        .from("blog_authors")
        .delete()
        .eq("id", deletingAuthor.id);

      if (error) throw error;
      toast.success("Müəllif silindi");
      setDeleteDialogOpen(false);
      setDeletingAuthor(null);
      fetchAuthors();
    } catch (error) {
      console.error("Error deleting author:", error);
      toast.error("Silinərkən xəta baş verdi");
    }
  };

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bloq İdarəetməsi</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="blogs" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Bloqlar
          </TabsTrigger>
          <TabsTrigger value="authors" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Müəlliflər
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blogs" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Bloq axtar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => openBlogDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Bloq
            </Button>
          </div>

          <Card>
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Başlıq</TableHead>
                    <TableHead>Müəllif</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Baxış</TableHead>
                    <TableHead>Tarix</TableHead>
                    <TableHead className="text-right">Əməliyyatlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBlogs.map((blog) => (
                    <TableRow key={blog.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium line-clamp-1">{blog.title}</p>
                          <p className="text-xs text-muted-foreground">/{blog.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {blog.blog_authors?.name || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {blog.is_published ? (
                            <Badge variant="default">Dərc edilib</Badge>
                          ) : (
                            <Badge variant="secondary">Qaralama</Badge>
                          )}
                          {!blog.is_active && (
                            <Badge variant="destructive">Deaktiv</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1 text-sm">
                          <Eye className="w-3 h-3" />
                          {blog.views || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(blog.created_at), "d MMM yyyy", { locale: az })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(`/blog/${blog.slug}`, "_blank")}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openBlogDialog(blog)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeletingBlog(blog);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="authors" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openAuthorDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Müəllif
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {authors.map((author) => (
              <Card key={author.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {author.avatar_url ? (
                      <img
                        src={author.avatar_url}
                        alt={author.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{author.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        /{author.slug}
                      </p>
                      {author.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {author.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openAuthorDialog(author)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDeletingAuthor(author);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Blog Dialog */}
      <Dialog open={blogDialogOpen} onOpenChange={setBlogDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBlog ? "Bloqu Redaktə Et" : "Yeni Bloq"}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="content" className="mt-4">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="content">Məzmun</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="social">Sosial</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Başlıq *</Label>
                  <Input
                    value={blogForm.title}
                    onChange={(e) => {
                      setBlogForm({
                        ...blogForm,
                        title: e.target.value,
                        slug: blogForm.slug || generateSlug(e.target.value),
                      });
                    }}
                    placeholder="Bloq başlığı"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input
                    value={blogForm.slug}
                    onChange={(e) =>
                      setBlogForm({ ...blogForm, slug: e.target.value })
                    }
                    placeholder="blog-slug"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Müəllif</Label>
                  <Select
                    value={blogForm.author_id}
                    onValueChange={(value) =>
                      setBlogForm({ ...blogForm, author_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Müəllif seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {authors.map((author) => (
                        <SelectItem key={author.id} value={author.id}>
                          {author.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Schema Tipi</Label>
                  <Select
                    value={blogForm.schema_type}
                    onValueChange={(value) =>
                      setBlogForm({ ...blogForm, schema_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Article">Article</SelectItem>
                      <SelectItem value="BlogPosting">BlogPosting</SelectItem>
                      <SelectItem value="NewsArticle">NewsArticle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Qısa Təsvir</Label>
                <Textarea
                  value={blogForm.excerpt}
                  onChange={(e) =>
                    setBlogForm({ ...blogForm, excerpt: e.target.value })
                  }
                  placeholder="Bloq haqqında qısa məlumat..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Məzmun *</Label>
                <RichTextEditor
                  value={blogForm.content}
                  onChange={(value: string) =>
                    setBlogForm({ ...blogForm, content: value })
                  }
                />
              </div>

              <ImageUpload
                value={blogForm.featured_image}
                onChange={(url) => setBlogForm({ ...blogForm, featured_image: url })}
                label="Əsas Şəkil"
                placeholder="https://example.com/image.jpg"
                imageType="companies"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={blogForm.is_published}
                      onCheckedChange={(checked) =>
                        setBlogForm({ ...blogForm, is_published: checked })
                      }
                    />
                    <Label>Dərc et</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={blogForm.is_active}
                      onCheckedChange={(checked) =>
                        setBlogForm({ ...blogForm, is_active: checked })
                      }
                    />
                    <Label>Aktiv</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>SEO Başlıq</Label>
                <Input
                  value={blogForm.seo_title}
                  onChange={(e) =>
                    setBlogForm({ ...blogForm, seo_title: e.target.value })
                  }
                  placeholder="SEO başlığı (60 simvol)"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {blogForm.seo_title.length}/60 simvol
                </p>
              </div>

              <div className="space-y-2">
                <Label>SEO Təsvir</Label>
                <Textarea
                  value={blogForm.seo_description}
                  onChange={(e) =>
                    setBlogForm({ ...blogForm, seo_description: e.target.value })
                  }
                  placeholder="SEO təsviri (160 simvol)"
                  maxLength={160}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {blogForm.seo_description.length}/160 simvol
                </p>
              </div>

              <div className="space-y-2">
                <Label>SEO Açar Sözlər</Label>
                <Input
                  value={keywordsInput}
                  onChange={(e) => setKeywordsInput(e.target.value)}
                  placeholder="açar, sözlər, vergüllə, ayrılmış"
                />
              </div>

              <div className="space-y-2">
                <Label>H1 Başlıq</Label>
                <Input
                  value={blogForm.h1_title}
                  onChange={(e) =>
                    setBlogForm({ ...blogForm, h1_title: e.target.value })
                  }
                  placeholder="Səhifədəki H1 başlığı"
                />
              </div>

              <div className="space-y-2">
                <Label>Canonical URL</Label>
                <Input
                  value={blogForm.canonical_url}
                  onChange={(e) =>
                    setBlogForm({ ...blogForm, canonical_url: e.target.value })
                  }
                  placeholder="https://jooble.az/blog/..."
                />
              </div>
            </TabsContent>

            <TabsContent value="social" className="space-y-4 mt-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Open Graph</h3>
                <div className="space-y-2">
                  <Label>OG Başlıq</Label>
                  <Input
                    value={blogForm.og_title}
                    onChange={(e) =>
                      setBlogForm({ ...blogForm, og_title: e.target.value })
                    }
                    placeholder="Sosial media başlığı"
                  />
                </div>
                <div className="space-y-2">
                  <Label>OG Təsvir</Label>
                  <Textarea
                    value={blogForm.og_description}
                    onChange={(e) =>
                      setBlogForm({ ...blogForm, og_description: e.target.value })
                    }
                    placeholder="Sosial media təsviri"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>OG Şəkil URL</Label>
                  <Input
                    value={blogForm.og_image}
                    onChange={(e) =>
                      setBlogForm({ ...blogForm, og_image: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Twitter</h3>
                <div className="space-y-2">
                  <Label>Twitter Başlıq</Label>
                  <Input
                    value={blogForm.twitter_title}
                    onChange={(e) =>
                      setBlogForm({ ...blogForm, twitter_title: e.target.value })
                    }
                    placeholder="Twitter başlığı"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Twitter Təsvir</Label>
                  <Textarea
                    value={blogForm.twitter_description}
                    onChange={(e) =>
                      setBlogForm({ ...blogForm, twitter_description: e.target.value })
                    }
                    placeholder="Twitter təsviri"
                    rows={2}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBlogDialogOpen(false)}>
              Ləğv et
            </Button>
            <Button onClick={saveBlog}>
              {editingBlog ? "Yenilə" : "Əlavə et"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Author Dialog */}
      <Dialog open={authorDialogOpen} onOpenChange={setAuthorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAuthor ? "Müəllifi Redaktə Et" : "Yeni Müəllif"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ad *</Label>
                <Input
                  value={authorForm.name}
                  onChange={(e) => {
                    setAuthorForm({
                      ...authorForm,
                      name: e.target.value,
                      slug: authorForm.slug || generateSlug(e.target.value),
                    });
                  }}
                  placeholder="Müəllif adı"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  value={authorForm.slug}
                  onChange={(e) =>
                    setAuthorForm({ ...authorForm, slug: e.target.value })
                  }
                  placeholder="muellif-slug"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={authorForm.bio}
                onChange={(e) =>
                  setAuthorForm({ ...authorForm, bio: e.target.value })
                }
                placeholder="Müəllif haqqında qısa məlumat"
                rows={3}
              />
            </div>

            <ImageUpload
              value={authorForm.avatar_url}
              onChange={(url) => setAuthorForm({ ...authorForm, avatar_url: url })}
              label="Avatar"
              placeholder="https://example.com/avatar.jpg"
              imageType="companies"
            />

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  value={authorForm.website}
                  onChange={(e) =>
                    setAuthorForm({ ...authorForm, website: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Twitter</Label>
                <Input
                  value={authorForm.twitter}
                  onChange={(e) =>
                    setAuthorForm({ ...authorForm, twitter: e.target.value })
                  }
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                <Input
                  value={authorForm.linkedin}
                  onChange={(e) =>
                    setAuthorForm({ ...authorForm, linkedin: e.target.value })
                  }
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={authorForm.is_active}
                onCheckedChange={(checked) =>
                  setAuthorForm({ ...authorForm, is_active: checked })
                }
              />
              <Label>Aktiv</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAuthorDialogOpen(false)}>
              Ləğv et
            </Button>
            <Button onClick={saveAuthor}>
              {editingAuthor ? "Yenilə" : "Əlavə et"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Silmək istədiyinizə əminsiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu əməliyyat geri qaytarıla bilməz.
              {deletingBlog && ` "${deletingBlog.title}" bloqu silinəcək.`}
              {deletingAuthor && ` "${deletingAuthor.name}" müəllifi silinəcək.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ləğv et</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingBlog) deleteBlog();
                if (deletingAuthor) deleteAuthor();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
