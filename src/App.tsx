import React, { useState, useEffect } from 'react';
import { Match, Participant, Prediction, ScoringConfig, ActiveTab } from './types';
import {
  INITIAL_PARTICIPANTS,
  INITIAL_MATCHES,
  INITIAL_PREDICTIONS,
  DEFAULT_SCORING
} from './initialData';
import { getStandings, exportToCSV } from './utils';
import {
  Trophy,
  Table,
  CalendarDays,
  Users,
  Flame,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Settings,
  HelpCircle,
  TrendingDown,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import our modular components
import Leaderboard from './components/Leaderboard';
import ExcelMatrix from './components/ExcelMatrix';
import MatchList from './components/MatchList';
import ParticipantsList from './components/ParticipantsList';
import FinesTracker from './components/FinesTracker';
import BulkPredictionSplitter from './components/BulkPredictionSplitter';
import RulesPanel from './components/RulesPanel';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('leaderboard');

  // Core Data States (Load from localStorage if exists)
  const [participants, setParticipants] = useState<Participant[]>(() => {
    const saved = localStorage.getItem('wc_office_participants');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Automatically migrate to new 28 PKT members if we detect old sample data
        if (parsed.some((p: any) => p.name === 'Sếp Dũng') || parsed.length < 15) {
          return INITIAL_PARTICIPANTS.map(p => ({ ...p, role: '' }));
        }
        return parsed.map((p: any) => ({ ...p, role: '' }));
      } catch (e) {
        return INITIAL_PARTICIPANTS.map(p => ({ ...p, role: '' }));
      }
    }
    return INITIAL_PARTICIPANTS.map(p => ({ ...p, role: '' }));
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem('wc_office_matches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length < 15 || parsed.some((m: any) => m.teamB === 'Togo 🇹🇬')) {
          return INITIAL_MATCHES;
        }
        return parsed;
      } catch (e) {
        return INITIAL_MATCHES;
      }
    }
    return INITIAL_MATCHES;
  });

  const [predictions, setPredictions] = useState<Prediction[]>(() => {
    const saved = localStorage.getItem('wc_office_predictions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length < 15) {
          return INITIAL_PREDICTIONS;
        }
        return parsed;
      } catch (e) {
        return INITIAL_PREDICTIONS;
      }
    }
    return INITIAL_PREDICTIONS;
  });

  const [scoringConfig, setScoringConfig] = useState<ScoringConfig>(() => {
    const saved = localStorage.getItem('wc_office_scoring_config');
    return saved ? JSON.parse(saved) : DEFAULT_SCORING;
  });

  // UI Control States
  const [showSettings, setShowSettings] = useState(false);
  const [backupJsonText, setBackupJsonText] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);
  const [showBulkSplitter, setShowBulkSplitter] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('wc_office_participants', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem('wc_office_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('wc_office_predictions', JSON.stringify(predictions));
  }, [predictions]);

  useEffect(() => {
    localStorage.setItem('wc_office_scoring_config', JSON.stringify(scoringConfig));
  }, [scoringConfig]);

  // Calculate standby statistics
  const standings = getStandings(participants, matches, predictions, scoringConfig);

  // --- ACTIONS & HANDLERS ---

  // Prediction updates
  const handleUpdatePrediction = (pId: string, mId: string, choice: 'A' | 'B') => {
    setPredictions((prev) => {
      // Check if prediction already exists
      const filtered = prev.filter((pr) => !(pr.participantId === pId && pr.matchId === mId));
      return [...filtered, { participantId: pId, matchId: mId, choice }];
    });
  };

  const handleBulkSavePredictions = (
    predictionsToSave: { participantId: string; choice: 'A' | 'B' }[],
    matchId: string
  ) => {
    setPredictions((prev) => {
      // Overwrite all existing predictions for this match with the new bulk set
      const remaining = prev.filter((pr) => pr.matchId !== matchId);
      const formatted = predictionsToSave.map((p) => ({
        participantId: p.participantId,
        matchId,
        choice: p.choice,
      }));
      return [...remaining, ...formatted];
    });
  };

  // Match administration
  const handleUpdateMatchScore = (mId: string, valA: number | null, valB: number | null) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === mId) {
          return { ...m, scoreA: valA, scoreB: valB };
        }
        return m;
      })
    );
  };

  const handleAddMatch = (newMatch: Omit<Match, 'id'>) => {
    const mWithId: Match = {
      ...newMatch,
      id: 'm_' + Date.now().toString()
    };
    setMatches((prev) => [...prev, mWithId]);
  };

  const handleDeleteMatch = (mId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== mId));
    // Clean up corresponding predictions
    setPredictions((prev) => prev.filter((pr) => pr.matchId !== mId));
  };

  // Participant administration
  const handleAddParticipant = (newP: Omit<Participant, 'id'>) => {
    const pWithId: Participant = {
      ...newP,
      id: 'p_' + Date.now().toString()
    };
    setParticipants((prev) => [...prev, pWithId]);
  };

  const handleDeleteParticipant = (pId: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== pId));
    // Clean up predictions
    setPredictions((prev) => prev.filter((pr) => pr.participantId !== pId));
  };

  // Live Scoring Configuration Change
  const handleUpdateScoringRules = (field: keyof ScoringConfig, val: number) => {
    setScoringConfig((prev) => ({
      ...prev,
      [field]: val
    }));
  };

  // Export spreadsheet directly as CSV (Excel compatible)
  const handleTriggerCSVDownload = () => {
    const csvString = exportToCSV(participants, matches, predictions, standings);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Dự-Đoán-WorldCup2026-VanPhong-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import JSON State
  const handleTriggerJSONImport = () => {
    try {
      const parsed = JSON.parse(backupJsonText);
      if (parsed.participants && parsed.matches && parsed.predictions) {
        setParticipants(parsed.participants);
        setMatches(parsed.matches);
        setPredictions(parsed.predictions);
        if (parsed.scoringConfig) setScoringConfig(parsed.scoringConfig);
        alert('Nhập dữ liệu thành công! Toàn bộ bảng tính và lịch sử dự đoán đã được cập nhật.');
        setBackupJsonText('');
        setShowImportArea(false);
      } else {
        alert('File dữ liệu thiếu cấu trúc yêu cầu (participants, matches, predictions).');
      }
    } catch (e) {
      alert('Chuỗi dữ liệu JSON không hợp lệ! Vui lòng kiểm tra lại copy-paste.');
    }
  };

  // Export JSON State string representation
  const handleGenerateBackupJSON = () => {
    const bundle = {
      participants,
      matches,
      predictions,
      scoringConfig
    };
    navigator.clipboard.writeText(JSON.stringify(bundle, null, 2));
    alert('Đã tạo liên kết sao lưu và sao chép vào bộ nhớ tạm (Clipboard)! Bạn có thể lưu trữ chuỗi văn bản này hoặc dán sang máy khác.');
  };

  // Fresh reset back to default mock data
  const handleResetToDefault = () => {
    if (confirm('Bạn có chắc chắn muốn RESET dữ liệu về trạng thái mẫu? Thao tác này sẽ xóa các thay đổi hiện tại.')) {
      setParticipants(INITIAL_PARTICIPANTS);
      setMatches(INITIAL_MATCHES);
      setPredictions(INITIAL_PREDICTIONS);
      setScoringConfig(DEFAULT_SCORING);
      localStorage.removeItem('wc_office_fines_log'); // clear penalty register
      alert('Đã thiết lập lại dữ liệu thành công!');
    }
  };

  // Nuclear wipeout (completely clean start)
  const handleClearAll = () => {
    if (confirm('BẠN CÓ CHẮC CHẮN MUỐN XÓA SẠCH DỮ LIỆU? Bạn sẽ bắt đầu một bảng tính hoàn toàn trống.')) {
      setParticipants([]);
      setMatches([]);
      setPredictions([]);
      localStorage.removeItem('wc_office_fines_log');
      alert('Đã xóa sạch dữ liệu. Hãy thêm Trận Đấu và Thành Viên mới nhé!');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans leading-normal antialiased p-0 sm:p-4 md:p-6 lg:p-8">
      
      {/* GEOMETRIC CONTAINER WITH STRONG SIDE BORDER DESIGN */}
      <div className="max-w-7xl mx-auto bg-white border-4 md:border-8 border-[#1E293B] shadow-[12px_12px_0px_#1E293B] flex flex-col overflow-hidden rounded-2xl">
        
        {/* GEOMETRIC BALANCE THEMED HEADER */}
        <header className="bg-[#1E293B] border-b-4 border-[#1E293B] text-white py-6 px-4 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-500 rounded-lg flex items-center justify-center font-black text-2xl rotate-3 border-2 border-white shadow-[3px_3px_0px_#000] shrink-0 text-white select-none">
              WC
            </div>
            <div>
              <h1 className="font-sans font-black text-xl tracking-tight sm:text-2xl uppercase italic text-white flex items-center gap-2">
                BẢNG DỰ ĐOÁN WORLD CUP 2026
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">
                ⚽ Office Penalty Tracker • Không cá cược thực tế • Văn phòng lành mạnh
              </p>
            </div>
          </div>

          {/* DYNAMIC TIMELINE STATUS */}
          <div className="flex items-center gap-6 justify-between md:justify-end">
            <div className="text-left md:text-right">
              <div className="text-2xl md:text-3xl font-mono text-red-400 font-black tracking-tight">
                {matches.filter((m) => m.scoreA === null).length} Trận
              </div>
              <p className="text-slate-400 text-[9px] uppercase tracking-tighter italic">Chờ Điền Dự Đoán / Đấu Tiếp</p>
            </div>
            <div className="h-10 w-[1px] bg-slate-700 hidden sm:block"></div>
            
            {/* ACTIONS */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowBulkSplitter(true)}
                className="px-3.5 py-2 mt-1 rounded bg-indigo-600 hover:bg-indigo-500 border-2 border-indigo-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#000] active:translate-y-0.5 cursor-pointer"
                title="Chia nhanh vote cho 28 người"
              >
                <span>⚡</span> Chia Nhanh Vote
              </button>
              <button
                onClick={handleTriggerCSVDownload}
                className="px-3.5 py-2 mt-1 rounded bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_rgba(255,255,255,0.1)] active:translate-y-0.5 cursor-pointer"
                title="Xuất file sang Excel"
              >
                <Download className="w-3.5 h-3.5" /> Xuất Excel
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 mt-1 rounded text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 transition-all cursor-pointer shadow-[2px_2px_0px_rgba(255,255,255,0.1)]"
                title="Cài đặt điểm & Sao lưu"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* SETTINGS DRAWER / COLLAPSED AREA */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-[#F8FAFC] border-b-4 border-[#1E293B] p-6 space-y-4"
            >
              <div className="border-b-2 border-slate-300 pb-2.5 flex items-center justify-between">
                <span className="font-mono font-black text-xs text-slate-900 uppercase tracking-widest">CẤU HÌNH ĐIỂM & ĐỒNG BỘ</span>
                <span className="text-[10px] text-slate-500 font-semibold italic">Phục vụ tự động cập nhật Excel</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* RULE INPUTS */}
                <div className="space-y-3 bg-white p-4 rounded border-2 border-slate-900 shadow-[4px_4px_0px_#1E293B]">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">LUẬT TÍNH ĐIỂM</span>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Đoán trúng tỷ số chính xác:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={scoringConfig.exactScore}
                          onChange={(e) => handleUpdateScoringRules('exactScore', parseInt(e.target.value) || 0)}
                          className="w-12 py-1 text-center font-bold border-2 border-slate-900 rounded focus:outline-none focus:ring-1 focus:ring-red-500 text-xs font-mono"
                        />
                        <span className="text-[10px] font-bold text-slate-500">đ</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Đoán trúng kết quả thắng/hòa:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={scoringConfig.correctOutcome}
                          onChange={(e) => handleUpdateScoringRules('correctOutcome', parseInt(e.target.value) || 0)}
                          className="w-12 py-1 text-center font-bold border-2 border-slate-900 rounded focus:outline-none focus:ring-1 focus:ring-red-500 text-xs font-mono"
                        />
                        <span className="text-[10px] font-bold text-slate-500">đ</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BACKUP RESTORE BUTTONS */}
                <div className="space-y-3 bg-white p-4 rounded border-2 border-slate-900 shadow-[4px_4px_0px_#1E293B]">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">SAO LƯU NHANH (JSON)</span>
                  <p className="text-[11px] text-slate-500">Truyền dữ liệu bảng sang máy đồng nghiệp cực kỳ đơn giản.</p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleGenerateBackupJSON}
                      className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded uppercase tracking-wider transition-all"
                    >
                      Copy mã sao lưu
                    </button>
                    <button
                      onClick={() => setShowImportArea(!showImportArea)}
                      className="py-1.5 px-3 border-2 border-slate-900 hover:bg-slate-100 text-slate-900 text-xs font-bold rounded uppercase tracking-wider transition-all"
                    >
                      Nhập mã
                    </button>
                  </div>
                </div>

                {/* EMERGENCY DATA WIPEOUTS */}
                <div className="space-y-3 bg-red-50 p-4 rounded border-2 border-red-950 shadow-[4px_4px_0px_#991B1B]">
                  <span className="text-[10px] font-black text-red-700 uppercase tracking-widest block">CÀI ĐẶT LẠI HỆ THỐNG</span>
                  <p className="text-[11px] text-red-800">Cần khôi phục dữ liệu gốc hoặc dọn dẹp sạch toàn bộ bảng.</p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleResetToDefault}
                      className="flex-1 py-1.5 bg-white border-2 border-red-900 hover:bg-red-100 text-red-900 text-xs font-bold rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Khởi tạo mẫu
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1 border border-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xóa sạch
                    </button>
                  </div>
                </div>
              </div>

              {/* Collapsible JSON Import Field */}
              <AnimatePresence>
                {showImportArea && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="pt-4 border-t-2 border-slate-200 space-y-2"
                  >
                    <label className="block text-xs font-bold text-slate-800">Dán chuỗi văn bản JSON sao lưu vào đây:</label>
                    <textarea
                      rows={3}
                      placeholder='{"participants": [...], "matches": [...]}'
                      value={backupJsonText}
                      onChange={(e) => setBackupJsonText(e.target.value)}
                      className="w-full bg-white border-2 border-slate-900 text-xs p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowImportArea(false)}
                        className="px-3 py-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        onClick={handleTriggerJSONImport}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold uppercase tracking-wider cursor-pointer shadow-[2px_2px_0px_#000]"
                      >
                        Nạp dữ liệu mới
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PRIMARY GEOMETRIC LEVEL-NAVIGATION BAR */}
        <div className="bg-[#1E293B] p-2 border-b-4 border-[#1E293B] flex flex-wrap gap-1 items-center">
          
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-3 px-4 font-black transition-all flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-red-500 text-white shadow-[2px_2px_0px_#000] border-2 border-slate-900 rounded'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            🥇 Bảng Xếp Hạng
          </button>

          <button
            onClick={() => setActiveTab('spreadsheet')}
            className={`flex-1 py-3 px-4 font-black transition-all flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer ${
              activeTab === 'spreadsheet'
                ? 'bg-red-500 text-white shadow-[2px_2px_0px_#000] border-2 border-slate-900 rounded'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Table className="w-4 h-4" /> Bảng Excel Tự Động
          </button>

          <button
            onClick={() => setActiveTab('matches')}
            className={`flex-1 py-3 px-4 font-black transition-all flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer ${
              activeTab === 'matches'
                ? 'bg-red-500 text-white shadow-[2px_2px_0px_#000] border-2 border-slate-900 rounded'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CalendarDays className="w-4 h-4" /> KQ Trận Đấu
          </button>

          <button
            onClick={() => setActiveTab('participants')}
            className={`flex-1 py-3 px-4 font-black transition-all flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer ${
              activeTab === 'participants'
                ? 'bg-red-500 text-white shadow-[2px_2px_0px_#000] border-2 border-slate-900 rounded'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" /> Nhân Sự Dự Đoán
          </button>

          <button
            onClick={() => setActiveTab('fines')}
            className={`flex-1 py-3 px-4 font-black transition-all flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer ${
              activeTab === 'fines'
                ? 'bg-yellow-400 text-slate-950 shadow-[2px_2px_0px_#000] border-2 border-slate-900 rounded'
                : 'text-yellow-300 hover:text-yellow-400 hover:bg-slate-850'
            }`}
          >
            <Flame className="w-4 h-4 text-red-650 animate-pulse fill-current" /> Dự Đoán Trận Đấu & Phạt 🔮
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 py-3 px-4 font-black transition-all flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-[#10B981] text-white shadow-[2px_2px_0px_#000] border-2 border-slate-900 rounded'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>📜</span> QUY CHẾ CHƠI 🌟
          </button>
        </div>

        {/* ACTIVE MODULE CONTAINER */}
        <div className="id-tab-view p-4 sm:p-8 bg-slate-50 min-h-[500px]">
          {activeTab === 'leaderboard' && (
            <Leaderboard
              standings={standings}
              scoringConfig={scoringConfig}
              onNavigateToFines={() => setActiveTab('fines')}
              onNavigateToSpreadsheet={() => setActiveTab('spreadsheet')}
            />
          )}

          {activeTab === 'spreadsheet' && (
            <ExcelMatrix
              participants={participants}
              matches={matches}
              predictions={predictions}
              scoringConfig={scoringConfig}
              onUpdatePrediction={handleUpdatePrediction}
            />
          )}

          {activeTab === 'matches' && (
            <MatchList
              matches={matches}
              onUpdateMatchScore={handleUpdateMatchScore}
              onAddMatch={handleAddMatch}
              onDeleteMatch={handleDeleteMatch}
            />
          )}

          {activeTab === 'participants' && (
            <ParticipantsList
              participants={participants}
              onAddParticipant={handleAddParticipant}
              onDeleteParticipant={handleDeleteParticipant}
            />
          )}

          {activeTab === 'fines' && (
            <FinesTracker
              participants={participants}
              standings={standings}
              matches={matches}
              predictions={predictions}
              onUpdatePrediction={handleUpdatePrediction}
            />
          )}

          {activeTab === 'rules' && (
            <RulesPanel />
          )}
        </div>

        {/* CLEAN GEOMETRIC FOOTER LINE */}
        <footer className="border-t-4 border-[#1E293B] bg-[#1E293B] text-slate-400 py-6 text-center text-xs space-y-1 select-none px-4">
          <p className="font-extrabold text-white tracking-widest uppercase">⚽ TRÌNH THEO DÕI HÌNH PHẠT DỰ ĐOÁN WORLD CUP 2026</p>
          <p className="text-slate-400 text-[11px]">Hỗ trợ Excel tự động tính toán chính xác • Hoàn toàn không cá độ ăn tiền thực tế.</p>
          <p className="text-[10px] text-slate-500 font-mono tracking-tight">CRAFTED WITH GEOMETRIC BALANCE DESIGN CONCEPT © 2026 AI STUDIO</p>
        </footer>

        {/* BULK PREDICTION SPLITTER MODAL */}
        <AnimatePresence>
          {showBulkSplitter && (
            <BulkPredictionSplitter
              participants={participants}
              matches={matches}
              predictions={predictions}
              onSaveAllPredictions={handleBulkSavePredictions}
              onClose={() => setShowBulkSplitter(false)}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
