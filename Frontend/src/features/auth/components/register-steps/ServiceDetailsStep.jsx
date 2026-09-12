import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export function ServiceDetailsStep({ data, updateData, onNext, onBack }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-form-row">
        <label className="auth-label">
          Rank / Designation
          <select
            value={data.rank || ''}
            onChange={(e) => updateData({ rank: e.target.value })}
            className="auth-input"
          >
            <option value="">Select Rank / Designation</option>
            <optgroup label="◈ CENTRAL ARMED POLICE FORCES (CAPF)">
              <option value="Constable">Constable</option>
              <option value="Head Constable">Head Constable</option>
              <option value="Assistant Sub-Inspector (ASI)">Assistant Sub-Inspector (ASI)</option>
              <option value="Sub-Inspector (SI)">Sub-Inspector (SI)</option>
              <option value="Inspector">Inspector</option>
              <option value="Assistant Commandant (AC)">Assistant Commandant (AC)</option>
              <option value="Deputy Commandant (DC)">Deputy Commandant (DC)</option>
              <option value="Commandant">Commandant</option>
            </optgroup>
            <optgroup label="◈ INDIAN ARMED FORCES (ARMY / NAVY / AIR FORCE)">
              <option value="Sepoy / Rifleman / Jawan">Sepoy / Rifleman / Jawan</option>
              <option value="Lance Naik">Lance Naik</option>
              <option value="Naik">Naik</option>
              <option value="Havildar">Havildar</option>
              <option value="Naib Subedar">Naib Subedar</option>
              <option value="Subedar">Subedar</option>
              <option value="Subedar Major">Subedar Major</option>
              <option value="Lieutenant">Lieutenant</option>
              <option value="Captain">Captain</option>
              <option value="Major">Major</option>
              <option value="Lieutenant Colonel">Lieutenant Colonel</option>
              <option value="Colonel">Colonel</option>
            </optgroup>
            <optgroup label="◈ OTHER CATEGORIES">
              <option value="Other / Civilian Staff">Other / Civilian Staff</option>
            </optgroup>
          </select>
        </label>

        <label className="auth-label">
          Job Role / Duty Type
          <select
            value={data.role || ''}
            onChange={(e) => updateData({ role: e.target.value })}
            className="auth-input"
          >
            <option value="">Select Job Role / Duty Type</option>
            <optgroup label="◈ CORE & FIELD ROLES">
              <option value="General Duty">General Duty</option>
              <option value="Combat Arms / Infantry">Combat Arms / Infantry</option>
              <option value="Quick Reaction Team (QRT) / Commando">Quick Reaction Team (QRT) / Commando</option>
              <option value="Armored / Artillery">Armored / Artillery</option>
            </optgroup>
            <optgroup label="◈ TECHNICAL & SPECIALIST ROLES">
              <option value="Communications / Radio Operator">Communications / Radio Operator</option>
              <option value="Technical / Signals">Technical / Signals</option>
              <option value="Intelligence & Surveillance">Intelligence & Surveillance</option>
              <option value="Field Engineer (Sappers)">Field Engineer (Sappers)</option>
              <option value="Weapons Specialist / Armorer (EME)">Weapons Specialist / Armorer (EME)</option>
            </optgroup>
            <optgroup label="◈ SUPPORT & SERVICES">
              <option value="Driver">Driver</option>
              <option value="Medical / Nursing">Medical / Nursing</option>
              <option value="Logistics & Supply / ASC">Logistics & Supply</option>
              <option value="Administration & Staff">Administration & Staff</option>
              <option value="Other Duty Role">Other Duty Role</option>
            </optgroup>
          </select>
        </label>
      </div>

      <div className="auth-form-row">
        <label className="auth-label">
          Unit / Battalion
          <select
            value={data.unit || ''}
            onChange={(e) => updateData({ unit: e.target.value })}
            className="auth-input"
          >
            <option value="">Select Unit / Battalion</option>
            <optgroup label="◈ CENTRAL ARMED POLICE FORCES (CAPF)">
              <option value="1st Battalion, CRPF">1st Battalion, CRPF</option>
              <option value="88th Battalion, CRPF">88th Battalion, CRPF</option>
              <option value="1st Battalion, BSF">1st Battalion, BSF</option>
              <option value="1st Battalion, ITBP">1st Battalion, ITBP</option>
              <option value="1st Battalion, SSB">1st Battalion, SSB</option>
              <option value="1st Battalion, CISF">1st Battalion, CISF</option>
              <option value="Assam Rifles">Assam Rifles</option>
              <option value="National Security Guard (NSG)">National Security Guard (NSG)</option>
            </optgroup>
            <optgroup label="◈ INDIAN ARMY REGIMENTS & FORMATIONS">
              <option value="Rajputana Rifles">Rajputana Rifles</option>
              <option value="Sikh Regiment">Sikh Regiment</option>
              <option value="Parachute Regiment (Special Forces)">Parachute Regiment (Special Forces)</option>
              <option value="Gorkha Rifles">Gorkha Rifles</option>
              <option value="Dogra Regiment">Dogra Regiment</option>
              <option value="Madras Regiment">Madras Regiment</option>
              <option value="Rashtriya Rifles (RR)">Rashtriya Rifles (RR)</option>
              <option value="Corps of Military Police (CMP)">Corps of Military Police (CMP)</option>
              <option value="Headquarters / Base Formation">Headquarters / Base Formation</option>
            </optgroup>
            <optgroup label="◈ OTHER FORMATIONS">
              <option value="Other Unit / Battalion">Other Unit / Battalion</option>
            </optgroup>
          </select>
        </label>

        <label className="auth-label">
          Department / Force Branch
          <select
            value={data.department || ''}
            onChange={(e) => updateData({ department: e.target.value })}
            className="auth-input"
          >
            <option value="">Select Department / Force Branch</option>
            <optgroup label="◈ OPERATIONS & COMBAT">
              <option value="Operations">Operations</option>
              <option value="Counter-Insurgency & Anti-Terrorism">Counter-Insurgency & Anti-Terrorism</option>
              <option value="Rapid Action Force (RAF)">Rapid Action Force (RAF)</option>
              <option value="Border Security & Vigilance">Border Security & Vigilance</option>
            </optgroup>
            <optgroup label="◈ INTELLIGENCE & SIGNALS">
              <option value="Intelligence">Intelligence</option>
              <option value="Communications / Signals">Communications / Signals</option>
              <option value="Military Intelligence (MI)">Military Intelligence (MI)</option>
              <option value="Cyber Operations & EW">Cyber Operations & EW</option>
            </optgroup>
            <optgroup label="◈ ADMINISTRATION & SERVICES">
              <option value="Administration">Administration</option>
              <option value="Training">Training</option>
              <option value="Logistics & Ordnance (AOC)">Logistics & Ordnance</option>
              <option value="Corps of Engineers (MES)">Corps of Engineers (MES)</option>
              <option value="Medical Services / AMC">Medical Services / AMC</option>
              <option value="Provost & Security">Provost & Security</option>
            </optgroup>
            <optgroup label="◈ OTHER BRANCHES">
              <option value="Other Force Branch">Other Force Branch</option>
            </optgroup>
          </select>
        </label>
      </div>

      <div className="auth-button-group">
        <button type="button" onClick={onBack} className="auth-secondary-btn">
          <ArrowLeft size={16} strokeWidth={3} />
          Back
        </button>
        <button type="submit" className="auth-submit-btn">
          Next: Status
          <ArrowRight size={16} strokeWidth={3} />
        </button>
      </div>
    </form>
  );
}
