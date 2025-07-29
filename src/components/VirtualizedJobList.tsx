import { memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Job } from '@/types/job';
import JobCard from './JobCard';
import AdBanner from './AdBanner';

interface VirtualizedJobListProps {
  jobs: Job[];
  selectedJob: Job | null;
  onJobSelect: (job: Job) => void;
  height: number;
}

const VirtualizedJobList = memo(({ jobs, selectedJob, onJobSelect, height }: VirtualizedJobListProps) => {
  const itemData = useMemo(() => ({
    jobs,
    selectedJob,
    onJobSelect
  }), [jobs, selectedJob, onJobSelect]);

  const Row = memo(({ index, style, data }: any) => {
    const { jobs, selectedJob, onJobSelect } = data;
    const job = jobs[index];
    
    if (!job) return null;
    
    return (
      <div style={style}>
        <div className="w-full max-w-full min-w-0 px-2">
          {/* Advertisement Banner every 6 jobs */}
          {index > 0 && index % 6 === 0 && (
            <AdBanner position="job_listing" className="mb-2 animate-fade-in" />
          )}
          
          <div className="animate-fade-in w-full" style={{
            animationDelay: `${index * 20}ms` // Reduced delay for better performance
          }}>
            <JobCard 
              job={job} 
              isSelected={selectedJob?.id === job.id} 
              onClick={() => onJobSelect(job)} 
              isAlternate={index % 2 === 1} 
            />
          </div>
        </div>
      </div>
    );
  });

  if (jobs.length === 0) {
    return null;
  }

  return (
    <List
      height={height}
      itemCount={jobs.length}
      itemSize={70} // Fixed height for each job card
      itemData={itemData}
      overscanCount={5} // Reduced overscan for better performance
    >
      {Row}
    </List>
  );
});

export default VirtualizedJobList;