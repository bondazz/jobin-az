export interface Job {
  id: string;
  title: string;
  company: string;
  company_id?: string;
  companyLogo?: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary?: string;
  description: string;
  tags: ('premium' | 'new' | 'urgent' | 'remote')[];
  views: number;
  postedAt: string;
  category: string;
  applicationUrl?: string;
  applicationType?: 'website' | 'email';
  applicationEmail?: string;
}

export interface JobCategory {
  id: string;
  name: string;
  count: number;
  slug: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  description: string;
  website?: string;
}