
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockCategories } from '@/data/mockJobs';
import { Badge } from '@/components/ui/badge';
import { Tag, TrendingUp } from 'lucide-react';

const Categories = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName: string) => {
    // Navigate to jobs page with category filter
    navigate(`/kateqoriyalar/${categoryName.toLowerCase().replace(/\s+/g, '-')}`);
  };

  return (
    <div className="h-full flex bg-gradient-to-br from-background via-primary/3 to-background overflow-hidden">
      <div className="flex-1 flex min-w-0 pb-16 xl:pb-0">
        {/* Categories List */}
        <div className="w-full lg:w-[400px] xl:w-[450px] border-r border-border animate-fade-in">
          <div className="flex-1 flex flex-col h-full bg-background">
            {/* Mobile/Tablet Sticky Header with Logo */}
            <div className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
              <div className="flex justify-center items-center py-3 px-4">
                <img src="/lovable-uploads/e888818f-70b8-405b-a5e8-f62f8e842525.png" alt="Logo" className="h-12 w-auto object-contain" />
              </div>
            </div>

            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/8 to-accent/5 border-b border-border/30 max-h-[73px]">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-60"></div>
              
              <div className="relative px-4 py-2 h-[73px] flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                    <Tag className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-lg font-bold text-foreground">Kateqoriyalar</h1>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    {mockCategories.length}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Categories List */}
            <div className="flex-1 overflow-y-auto p-2 bg-gradient-to-b from-transparent to-primary/5 w-full max-w-[100%] mx-auto">
              <div className="flex flex-col gap-2 justify-center items-center w-full max-w-full px-2">
                {mockCategories.map((category, index) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category.name)}
                    className="group cursor-pointer p-3 rounded-lg border transition-all duration-200 ease-smooth
                      hover:shadow-card-hover hover:-translate-y-0.5 animate-fade-in
                      w-full max-w-full min-w-0 h-[60px] flex flex-row items-center justify-between backdrop-blur-sm
                      bg-job-card border-border/50 hover:border-primary/40 hover:shadow-card-hover"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
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
                            {category.count} vakansiya
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Count and Trend */}
                    <div className="flex items-center gap-2 flex-shrink-0 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-primary" />
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                          {category.count}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Category Details */}
        <div className="hidden lg:block flex-1 bg-gradient-to-br from-job-details to-primary/3 animate-slide-in-right">
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Kateqoriya Seçin</h2>
              <p className="text-muted-foreground text-sm max-w-sm">
                Sol tərəfdən bir kateqoriya seçin və həmin sahədəki vakansiyaları görün
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
