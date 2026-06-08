import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function JurisdictionSelector({ selectedId, onChange, isTa }) {
  const [districts, setDistricts] = useState([]);
  const [children, setChildren] = useState([]);
  const [grandChildren, setGrandChildren] = useState([]);
  
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedChild, setSelectedChild] = useState('');
  const [selectedGrandChild, setSelectedGrandChild] = useState('');

  // Fetch districts on mount
  useEffect(() => {
    api.get('/metadata/jurisdictions?level=DISTRICT').then(res => {
      setDistricts(res.data);
    }).catch(err => console.error(err));
  }, []);

  // When a district is selected, fetch its blocks/corporations/constituencies
  useEffect(() => {
    if (selectedDistrict) {
      api.get(`/metadata/jurisdictions?parentId=${selectedDistrict}`).then(res => {
        setChildren(res.data);
        setSelectedChild('');
        setGrandChildren([]);
        setSelectedGrandChild('');
        
        const distObj = districts.find(d => d.id === selectedDistrict);
        onChange(selectedDistrict, res.data.length === 0, distObj);
      }).catch(err => console.error(err));
    }
  }, [selectedDistrict]);

  // When a child (e.g. Corporation, Zone, Block) is selected, fetch wards or sub-zones
  useEffect(() => {
    if (selectedChild) {
      api.get(`/metadata/jurisdictions?parentId=${selectedChild}`).then(res => {
        setGrandChildren(res.data);
        setSelectedGrandChild('');
        
        const childObj = children.find(c => c.id === selectedChild);
        onChange(selectedChild, res.data.length === 0, childObj);
      }).catch(err => console.error(err));
    }
  }, [selectedChild]);

  useEffect(() => {
    if (selectedGrandChild) {
       const grandChildObj = grandChildren.find(g => g.id === selectedGrandChild);
       onChange(selectedGrandChild, true, grandChildObj);
    }
  }, [selectedGrandChild]);

  return (
    <div className="space-y-3">
      {/* District Dropdown */}
      <div className="space-y-1">
        <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block">
          District
        </label>
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 outline-none px-3 py-2.5 rounded-xl text-slate-700 font-extrabold text-xs shadow-sm cursor-pointer focus:border-[#8B1A1A] transition-all"
        >
          <option value="">-- Select District --</option>
          {districts.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Child Dropdown (Block / Corporation / Constituency) */}
      {children.length > 0 && (
        <div className="space-y-1">
          <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block">
            Sub-Jurisdiction (Block/Corp/Constituency)
          </label>
          <select
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 outline-none px-3 py-2.5 rounded-xl text-slate-700 font-extrabold text-xs shadow-sm cursor-pointer focus:border-[#8B1A1A] transition-all"
          >
            <option value="">-- Select Sub-Jurisdiction --</option>
            {children.map(c => (
              <option key={c.id} value={c.id}>{c.level}: {c.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* GrandChild Dropdown (Ward / Zone) */}
      {grandChildren.length > 0 && (
        <div className="space-y-1">
          <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block">
            Ward / Zone
          </label>
          <select
            value={selectedGrandChild}
            onChange={(e) => setSelectedGrandChild(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 outline-none px-3 py-2.5 rounded-xl text-slate-700 font-extrabold text-xs shadow-sm cursor-pointer focus:border-[#8B1A1A] transition-all"
          >
            <option value="">-- Select Ward/Zone --</option>
            {grandChildren.map(g => (
              <option key={g.id} value={g.id}>{g.level}: {g.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
