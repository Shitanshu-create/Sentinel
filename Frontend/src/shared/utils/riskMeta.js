export function getRiskMeta(riskLevel) {
  switch (riskLevel) {
    case 'critical':
      return {
        title: 'Critical Risk Level',
        badge: 'Critical',
        color: 'var(--color-danger)',
        bg: 'color-mix(in srgb, var(--color-danger) 15%, var(--color-surface))',
        desc: 'Sustained severe fatigue and stress detected. Recommend immediate rest and welfare review.'
      };
    case 'high':
      return {
        title: 'High Risk Level',
        badge: 'High',
        color: 'var(--color-warning)',
        bg: 'color-mix(in srgb, var(--color-warning) 15%, var(--color-surface))',
        desc: 'Elevated stress trends observed over consecutive duty shifts. Preemptive intervention advised.'
      };
    case 'elevated':
      return {
        title: 'Elevated Risk Level',
        badge: 'Elevated',
        color: 'var(--color-warning)',
        bg: 'color-mix(in srgb, var(--color-warning) 15%, var(--color-surface))',
        desc: 'Mild fatigue cues present. Monitor workload schedule and ensure routine rest cycles.'
      };
    case 'normal':
    default:
      return {
        title: 'Normal Status',
        badge: 'Normal',
        color: 'var(--color-success)',
        bg: 'color-mix(in srgb, var(--color-success) 15%, var(--color-surface))',
        desc: 'Personnel indicators are balanced. Standard operational readiness maintained.'
      };
  }
}
