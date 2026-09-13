import { useState, useEffect } from 'react';

function toDateInput(val) {
  if (!val) return '';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

export function useProfileForm(user) {
  const [personalDetails, setPersonalDetails] = useState({
    name: '',
    age: '',
    gender: '',
    phoneNo: ''
  });

  const [serviceDetails, setServiceDetails] = useState({
    rank: '',
    jobType: '',
    unit: '',
    force: ''
  });

  const [currentStatus, setCurrentStatus] = useState({
    postingLocation: '',
    estimatedWorkHours: '',
    lastLeaveDate: '',
    dutySchedule: '',
    deploymentHistory: [],
    transferHistory: [],
    trainingCommitments: [],
    workloadLevel: '',
    workloadNotes: ''
  });

  useEffect(() => {
    if (!user) return;

    setPersonalDetails({
      name: user.personalDetails?.name || '',
      age: user.personalDetails?.age !== undefined && user.personalDetails?.age !== null ? user.personalDetails.age : '',
      gender: user.personalDetails?.gender || '',
      phoneNo: user.personalDetails?.phoneNo || ''
    });

    setServiceDetails({
      rank: user.serviceDetails?.rank || '',
      jobType: user.serviceDetails?.jobType || '',
      unit: user.serviceDetails?.unit || '',
      force: user.serviceDetails?.force || ''
    });

    const status = user.currentStatus || {};
    setCurrentStatus({
      postingLocation: status.postingLocation || '',
      estimatedWorkHours: status.estimatedWorkHours !== undefined && status.estimatedWorkHours !== null ? status.estimatedWorkHours : '',
      lastLeaveDate: toDateInput(status.lastLeaveDate),
      dutySchedule: status.dutySchedule || '',
      deploymentHistory: (status.deploymentHistory || []).map(d => ({
        location: d.location || '',
        startDate: toDateInput(d.startDate),
        endDate: toDateInput(d.endDate)
      })),
      transferHistory: (status.transferHistory || []).map(t => ({
        fromUnit: t.fromUnit || '',
        toUnit: t.toUnit || '',
        location: t.location || '',
        transferDate: toDateInput(t.transferDate)
      })),
      trainingCommitments: (status.trainingCommitments || []).map(tc => ({
        name: tc.name || '',
        startDate: toDateInput(tc.startDate),
        endDate: toDateInput(tc.endDate)
      })),
      workloadLevel: status.workloadLevel || '',
      workloadNotes: status.workloadNotes || ''
    });
  }, [user]);

  return {
    personalDetails,
    setPersonalDetails,
    serviceDetails,
    setServiceDetails,
    currentStatus,
    setCurrentStatus
  };
}
