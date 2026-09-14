import React, { useState, useMemo } from 'react';
import { Search, Filter, ClipboardList, Plus } from 'lucide-react';
import OfficerSidebar from '../components/OfficerSidebar.jsx';
import { OfficerAssessmentRow } from '../components/OfficerAssessmentRow.jsx';
import { AssignAssessmentModal } from '../components/AssignAssessmentModal.jsx';
import { useOfficerAssessments } from '../hooks/useOfficerAssessments.js';
import { Panel } from '../../analytics/components/Panel.jsx';
import '../styles/welfareOfficer.css';

export function OfficerAssessmentsPage({ onLogout }) {
  const { assessments, assessmentsRequest, reload } = useOfficerAssessments();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPersonnelId, setSelectedPersonnelId] = useState(null);

  const filteredAssessments = useMemo(() => {
    return (assessments || []).filter((a) => {
      const name = a.personnelId?.personalDetails?.name || a.personnelId?.username || '';
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [assessments, searchTerm, statusFilter]);

  const handleOpenAssignModal = (personnelId = null) => {
    setSelectedPersonnelId(personnelId);
    setIsModalOpen(true);
  };

  return (
    <main className="officer-page-container analytics-scroll">
      <div className="officer-flex-wrapper">
        <OfficerSidebar onLogout={onLogout} />
        <section className="officer-section">
          <div className="officer-content-wrapper">
            <div className="officer-header-row">
              <div>
                <h1 className="officer-page-title">Wellness Assessments Log</h1>
                <p className="unit-summary-sub">
                  Targeted welfare questionnaires, direct personnel responses, and AI stress evaluations
                </p>
              </div>
              <button
                type="button"
                className="officer-assign-new-btn"
                onClick={() => handleOpenAssignModal(null)}
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Assign New Assessment</span>
              </button>
            </div>

            {assessmentsRequest.loading && (
              <p className="obs-desc">Loading wellness assessments...</p>
            )}

            {assessmentsRequest.error && (
              <p className="obs-desc" style={{ color: 'var(--color-danger)' }}>
                {assessmentsRequest.error}
              </p>
            )}

            {!assessmentsRequest.loading && !assessmentsRequest.error && (
              <>
                <Panel className="roster-table-panel" padding="p-0">
                  <div className="roster-toolbar">
                    <div className="roster-search-box">
                      <Search size={16} className="roster-search-icon" />
                      <input
                        type="text"
                        placeholder="Search assessments by personnel name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="roster-search-input"
                      />
                    </div>

                    <div className="roster-filter-group">
                      <Filter size={15} className="roster-filter-icon" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="roster-filter-select"
                      >
                        <option value="all">All Assessments</option>
                        <option value="completed">Completed Only</option>
                        <option value="assigned">Pending Response</option>
                      </select>
                    </div>
                  </div>
                </Panel>

                <div className="officer-assessments-list">
                  {filteredAssessments.length > 0 ? (
                    filteredAssessments.map((a) => (
                      <OfficerAssessmentRow
                        key={a._id}
                        assessment={a}
                        onAssignNew={handleOpenAssignModal}
                      />
                    ))
                  ) : (
                    <Panel padding="p-5" className="roster-empty-panel">
                      <div className="roster-empty-content">
                        <p className="obs-desc">
                          {assessments.length === 0
                            ? "No assessments assigned yet. Assign a targeted questionnaire to begin welfare monitoring."
                            : "No assessments match the selected search or filter."}
                        </p>
                        <button
                          type="button"
                          className="officer-assign-new-btn officer-empty-btn"
                          onClick={() => handleOpenAssignModal(null)}
                        >
                          <Plus size={16} strokeWidth={2.5} />
                          <span>Assign New Assessment</span>
                        </button>
                      </div>
                    </Panel>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      <AssignAssessmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAssigned={reload}
        initialPersonnelId={selectedPersonnelId}
      />
    </main>
  );
}

export default OfficerAssessmentsPage;
