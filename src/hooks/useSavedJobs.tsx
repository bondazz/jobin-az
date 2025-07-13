import { useState, useEffect } from 'react';

export const useSavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  useEffect(() => {
    // Load saved jobs from localStorage
    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      setSavedJobs(JSON.parse(saved));
    }
  }, []);

  const saveJob = (jobId: string) => {
    const updatedSavedJobs = [...savedJobs, jobId];
    setSavedJobs(updatedSavedJobs);
    localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
  };

  const unsaveJob = (jobId: string) => {
    const updatedSavedJobs = savedJobs.filter(id => id !== jobId);
    setSavedJobs(updatedSavedJobs);
    localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
  };

  const isJobSaved = (jobId: string) => {
    return savedJobs.includes(jobId);
  };

  return {
    savedJobs,
    saveJob,
    unsaveJob,
    isJobSaved,
    savedJobsCount: savedJobs.length
  };
};