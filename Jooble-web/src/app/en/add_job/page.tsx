import { Metadata } from 'next';
import ReferralJobSubmissionClient from '@/components/ReferralJobSubmissionClient';

export const metadata: Metadata = {
    title: 'Submit a Job | Post Vacancy - Jooble.az',
    description: 'Submit a job posting through our referral program. Help companies find great candidates.',
    alternates: {
        canonical: 'https://jooble.az/en/add_job',
        languages: {
            'az': 'https://jooble.az/add_job',
            'en': 'https://jooble.az/en/add_job',
            'ru': 'https://jooble.az/ru/add_job',
            'x-default': 'https://jooble.az/add_job',
        },
    },
};

export default function EnAddJobPage() {
    return <ReferralJobSubmissionClient />;
}
