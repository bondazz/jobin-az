import { Metadata } from 'next';
import BlogClient from '@/components/BlogClient';

export const metadata: Metadata = {
    title: 'Blog | Career Tips & Job Search Advice - Jooble.az',
    description: 'Read career advice, job search tips, and industry insights. Stay informed about the job market in Azerbaijan.',
    alternates: {
        canonical: 'https://jooble.az/en/blog',
        languages: {
            'az': 'https://jooble.az/blog',
            'en': 'https://jooble.az/en/blog',
            'ru': 'https://jooble.az/ru/blog',
            'x-default': 'https://jooble.az/blog',
        },
    },
};

export default function EnBlogPage() {
    return <BlogClient />;
}
