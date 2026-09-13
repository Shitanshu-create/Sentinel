import React from 'react';
import { Save, CheckCircle2, AlertCircle } from 'lucide-react';
import AppSidebar from '../../../components/AppSidebar.jsx';
import { useAuth } from '../../auth/hooks/useAuth.js';
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
  const { user } = useAuth();
  const {
    personalDetails,
    setPersonalDetails,
    serviceDetails,
    setServiceDetails,
    currentStatus,
    setCurrentStatus
  } = useProfileForm(user);

  const { save, saveStatus } = useUpdateProfile();

  const handleSave = (e) => {
    e.preventDefault();

    // Clean numeric types before submitting
    const payload = {
      personalDetails: {
        ...personalDetails,
        age: personalDetails.age ? Number(personalDetails.age) : null
      },
      serviceDetails: { ...serviceDetails },
      currentStatus: {
        ...currentStatus,
        estimatedWorkHours: currentStatus.estimatedWorkHours !== '' && currentStatus.estimatedWorkHours !== null
          ? Number(currentStatus.estimatedWorkHours)
          : null,
        lastLeaveDate: currentStatus.lastLeaveDate ? new Date(currentStatus.lastLeaveDate) : null,
        deploymentHistory: (currentStatus.deploymentHistory || []).map(d => ({
          ...d,
          startDate: d.startDate ? new Date(d.startDate) : null,
          endDate: d.endDate ? new Date(d.endDate) : null
        })),
        transferHistory: (currentStatus.transferHistory || []).map(t => ({
          ...t,
          transferDate: t.transferDate ? new Date(t.transferDate) : null
        })),
        trainingCommitments: (currentStatus.trainingCommitments || []).map(tc => ({
          ...tc,
          startDate: tc.startDate ? new Date(tc.startDate) : null,
          endDate: tc.endDate ? new Date(tc.endDate) : null
        }))
      }
    };

    save(payload);
  };

  return (
    <main className="profile-page-container analytics-scroll">
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
        <form onSubmit={handleSave}>
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
            <div>
              {saveStatus.error && (
                <p className="profile-status-msg text-danger" style={{ color: 'var(--color-danger)' }}>
                  <AlertCircle size={16} className="inline mr-1" />
                  {saveStatus.error}
                </p>
              )}
              {saveStatus.success && (
                <p className="profile-status-msg text-success" style={{ color: 'var(--color-success)' }}>
                  <CheckCircle2 size={16} className="inline mr-1" />
                  Profile updated successfully. AI wellness insights will reflect your updated record.
                </p>
              )}
              {!saveStatus.error && !saveStatus.success && (
                <p className="profile-status-msg" style={{ color: 'var(--color-text-muted)' }}>
                  Make changes to your personnel record and click Save to sync.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={saveStatus.loading}
              className="profile-save-btn"
            >
              <Save size={18} strokeWidth={3} />
              {saveStatus.loading ? 'Saving Record...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default ProfilePage;
