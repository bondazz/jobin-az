import ReferralJobSubmissionClient from '@/components/ReferralJobSubmissionClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'İş Elanı Yerləşdir | Birləşik Elan | Jooble Azərbaycan',
    description: 'İş elanınızı pulsuz yerləşdirin. Referral sistemi ilə birləşik elan yerləşdirin və işəgötürənlərlə birbaşa əlaqə saxlayın. Azərbaycanda ən effektiv iş elanı platforması.',
    keywords: 'iş elanı yerləşdir, birləşik elan, referral sistem, iş elanı ver, vakansiya yerləşdir, işəgötürən, Azərbaycan iş elanları'
};

export default function AddJobPage() {
    return <ReferralJobSubmissionClient />;
}
