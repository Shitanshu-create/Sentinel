import React, { useEffect } from 'react';
import { Save, CheckCircle2, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';
import AppSidebar from '../../../components/AppSidebar.jsx';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { getMe } from '../../auth/services/auth.api.js';
import { useProfileForm } from '../hooks/useProfileForm.js';
import { useUpdateProfile } from '../hooks/useUpdateProfile.js';
import { ProfileHeaderCard } from '../components/ProfileHeaderCard.jsx';
import { PersonalDetailsSection } from '../components/PersonalDetailsSection.jsx';
import { ServiceDetailsSection } from '../components/ServiceDetailsSection.jsx';
import { CurrentStatusSection } from '../components/CurrentStatusSection.jsx';
import { DeploymentHistoryPanel } from '../components/DeploymentHistoryPanel.jsx';
import { TransferHistoryPanel } from '../components/TransferHistoryPanel.jsx';
import { TrainingCommitmentsPanel } from '../components/TrainingCommitmentsPanel.jsx';
import '../styles/profile.css';

export function ProfilePage({
  onLogout,
  onOpenWriting,
  onOpenChat,
  onOpenAnalytics,
  onOpenAssessments,
  onOpenProfile,
  pendingAssessments
}) {
  const { user, setUser } = useAuth();
  const {
    personalDetails,
    setPersonalDetails,
    serviceDetails,
    setServiceDetails,
    currentStatus,
    setCurrentStatus
  } = useProfileForm(user);

  const { save, saveStatus } = useUpdateProfile();

  // Ensure fresh user record from database on mount
  useEffect(() => {
    let isMounted = true;
    getMe().then((res) => {
      if (isMounted && res?.user && typeof setUser === 'function') {
        setUser(res.user);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [setUser]);

  const handleSave = (e) => {
    e.preventDefault();

    const parseDate = (val) => {
      if (!val) return null;
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    };

    // Clean data before submitting to prevent Zod 400 Bad Request
    const payload = {
      personalDetails: {
        name: personalDetails.name?.trim() || null,
        age: personalDetails.age !== '' && personalDetails.age !== null && personalDetails.age !== undefined
          ? Number(personalDetails.age)
          : null,
        gender: personalDetails.gender || null,
        phoneNo: personalDetails.phoneNo?.trim() || null
      },
      serviceDetails: {
        force: serviceDetails.force?.trim() || null,
        unit: serviceDetails.unit?.trim() || null,
        rank: serviceDetails.rank?.trim() || null,
        jobType: serviceDetails.jobType?.trim() || null
      },
      currentStatus: {
        postingLocation: currentStatus.postingLocation?.trim() || null,
        estimatedWorkHours: currentStatus.estimatedWorkHours !== '' && currentStatus.estimatedWorkHours !== null && currentStatus.estimatedWorkHours !== undefined
          ? Number(currentStatus.estimatedWorkHours)
          : null,
        lastLeaveDate: parseDate(currentStatus.lastLeaveDate),
        dutySchedule: currentStatus.dutySchedule?.trim() || null,
        deploymentHistory: (currentStatus.deploymentHistory || []).map((d) => ({
          location: d.location?.trim() || null,
          startDate: parseDate(d.startDate),
          endDate: parseDate(d.endDate)
        })),
        transferHistory: (currentStatus.transferHistory || []).map((t) => ({
          fromUnit: t.fromUnit?.trim() || null,
          toUnit: t.toUnit?.trim() || null,
          location: t.location?.trim() || null,
          transferDate: parseDate(t.transferDate)
        })),
        trainingCommitments: (currentStatus.trainingCommitments || []).map((tc) => ({
          name: tc.name?.trim() || null,
          startDate: parseDate(tc.startDate),
          endDate: parseDate(tc.endDate)
        })),
        workloadLevel: currentStatus.workloadLevel || null,
        workloadNotes: currentStatus.workloadNotes?.trim() || null
      }
    };

    save(payload);
  };

  return (
    <main className="profile-page-container analytics-scroll">
      <div className="profile-flex-wrapper">
        <AppSidebar
          active="profile"
          onOpenWriting={onOpenWriting}
          onOpenChat={onOpenChat}
          onOpenAnalytics={onOpenAnalytics}
          onOpenAssessments={onOpenAssessments}
          onOpenProfile={onOpenProfile}
          pendingAssessments={pendingAssessments}
          onLogout={onLogout}
        />

        <section className="profile-section">
          <div className="profile-page-header">
            <div className="profile-page-badge">
              <ShieldCheck size={14} />
              <span>SENTINEL OPERATIONAL RECORD</span>
            </div>
            <h1 className="profile-page-title">Personnel Dossier</h1>
            <p className="profile-page-subtitle">
              Manage personal identification, force hierarchy, mission postings, and workload telemetry.
            </p>
          </div>

          <form onSubmit={handleSave} className="profile-form">
            <ProfileHeaderCard user={user} />

            <PersonalDetailsSection
              data={personalDetails}
              setData={setPersonalDetails}
            />

            <ServiceDetailsSection
              data={serviceDetails}
              setData={setServiceDetails}
            />

            <CurrentStatusSection
              data={currentStatus}
              setData={setCurrentStatus}
            />

            <DeploymentHistoryPanel
              deploymentHistory={currentStatus.deploymentHistory || []}
              setDeploymentHistory={(v) =>
                setCurrentStatus((p) => ({ ...p, deploymentHistory: v }))
              }
            />

            <TransferHistoryPanel
              transferHistory={currentStatus.transferHistory || []}
              setTransferHistory={(v) =>
                setCurrentStatus((p) => ({ ...p, transferHistory: v }))
              }
            />

            <TrainingCommitmentsPanel
              trainingCommitments={currentStatus.trainingCommitments || []}
              setTrainingCommitments={(v) =>
                setCurrentStatus((p) => ({ ...p, trainingCommitments: v }))
              }
            />

            <div className="profile-submit-footer">
              <div className="profile-footer-status">
                {saveStatus.error && (
                  <p className="profile-status-msg profile-msg-danger">
                    <AlertCircle size={16} className="inline-icon" />
                    {saveStatus.error}
                  </p>
                )}
                {saveStatus.success && (
                  <p className="profile-status-msg profile-msg-success">
                    <CheckCircle2 size={16} className="inline-icon" />
                    Profile updated successfully. Telemetry and AI health insights synchronized.
                  </p>
                )}
                {!saveStatus.error && !saveStatus.success && (
                  <p className="profile-status-msg profile-msg-neutral">
                    Make changes to your personnel record and click Save to sync with Sentinel.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={saveStatus.loading}
                className="profile-save-btn"
              >
                {saveStatus.loading ? (
                  <>
                    <Loader2 size={18} className="profile-spinner" />
                    <span>Saving Record...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} strokeWidth={2.5} />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default ProfilePage;
