import { Job, JobCategory, Company } from '@/types/job';

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'Google',
    location: 'New York, NY',
    type: 'full-time',
    salary: '$120,000 - $150,000',
    description: 'We are looking for a Senior Software Engineer to join our growing team. You will be responsible for designing, developing, and maintaining high-quality software solutions.',
    requirements: [
      '5+ years of experience in software development',
      'Proficiency in React, Node.js, and TypeScript',
      'Experience with cloud platforms (AWS, Azure)',
      'Strong problem-solving skills'
    ],
    benefits: ['Health insurance', 'Remote work options', '401(k) matching'],
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
    description: 'Join our product team to drive innovation and create user-centric solutions. Lead cross-functional teams to deliver exceptional products.',
    requirements: [
      '3+ years of product management experience',
      'Strong analytical and communication skills',
      'Experience with Agile methodologies',
      'Bachelor degree in relevant field'
    ],
    benefits: ['Equity package', 'Flexible hours', 'Learning budget'],
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
    description: 'Create beautiful and intuitive user experiences for our digital products. Work closely with developers and product managers.',
    requirements: [
      '3+ years of UX/UI design experience',
      'Proficiency in Figma, Sketch, Adobe Creative Suite',
      'Strong portfolio demonstrating design thinking',
      'Knowledge of front-end development is a plus'
    ],
    benefits: ['Creative environment', 'Design tools budget', 'Conference attendance'],
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
    description: 'Drive marketing campaigns and increase brand awareness. Analyze market trends and optimize marketing strategies.',
    requirements: [
      '2+ years of marketing experience',
      'Experience with digital marketing tools',
      'Strong analytical skills',
      'Excellent written and verbal communication'
    ],
    benefits: ['Marketing budget', 'Professional development', 'Team events'],
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
    description: 'Analyze complex datasets to derive actionable insights. Build predictive models and machine learning algorithms.',
    requirements: [
      'PhD or Masters in Data Science/Statistics',
      'Proficiency in Python, R, SQL',
      'Experience with ML frameworks',
      'Strong statistical background'
    ],
    benefits: ['Research budget', 'Conference presentations', 'Flexible schedule'],
    tags: ['premium', 'urgent'],
    views: 756,
    postedAt: '2 days ago',
    category: 'Data Science',
    applicationUrl: 'https://example.com/apply'
  },
  {
    id: '6',
    title: 'DevOps Engineer',
    company: 'CloudSystems',
    location: 'Seattle, WA',
    type: 'full-time',
    salary: '$100,000 - $130,000',
    description: 'Maintain and improve our cloud infrastructure. Implement CI/CD pipelines and ensure system reliability.',
    requirements: [
      '4+ years of DevOps experience',
      'Experience with AWS/Azure/GCP',
      'Knowledge of containerization (Docker, Kubernetes)',
      'Scripting skills (Bash, Python)'
    ],
    benefits: ['Cloud certifications', 'On-call compensation', 'Stock options'],
    tags: ['remote', 'urgent'],
    views: 523,
    postedAt: '3 days ago',
    category: 'Engineering',
    applicationUrl: 'https://example.com/apply'
  }
];

export const mockCategories: JobCategory[] = [
  { id: '1', name: 'Engineering', count: 245 },
  { id: '2', name: 'Product', count: 89 },
  { id: '3', name: 'Design', count: 67 },
  { id: '4', name: 'Marketing', count: 112 },
  { id: '5', name: 'Data Science', count: 78 },
  { id: '6', name: 'Sales', count: 156 },
  { id: '7', name: 'Operations', count: 134 },
  { id: '8', name: 'Finance', count: 93 }
];

export const mockCompanies: Company[] = [
  { id: '1', name: 'TechCorp', description: 'Leading technology company' },
  { id: '2', name: 'InnovateLab', description: 'Innovation-focused startup' },
  { id: '3', name: 'DesignStudio', description: 'Creative design agency' },
  { id: '4', name: 'GrowthCo', description: 'Fast-growing marketing company' },
  { id: '5', name: 'DataTech', description: 'Data analytics platform' },
  { id: '6', name: 'CloudSystems', description: 'Cloud infrastructure provider' }
];