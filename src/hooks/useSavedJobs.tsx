import { useState, useEffect, useCallback } from 'react';

export const useSavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  const loadSavedJobs = useCallback(() => {
    try {
      const saved = localStorage.getItem('savedJobs');
      if (saved) {
        const parsedJobs = JSON.parse(saved);
        if (Array.isArray(parsedJobs)) {
          setSavedJobs(parsedJobs);
          return;
        }
      }
      // If no saved jobs or invalid data, reset to empty
      setSavedJobs([]);
      localStorage.setItem('savedJobs', JSON.stringify([]));
    } catch (error) {
      console.error('Error loading saved jobs:', error);
      setSavedJobs([]);
      localStorage.setItem('savedJobs', JSON.stringify([]));
    }
  }, []);

  useEffect(() => {
    loadSavedJobs();
  }, [loadSavedJobs]);

  const toggleSaveJob = useCallback((jobId: string) => {
    setSavedJobs(prevSavedJobs => {
      const newSavedJobs = prevSavedJobs.includes(jobId)
        ? prevSavedJobs.filter(id => id !== jobId)
        : [...prevSavedJobs, jobId];
      
      localStorage.setItem('savedJobs', JSON.stringify(newSavedJobs));
      return newSavedJobs;
    });
  }, []);

  const isJobSaved = useCallback((jobId: string) => savedJobs.includes(jobId), [savedJobs]);

  return {
    savedJobs,
    toggleSaveJob,
    isJobSaved,
    savedJobsCount: savedJobs.length
  };
};