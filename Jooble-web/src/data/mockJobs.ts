import { Job, JobCategory, Company } from '@/types/job';

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'Google',
    location: 'New York, NY',
    type: 'full-time',
    salary: '$120,000 - $150,000',
    description: 'We are looking for a Senior Software Engineer to join our growing team. You will be responsible for designing, developing, and maintaining high-quality software solutions. Requirements: 5+ years of experience in software development, proficiency in React, Node.js, and TypeScript, experience with cloud platforms (AWS, Azure), strong problem-solving skills. Benefits: Health insurance, remote work options, 401(k) matching.',
    tags: ['premium', 'remote'],
    views: 1247,
    postedAt: 'Today',
    category: 'Engineering',
    applicationUrl: 'https://example.com/apply'
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'Apple',
    location: 'San Francisco, CA',
    type: 'full-time',
    salary: '$130,000 - $170,000',
    description: 'Join our product team to drive innovation and create user-centric solutions. Lead cross-functional teams to deliver exceptional products. Requirements: 3+ years of product management experience, strong analytical and communication skills, experience with Agile methodologies, Bachelor degree in relevant field. Benefits: Equity package, flexible hours, learning budget.',
    tags: ['new', 'premium'],
    views: 892,
    postedAt: 'Today',
    category: 'Product',
    applicationUrl: 'https://example.com/apply'
  },
  {
    id: '3',
    title: 'UX/UI Designer',
    company: 'DesignStudio',
    location: 'Los Angeles, CA',
    type: 'full-time',
    salary: '$80,000 - $110,000',
    description: 'Create beautiful and intuitive user experiences for our digital products. Work closely with developers and product managers. Requirements: 3+ years of UX/UI design experience, proficiency in Figma, Sketch, Adobe Creative Suite, strong portfolio demonstrating design thinking, knowledge of front-end development is a plus. Benefits: Creative environment, design tools budget, conference attendance.',
    tags: ['remote'],
    views: 634,
    postedAt: 'Yesterday',
    category: 'Design',
    applicationUrl: 'https://example.com/apply'
  },
  {
    id: '4',
    title: 'Marketing Specialist',
    company: 'GrowthCo',
    location: 'Chicago, IL',
    type: 'full-time',
    salary: '$60,000 - $80,000',
    description: 'Drive marketing campaigns and increase brand awareness. Analyze market trends and optimize marketing strategies. Requirements: 2+ years of marketing experience, experience with digital marketing tools, strong analytical skills, excellent written and verbal communication. Benefits: Marketing budget, professional development, team events.',
    tags: ['new'],
    views: 445,
    postedAt: 'Yesterday', 
    category: 'Marketing',
    applicationUrl: 'https://example.com/apply'
  },
  {
    id: '5',
    title: 'Data Scientist',
    company: 'Microsoft',
    location: 'Boston, MA',
    type: 'full-time',
    salary: '$110,000 - $140,000',
    description: 'Analyze complex datasets to derive actionable insights. Build predictive models and machine learning algorithms. Requirements: PhD or Masters in Data Science/Statistics, proficiency in Python, R, SQL, experience with ML frameworks, strong statistical background. Benefits: Research budget, conference presentations, flexible schedule.',
    tags: ['premium', 'urgent'],
    views: 756,
    postedAt: '2 days ago',
    category: 'Data Science',
    applicationUrl: 'https://example.com/apply'
  }
];

export const mockCategories: JobCategory[] = [
  { id: '1', name: 'Engineering', count: 245, slug: 'engineering' },
  { id: '2', name: 'Product', count: 89, slug: 'product' },
  { id: '3', name: 'Design', count: 67, slug: 'design' },
  { id: '4', name: 'Marketing', count: 112, slug: 'marketing' },
  { id: '5', name: 'Data Science', count: 78, slug: 'data-science' },
  { id: '6', name: 'Sales', count: 156, slug: 'sales' },
  { id: '7', name: 'Operations', count: 134, slug: 'operations' },
  { id: '8', name: 'Finance', count: 93, slug: 'finance' }
];

export const mockCompanies: Company[] = [
  { id: '1', name: 'TechCorp', description: 'Leading technology company' },
  { id: '2', name: 'InnovateLab', description: 'Innovation-focused startup' },
  { id: '3', name: 'DesignStudio', description: 'Creative design agency' },
  { id: '4', name: 'GrowthCo', description: 'Fast-growing marketing company' },
  { id: '5', name: 'DataTech', description: 'Data analytics platform' },
  { id: '6', name: 'CloudSystems', description: 'Cloud infrastructure provider' }
];