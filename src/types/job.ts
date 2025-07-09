export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary?: string;
  description: string;
  requirements: string[];
  benefits?: string[];
  tags: ('premium' | 'new' | 'urgent' | 'remote')[];
  views: number;
  postedAt: string;
  category: string;
  applicationUrl?: string;
}

export interface JobCategory {
  id: string;
  name: string;
  count: number;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  description: string;
  website?: string;
}