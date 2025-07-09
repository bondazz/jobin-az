
import { Job } from '@/types/job';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Clock, 
  Building, 
  Star,
  Share2,
  Bookmark,
  Eye,
  DollarSign,
  Globe,
  Mail,
  Phone
} from 'lucide-react';
import VerifyBadge from '@/components/ui/verify-badge';

interface JobDetailsProps {
  job: Job | null;
}

const JobDetails = ({ job }: JobDetailsProps) => {
  if (!job) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-job-details to-primary/3">
        <div className="text-center p-8 animate-fade-in">
          {/* 500x500px Banner Advertisement */}
          <div className="w-[500px] h-[500px] bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-dashed border-primary/30 rounded-xl flex items-center justify-center mx-auto mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Reklam Yeri</h3>
              <p className="text-muted-foreground text-sm">500x500px Banner Reklamı</p>
              <p className="text-muted-foreground text-xs mt-2">İlana toxunduqda bu yerə iş təfərrüatları gələcək</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">İş Təfərrüatları</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Hərhansı bir iş elanına toxunaraq təfərrüatlı məlumat əldə edə bilərsiniz
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isVerifiedCompany = (company: string) => {
    const verifiedCompanies = ['Google', 'Apple', 'Microsoft', 'Meta', 'Amazon', 'Netflix', 'Tesla', 'Spotify'];
    return verifiedCompanies.includes(company);
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-job-details to-primary/3">
      {/* Hero Section with Company Logo */}
      <div className="relative h-48 bg-gradient-to-r from-primary via-primary/80 to-accent overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] bg-repeat"></div>
        
        {/* Company Logo in Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl flex items-center justify-center">
            <span className="text-3xl font-bold text-primary">
              {job.company.charAt(0)}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Job Title and Company */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">{job.company}</h1>
            {isVerifiedCompany(job.company) && <VerifyBadge size={20} />}
          </div>
          <h2 className="text-xl font-semibold text-muted-foreground">{job.title}</h2>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-6">
            Müraciət Et
          </Button>
          <Button variant="outline" size="lg" className="border-primary/30 text-primary hover:bg-primary hover:text-white">
            <Bookmark className="w-4 h-4 mr-2" />
            Saxla
          </Button>
          <Button variant="outline" size="lg" className="border-primary/30 text-primary hover:bg-primary hover:text-white">
            <Share2 className="w-4 h-4 mr-2" />
            Paylaş
          </Button>
        </div>

        <Separator />

        {/* Job Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Məkan</p>
                <p className="text-sm text-muted-foreground">{job.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Yayımlanma Tarixi</p>
                <p className="text-sm text-muted-foreground">{job.postedAt}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Eye className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Baxış Sayı</p>
                <p className="text-sm text-muted-foreground">{job.views}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Building className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Şirkət</p>
                <p className="text-sm text-muted-foreground">{job.company}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <DollarSign className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Maaş</p>
                <p className="text-sm text-muted-foreground">{job.salary || 'Müzakirə ediləcək'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Clock className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">İş Növü</p>
                <p className="text-sm text-muted-foreground">Tam məşğul</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Job Description */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">İş Təsviri</h3>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p className="leading-relaxed">
              Bu pozisiya üçün axtarılan namizəd yüksək səviyyədə professional bacarıqlara malik olmalı, 
              komanda işində səriştəli və innovativ həllərlə gəlmək qabiliyyətinə sahib olmalıdır.
            </p>
            <p className="leading-relaxed mt-4">
              Məsuliyyətlər arasında layihələrin idarə edilməsi, müştəri münasibətlərinin qurulması 
              və dəstəklənməsi, həmçinin strateji planlaşdırma işləri daxildir.
            </p>
          </div>
        </div>

        <Separator />

        {/* Requirements */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">Tələblər</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <span>Sahədə ən azı 3 il iş təcrübəsi</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <span>Yüksək səviyyədə ingilis dili bilikləri</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <span>Komanda işində bacarıqlı olmaq</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <span>Analitik düşüncə qabiliyyəti</span>
            </li>
          </ul>
        </div>

        <Separator />

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">Əlaqə Məlumatları</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Mail className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">E-mail</p>
                <p className="text-sm text-muted-foreground">hr@{job.company.toLowerCase()}.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Phone className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Telefon</p>
                <p className="text-sm text-muted-foreground">+994 XX XXX XX XX</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="sticky bottom-0 bg-job-details/90 backdrop-blur-md p-4 -mx-6 border-t border-border">
          <Button size="lg" className="w-full bg-gradient-primary hover:opacity-90 text-white font-semibold">
            Bu İşə Müraciət Et
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
