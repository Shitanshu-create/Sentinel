import { useMemo, useState, useEffect } from 'react';

export function useObservations(insights) {
  const [expandedObservation, setExpandedObservation] = useState('Pattern');
  const [doneAdvice, setDoneAdvice] = useState([]);
  const [dismissedAdvice, setDismissedAdvice] = useState([]);

  const activeObservations = useMemo(() => {
    if (insights?.observations && insights.observations.length > 0) {
      return insights.observations.map(o => [o.tag, o.text]);
    }
    return [];
  }, [insights?.observations]);

  useEffect(() => {
    if (activeObservations.length > 0) {
      setExpandedObservation(activeObservations[0][0]);
    }
  }, [activeObservations]);

  const activeAdvice = useMemo(() => {
    const list = insights?.welfareRecommendations || insights?.advices;
    if (list && list.length > 0) {
      return list.map(a => [a.category, a.title, a.body, a.action]);
    }
    return [];
  }, [insights?.welfareRecommendations, insights?.advices]);

  const visibleAdvice = activeAdvice.filter((item) => !dismissedAdvice.includes(item[1]));

  return {
    activeObservations,
    activeAdvice,
    visibleAdvice,
    expandedObservation,
    setExpandedObservation,
    doneAdvice,
    setDoneAdvice,
    dismissedAdvice,
    setDismissedAdvice
  };
}
