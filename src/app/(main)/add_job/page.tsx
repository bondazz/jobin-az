import ReferralJobSubmissionClient from '@/components/ReferralJobSubmissionClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'İş Elanı Yerləşdir | Namizəd Tapma Platforması ',
    description: 'Vakansiyanızı ən uyğun namizədlərə çatdırın. Jooble.az işə qəbul prosesinizi sürətləndirən peşəkar vakansiya yerləşdirmə və namizəd tapma platforması təqdim edir.',
    keywords: 'iş elanı yerləşdir, vakansiya yerləşdirmək, iş elanı vermək, namizəd tapma platforması, işəgötürən paneli, HR vakansiya sistemi, işə qəbul platforması, Azərbaycan vakansiyaları'
};

export default function AddJobPage() {
    return <ReferralJobSubmissionClient />;
}
