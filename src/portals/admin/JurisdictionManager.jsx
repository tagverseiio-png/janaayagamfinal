import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Plus, Edit2, Trash2, ChevronRight, FolderTree } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';

export default function JurisdictionManager() {
  const { lang } = useLanguage();
  const isTa = lang === 'ta';
  
  const [districts, setDistricts] = useState([]);
  const [children, setChildren] = useState([]);
  const [grandChildren, setGrandChildren] = useState([]);
  
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedGrandChild, setSelectedGrandChild] = useState(null);
  
  const [loading, setLoading] = useState(false);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeParentForAdd, setActiveParentForAdd] = useState(null); // null means adding District
  const [editingNode, setEditingNode] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', level: 'DISTRICT' });

  const fetchDistricts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/metadata/jurisdictions?level=DISTRICT');
      setDistricts(res.data);
    } catch (err) {
      toast.error('Failed to fetch districts');
    } finally {
      setLoading(false);
    }
  };

  const fetchChildren = async (parentId) => {
    try {
      const res = await api.get(`/metadata/jurisdictions?parentId=${parentId}`);
      return res.data;
    } catch (err) {
      toast.error('Failed to fetch sub-jurisdictions');
      return [];
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, []);

  const handleSelectDistrict = async (dist) => {
    setSelectedDistrict(dist);
    setSelectedChild(null);
    setSelectedGrandChild(null);
    setGrandChildren([]);
    const data = await fetchChildren(dist.id);
    setChildren(data);
  };

  const handleSelectChild = async (child) => {
    setSelectedChild(child);
    setSelectedGrandChild(null);
    const data = await fetchChildren(child.id);
    setGrandChildren(data);
  };

  const handleDelete = async (node, levelType) => {
    if (!window.confirm(`Are you sure you want to delete ${node.name}?`)) return;
    try {
      await api.delete(`/metadata/jurisdictions/${node.id}`);
      toast.success('Jurisdiction deleted successfully');
      
      // Refresh appropriately
      if (levelType === 'DISTRICT') {
        setSelectedDistrict(null);
        fetchDistricts();
      } else if (levelType === 'CHILD') {
        setSelectedChild(null);
        const data = await fetchChildren(selectedDistrict.id);
        setChildren(data);
      } else if (levelType === 'GRANDCHILD') {
        const data = await fetchChildren(selectedChild.id);
        setGrandChildren(data);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete jurisdiction');
    }
  };

  const openAddModal = (parent, suggestedLevel) => {
    setActiveParentForAdd(parent);
    setFormData({ name: '', level: suggestedLevel });
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/metadata/jurisdictions', {
        name: formData.name,
        level: formData.level,
        parentId: activeParentForAdd ? activeParentForAdd.id : null
      });
      toast.success('Jurisdiction added successfully');
      setShowAddModal(false);
      
      if (!activeParentForAdd) {
        fetchDistricts();
      } else if (activeParentForAdd.id === selectedDistrict?.id) {
        const data = await fetchChildren(selectedDistrict.id);
        setChildren(data);
      } else if (activeParentForAdd.id === selectedChild?.id) {
        const data = await fetchChildren(selectedChild.id);
        setGrandChildren(data);
      }
    } catch (err) {
      toast.error('Failed to add jurisdiction');
    }
  };

  const openEditModal = (node) => {
    setEditingNode(node);
    setFormData({ name: node.name, level: node.level });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/metadata/jurisdictions/${editingNode.id}`, {
        name: formData.name,
        level: formData.level,
        parentId: editingNode.parentId
      });
      toast.success('Jurisdiction updated successfully');
      setShowEditModal(false);
      
      if (editingNode.level === 'DISTRICT') fetchDistricts();
      else if (selectedDistrict && editingNode.parentId === selectedDistrict.id) {
        const data = await fetchChildren(selectedDistrict.id);
        setChildren(data);
      } else if (selectedChild && editingNode.parentId === selectedChild.id) {
        const data = await fetchChildren(selectedChild.id);
        setGrandChildren(data);
      }
    } catch (err) {
      toast.error('Failed to update jurisdiction');
    }
  };

  const ListPanel = ({ title, items, selectedItem, onSelect, onDelete, onEdit, onAdd, addLabel, suggestedLevel }) => (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h3 className="font-black text-slate-800">{title}</h3>
        {onAdd && (
          <button onClick={() => onAdd(suggestedLevel)} className="p-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-600 transition" title={addLabel}>
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {items.length === 0 ? (
          <div className="text-center p-4 text-sm text-slate-400 font-bold">No records found.</div>
        ) : (
          items.map(item => (
            <div 
              key={item.id} 
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${selectedItem?.id === item.id ? 'bg-[#8B1A1A]/5 border-[#8B1A1A] shadow-sm' : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'}`}
              onClick={() => onSelect && onSelect(item)}
            >
              <div>
                <div className={`font-bold text-sm ${selectedItem?.id === item.id ? 'text-[#8B1A1A]' : 'text-slate-700'}`}>{item.name}</div>
                {item.level !== 'DISTRICT' && item.level !== 'WARD' && (
                  <div className="text-[10px] font-black text-slate-400 tracking-wider uppercase mt-0.5">{item.level}</div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(item); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
                {onSelect && <ChevronRight className={`w-4 h-4 ml-1 ${selectedItem?.id === item.id ? 'text-[#8B1A1A]' : 'text-slate-300'}`} />}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FolderTree className="w-5 h-5 text-[#8B1A1A]" />
        <div>
          <h2 className="text-lg font-black text-slate-800">Jurisdiction Management Tree</h2>
          <p className="text-xs text-slate-500 font-bold">Add or remove Locations natively. Do not delete jurisdictions that have active users or tickets.</p>
        </div>
      </div>

      <div className="flex gap-4">
        <ListPanel 
          title="1. Districts" 
          items={districts} 
          selectedItem={selectedDistrict} 
          onSelect={handleSelectDistrict}
          onDelete={(node) => handleDelete(node, 'DISTRICT')}
          onEdit={openEditModal}
          onAdd={() => openAddModal(null, 'DISTRICT')}
          addLabel="Add District"
        />

        {selectedDistrict && (
          <ListPanel 
            title={`2. Blocks/Corporations in ${selectedDistrict.name}`} 
            items={children} 
            selectedItem={selectedChild} 
            onSelect={handleSelectChild}
            onDelete={(node) => handleDelete(node, 'CHILD')}
            onEdit={openEditModal}
            onAdd={(level) => openAddModal(selectedDistrict, level)}
            addLabel="Add Sub-Jurisdiction"
            suggestedLevel="CORPORATION"
          />
        )}

        {selectedChild && (
          <ListPanel 
            title={`3. Wards/Zones in ${selectedChild.name}`} 
            items={grandChildren} 
            selectedItem={selectedGrandChild} 
            onSelect={setSelectedGrandChild} // No deep select needed
            onDelete={(node) => handleDelete(node, 'GRANDCHILD')}
            onEdit={openEditModal}
            onAdd={(level) => openAddModal(selectedChild, level)}
            addLabel="Add Ward"
            suggestedLevel="WARD"
          />
        )}
      </div>

      {/* MODALS */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-[400px] p-6 shadow-xl">
            <h3 className="text-lg font-black text-slate-800 mb-4">{showAddModal ? 'Add Jurisdiction' : 'Edit Jurisdiction'}</h3>
            <form onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Level</label>
                <select 
                  value={formData.level} 
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm font-bold outline-none"
                >
                  <option value="STATE">State</option>
                  <option value="LOK_SABHA">Lok Sabha</option>
                  <option value="CONSTITUENCY">Assembly Constituency</option>
                  <option value="DISTRICT">District</option>
                  <option value="CORPORATION">Corporation</option>
                  <option value="MUNICIPALITY">Municipality</option>
                  <option value="BLOCK">Block</option>
                  <option value="ZONE">Zone</option>
                  <option value="WARD">Ward</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Ward 1"
                  className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-[#8B1A1A]"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => {setShowAddModal(false); setShowEditModal(false);}} className="flex-1 bg-slate-100 text-slate-600 font-bold py-2.5 rounded-xl hover:bg-slate-200">Cancel</button>
                <button type="submit" className="flex-1 bg-[#8B1A1A] text-white font-bold py-2.5 rounded-xl hover:bg-red-900">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
