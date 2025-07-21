import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { 
  Users, 
  Briefcase, 
  Building2, 
  Tag, 
  TrendingUp, 
  Eye,
  Plus,
  Settings,
  Globe
} from 'lucide-react';

interface DashboardStats {
  totalJobs: number;
  totalCompanies: number;
  totalCategories: number;
  totalViews: number;
  recentJobs: number;
  activeJobs: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    totalCompanies: 0,
    totalCategories: 0,
    totalViews: 0,
    recentJobs: 0,
    activeJobs: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      navigate('/admin/login');
    }
  };

  const fetchStats = async () => {
    try {
      const [jobsResponse, companiesResponse, categoriesResponse] = await Promise.all([
        supabase.from('jobs').select('views, created_at, is_active'),
        supabase.from('companies').select('id'),
        supabase.from('categories').select('id'),
      ]);

      const jobs = jobsResponse.data || [];
      const companies = companiesResponse.data || [];
      const categories = categoriesResponse.data || [];

      const totalViews = jobs.reduce((sum, job) => sum + (job.views || 0), 0);
      const recentJobs = jobs.filter(job => {
        const createdDate = new Date(job.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdDate >= weekAgo;
      }).length;

      const activeJobs = jobs.filter(job => job.is_active).length;

      setStats({
        totalJobs: jobs.length,
        totalCompanies: companies.length,
        totalCategories: categories.length,
        totalViews,
        recentJobs,
        activeJobs,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Toplam Vakansiyalar',
      value: stats.totalJobs,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Aktiv Vakansiyalar',
      value: stats.activeJobs,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Şirkətlər',
      value: stats.totalCompanies,
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Kateqoriyalar',
      value: stats.totalCategories,
      icon: Tag,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Toplam Baxış',
      value: stats.totalViews,
      icon: Eye,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Bu həftə əlavə edilən',
      value: stats.recentJobs,
      icon: Plus,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">İdarə Paneli</h1>
          <p className="text-muted-foreground mt-2">Saytın ümumi statistikası və idarəetmə</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="flex items-center p-6">
                <div className={`${stat.bgColor} p-3 rounded-lg mr-4`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Tez Əməliyyatlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02] bg-card/50 backdrop-blur-sm border-border/50" 
                  onClick={() => navigate('/admin/jobs')}>
              <CardHeader className="text-center">
                <Briefcase className="h-8 w-8 mx-auto text-primary mb-2" />
                <CardTitle className="text-lg">Vakansiyaları İdarə Et</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-sm">
                  Vakansiyalar əlavə et, redaktə et və idarə et
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02] bg-card/50 backdrop-blur-sm border-border/50" 
                  onClick={() => navigate('/admin/companies')}>
              <CardHeader className="text-center">
                <Building2 className="h-8 w-8 mx-auto text-primary mb-2" />
                <CardTitle className="text-lg">Şirkətləri İdarə Et</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-sm">
                  Şirkətlər əlavə et, redaktə et və idarə et
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02] bg-card/50 backdrop-blur-sm border-border/50" 
                  onClick={() => navigate('/admin/categories')}>
              <CardHeader className="text-center">
                <Tag className="h-8 w-8 mx-auto text-primary mb-2" />
                <CardTitle className="text-lg">Kateqoriyaları İdarə Et</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-sm">
                  Kateqoriyalar əlavə et, redaktə et və idarə et
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02] bg-card/50 backdrop-blur-sm border-border/50" 
                  onClick={() => navigate('/admin/settings')}>
              <CardHeader className="text-center">
                <Settings className="h-8 w-8 mx-auto text-primary mb-2" />
                <CardTitle className="text-lg">Sayt Tənzimləmələri</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-sm">
                  Sayt tənzimləmələri və SEO
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02] bg-card/50 backdrop-blur-sm border-border/50" 
                  onClick={() => navigate('/admin/sitemap')}>
              <CardHeader className="text-center">
                <Globe className="h-8 w-8 mx-auto text-primary mb-2" />
                <CardTitle className="text-lg">Sitemap Generator</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-sm">
                  SEO sitemap generasiya və idarəetmə
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}