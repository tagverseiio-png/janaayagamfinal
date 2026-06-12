import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { UserPlus, Trash2, Users, Shield, ArrowLeft, Map, Briefcase } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'sonner';
import JurisdictionSelector from '../../shared/components/JurisdictionSelector';
import JurisdictionManager from './JurisdictionManager';

export default function AdminDashboard() {
  const { lang } = useLanguage();
  const isTa = lang === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('EMPLOYEES'); // 'EMPLOYEES' | 'JURISDICTIONS'

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [categories, setCategories] = useState(['Elected Representative', 'Administrative Officer', 'Department Official']);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    category: 'Department Official',
    role: 'Ward Officer',
    departmentName: '',
    jurisdictionLevel: 'Ward',
    jurisdictionName: 'Ward 1'
  });

  useEffect(() => {
    fetchEmployees();
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [rolesRes, deptsRes] = await Promise.all([
        api.get('/metadata/roles'),
        api.get('/metadata/departments')
      ]);
      setRoles(rolesRes.data.map(r => r.slug || r.code));
      setDepartments(deptsRes.data);
      if (deptsRes.data.length > 0) {
        setFormData(prev => ({ ...prev, departmentName: deptsRes.data[0].name }));
      }
    } catch (err) {
      console.error('Failed to fetch metadata:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/employees');
      setEmployees(res.data);
    } catch (err) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (formData.phone && formData.phone.length !== 10) {
      toast.error('Phone must be 10 digits if provided');
      return;
    }
    try {
      await api.post('/admin/employees', formData);
      toast.success('Employee created successfully');
      setFormData({ ...formData, username: '', password: '', phone: '', name: '' });
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error creating employee');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/employees/${id}`);
      toast.success('Employee deleted');
      fetchEmployees();
    } catch (err) {
      toast.error('Error deleting employee');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/employee/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link to="/employee/login" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#8B1A1A]" />
            <h1 className="text-xl font-black text-slate-800 tracking-wide">
              {tLabel('Admin Portal', 'நிர்வாக தளம்')}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-1.5 bg-red-50 text-red-700 font-bold text-sm rounded-full border border-red-100">
            Superadmin Access
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* TABS */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('EMPLOYEES')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'EMPLOYEES' ? 'bg-[#8B1A1A] text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            <Briefcase className="w-5 h-5" />
            Manage Employees
          </button>
          <button 
            onClick={() => setActiveTab('JURISDICTIONS')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'JURISDICTIONS' ? 'bg-[#8B1A1A] text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            <Map className="w-5 h-5" />
            Manage Jurisdictions
          </button>
        </div>

        {activeTab === 'JURISDICTIONS' ? (
          <JurisdictionManager />
        ) : (
          <div className="flex gap-8">
            {/* CREATE FORM */}
            <div className="w-1/3 shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                  <UserPlus className="w-5 h-5 text-[#8B1A1A]" />
                  <h2 className="text-lg font-black text-slate-800">Create Employee</h2>
                </div>
                
                <form onSubmit={handleCreateEmployee} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Username *</label>
                    <input 
                      type="text" 
                      name="username"
                      required
                      value={formData.username || ''}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-[#8B1A1A] outline-none"
                      placeholder="emp123"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Password *</label>
                    <input 
                      type="password" 
                      name="password"
                      required
                      value={formData.password || ''}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-[#8B1A1A] outline-none"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Mobile Number (Optional)</label>
                    <input 
                      type="text" 
                      name="phone"
                      maxLength={10}
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-[#8B1A1A] outline-none"
                      placeholder="10 digit number"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Full Name *</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-[#8B1A1A] outline-none"
                      placeholder="Name"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Category *</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-[#8B1A1A] outline-none">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Role *</label>
                    <select name="role" value={formData.role} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-[#8B1A1A] outline-none">
                      {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Department Name</label>
                    <select 
                      name="departmentName"
                      value={formData.departmentName}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-[#8B1A1A] outline-none"
                    >
                      <option value="">-- No Department --</option>
                      {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <div className="col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Assign Jurisdiction</label>
                      <JurisdictionSelector
                        onChange={(id, isFinal) => {
                          setFormData(prev => ({ ...prev, jurisdictionId: id }));
                        }}
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-[#8B1A1A] hover:bg-red-900 text-white font-bold py-3 rounded-xl transition-colors mt-2">
                    Create User
                  </button>
                </form>
              </div>
            </div>

            {/* USERS LIST */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-700" />
                    <h2 className="text-lg font-black text-slate-800">Manage Employees</h2>
                  </div>
                  <div className="text-sm font-bold text-slate-500">
                    Total: {employees.length}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="py-3 px-6 text-xs font-black text-slate-500 uppercase tracking-wider">Name / Phone</th>
                        <th className="py-3 px-6 text-xs font-black text-slate-500 uppercase tracking-wider">Role / Dept</th>
                        <th className="py-3 px-6 text-xs font-black text-slate-500 uppercase tracking-wider">Jurisdiction</th>
                        <th className="py-3 px-6 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr><td colSpan="4" className="text-center py-8 text-slate-500 font-bold">Loading...</td></tr>
                      ) : employees.length === 0 ? (
                        <tr><td colSpan="4" className="text-center py-8 text-slate-500 font-bold">No employees found.</td></tr>
                      ) : (
                        employees.map(emp => (
                          <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="font-bold text-slate-800">{emp.name}</div>
                              <div className="text-xs text-slate-500 font-semibold">{emp.username}</div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="font-bold text-[#8B1A1A]">{emp.role}</div>
                              <div className="text-xs text-slate-500 font-semibold">
                                {emp.department?.name || emp.category}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="font-semibold text-sm text-slate-700">
                                {emp.jurisdiction ? `${emp.jurisdiction.level}: ${emp.jurisdiction.name}` : 'N/A'}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button 
                                onClick={() => handleDeleteEmployee(emp.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
