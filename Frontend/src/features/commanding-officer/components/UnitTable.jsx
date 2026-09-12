import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { Panel } from '../../analytics/components/Panel.jsx';
import { UnitRow } from './UnitRow.jsx';

export function UnitTable({ units }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

  const filteredUnits = useMemo(() => {
    return (units || []).filter((u) => {
      const matchesSearch = u.unit.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = riskFilter === 'all' || (u.worstCaseRiskLevel || 'normal') === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [units, searchTerm, riskFilter]);

  if (!units || units.length === 0) {
    return (
      <Panel padding="p-5" className="roster-empty-panel">
        <p className="obs-desc">No units found under your department.</p>
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
            placeholder="Search units by name..."
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
            <option value="critical">Critical Risk</option>
            <option value="high">High Risk</option>
            <option value="elevated">Elevated Risk</option>
            <option value="normal">Normal Status</option>
          </select>
        </div>
      </div>

      <div className="roster-table">
        {filteredUnits.length > 0 ? (
          filteredUnits.map((u) => (
            <UnitRow
              key={u.unit}
              unitData={u}
              onClick={() => navigate(`/commanding-officer/units/${encodeURIComponent(u.unit)}`)}
            />
          ))
        ) : (
          <div className="roster-no-match">
            <p className="obs-desc">No units matching search criteria.</p>
          </div>
        )}
      </div>
    </Panel>
  );
}
