import { useState, useEffect } from 'react';
import { fetchStats, fetchObservations } from '../../ai-chat/services/journal.api.js';

const insightErrorMessage = 'Observation/ Advice cannot be generated because our servers are experiencing heavy load';

export function useAnalyticsData(entries) {
  const [statsData, setStatsData] = useState({
    totalEntries: 0,
    totalWords: 0,
    longestStreak: 0,
    currentStreak: 0,
    avgMoodScore: 0,
    currentStressStatus: 0,
    wellnessRiskLevel: 'normal',
    avgSleepHours: null
  });

  const [insights, setInsights] = useState({
    observations: [],
    welfareRecommendations: []
  });
  
  const [statsRequest, setStatsRequest] = useState({ loading: false, error: null });
  const [insightsRequest, setInsightsRequest] = useState({ loading: false, error: null });

  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsRequest({ loading: true, error: null });
        const res = await fetchStats();
        if (res && res.stats) {
          setStatsData(res.stats);
        }
        setStatsRequest({ loading: false, error: null });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setStatsRequest({
          loading: false,
          error: err.response?.data?.message || err.message || 'Failed to fetch stats'
        });
      }
    };
    loadStats();
  }, [entries]);

  useEffect(() => {
    const loadObservations = async () => {
      try {
        setInsightsRequest({ loading: true, error: null });
        const res = await fetchObservations();
        if (res && res.insights) {
          setInsights(res.insights);
        }
        setInsightsRequest({ loading: false, error: null });
      } catch (err) {
        console.error("Failed to fetch insights:", err);
        setInsightsRequest({
          loading: false,
          error: insightErrorMessage
        });
      }
    };
    loadObservations();
  }, [entries]);

  return { statsData, insights, statsRequest, insightsRequest };
}
