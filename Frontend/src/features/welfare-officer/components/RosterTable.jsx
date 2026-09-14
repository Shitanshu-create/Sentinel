import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { Panel } from '../../analytics/components/Panel.jsx';
import { RosterRow } from './RosterRow.jsx';

export function RosterTable({ roster }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('stress-desc');

  const filteredRoster = useMemo(() => {
    return (roster || []).filter((person) => {
      const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (person.rank && person.rank.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesRisk = riskFilter === 'all' || (person.stats?.wellnessRiskLevel || 'normal') === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [roster, searchTerm, riskFilter]);

  const sortedRoster = useMemo(() => {
    const list = [...filteredRoster];
    list.sort((a, b) => {
      const aStress = a.stats?.currentStressStatus ?? 0;
      const bStress = b.stats?.currentStressStatus ?? 0;
      if (sortOrder === 'stress-desc') {
        return bStress - aStress;
      }
      if (sortOrder === 'stress-asc') {
        return aStress - bStress;
      }
      return (a.name || '').localeCompare(b.name || '');
    });
    return list;
  }, [filteredRoster, sortOrder]);

  if (!roster || roster.length === 0) {
    return (
      <Panel padding="p-5" className="roster-empty-panel">
        <p className="obs-desc">No personnel found in your assigned unit roster yet.</p>
      </Panel>
    );
  }

  return (
    <Panel className="roster-table-panel" padding="p-0">
      <div className="roster-toolbar">
        <div className="roster-search-box">
          <Search size={16} className="roster-search-icon" />
          <input
            type="text"
            placeholder="Search personnel by name or rank..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="roster-search-input"
          />
        </div>

        <div className="roster-filter-group">
          <Filter size={15} className="roster-filter-icon" />
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="roster-filter-select"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Risk Only</option>
            <option value="elevated">Elevated Only</option>
            <option value="normal">Normal Status</option>
          </select>
        </div>

        <div className="roster-filter-group">
          <ArrowUpDown size={15} className="roster-filter-icon" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="roster-filter-select"
          >
            <option value="stress-desc">Highest Stress First</option>
            <option value="stress-asc">Lowest Stress First</option>
            <option value="name-asc">Name (A-Z)</option>
          </select>
        </div>
      </div>

      <div className="roster-table">
        {sortedRoster.length > 0 ? (
          sortedRoster.map((person) => (
            <RosterRow
              key={person.id}
              person={person}
              onClick={() => navigate(`/welfare-officer/personnel/${person.id}`)}
            />
          ))
        ) : (
          <div className="roster-no-match">
            <p className="obs-desc">No personnel matching search criteria.</p>
          </div>
        )}
      </div>
    </Panel>
  );
}

export default RosterTable;
