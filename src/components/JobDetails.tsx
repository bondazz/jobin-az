import React, { useEffect, useState } from 'react';
import { useDynamicSEO } from '@/hooks/useSEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Calendar, Users, Clock, Building, Star, Share2, Bookmark, Eye, DollarSign, Globe, Mail, Phone, Printer } from 'lucide-react';
import VerifyBadge from '@/components/ui/verify-badge';
import AdBanner from './AdBanner';
import { useReferralCode } from '@/hooks/useReferralCode';
interface JobDetailsProps {
  jobId: string | null;
  isMobile?: boolean;
}
const JobDetails = ({
  jobId,
  isMobile = false
}: JobDetailsProps) => {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [applicationEmail, setApplicationEmail] = useState<string | null>(null);
  const [revealingEmail, setRevealingEmail] = useState(false);
  const { toast } = useToast();
  const { getUrlWithReferral } = useReferralCode();
  
  // Apply SEO for job page
  useDynamicSEO('job', job);
  useEffect(() => {
    if (jobId) {
      fetchJobDetails(jobId);
      // Check if job is saved
      const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      setIsSaved(savedJobs.includes(jobId));
      // Increment view count
      incrementViewCount(jobId);
    }
  }, [jobId]);
  const incrementViewCount = async (id: string) => {
    try {
      await supabase.rpc('increment_job_views', {
        job_id: id
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };
  const fetchJobDetails = async (id: string) => {
    setLoading(true);
    try {
      // First try to find by ID, then by slug
      let {
        data,
        error
      } = await supabase.from('jobs').select(`
          id, application_type, salary, company_id, title, is_active, updated_at, type, location, seo_keywords, seo_description, views, category_id, seo_title, created_at, slug, application_url, tags, description,
          companies:company_id(name, logo, website, email, phone, is_verified),
          categories:category_id(name)
        `).eq('id', id).single();

      // If not found by ID, try by slug
      if (error && error.code === 'PGRST116') {
        const slugResult = await supabase.from('jobs').select(`
            id, application_type, salary, company_id, title, is_active, updated_at, type, location, seo_keywords, seo_description, views, category_id, seo_title, created_at, slug, application_url, tags, description,
            companies:company_id(name, logo, website, email, phone, is_verified),
            categories:category_id(name)
          `).eq('slug', id).single();
        data = slugResult.data;
        error = slugResult.error;
      }
      if (error) throw error;
      setJob(data);

      // Check if job is saved
      const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      setIsSaved(savedJobs.includes(data.id));
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleSaveJob = () => {
    if (!job) return;
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    let updatedSavedJobs;
    if (isSaved) {
      // Remove from saved
      updatedSavedJobs = savedJobs.filter((id: string) => id !== job.id);
    } else {
      // Add to saved
      updatedSavedJobs = [...savedJobs, job.id];
    }
    localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
    setIsSaved(!isSaved);

    // Dispatch storage event to update sidebar count
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'savedJobs',
      newValue: JSON.stringify(updatedSavedJobs)
    }));
  };
  const handlePrint = () => {
    window.print();
  };
  const handleShare = async () => {
    const currentUrl = window.location.href.split('?')[0]; // Remove existing query params
    const shareUrl = getUrlWithReferral(currentUrl);
    const shareData = {
      title: job.title,
      text: `${job.companies?.name} şirkətində ${job.title} iş elanı`,
      url: shareUrl
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({
          title: 'Paylaşıldı',
          description: 'İş elanı uğurla paylaşıldı'
        });
      } catch (error) {
        // User cancelled sharing
        if (error.name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };
  const copyToClipboard = () => {
    const currentUrl = window.location.href.split('?')[0]; // Remove existing query params
    const shareUrl = getUrlWithReferral(currentUrl);
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Link kopyalandı',
      description: 'İş elanının linki panoa kopyalandı'
    });
  };

  const handleRevealEmail = async () => {
    if (!job?.id) return;
    try {
      setRevealingEmail(true);
      const { data, error } = await supabase.rpc('get_job_application_email', { job_uuid: job.id });
      setRevealingEmail(false);
      if (error || !data) {
        toast({ title: 'E-mail tapılmadı', description: 'Bu elan üçün e-mail mövcud deyil', variant: 'destructive' as any });
        return;
      }
      setApplicationEmail(data);
      await navigator.clipboard.writeText(data);
      toast({ title: 'E-mail kopyalandı', description: `${data} panoya kopyalandı` });
    } catch (e) {
      setRevealingEmail(false);
      console.error('Error revealing email:', e);
    }
  };
  if (loading) {
    return <div className="h-full flex items-center justify-center bg-gradient-to-br from-job-details to-primary/3">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>;
  }
  if (!job) {
    return <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-job-details to-primary/3">
        <div className="text-center p-8 animate-fade-in">
          {/* Banner Advertisement */}
          <div className="max-w-[500px] mx-auto mb-6">
            <AdBanner position="job_details" />
          </div>
          
          <div className="space-y-3 mb-8">
            <h2 className="text-2xl font-bold text-foreground">İş Təfərrüatları</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Hərhansı bir iş elanına toxunaraq təfərrüatlı məlumat əldə edə bilərsiniz
            </p>
          </div>

          {/* Interactive Job Workflow Illustration */}
          <div className="flex justify-center">
            <svg width="800" height="400" viewBox="20 20 1060 546" fill="none" xmlns="http://www.w3.org/2000/svg" 
                 style={{"--accent":"#FF6A1A", "--brand":"#2B8CFF", "--ink":"#1f2937", "--inkWeak":"#64748b", "--card":"rgba(0,0,0,.06)", "--card2":"rgba(0,0,0,.10)"} as React.CSSProperties} 
                 aria-hidden="true" className="w-full max-w-4xl">
              <defs>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="10" stdDeviation="18" floodOpacity=".12"/>
                </filter>
                <path id="shimmer" x1="0" y1="0" x2="1" y2="0" d="">
                  <stop offset="-0.2" stopColor="rgba(255,255,255,0)"/>
                  <stop offset="0.5" stopColor="rgba(255,255,255,.45)"/>
                  <stop offset="1.2" stopColor="rgba(255,255,255,0)"/>
                  <animate attributeName="x1" values="0;1" dur="1.6s" repeatCount="indefinite"/>
                  <animate attributeName="x2" values="1;2" dur="1.6s" repeatCount="indefinite"/>
                </path>
              </defs>
              <style>{`
                .ink{ fill:var(--ink); } 
                .weak{ fill:var(--inkWeak); }
                .card{ fill:var(--card); } 
                .card2{ fill:var(--card2); }
                .accent{ fill:var(--accent); stroke:var(--accent); }
                .brand{ fill:var(--brand); stroke:var(--brand); }

                #cursor{ animation:curMove 6s cubic-bezier(.22,.9,.2,1) infinite; }
                #ripple{ animation:rip 6s ease-out infinite; transform-origin: 0 0; }
                #panelWrap{ animation:panelIn 6s cubic-bezier(.2,.9,.2,1) infinite; transform-origin: 100% 50%; }
                #cta{ animation:breath 6s ease-in-out infinite; transform-origin: 980px 560px; }
                #tick{ stroke-dasharray:70; stroke-dashoffset:70; animation:tick 6s ease-in-out infinite; }
                #chosen{ animation:glow 6s ease-in-out infinite; }
                #divider{ animation:dividerPulse 6s ease-in-out infinite; }

                @keyframes curMove{
                  0%{   transform: translate(520px,176px); }
                  18%{  transform: translate(520px,260px); }
                  22%{  transform: translate(548px,368px); }
                  100%{ transform: translate(520px,176px); }
                }
                @keyframes rip{
                  0%,20%{ opacity:0; transform: translate(574px,388px) scale(.4); }
                  26%   { opacity:.35; transform: translate(574px,388px) scale(1.2); }
                  32%   { opacity:0;   transform: translate(574px,388px) scale(1.8); }
                  100%  { opacity:0;   transform: translate(574px,388px) scale(.4); }
                }
                @keyframes panelIn{
                  0%,24% { opacity:0; transform: translateX(60px) scale(.98); }
                  36%    { opacity:1; transform: translateX(0)   scale(1.02); }
                  56%    { opacity:1; transform: translateX(0)   scale(1); }
                  100%   { opacity:1; transform: translateX(0)   scale(1); }
                }
                @keyframes breath{ 0%,55%,100%{transform:scale(1)} 72%{transform:scale(1.04)} 86%{transform:scale(1.02)} }
                @keyframes tick{ 0%,62%{stroke-dashoffset:70;opacity:0} 75%{stroke-dashoffset:0;opacity:1} 100%{stroke-dashoffset:0;opacity:1} }
                @keyframes glow{ 0%,20%,100%{filter:none} 26%{filter:drop-shadow(0 10px 22px rgba(255,106,26,.35))} 44%{filter:drop-shadow(0 6px 14px rgba(255,106,26,.22))} 54%{filter:none} }
                @keyframes dividerPulse{ 0%,24%,100%{opacity:.22} 36%{opacity:.5} 56%{opacity:.3} }
                @media (prefers-reduced-motion:reduce){
                  #cursor,#ripple,#panelWrap,#cta,#tick,#chosen,#divider{ animation:none !important; }
                }
              `}</style>
              
              <g transform="translate(32 40)">
                <path x="0" y="0" width="240" height="560" rx="22" className="card2" filter="url(#shadow)" d="M20.167 0H199.833A20.167 20.167 0 0 1 220 20.167V493.167A20.167 20.167 0 0 1 199.833 513.333H20.167A20.167 20.167 0 0 1 0 493.167V20.167A20.167 20.167 0 0 1 20.167 0z"/>
                <g transform="translate(24 28)">
                  <path x="0" y="0" width="192" height="44" rx="12" className="card" d="M11 0H165A11 11 0 0 1 176 11V29.333A11 11 0 0 1 165 40.333H11A11 11 0 0 1 0 29.333V11A11 11 0 0 1 11 0z"/>
                  <text x="16" y="30" fontSize="22" fontWeight="800" fontFamily="Inter,ui-sans-serif,system-ui" className="ink">Jooble.</text>
                  <path cx="10" cy="10" r="6" className="accent" d="M179.667 20.167A5.5 5.5 0 0 1 174.167 25.667A5.5 5.5 0 0 1 168.667 20.167A5.5 5.5 0 0 1 179.667 20.167z"/>
                </g>
                <g transform="translate(24 96)" opacity=".9">
                  <path x="0" y="0" width="192" height="40" rx="12" className="card" d="M11 0H165A11 11 0 0 1 176 11V25.667A11 11 0 0 1 165 36.667H11A11 11 0 0 1 0 25.667V11A11 11 0 0 1 11 0z"/>
                  <path x="0" y="52" width="192" height="40" rx="12" className="card" d="M11 47.667H165A11 11 0 0 1 176 58.667V73.333A11 11 0 0 1 165 84.333H11A11 11 0 0 1 0 73.333V58.667A11 11 0 0 1 11 47.667z"/>
                  <path x="0" y="104" width="192" height="40" rx="12" className="card" d="M11 95.333H165A11 11 0 0 1 176 106.333V121A11 11 0 0 1 165 132H11A11 11 0 0 1 0 121V106.333A11 11 0 0 1 11 95.333z"/>
                  <path x="0" y="156" width="192" height="40" rx="12" className="card" d="M11 143H165A11 11 0 0 1 176 154V168.667A11 11 0 0 1 165 179.667H11A11 11 0 0 1 0 168.667V154A11 11 0 0 1 11 143z"/>
                  <path x="0" y="208" width="192" height="40" rx="12" className="card" d="M11 190.667H165A11 11 0 0 1 176 201.667V216.333A11 11 0 0 1 165 227.333H11A11 11 0 0 1 0 216.333V201.667A11 11 0 0 1 11 190.667z"/>
                </g>
              </g>
              
              <g transform="translate(288 40)">
                <path x="0" y="0" width="480" height="560" rx="22" className="card2" filter="url(#shadow)" d="M20.167 0H419.833A20.167 20.167 0 0 1 440 20.167V493.167A20.167 20.167 0 0 1 419.833 513.333H20.167A20.167 20.167 0 0 1 0 493.167V20.167A20.167 20.167 0 0 1 20.167 0z"/>
                <path x="20" y="20" width="340" height="36" rx="12" className="card" d="M29.333 18.333H319A11 11 0 0 1 330 29.333V40.333A11 11 0 0 1 319 51.333H29.333A11 11 0 0 1 18.333 40.333V29.333A11 11 0 0 1 29.333 18.333z"/>
                <path x="372" y="20" width="88" height="36" rx="12" className="brand" d="M352 18.333H410.667A11 11 0 0 1 421.667 29.333V40.333A11 11 0 0 1 410.667 51.333H352A11 11 0 0 1 341 40.333V29.333A11 11 0 0 1 352 18.333z"/>
                <g transform="translate(20 76)">
                  <path x="0" y="0" width="440" height="88" rx="16" className="card" d="M14.667 0H388.667A14.667 14.667 0 0 1 403.333 14.667V66A14.667 14.667 0 0 1 388.667 80.667H14.667A14.667 14.667 0 0 1 0 66V14.667A14.667 14.667 0 0 1 14.667 0z"/>
                  <path x="0" y="108" width="440" height="88" rx="16" className="card" d="M14.667 99H388.667A14.667 14.667 0 0 1 403.333 113.667V165A14.667 14.667 0 0 1 388.667 179.667H14.667A14.667 14.667 0 0 1 0 165V113.667A14.667 14.667 0 0 1 14.667 99z"/>
                  <path id="chosen" x="0" y="216" width="440" height="88" rx="16" className="card" stroke="var(--accent)" strokeWidth="1.8333333333333333" d="M14.667 198H388.667A14.667 14.667 0 0 1 403.333 212.667V264A14.667 14.667 0 0 1 388.667 278.667H14.667A14.667 14.667 0 0 1 0 264V212.667A14.667 14.667 0 0 1 14.667 198z"/>
                  <path x="0" y="324" width="440" height="88" rx="16" className="card" d="M14.667 297H388.667A14.667 14.667 0 0 1 403.333 311.667V363A14.667 14.667 0 0 1 388.667 377.667H14.667A14.667 14.667 0 0 1 0 363V311.667A14.667 14.667 0 0 1 14.667 297z"/>
                  <path x="0" y="432" width="440" height="88" rx="16" className="card" d="M14.667 396H388.667A14.667 14.667 0 0 1 403.333 410.667V462A14.667 14.667 0 0 1 388.667 476.667H14.667A14.667 14.667 0 0 1 0 462V410.667A14.667 14.667 0 0 1 14.667 396z"/>
                  <g opacity=".22">
                    <path x="18" y="18" width="270" height="12" rx="6" className="ink" d="M22 16.5H258.5A5.5 5.5 0 0 1 264 22V22A5.5 5.5 0 0 1 258.5 27.5H22A5.5 5.5 0 0 1 16.5 22V22A5.5 5.5 0 0 1 22 16.5z"/>
                    <path x="18" y="40" width="210" height="10" rx="5" className="weak" d="M21.083 36.667H204.417A4.583 4.583 0 0 1 209 41.25V41.25A4.583 4.583 0 0 1 204.417 45.833H21.083A4.583 4.583 0 0 1 16.5 41.25V41.25A4.583 4.583 0 0 1 21.083 36.667z"/>
                    <path x="18" y="126" width="250" height="12" rx="6" className="ink" d="M22 115.5H240.167A5.5 5.5 0 0 1 245.667 121V121A5.5 5.5 0 0 1 240.167 126.5H22A5.5 5.5 0 0 1 16.5 121V121A5.5 5.5 0 0 1 22 115.5z"/>
                    <path x="18" y="148" width="190" height="10" rx="5" className="weak" d="M21.083 135.667H186.083A4.583 4.583 0 0 1 190.667 140.25V140.25A4.583 4.583 0 0 1 186.083 144.833H21.083A4.583 4.583 0 0 1 16.5 140.25V140.25A4.583 4.583 0 0 1 21.083 135.667z"/>
                    <path x="18" y="234" width="280" height="12" rx="6" className="ink" d="M22 214.5H267.667A5.5 5.5 0 0 1 273.167 220V220A5.5 5.5 0 0 1 267.667 225.5H22A5.5 5.5 0 0 1 16.5 220V220A5.5 5.5 0 0 1 22 214.5z"/>
                    <path x="18" y="256" width="200" height="10" rx="5" className="weak" d="M21.083 234.667H195.25A4.583 4.583 0 0 1 199.833 239.25V239.25A4.583 4.583 0 0 1 195.25 243.833H21.083A4.583 4.583 0 0 1 16.5 239.25V239.25A4.583 4.583 0 0 1 21.083 234.667z"/>
                  </g>
                </g>
              </g>
              
              <path id="divider" x="784" y="40" width="2" height="560" className="ink" opacity=".22" d="M718.667 36"/>
              
              <g id="panelWrap" transform="translate(808 40)" filter="url(#shadow)">
                <path x="808" y="40" width="360" height="560" rx="22" className="card2" d="M760.833 36.667H1050.5A20.167 20.167 0 0 1 1070.667 56.833V529.833A20.167 20.167 0 0 1 1050.5 550H760.833A20.167 20.167 0 0 1 740.667 529.833V56.833A20.167 20.167 0 0 1 760.833 36.667z"/>
                <path x="808" y="52" width="300" height="10" rx="5" fill="url(#shimmer)" d="M745.25 47.667H1011.083A4.583 4.583 0 0 1 1015.667 52.25V52.25A4.583 4.583 0 0 1 1011.083 56.833H745.25A4.583 4.583 0 0 1 740.667 52.25V52.25A4.583 4.583 0 0 1 745.25 47.667z"/>
                <path x="808" y="72" width="210" height="10" rx="5" fill="url(#shimmer)" d="M745.25 66H928.583A4.583 4.583 0 0 1 933.167 70.583V70.583A4.583 4.583 0 0 1 928.583 75.167H745.25A4.583 4.583 0 0 1 740.667 70.583V70.583A4.583 4.583 0 0 1 745.25 66z"/>
                <path x="808" y="110" width="316" height="10" rx="5" fill="url(#shimmer)" d="M745.25 100.833H1025.75A4.583 4.583 0 0 1 1030.333 105.417V105.417A4.583 4.583 0 0 1 1025.75 110H745.25A4.583 4.583 0 0 1 740.667 105.417V105.417A4.583 4.583 0 0 1 745.25 100.833z"/>
                <path x="808" y="130" width="284" height="10" rx="5" fill="url(#shimmer)" d="M745.25 119.167H996.417A4.583 4.583 0 0 1 1001 123.75V123.75A4.583 4.583 0 0 1 996.417 128.333H745.25A4.583 4.583 0 0 1 740.667 123.75V123.75A4.583 4.583 0 0 1 745.25 119.167z"/>
                <path x="808" y="150" width="260" height="10" rx="5" fill="url(#shimmer)" d="M745.25 137.5H974.417A4.583 4.583 0 0 1 979 142.083V142.083A4.583 4.583 0 0 1 974.417 146.667H745.25A4.583 4.583 0 0 1 740.667 142.083V142.083A4.583 4.583 0 0 1 745.25 137.5z"/>
                <path x="808" y="170" width="320" height="10" rx="5" fill="url(#shimmer)" d="M745.25 155.833H1029.417A4.583 4.583 0 0 1 1034 160.417V160.417A4.583 4.583 0 0 1 1029.417 165H745.25A4.583 4.583 0 0 1 740.667 160.417V160.417A4.583 4.583 0 0 1 745.25 155.833z"/>
                <path x="808" y="190" width="270" height="10" rx="5" fill="url(#shimmer)" d="M745.25 174.167H983.583A4.583 4.583 0 0 1 988.167 178.75V178.75A4.583 4.583 0 0 1 983.583 183.333H745.25A4.583 4.583 0 0 1 740.667 178.75V178.75A4.583 4.583 0 0 1 745.25 174.167z"/>
                <g id="cta">
                  <path x="900" y="400" width="100" height="44" rx="12" className="accent"
                        transform="translate(24 0)"
                        d="M751.667 458.333H872.667A11 11 0 0 1 883.667 469.333V487.667A11 11 0 0 1 872.667 498.667H751.667A11 11 0 0 1 740.667 487.667V469.333A11 11 0 0 1 751.667 458.333z"/>
                  <path x="900" y="800" width="150" height="44" rx="12" className="card"
                        d="M751.667 458.333H867.167A11 11 0 0 1 878.167 469.333V487.667A11 11 0 0 1 867.167 498.667H751.667A11 11 0 0 1 740.667 487.667V469.333A11 11 0 0 1 751.667 458.333z"/>
                </g>
                <g transform="translate(836.167 478.5)">
                  <path id="tick"
                        d="m-7.333 0 7.333 7.333L12.833 -5.5"
                        fill="none" stroke="#fff" strokeWidth="3.6666666666666665"
                        strokeLinecap="round" strokeLinejoin="round"/>
                </g>
              </g>
              
              <g id="cursor">
                <path points="0,0 26,12 12,16 16,30" fill="#fff" stroke="rgba(0,0,0,.28)" strokeWidth="1.0999999999999999" d="M0 0L23.833 11L11 14.667L14.667 27.5Z"/>
              </g>
              
              <g id="ripple" opacity="0">
                <path r="14" className="accent" d="Maaaaaaaaz"/>
                <path r="14" className="accent" opacity=".25" d="Maaaaaaaaz"/>
              </g>
            </svg>
          </div>
        </div>
      </div>;
  }
  // Generate JobPosting structured data
  const generateJobPostingSchema = () => {
    const baseUrl = window.location.origin;
    const jobUrl = `${baseUrl}/vacancies/${job.slug}`;
    
    const schema: any = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": job.title,
      "description": job.description.replace(/<[^>]*>/g, ''), // Remove HTML tags
      "identifier": {
        "@type": "PropertyValue",
        "name": job.companies?.name || "Company",
        "value": job.id
      },
      "datePosted": job.created_at,
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": job.location,
          "addressCountry": "AZ"
        }
      },
      "hiringOrganization": {
        "@type": "Organization",
        "name": job.companies?.name || "Company",
        "sameAs": job.companies?.website || "",
        "logo": job.companies?.logo || ""
      },
      "employmentType": job.type === 'full-time' ? 'FULL_TIME' : 
                       job.type === 'part-time' ? 'PART_TIME' : 
                       job.type === 'contract' ? 'CONTRACTOR' : 
                       job.type === 'internship' ? 'INTERN' : 'FULL_TIME',
      "url": jobUrl,
      "industry": job.categories?.name || "",
      "workHours": job.type === 'full-time' ? "40 hours per week" : undefined,
      "applicantLocationRequirements": {
        "@type": "Country",
        "name": "Azerbaijan"
      }
    };

    // Add salary if available
    if (job.salary && job.salary !== 'Müzakirə') {
      schema.baseSalary = {
        "@type": "MonetaryAmount",
        "currency": "AZN",
        "value": {
          "@type": "QuantitativeValue",
          "value": job.salary,
          "unitText": "MONTH"
        }
      };
    }

    // Add valid through date (30 days from posting)
    if (job.created_at) {
      const validThrough = new Date(job.created_at);
      validThrough.setDate(validThrough.getDate() + 30);
      schema.validThrough = validThrough.toISOString();
    }

    return schema;
  };

  return <>
      {/* JobPosting Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateJobPostingSchema())
        }}
      />
      
      <div id="job-details-printable" className={`h-full overflow-y-auto bg-background ${isMobile ? 'pt-16 pb-20' : 'pb-24'}`}>
        {/* Minimalist Header with Company Logo */}
        <div className={`${isMobile ? 'p-4 pt-6' : 'p-6'} border-b border-border`}>
          <div className="flex items-center gap-4">
            {/* Company Logo */}
            <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0`}>
              {job.companies?.logo ? <img src={job.companies.logo} alt={job.companies?.name || 'Company'} className={`${isMobile ? 'w-10 h-10' : 'w-14 h-14'} rounded-lg object-cover`} width={isMobile ? "40" : "56"} height={isMobile ? "40" : "56"} decoding="async" /> : <span className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-primary`}>
                  {(job.companies?.name || job.title).charAt(0)}
                </span>}
            </div>
            
            {/* Job Title and Company */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-foreground truncate`}>
                  {job.companies?.name || 'Şirkət'} {job.location && `- ${job.location}`}
                </h2>
                {job.companies?.is_verified && <VerifyBadge size={isMobile ? 14 : 16} />}
              </div>
              <h1 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-foreground`}>
                {job.title} {job.categories?.name && `- ${job.categories.name} Vakansiyası`} {job.salary && job.salary !== 'Müzakirə' && `(${job.salary})`}
              </h1>
              <Badge variant="outline" className={`${isMobile ? 'text-xs' : 'text-sm'} mt-1`}>
                {job.categories?.name || 'Kateqoriya'}
              </Badge>
            </div>
          </div>
        </div>

        <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-4`}>
          {/* Job Info and Action Buttons Combined Layout */}
          <div className={`${isMobile ? 'space-y-3' : 'flex items-start gap-4'}`}>
            {/* Job Info Grid - More compact */}
            <div className={`${isMobile ? 'w-full' : 'flex-1'} grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-4 gap-3'}`}>
              <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-2'} rounded-md bg-muted/20`}>
                <MapPin className={`${isMobile ? 'w-3 h-3' : 'w-3 h-3'} text-primary flex-shrink-0`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">{job.location}</p>
                </div>
              </div>

              <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-2'} rounded-md bg-muted/20`}>
                <Clock className={`${isMobile ? 'w-3 h-3' : 'w-3 h-3'} text-primary flex-shrink-0`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">{job.type}</p>
                </div>
              </div>

              <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-2'} rounded-md bg-muted/20`}>
                <DollarSign className={`${isMobile ? 'w-3 h-3' : 'w-3 h-3'} text-primary flex-shrink-0`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">{job.salary || 'Müzakirə'}</p>
                </div>
              </div>

              <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-2'} rounded-md bg-muted/20`}>
                <Eye className={`${isMobile ? 'w-3 h-3' : 'w-3 h-3'} text-primary flex-shrink-0`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground">{(job.views || 0) + 1}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons - More compact */}
            <div className={`${isMobile ? 'flex flex-row gap-2' : 'flex flex-row gap-2 min-w-[200px]'}`}>
              <Button variant="outline" size="sm" className={`${isMobile ? 'flex-1' : 'flex-1'} border-primary/30 hover:bg-primary hover:text-white ${isSaved ? 'bg-primary text-white' : 'text-primary'} text-xs`} onClick={handleSaveJob}>
                <Bookmark className={`w-3 h-3 ${isMobile ? 'mr-1' : 'mr-1'} ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Saxlanıldı' : 'Saxla'}
              </Button>
              <Button variant="outline" size="sm" className={`${isMobile ? 'flex-1' : 'flex-1'} border-primary/30 text-primary hover:bg-primary hover:text-white text-xs`} onClick={handleShare}>
                <Share2 className={`w-3 h-3 ${isMobile ? 'mr-1' : 'mr-1'}`} />
                Paylaş
              </Button>
              <Button variant="outline" size="sm" className={`${isMobile ? 'flex-1' : 'flex-1'} border-primary/30 text-primary hover:bg-primary hover:text-white text-xs`} onClick={handlePrint}>
                <Printer className={`w-3 h-3 ${isMobile ? 'mr-1' : 'mr-1'}`} />
                Çap
              </Button>
            </div>
          </div>

          <Separator />

          {/* Job Description */}
          <div className="space-y-3">
            <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>
              {job.title} İş Təsviri {job.location && `- ${job.location}`}
            </h3>
            <div className={`${isMobile ? 'text-sm' : 'text-base'} text-foreground leading-relaxed rich-text-content`} dangerouslySetInnerHTML={{
            __html: job.description
          }} />
          </div>

          <Separator />

          {/* Contact Information */}
          {(job.companies?.email || job.companies?.phone || job.companies?.website) && <div className="space-y-3">
              <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>
                {job.companies?.name || 'Şirkət'} - Əlaqə Məlumatları
              </h3>
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-3`}>
                {job.companies?.email && <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-3'} rounded-lg bg-muted/30`}>
                    <Mail className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary flex-shrink-0`} />
                    <div className="min-w-0 flex-1">
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>E-mail</p>
                      <a href={`mailto:${job.companies.email}`} className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground hover:text-primary truncate block`}>
                        {job.companies.email}
                      </a>
                    </div>
                  </div>}
                {job.companies?.phone && <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-3'} rounded-lg bg-muted/30`}>
                    <Phone className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary flex-shrink-0`} />
                    <div className="min-w-0 flex-1">
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>Telefon</p>
                      <a href={`tel:${job.companies.phone}`} className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground hover:text-primary`}>
                        {job.companies.phone}
                      </a>
                    </div>
                  </div>}
                {job.companies?.website && <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-3'} rounded-lg bg-muted/30`}>
                    <Globe className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary flex-shrink-0`} />
                    <div className="min-w-0 flex-1">
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>Veb Sayt</p>
                      <a href={job.companies.website} target="_blank" rel="noopener noreferrer" className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground hover:text-primary truncate block`}>
                        {job.companies.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>}
              </div>
            </div>}
        </div>
      </div>

      {/* Sticky Apply Button - Positioned above bottom navigation on mobile/tablet */}
      <div className="fixed bottom-20 right-6 md:bottom-24 md:right-6 lg:bottom-8 lg:right-8 z-50 no-print">
        {job.application_type === 'website' && job.application_url ? (
          <Button 
            size="sm" 
            onClick={() => window.open(job.application_url, '_blank')} 
            className="bg-primary hover:bg-primary/90 text-white font-medium shadow-lg text-sm px-4 py-2 rounded-md"
          >
            Müraciət et
          </Button>
        ) : job.application_type === 'email' ? (
          <Button 
            size="sm" 
            className="bg-primary hover:bg-primary/90 text-white font-medium shadow-lg text-sm px-4 py-2 rounded-md" 
            onClick={handleRevealEmail}
            disabled={revealingEmail}
          >
            {applicationEmail ? 'E-mail kopyalandı' : 'Müraciət et'}
          </Button>
        ) : (
          <Button 
            size="sm" 
            className="bg-muted hover:bg-muted/90 text-muted-foreground font-medium shadow-lg text-sm px-4 py-2 rounded-md" 
            disabled
          >
            Müraciət et
          </Button>
        )}
      </div>

      {/* Interactive Job Workflow Illustration */}
      <div className="flex justify-center py-4 mt-8">
        <svg width="800" height="400" viewBox="20 20 1060 546" fill="none" xmlns="http://www.w3.org/2000/svg" 
             style={{"--accent":"#FF6A1A", "--brand":"#2B8CFF", "--ink":"#1f2937", "--inkWeak":"#64748b", "--card":"rgba(0,0,0,.06)", "--card2":"rgba(0,0,0,.10)"} as React.CSSProperties} 
             aria-hidden="true" className="w-full max-w-4xl">
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="10" stdDeviation="18" floodOpacity=".12"/>
            </filter>
            <path id="shimmer" x1="0" y1="0" x2="1" y2="0" d="">
              <stop offset="-0.2" stopColor="rgba(255,255,255,0)"/>
              <stop offset="0.5" stopColor="rgba(255,255,255,.45)"/>
              <stop offset="1.2" stopColor="rgba(255,255,255,0)"/>
              <animate attributeName="x1" values="0;1" dur="1.6s" repeatCount="indefinite"/>
              <animate attributeName="x2" values="1;2" dur="1.6s" repeatCount="indefinite"/>
            </path>
          </defs>
          <style>{`
            .ink{ fill:var(--ink); } 
            .weak{ fill:var(--inkWeak); }
            .card{ fill:var(--card); } 
            .card2{ fill:var(--card2); }
            .accent{ fill:var(--accent); stroke:var(--accent); }
            .brand{ fill:var(--brand); stroke:var(--brand); }

            #cursor{ animation:curMove 6s cubic-bezier(.22,.9,.2,1) infinite; }
            #ripple{ animation:rip 6s ease-out infinite; transform-origin: 0 0; }
            #panelWrap{ animation:panelIn 6s cubic-bezier(.2,.9,.2,1) infinite; transform-origin: 100% 50%; }
            #cta{ animation:breath 6s ease-in-out infinite; transform-origin: 980px 560px; }
            #tick{ stroke-dasharray:70; stroke-dashoffset:70; animation:tick 6s ease-in-out infinite; }
            #chosen{ animation:glow 6s ease-in-out infinite; }
            #divider{ animation:dividerPulse 6s ease-in-out infinite; }

            @keyframes curMove{
              0%{   transform: translate(520px,176px); }
              18%{  transform: translate(520px,260px); }
              22%{  transform: translate(548px,368px); }
              100%{ transform: translate(520px,176px); }
            }
            @keyframes rip{
              0%,20%{ opacity:0; transform: translate(574px,388px) scale(.4); }
              26%   { opacity:.35; transform: translate(574px,388px) scale(1.2); }
              32%   { opacity:0;   transform: translate(574px,388px) scale(1.8); }
              100%  { opacity:0;   transform: translate(574px,388px) scale(.4); }
            }
            @keyframes panelIn{
              0%,24% { opacity:0; transform: translateX(60px) scale(.98); }
              36%    { opacity:1; transform: translateX(0)   scale(1.02); }
              56%    { opacity:1; transform: translateX(0)   scale(1); }
              100%   { opacity:1; transform: translateX(0)   scale(1); }
            }
            @keyframes breath{ 0%,55%,100%{transform:scale(1)} 72%{transform:scale(1.04)} 86%{transform:scale(1.02)} }
            @keyframes tick{ 0%,62%{stroke-dashoffset:70;opacity:0} 75%{stroke-dashoffset:0;opacity:1} 100%{stroke-dashoffset:0;opacity:1} }
            @keyframes glow{ 0%,20%,100%{filter:none} 26%{filter:drop-shadow(0 10px 22px rgba(255,106,26,.35))} 44%{filter:drop-shadow(0 6px 14px rgba(255,106,26,.22))} 54%{filter:none} }
            @keyframes dividerPulse{ 0%,24%,100%{opacity:.22} 36%{opacity:.5} 56%{opacity:.3} }
            @media (prefers-reduced-motion:reduce){
              #cursor,#ripple,#panelWrap,#cta,#tick,#chosen,#divider{ animation:none !important; }
            }
          `}</style>
          
          <g transform="translate(32 40)">
            <path x="0" y="0" width="240" height="560" rx="22" className="card2" filter="url(#shadow)" d="M20.167 0H199.833A20.167 20.167 0 0 1 220 20.167V493.167A20.167 20.167 0 0 1 199.833 513.333H20.167A20.167 20.167 0 0 1 0 493.167V20.167A20.167 20.167 0 0 1 20.167 0z"/>
            <g transform="translate(24 28)">
              <path x="0" y="0" width="192" height="44" rx="12" className="card" d="M11 0H165A11 11 0 0 1 176 11V29.333A11 11 0 0 1 165 40.333H11A11 11 0 0 1 0 29.333V11A11 11 0 0 1 11 0z"/>
              <text x="16" y="30" fontSize="22" fontWeight="800" fontFamily="Inter,ui-sans-serif,system-ui" className="ink">Jooble.</text>
              <path cx="10" cy="10" r="6" className="accent" d="M179.667 20.167A5.5 5.5 0 0 1 174.167 25.667A5.5 5.5 0 0 1 168.667 20.167A5.5 5.5 0 0 1 179.667 20.167z"/>
            </g>
            <g transform="translate(24 96)" opacity=".9">
              <path x="0" y="0" width="192" height="40" rx="12" className="card" d="M11 0H165A11 11 0 0 1 176 11V25.667A11 11 0 0 1 165 36.667H11A11 11 0 0 1 0 25.667V11A11 11 0 0 1 11 0z"/>
              <path x="0" y="52" width="192" height="40" rx="12" className="card" d="M11 47.667H165A11 11 0 0 1 176 58.667V73.333A11 11 0 0 1 165 84.333H11A11 11 0 0 1 0 73.333V58.667A11 11 0 0 1 11 47.667z"/>
              <path x="0" y="104" width="192" height="40" rx="12" className="card" d="M11 95.333H165A11 11 0 0 1 176 106.333V121A11 11 0 0 1 165 132H11A11 11 0 0 1 0 121V106.333A11 11 0 0 1 11 95.333z"/>
              <path x="0" y="156" width="192" height="40" rx="12" className="card" d="M11 143H165A11 11 0 0 1 176 154V168.667A11 11 0 0 1 165 179.667H11A11 11 0 0 1 0 168.667V154A11 11 0 0 1 11 143z"/>
              <path x="0" y="208" width="192" height="40" rx="12" className="card" d="M11 190.667H165A11 11 0 0 1 176 201.667V216.333A11 11 0 0 1 165 227.333H11A11 11 0 0 1 0 216.333V201.667A11 11 0 0 1 11 190.667z"/>
            </g>
          </g>
          
          <g transform="translate(288 40)">
            <path x="0" y="0" width="480" height="560" rx="22" className="card2" filter="url(#shadow)" d="M20.167 0H419.833A20.167 20.167 0 0 1 440 20.167V493.167A20.167 20.167 0 0 1 419.833 513.333H20.167A20.167 20.167 0 0 1 0 493.167V20.167A20.167 20.167 0 0 1 20.167 0z"/>
            <path x="20" y="20" width="340" height="36" rx="12" className="card" d="M29.333 18.333H319A11 11 0 0 1 330 29.333V40.333A11 11 0 0 1 319 51.333H29.333A11 11 0 0 1 18.333 40.333V29.333A11 11 0 0 1 29.333 18.333z"/>
            <path x="372" y="20" width="88" height="36" rx="12" className="brand" d="M352 18.333H410.667A11 11 0 0 1 421.667 29.333V40.333A11 11 0 0 1 410.667 51.333H352A11 11 0 0 1 341 40.333V29.333A11 11 0 0 1 352 18.333z"/>
            <g transform="translate(20 76)">
              <path x="0" y="0" width="440" height="88" rx="16" className="card" d="M14.667 0H388.667A14.667 14.667 0 0 1 403.333 14.667V66A14.667 14.667 0 0 1 388.667 80.667H14.667A14.667 14.667 0 0 1 0 66V14.667A14.667 14.667 0 0 1 14.667 0z"/>
              <path x="0" y="108" width="440" height="88" rx="16" className="card" d="M14.667 99H388.667A14.667 14.667 0 0 1 403.333 113.667V165A14.667 14.667 0 0 1 388.667 179.667H14.667A14.667 14.667 0 0 1 0 165V113.667A14.667 14.667 0 0 1 14.667 99z"/>
              <path id="chosen" x="0" y="216" width="440" height="88" rx="16" className="card" stroke="var(--accent)" strokeWidth="1.8333333333333333" d="M14.667 198H388.667A14.667 14.667 0 0 1 403.333 212.667V264A14.667 14.667 0 0 1 388.667 278.667H14.667A14.667 14.667 0 0 1 0 264V212.667A14.667 14.667 0 0 1 14.667 198z"/>
              <path x="0" y="324" width="440" height="88" rx="16" className="card" d="M14.667 297H388.667A14.667 14.667 0 0 1 403.333 311.667V363A14.667 14.667 0 0 1 388.667 377.667H14.667A14.667 14.667 0 0 1 0 363V311.667A14.667 14.667 0 0 1 14.667 297z"/>
              <path x="0" y="432" width="440" height="88" rx="16" className="card" d="M14.667 396H388.667A14.667 14.667 0 0 1 403.333 410.667V462A14.667 14.667 0 0 1 388.667 476.667H14.667A14.667 14.667 0 0 1 0 462V410.667A14.667 14.667 0 0 1 14.667 396z"/>
              <g opacity=".22">
                <path x="18" y="18" width="270" height="12" rx="6" className="ink" d="M22 16.5H258.5A5.5 5.5 0 0 1 264 22V22A5.5 5.5 0 0 1 258.5 27.5H22A5.5 5.5 0 0 1 16.5 22V22A5.5 5.5 0 0 1 22 16.5z"/>
                <path x="18" y="40" width="210" height="10" rx="5" className="weak" d="M21.083 36.667H204.417A4.583 4.583 0 0 1 209 41.25V41.25A4.583 4.583 0 0 1 204.417 45.833H21.083A4.583 4.583 0 0 1 16.5 41.25V41.25A4.583 4.583 0 0 1 21.083 36.667z"/>
                <path x="18" y="126" width="250" height="12" rx="6" className="ink" d="M22 115.5H240.167A5.5 5.5 0 0 1 245.667 121V121A5.5 5.5 0 0 1 240.167 126.5H22A5.5 5.5 0 0 1 16.5 121V121A5.5 5.5 0 0 1 22 115.5z"/>
                <path x="18" y="148" width="190" height="10" rx="5" className="weak" d="M21.083 135.667H186.083A4.583 4.583 0 0 1 190.667 140.25V140.25A4.583 4.583 0 0 1 186.083 144.833H21.083A4.583 4.583 0 0 1 16.5 140.25V140.25A4.583 4.583 0 0 1 21.083 135.667z"/>
                <path x="18" y="234" width="280" height="12" rx="6" className="ink" d="M22 214.5H267.667A5.5 5.5 0 0 1 273.167 220V220A5.5 5.5 0 0 1 267.667 225.5H22A5.5 5.5 0 0 1 16.5 220V220A5.5 5.5 0 0 1 22 214.5z"/>
                <path x="18" y="256" width="200" height="10" rx="5" className="weak" d="M21.083 234.667H195.25A4.583 4.583 0 0 1 199.833 239.25V239.25A4.583 4.583 0 0 1 195.25 243.833H21.083A4.583 4.583 0 0 1 16.5 239.25V239.25A4.583 4.583 0 0 1 21.083 234.667z"/>
              </g>
            </g>
          </g>
          
          <path id="divider" x="784" y="40" width="2" height="560" className="ink" opacity=".22" d="M718.667 36"/>
          
          <g id="panelWrap" transform="translate(808 40)" filter="url(#shadow)">
            <path x="808" y="40" width="360" height="560" rx="22" className="card2" d="M760.833 36.667H1050.5A20.167 20.167 0 0 1 1070.667 56.833V529.833A20.167 20.167 0 0 1 1050.5 550H760.833A20.167 20.167 0 0 1 740.667 529.833V56.833A20.167 20.167 0 0 1 760.833 36.667z"/>
            <path x="808" y="52" width="300" height="10" rx="5" fill="url(#shimmer)" d="M745.25 47.667H1011.083A4.583 4.583 0 0 1 1015.667 52.25V52.25A4.583 4.583 0 0 1 1011.083 56.833H745.25A4.583 4.583 0 0 1 740.667 52.25V52.25A4.583 4.583 0 0 1 745.25 47.667z"/>
            <path x="808" y="72" width="210" height="10" rx="5" fill="url(#shimmer)" d="M745.25 66H928.583A4.583 4.583 0 0 1 933.167 70.583V70.583A4.583 4.583 0 0 1 928.583 75.167H745.25A4.583 4.583 0 0 1 740.667 70.583V70.583A4.583 4.583 0 0 1 745.25 66z"/>
            <path x="808" y="110" width="316" height="10" rx="5" fill="url(#shimmer)" d="M745.25 100.833H1025.75A4.583 4.583 0 0 1 1030.333 105.417V105.417A4.583 4.583 0 0 1 1025.75 110H745.25A4.583 4.583 0 0 1 740.667 105.417V105.417A4.583 4.583 0 0 1 745.25 100.833z"/>
            <path x="808" y="130" width="284" height="10" rx="5" fill="url(#shimmer)" d="M745.25 119.167H996.417A4.583 4.583 0 0 1 1001 123.75V123.75A4.583 4.583 0 0 1 996.417 128.333H745.25A4.583 4.583 0 0 1 740.667 123.75V123.75A4.583 4.583 0 0 1 745.25 119.167z"/>
            <path x="808" y="150" width="260" height="10" rx="5" fill="url(#shimmer)" d="M745.25 137.5H974.417A4.583 4.583 0 0 1 979 142.083V142.083A4.583 4.583 0 0 1 974.417 146.667H745.25A4.583 4.583 0 0 1 740.667 142.083V142.083A4.583 4.583 0 0 1 745.25 137.5z"/>
            <path x="808" y="170" width="320" height="10" rx="5" fill="url(#shimmer)" d="M745.25 155.833H1029.417A4.583 4.583 0 0 1 1034 160.417V160.417A4.583 4.583 0 0 1 1029.417 165H745.25A4.583 4.583 0 0 1 740.667 160.417V160.417A4.583 4.583 0 0 1 745.25 155.833z"/>
            <path x="808" y="190" width="270" height="10" rx="5" fill="url(#shimmer)" d="M745.25 174.167H983.583A4.583 4.583 0 0 1 988.167 178.75V178.75A4.583 4.583 0 0 1 983.583 183.333H745.25A4.583 4.583 0 0 1 740.667 178.75V178.75A4.583 4.583 0 0 1 745.25 174.167z"/>
            <g id="cta">
              <path x="900" y="400" width="100" height="44" rx="12" className="accent"
                    transform="translate(24 0)"
                    d="M751.667 458.333H872.667A11 11 0 0 1 883.667 469.333V487.667A11 11 0 0 1 872.667 498.667H751.667A11 11 0 0 1 740.667 487.667V469.333A11 11 0 0 1 751.667 458.333z"/>
              <path x="900" y="800" width="150" height="44" rx="12" className="card"
                    d="M751.667 458.333H867.167A11 11 0 0 1 878.167 469.333V487.667A11 11 0 0 1 867.167 498.667H751.667A11 11 0 0 1 740.667 487.667V469.333A11 11 0 0 1 751.667 458.333z"/>
            </g>
            <g transform="translate(836.167 478.5)">
              <path id="tick"
                    d="m-7.333 0 7.333 7.333L12.833 -5.5"
                    fill="none" stroke="#fff" strokeWidth="3.6666666666666665"
                    strokeLinecap="round" strokeLinejoin="round"/>
            </g>
          </g>
          
          <g id="cursor">
            <path points="0,0 26,12 12,16 16,30" fill="#fff" stroke="rgba(0,0,0,.28)" strokeWidth="1.0999999999999999" d="M0 0L23.833 11L11 14.667L14.667 27.5Z"/>
          </g>
          
          <g id="ripple" opacity="0">
            <path r="14" className="accent" d="Maaaaaaaaz"/>
            <path r="14" className="accent" opacity=".25" d="Maaaaaaaaz"/>
          </g>
        </svg>
      </div>
    </>;
};
export default JobDetails;