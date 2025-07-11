import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  Building2, 
  Tag, 
  TrendingUp, 
  Eye,
  Plus,
  Settings
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/settings')}
                className="hidden sm:flex"
              >
                <Settings className="h-4 w-4 mr-2" />
                Tənzimləmələr
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Çıxış
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
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

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
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

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
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

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
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
        </div>
      </div>
    </div>
  );
}