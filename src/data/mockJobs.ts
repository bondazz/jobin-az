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
  },
  {
    id: '7',
    title: 'Frontend Developer',
    company: 'TechStart',
    location: 'Austin, TX',
    type: 'full-time',
    salary: '$85,000 - $115,000',
    description: 'Build responsive user interfaces using modern React technologies.',
    requirements: [
      '3+ years of React experience',
      'TypeScript proficiency',
      'Experience with state management',
      'Knowledge of testing frameworks'
    ],
    benefits: ['Health insurance', 'Flexible hours', 'Learning budget'],
    tags: ['remote'],
    views: 342,
    postedAt: '4 days ago',
    category: 'Engineering',
    applicationUrl: 'https://example.com/apply'
  },
  {
    id: '8',
    title: 'Backend Engineer',
    company: 'DataFlow',
    location: 'Denver, CO',
    type: 'full-time',
    salary: '$95,000 - $125,000',
    description: 'Design scalable backend systems and APIs.',
    requirements: [
      '4+ years of backend development',
      'Experience with Node.js or Python',
      'Database design knowledge',
      'Microservices architecture'
    ],
    benefits: ['Stock options', 'Remote work', 'Tech conferences'],
    tags: ['premium'],
    views: 567,
    postedAt: '5 days ago',
    category: 'Engineering',
    applicationUrl: 'https://example.com/apply'
  },
  {
    id: '9',
    title: 'QA Engineer',
    company: 'TestPro',
    location: 'Portland, OR',
    type: 'full-time',
    salary: '$70,000 - $90,000',
    description: 'Ensure software quality through comprehensive testing strategies.',
    requirements: [
      '3+ years of QA experience',
      'Automation testing skills',
      'Knowledge of testing frameworks',
      'Bug tracking experience'
    ],
    benefits: ['Professional development', 'Team bonuses', 'Health benefits'],
    tags: ['new'],
    views: 234,
    postedAt: '6 days ago',
    category: 'Engineering',
    applicationUrl: 'https://example.com/apply'
  },
  {
    id: '10',
    title: 'Mobile Developer',
    company: 'AppInnovate',
    location: 'Miami, FL',
    type: 'full-time',
    salary: '$90,000 - $120,000',
    description: 'Develop native and cross-platform mobile applications.',
    requirements: [
      '4+ years of mobile development',
      'React Native or Flutter experience',
      'iOS/Android knowledge',
      'App store deployment experience'
    ],
    benefits: ['Device allowance', 'Conference tickets', 'Equity'],
    tags: ['premium', 'urgent'],
    views: 789,
    postedAt: '1 week ago',
    category: 'Engineering',
    applicationUrl: 'https://example.com/apply'
  },
  {
    id: '11',
    title: 'Sales Manager',
    company: 'SalesForce',
    location: 'Phoenix, AZ',
    type: 'full-time',
    salary: '$75,000 - $105,000',
    description: 'Lead sales team and drive revenue growth.',
    requirements: [
      '5+ years of sales experience',
      'Team leadership skills',
      'CRM software knowledge',
      'Strong negotiation skills'
    ],
    benefits: ['Commission structure', 'Car allowance', 'Health insurance'],
    tags: ['new'],
    views: 445,
    postedAt: '1 week ago',
    category: 'Sales',
    applicationUrl: 'https://example.com/apply'
  },
  {
    id: '12',
    title: 'HR Specialist',
    company: 'PeopleFirst',
    location: 'Atlanta, GA',
    type: 'full-time',
    salary: '$55,000 - $75,000',
    description: 'Support HR operations and employee relations.',
    requirements: [
      '2+ years of HR experience',
      'SHRM certification preferred',
      'Employee relations knowledge',
      'Recruitment experience'
    ],
    benefits: ['Professional development', 'Flexible schedule', 'Health benefits'],
    tags: ['remote'],
    views: 198,
    postedAt: '1 week ago',
    category: 'HR',
    applicationUrl: 'https://example.com/apply'
  },
  {
    id: '13',
    title: 'Content Writer',
    company: 'ContentCorp',
    location: 'Nashville, TN',
    type: 'part-time',
    salary: '$40,000 - $60,000',
    description: 'Create engaging content for digital platforms.',
    requirements: [
      '3+ years of writing experience',
      'SEO knowledge',
      'Content management systems',
      'Social media experience'
    ],
    benefits: ['Flexible hours', 'Writing tools', 'Creative freedom'],
    tags: ['remote'],
    views: 167,
    postedAt: '2 weeks ago',
    category: 'Marketing',
    applicationUrl: 'https://example.com/apply'
  },
  {
    id: '14',
    title: 'Graphic Designer',
    company: 'CreativeAgency',
    location: 'San Diego, CA',
    type: 'contract',
    salary: '$65,000 - $85,000',
    description: 'Design visual content for various marketing materials.',
    requirements: [
      '4+ years of design experience',
      'Adobe Creative Suite mastery',
      'Brand identity design',
      'Print and digital design'
    ],
    benefits: ['Creative environment', 'Design software', 'Portfolio development'],
    tags: ['premium'],
    views: 423,
    postedAt: '2 weeks ago',
    category: 'Design',
    applicationUrl: 'https://example.com/apply'
  },
  {
    id: '15',
    title: 'Financial Analyst',
    company: 'FinanceHub',
    location: 'Charlotte, NC',
    type: 'full-time',
    salary: '$70,000 - $95,000',
    description: 'Analyze financial data and create reports for management.',
    requirements: [
      '3+ years of financial analysis',
      'Excel and PowerBI skills',
      'Financial modeling experience',
      'CPA or CFA preferred'
    ],
    benefits: ['Certification support', 'Bonus structure', 'Health insurance'],
    tags: ['new'],
    views: 312,
    postedAt: '2 weeks ago',
    category: 'Finance',
    applicationUrl: 'https://example.com/apply'
  },
  {
    id: '16',
    title: 'Customer Success Manager',
    company: 'ServicePro',
    location: 'Orlando, FL',
    type: 'full-time',
    salary: '$80,000 - $100,000',
    description: 'Ensure customer satisfaction and drive retention.',
    requirements: [
      '4+ years of customer success',
      'SaaS experience',
      'Strong communication skills',
      'Data analysis capabilities'
    ],
    benefits: ['Customer events', 'Performance bonuses', 'Travel opportunities'],
    tags: ['premium'],
    views: 289,
    postedAt: '3 weeks ago',
    category: 'Customer Success',
    applicationUrl: 'https://example.com/apply'
  },
  {
    id: '17',
    title: 'Operations Manager',
    company: 'OptiFlow',
    location: 'Kansas City, MO',
    type: 'full-time',
    salary: '$85,000 - $110,000',
    description: 'Oversee daily operations and process improvements.',
    requirements: [
      '5+ years of operations experience',
      'Process optimization skills',
      'Team management experience',
      'Lean Six Sigma knowledge'
    ],
    benefits: ['Leadership training', 'Performance incentives', 'Health coverage'],
    tags: ['urgent'],
    views: 356,
    postedAt: '3 weeks ago',
    category: 'Operations',
    applicationUrl: 'https://example.com/apply'
  },
  {
    id: '18',
    title: 'Business Analyst',
    company: 'BizTech',
    location: 'Indianapolis, IN',
    type: 'full-time',
    salary: '$75,000 - $95,000',
    description: 'Analyze business processes and recommend improvements.',
    requirements: [
      '3+ years of business analysis',
      'Requirements gathering',
      'Process mapping skills',
      'SQL knowledge preferred'
    ],
    benefits: ['Training programs', 'Flexible work', 'Professional development'],
    tags: ['remote'],
    views: 234,
    postedAt: '3 weeks ago',
    category: 'Business',
    applicationUrl: 'https://example.com/apply'
  },
  {
    id: '19',
    title: 'Network Administrator',
    company: 'NetSecure',
    location: 'Columbus, OH',
    type: 'full-time',
    salary: '$65,000 - $85,000',
    description: 'Maintain and secure network infrastructure.',
    requirements: [
      '4+ years of network administration',
      'Cisco certifications',
      'Security protocols knowledge',
      'Troubleshooting skills'
    ],
    benefits: ['Certification training', 'On-call pay', 'Equipment allowance'],
    tags: ['urgent'],
    views: 178,
    postedAt: '1 month ago',
    category: 'IT',
    applicationUrl: 'https://example.com/apply'
  },
  {
    id: '20',
    title: 'Project Manager',
    company: 'ProjectPro',
    location: 'Richmond, VA',
    type: 'full-time',
    salary: '$90,000 - $115,000',
    description: 'Lead cross-functional projects and ensure timely delivery.',
    requirements: [
      '5+ years of project management',
      'PMP certification preferred',
      'Agile/Scrum experience',
      'Stakeholder management'
    ],
    benefits: ['Certification support', 'Team events', 'Flexible schedule'],
    tags: ['premium'],
    views: 467,
    postedAt: '1 month ago',
    category: 'Management',
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