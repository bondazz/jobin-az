import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tag, TrendingUp, Search } from 'lucide-react';
import JobListings from '@/components/JobListings';
import JobDetails from '@/components/JobDetails';
import { Job } from '@/types/job';
import { generateCategorySEO, generateJobSEO, generatePageSEO, updatePageMeta } from '@/utils/seo';
import BottomNavigation from '@/components/BottomNavigation';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Category = Tables<'categories'>;
const Categories = () => {
  const navigate = useNavigate();
  const {
    category: categorySlug,
    job: jobSlug
  } = useParams();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from database
  useEffect(() => {
    fetchCategories();
  }, []);

  // SEO setup
  useEffect(() => {
    const seoData = generatePageSEO('categories');
    updatePageMeta(seoData);
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Find selected category from URL slug
  const selectedCategory = categorySlug && categories.length > 0 
    ? categories.find(cat => cat.slug === categorySlug)?.name || '' 
    : '';

  // SEO for selected category
  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      const category = categories.find(cat => cat.name === selectedCategory);
      if (category) {
        const seoData = generateCategorySEO(category.name, 0); // Job count will be fetched from backend
        updatePageMeta(seoData);
      }
    }
  }, [selectedCategory, categories]);
  const handleCategoryClick = (category: Category) => {
    navigate(`/vacancies?category=${category.slug}`);
  };
  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    const jobSlug = job.title.toLowerCase().replace(/\s+/g, '-');
    navigate(`/categories/${categorySlug}/vacancy/${jobSlug}`);
  };

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  return <div className="h-full flex bg-gradient-to-br from-background via-primary/3 to-background overflow-hidden">
      <div className="flex-1 flex min-w-0 pb-16 xl:pb-0">
        {/* Categories List */}
        <div className="w-full lg:w-[400px] xl:w-[450px] border-r border-border animate-fade-in">
          <div className="flex-1 flex flex-col h-full bg-background">
            {/* Mobile/Tablet Sticky Header with Logo */}
            <div className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
              <div className="flex justify-center items-center py-3 px-4">
                <Link to="/">
                  <img src="/lovable-uploads/e888818f-70b8-405b-a5e8-f62f8e842525.png" alt="Logo" className="h-12 w-auto object-contain" />
                </Link>
              </div>
            </div>

            {/* Header with Search */}
            <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/8 to-accent/5 border-b border-border/30">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-60"></div>
              
              <div className="relative space-y-3 my-0 px-[16px] py-[4px]">
                <div className="flex items-center gap-2">
                  
                  
                  
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Kateqoriyalar axtarın..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
              </div>
            </div>

            {/* Categories List */}
            <div className="flex-1 overflow-y-auto p-2 bg-gradient-to-b from-transparent to-primary/5 w-full max-w-[100%] mx-auto">
              <div className="flex flex-col gap-2 justify-center items-center w-full max-w-full px-2">
                {filteredCategories.map((category, index) => (
                  <div key={category.id} onClick={() => handleCategoryClick(category)} className={`group cursor-pointer p-3 rounded-lg border transition-all duration-200 ease-smooth
                      hover:shadow-card-hover hover:-translate-y-0.5 animate-fade-in
                      w-full max-w-full min-w-0 h-[60px] flex flex-row items-center justify-between backdrop-blur-sm
                      ${selectedCategory === category.name ? 'border-primary bg-gradient-to-r from-primary/20 to-primary/5 shadow-elegant ring-1 ring-primary/50' : 'bg-job-card border-border/50 hover:border-primary/40 hover:shadow-card-hover'}`} style={{
                    animationDelay: `${index * 50}ms`
                  }}>
                    {/* Left Section - Category Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-sm bg-gradient-primary">
                          <Tag className="w-4 h-4" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                          {category.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0">
                          <p className="text-muted-foreground text-xs truncate">
                            {category.description || 'Kateqoriya təsviri'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Category Icon */}
                    <div className="flex items-center gap-2 flex-shrink-0 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-primary" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Filtered Jobs or Job Details */}
        <div className="hidden lg:block flex-1 bg-gradient-to-br from-job-details to-primary/3 animate-slide-in-right">
          {selectedJob ? <JobDetails jobId={selectedJob.id} /> : selectedCategory ? <JobListings selectedJob={null} onJobSelect={handleJobSelect} selectedCategory={selectedCategory} showHeader={false} /> : <div className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Kateqoriya Seçin</h2>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Sol tərəfdən bir kateqoriya seçin və həmin sahədəki vakansiyaları görün
                </p>
              </div>
            </div>}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        selectedCategory={selectedCategory}
        onCategorySelect={() => {}}
      />
    </div>;
};
export default Categories;