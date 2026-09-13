import { useState } from 'react';
import { updateProfile } from '../services/profile.api.js';
import { useAuth } from '../../auth/hooks/useAuth.js';

export function useUpdateProfile() {
  const { setUser } = useAuth();
  const [saveStatus, setSaveStatus] = useState({ loading: false, error: null, success: false });

  const save = async (payload) => {
    try {
      setSaveStatus({ loading: true, error: null, success: false });
      const res = await updateProfile(payload);
      if (res.user) {
        setUser(res.user);
      }
      setSaveStatus({ loading: false, error: null, success: true });
    } catch (err) {
      setSaveStatus({
        loading: false,
        error: err.response?.data?.message || err.message || 'Failed to update profile',
        success: false
      });
    }
  };

  return { save, saveStatus };
}
