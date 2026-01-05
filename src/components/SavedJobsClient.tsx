"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Bookmark } from 'lucide-react';
import JobListings from '@/components/JobListings';
import JobDetails from '@/components/JobDetails';
import { Job } from '@/types/job';

import MobileHeader from '@/components/MobileHeader';
import { useReferralCode } from '@/hooks/useReferralCode';
import SEOBreadcrumb from '@/components/SEOBreadcrumb';

const SavedJobsClient = () => {
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const params = useParams();
    const jobId = params?.jobId as string | undefined;
    const router = useRouter();
    const { getUrlWithReferral } = useReferralCode();

    useEffect(() => {
        if (jobId) {
            setSelectedJob({ id: jobId } as Job);
        }
    }, [jobId]);

    const handleJobSelect = async (job: Job) => {
        setSelectedJob(job);
        const urlWithReferral = getUrlWithReferral(`/favorites/${job.id}`);
        router.push(urlWithReferral, { scroll: false });
    };

    return (
        <div className="h-full flex bg-background overflow-hidden">
            {/* SEO Breadcrumb - Hidden visually */}
            <SEOBreadcrumb 
                items={[
                    { label: "Yadda saxlanılanlar" }
                ]}
                visuallyHidden={true}
            />

            {/* Mobile Header */}
            <MobileHeader />

            <div className="flex-1 flex min-w-0 pb-16 xl:pb-0 pt-14 xl:pt-0">

                {/* Saved Jobs List */}
                <div className="w-full lg:w-[500px] xl:w-[580px] 2xl:w-[650px] border-r border-border animate-fade-in">
                    <div className="xl:hidden p-4 border-b border-border">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Elanları axtar..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                🔍
                            </div>
                        </div>
                    </div>
                    <JobListings
                        selectedJobId={selectedJob?.id || null}
                        onJobSelect={handleJobSelect}
                        showOnlySaved={true}
                        showHeader={false}
                    />
                </div>

                {/* Right Section - Job Details */}
                <div className="hidden lg:block flex-1 bg-background animate-slide-in-right">
                    {selectedJob ? (
                        <JobDetails jobId={selectedJob.id} />
                    ) : (
                        <div className="h-full flex items-center justify-center p-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bookmark className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-foreground mb-2">Elan Seçin</h2>
                                <p className="text-muted-foreground text-sm max-w-sm">
                                    Sol tərəfdən bir elan seçin və ətraflı məlumat alın
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Job Details Modal */}
            {selectedJob && (
                <div className="lg:hidden fixed inset-0 bg-background z-50 overflow-y-auto animate-slide-in-right">
                    {/* Mobile Header with Logo */}
                    <MobileHeader
                        showCloseButton={true}
                        onClose={() => {
                            setSelectedJob(null);
                            router.push('/favorites');
                        }}
                    />
                    <JobDetails jobId={selectedJob.id} isMobile={true} primaryHeading={false} />
                </div>
            )}


        </div>
    );
};

export default SavedJobsClient;
