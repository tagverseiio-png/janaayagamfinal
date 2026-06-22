import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, List, Award, Activity } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

export default function CabinetRankings() {
  const [cabinetReport, setCabinetReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchLatestCabinetReport = async () => {
      try {
        // Bypass API
        // const res = await api.get('/cabinet/latest');
        // setCabinetReport(res.data);
      } catch (err) {
        console.warn('No existing cabinet report found');
      } finally {
        setLoading(false);
      }
    };
    fetchLatestCabinetReport();
  }, []);

  const handleGenerateCabinetReport = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/cabinet/generate');
      setCabinetReport(res.data);
      toast.success('Cabinet audit generated successfully.');
    } catch (err) {
      console.error('Failed to generate cabinet report:', err);
      toast.error('Failed to generate cabinet report.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Activity className="w-8 h-8 animate-spin text-[#8B1A1A]" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* ── HEADER ── */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
          <Award className="w-5 h-5 text-[#8B1A1A]" /> Cabinet Rankings & Audits
        </h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
          Algorithmic Ministerial Performance Evaluation
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
            <List className="w-8 h-8 text-[#8B1A1A]" />
          </div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide mb-2">
            Automate Cabinet Performance Summary
          </h2>
          <p className="text-slate-500 font-bold text-xs max-w-md mx-auto mb-6">
            Compiles resolution rates, pending volumes, and efficiency rankings across all ministerial departments for the State Cabinet meeting.
          </p>
          <button 
            onClick={handleGenerateCabinetReport}
            disabled={generating}
            className="bg-[#8B1A1A] hover:bg-red-800 disabled:opacity-50 text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-wider text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 mx-auto"
          >
            {generating ? <Activity className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} 
            Run Cabinet Audit Report
          </button>

          {cabinetReport && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-left space-y-4">
              <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg font-bold text-xs mb-4 flex items-center gap-2 justify-center border border-emerald-200">
                ✓ Cabinet audit generated and stored securely.
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-wrap shadow-inner overflow-auto max-h-[500px] custom-scrollbar">
{`JANANAYAGAM — CABINET REPORT
Tamil Nadu Civic Command Center
Generated: ${new Date(cabinetReport.createdAt).toLocaleString()}
========================================

STATE CABINET RANKINGS (By Efficiency & Resolution Rate)

${cabinetReport.rankings.map((rank, idx) => `${idx + 1}. Department of ${rank.dept}
   - Minister-in-Charge: ${rank.minister}
   - Resolution Rate: ${rank.rate}%
   - Unresolved Backlog: ${rank.pending} pending`).join('\\n\\n')}

SUMMARY FINDINGS:
${cabinetReport.summaryText}

========================================
Confidential — Office of the Chief Minister`}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
