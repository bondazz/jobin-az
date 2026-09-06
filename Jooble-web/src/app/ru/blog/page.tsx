import { Metadata } from 'next';
import BlogClient from '@/components/BlogClient';

export const metadata: Metadata = {
    title: 'Блог | Советы по карьере и поиску работы - Jooble.az',
    description: 'Читайте советы по карьере, поиску работы и аналитику рынка труда. Будьте в курсе событий на рынке труда Азербайджана.',
    alternates: {
        canonical: 'https://jooble.az/ru/blog',
        languages: {
            'az': 'https://jooble.az/blog',
            'en': 'https://jooble.az/en/blog',
            'ru': 'https://jooble.az/ru/blog',
            'x-default': 'https://jooble.az/blog',
        },
    },
};

export default function RuBlogPage() {
    return <BlogClient />;
}
