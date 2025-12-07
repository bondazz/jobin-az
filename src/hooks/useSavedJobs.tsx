import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'savedJobs';

export const useSavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadSavedJobs = useCallback(() => {
    if (!isClient) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSavedJobs(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved jobs:', error);
    }
  }, [isClient]);

  useEffect(() => {
    loadSavedJobs();
  }, [loadSavedJobs]);

  const toggleSaveJob = useCallback((jobId: string) => {
    if (!isClient) return;

    setSavedJobs(prev => {
      const newSaved = prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId];

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSaved));
      } catch (error) {
        console.error('Error saving jobs:', error);
      }

      return newSaved;
    });
  }, [isClient]);

  const isJobSaved = useCallback((jobId: string) => {
    return savedJobs.includes(jobId);
  }, [savedJobs]);

  return {
    savedJobs,
    toggleSaveJob,
    isJobSaved,
    savedJobsCount: savedJobs.length
  };
};