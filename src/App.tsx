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
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  writeBatch,
  query,
  where
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
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

  // Core Data States (Load from localStorage as quick starting client fallback/offline cache)
  const [participants, setParticipants] = useState<Participant[]>(() => {
    const saved = localStorage.getItem('wc_office_participants');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
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
  const [useIPhoneFrame, setUseIPhoneFrame] = useState(false);

  // Firestore automatic seed & real-time sync listeners
  useEffect(() => {
    const checkAndSeed = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'participants'));
        if (querySnapshot.empty) {
          console.log('Firestore is empty. Syncing and seeding Initial Dataset...');
          const batch = writeBatch(db);
          INITIAL_PARTICIPANTS.forEach((p) => {
            batch.set(doc(db, 'participants', p.id), { ...p, role: p.role || '' });
          });
          INITIAL_MATCHES.forEach((m) => {
            batch.set(doc(db, 'matches', m.id), m);
          });
          INITIAL_PREDICTIONS.forEach((pr) => {
            batch.set(doc(db, 'predictions', `${pr.participantId}_${pr.matchId}`), pr);
          });
          batch.set(doc(db, 'scoringConfig', 'default'), DEFAULT_SCORING);
          await batch.commit();
          console.log('Seeding completed successfully!');
        }
      } catch (err) {
        console.error('Error auto-seeding Firestore:', err);
      }
    };
    checkAndSeed();
  }, []);

  useEffect(() => {
    const unsubParticipants = onSnapshot(collection(db, 'participants'), (snap) => {
      const list: Participant[] = [];
      snap.forEach((d) => {
        list.push(d.data() as Participant);
      });
      if (list.length > 0) {
        setParticipants(list);
        localStorage.setItem('wc_office_participants', JSON.stringify(list));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'participants');
    });

    const unsubMatches = onSnapshot(collection(db, 'matches'), (snap) => {
      const list: Match[] = [];
      snap.forEach((d) => {
        list.push(d.data() as Match);
      });
      if (list.length > 0) {
        const sortedList = [...list].sort((a, b) => {
          return a.id.localeCompare(b.id);
        });
        setMatches(sortedList);
        localStorage.setItem('wc_office_matches', JSON.stringify(sortedList));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'matches');
    });

    const unsubPredictions = onSnapshot(collection(db, 'predictions'), (snap) => {
      const list: Prediction[] = [];
      snap.forEach((d) => {
        list.push(d.data() as Prediction);
      });
      setPredictions(list);
      localStorage.setItem('wc_office_predictions', JSON.stringify(list));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'predictions');
    });

    const unsubScoring = onSnapshot(doc(db, 'scoringConfig', 'default'), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as ScoringConfig;
        setScoringConfig(data);
        localStorage.setItem('wc_office_scoring_config', JSON.stringify(data));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'scoringConfig/default');
    });

    return () => {
      unsubParticipants();
      unsubMatches();
      unsubPredictions();
      unsubScoring();
    };
  }, []);

  // Calculate standby statistics
  const standings = getStandings(participants, matches, predictions, scoringConfig);

  // --- ACTIONS & HANDLERS ---

  // Prediction updates
  const handleUpdatePrediction = async (pId: string, mId: string, choice: 'A' | 'B') => {
    // Optimistic Update
    setPredictions((prev) => {
      const filtered = prev.filter((pr) => !(pr.participantId === pId && pr.matchId === mId));
      return [...filtered, { participantId: pId, matchId: mId, choice }];
    });

    try {
      await setDoc(doc(db, 'predictions', `${pId}_${mId}`), { participantId: pId, matchId: mId, choice });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `predictions/${pId}_${mId}`);
    }
  };

  const handleBulkSavePredictions = async (
    predictionsToSave: { participantId: string; choice: 'A' | 'B' }[],
    matchId: string
  ) => {
    // Optimistic Update
    setPredictions((prev) => {
      const remaining = prev.filter((pr) => pr.matchId !== matchId);
      const formatted = predictionsToSave.map((p) => ({
        participantId: p.participantId,
        matchId,
        choice: p.choice,
      }));
      return [...remaining, ...formatted];
    });

    try {
      const batch = writeBatch(db);
      const q = query(collection(db, 'predictions'), where('matchId', '==', matchId));
      const snap = await getDocs(q);
      snap.forEach((d) => batch.delete(d.ref));

      predictionsToSave.forEach((p) => {
        batch.set(doc(db, 'predictions', `${p.participantId}_${matchId}`), {
          participantId: p.participantId,
          matchId,
          choice: p.choice,
        });
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `bulk-predictions-match-${matchId}`);
    }
  };

  // Match administration
  const handleUpdateMatchScore = async (mId: string, valA: number | null, valB: number | null) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === mId) {
          return { ...m, scoreA: valA, scoreB: valB };
        }
        return m;
      })
    );

    try {
      const target = matches.find((m) => m.id === mId);
      if (target) {
        await setDoc(doc(db, 'matches', mId), {
          ...target,
          scoreA: valA,
          scoreB: valB,
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `matches/${mId}`);
    }
  };

  const handleAddMatch = async (newMatch: Omit<Match, 'id'>) => {
    const mId = 'm_' + Date.now().toString();
    const mWithId: Match = {
      ...newMatch,
      id: mId
    };
    setMatches((prev) => [...prev, mWithId]);

    try {
      await setDoc(doc(db, 'matches', mId), mWithId);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `matches/${mId}`);
    }
  };

  const handleDeleteMatch = async (mId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== mId));
    setPredictions((prev) => prev.filter((pr) => pr.matchId !== mId));

    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'matches', mId));

      const q = query(collection(db, 'predictions'), where('matchId', '==', mId));
      const snap = await getDocs(q);
      snap.forEach((d) => batch.delete(d.ref));

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `delete-match-${mId}`);
    }
  };

  // Participant administration
  const handleAddParticipant = async (newP: Omit<Participant, 'id'>) => {
    const pId = 'p_' + Date.now().toString();
    const pWithId: Participant = {
      ...newP,
      id: pId
    };
    setParticipants((prev) => [...prev, pWithId]);

    try {
      await setDoc(doc(db, 'participants', pId), { ...pWithId, role: pWithId.role || '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `participants/${pId}`);
    }
  };

  const handleDeleteParticipant = async (pId: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== pId));
    setPredictions((prev) => prev.filter((pr) => pr.participantId !== pId));

    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'participants', pId));

      const q = query(collection(db, 'predictions'), where('participantId', '==', pId));
      const snap = await getDocs(q);
      snap.forEach((d) => batch.delete(d.ref));

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `delete-participant-${pId}`);
    }
  };

  // Live Scoring Configuration Change
  const handleUpdateScoringRules = (field: keyof ScoringConfig, val: number) => {
    const nextConfig = {
      ...scoringConfig,
      [field]: val
    };
    setScoringConfig(nextConfig);

    try {
      setDoc(doc(db, 'scoringConfig', 'default'), nextConfig);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'scoringConfig/default');
    }
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
  const handleResetToDefault = async () => {
    if (confirm('Bạn có chắc chắn muốn RESET dữ liệu về trạng thái mẫu trên Cloud? Thao tác này sẽ đặt lại tất cả thiết bị đồng hồ & máy tính.')) {
      try {
        const batch = writeBatch(db);

        const matchesSnap = await getDocs(collection(db, 'matches'));
        matchesSnap.forEach((docSnap) => batch.delete(docSnap.ref));

        const participantsSnap = await getDocs(collection(db, 'participants'));
        participantsSnap.forEach((docSnap) => batch.delete(docSnap.ref));

        const predictionsSnap = await getDocs(collection(db, 'predictions'));
        predictionsSnap.forEach((docSnap) => batch.delete(docSnap.ref));

        INITIAL_PARTICIPANTS.forEach((p) => {
          batch.set(doc(db, 'participants', p.id), { ...p, role: p.role || '' });
        });
        INITIAL_MATCHES.forEach((m) => {
          batch.set(doc(db, 'matches', m.id), m);
        });
        INITIAL_PREDICTIONS.forEach((pr) => {
          batch.set(doc(db, 'predictions', `${pr.participantId}_${pr.matchId}`), pr);
        });
        batch.set(doc(db, 'scoringConfig', 'default'), DEFAULT_SCORING);

        await batch.commit();
        localStorage.removeItem('wc_office_fines_log'); // clear penalty register
        alert('Đã reset và thiết lập lại dữ liệu thành công trên Cloud!');
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'reset-database');
      }
    }
  };

  // Nuclear wipeout (completely clean start)
  const handleClearAll = async () => {
    if (confirm('BẠN CÓ CHẮC CHẮN MUỐN XÓA SẠCH DỮ LIỆU? Toàn bộ bảng trống sẽ đồng bộ qua điện thoại và máy tính.')) {
      try {
        const batch = writeBatch(db);

        const matchesSnap = await getDocs(collection(db, 'matches'));
        matchesSnap.forEach((docSnap) => batch.delete(docSnap.ref));

        const participantsSnap = await getDocs(collection(db, 'participants'));
        participantsSnap.forEach((docSnap) => batch.delete(docSnap.ref));

        const predictionsSnap = await getDocs(collection(db, 'predictions'));
        predictionsSnap.forEach((docSnap) => batch.delete(docSnap.ref));

        await batch.commit();
        localStorage.removeItem('wc_office_fines_log');
        alert('Đã xóa sạch dữ liệu trên đám mây quốc tế!');
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'clear-database');
      }
    }
  };

  // Adaptive content renderer
  const renderAppContent = (isSimulatedMobile: boolean) => {
    return (
      <div className={`w-full bg-white flex flex-col overflow-hidden ${
        isSimulatedMobile 
          ? 'border-0 rounded-none' 
          : 'border-0 md:border-8 border-[#1E293B] md:shadow-[12px_12px_0px_#1E293B] md:rounded-2xl'
      }`}>
        
        {/* GEOMETRIC BALANCE THEMED HEADER */}
        <header className="bg-[#1E293B] border-b-4 border-[#1E293B] text-white py-4 md:py-6 px-4 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-red-500 rounded-lg flex items-center justify-center font-black text-lg md:text-2xl rotate-3 border-2 border-white shadow-[2px_2px_0px_#000] shrink-0 text-white select-none">
              ⚽
            </div>
            <div>
              <h1 className="font-sans font-black text-base md:text-2xl uppercase italic text-white flex items-center gap-1.5 tracking-tight">
                SÁNG TÂM HỒN - TỐI TÂM TRẠNG
              </h1>
              <p className="text-[9px] md:text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">
                ⚽ Office Penalty Tracker • PKT Co-workers Rule
              </p>
            </div>
          </div>

          {/* DYNAMIC TIMELINE STATUS */}
          <div className="flex items-center gap-4 md:gap-6 justify-between md:justify-end">
            <div className="text-left md:text-right">
              <div className="text-xl md:text-3xl font-mono text-red-500 font-black tracking-tight">
                {matches.filter((m) => m.scoreA === null).length} Trận
              </div>
              <p className="text-slate-400 text-[8px] md:text-[9px] uppercase tracking-tighter italic">Chờ Điền Dự Đoán / Đấu Tiếp</p>
            </div>
            <div className="h-8 md:h-10 w-[1px] bg-slate-700 hidden sm:block"></div>
            
            {/* ACTIONS */}
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
              <button
                onClick={() => setShowBulkSplitter(true)}
                className="px-2.5 py-1.5 md:px-3.5 md:py-2 mt-1 rounded bg-indigo-600 hover:bg-indigo-500 border-2 border-indigo-500 text-white text-[10px] md:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 active:translate-y-0.5 cursor-pointer shadow-[1px_1px_0px_#000]"
                title="Chia nhanh vote cho 28 người"
              >
                <span>⚡</span> Chia Vote
              </button>
              <button
                onClick={handleTriggerCSVDownload}
                className="px-2.5 py-1.5 md:px-3.5 md:py-2 mt-1 rounded bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 text-white text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 active:translate-y-0.5 cursor-pointer shadow-[1px_1px_0px_#000]"
                title="Xuất file sang Excel"
              >
                <Download className="w-3 md:w-3.5 h-3 md:h-3.5" /> Xuất Excel
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 md:p-2 mt-1 rounded text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 transition-all cursor-pointer"
                title="Cài đặt điểm & Sao lưu"
              >
                <Settings className="w-3.5 md:w-4 h-3.5 md:h-4" />
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
              className="overflow-hidden bg-[#F8FAFC] border-b-4 border-[#1E293B] p-4 md:p-6 space-y-4"
            >
              <div className="border-b-2 border-slate-300 pb-2 flex items-center justify-between">
                <span className="font-mono font-black text-[10px] md:text-xs text-slate-900 uppercase tracking-widest">CẤU HÌNH ĐIỂM & ĐỒNG BỘ</span>
                <span className="text-[9px] md:text-[10px] text-slate-500 font-semibold italic">Phục vụ tự động cập nhật Excel</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* RULE INPUTS */}
                <div className="space-y-3 bg-white p-4 rounded border-2 border-slate-900 shadow-[4px_4px_0px_#1E293B]">
                  <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">LUẬT TÍNH ĐIỂM</span>
                  
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
                        <span className="text-[10px] font-bold text-slate-500">cá</span>
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
                        <span className="text-[10px] font-bold text-slate-500">cá</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BACKUP RESTORE BUTTONS */}
                <div className="space-y-3 bg-white p-4 rounded border-2 border-slate-900 shadow-[4px_4px_0px_#1E293B]">
                  <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">SAO LƯU NHANH (JSON)</span>
                  <p className="text-[11px] text-slate-500">Truyền dữ liệu bảng sang máy đồng nghiệp cực kỳ đơn giản.</p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleGenerateBackupJSON}
                      className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] md:text-xs font-bold rounded uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Copy mã sao lưu
                    </button>
                    <button
                      onClick={() => setShowImportArea(!showImportArea)}
                      className="py-1.5 px-3 border-2 border-slate-900 hover:bg-slate-100 text-slate-900 text-[10px] md:text-xs font-bold rounded uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Nhập mã
                    </button>
                  </div>
                </div>

                {/* EMERGENCY DATA WIPEOUTS */}
                <div className="space-y-3 bg-red-50 p-4 rounded border-2 border-red-950 shadow-[4px_4px_0px_#991B1B]">
                  <span className="text-[9px] md:text-[10px] font-black text-red-700 uppercase tracking-widest block font-sans">CÀI ĐẶT LẠI HỆ THỐNG</span>
                  <p className="text-[11px] text-red-800">Cần khôi phục dữ liệu gốc hoặc dọn dẹp sạch toàn bộ bảng.</p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleResetToDefault}
                      className="flex-1 py-1.5 bg-white border-2 border-red-900 hover:bg-red-100 text-red-900 text-[10px] md:text-xs font-bold rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Khởi tạo mẫu
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] md:text-xs font-bold rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1 border border-red-700 cursor-pointer"
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
                        className="px-3 py-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider cursor-pointer"
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
        <div className="bg-[#1E293B] p-1.5 border-b-4 border-[#1E293B] flex overflow-x-auto sm:overflow-visible scrollbar-none gap-1 sm:grid sm:grid-cols-3 lg:grid-cols-6 items-center shrink-0">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`shrink-0 sm:shrink-1 py-2 md:py-3 px-3 md:px-4 font-black transition-all flex items-center justify-center gap-1 text-[11px] md:text-xs uppercase tracking-wider cursor-pointer rounded ${
              activeTab === 'leaderboard'
                ? 'bg-red-500 text-white shadow-[2px_2px_0px_#000] border-2 border-slate-900'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            🥇 Hạng
          </button>

          <button
            onClick={() => setActiveTab('spreadsheet')}
            className={`shrink-0 sm:shrink-1 py-2 md:py-3 px-3 md:px-4 font-black transition-all flex items-center justify-center gap-1 text-[11px] md:text-xs uppercase tracking-wider cursor-pointer rounded ${
              activeTab === 'spreadsheet'
                ? 'bg-red-500 text-white shadow-[2px_2px_0px_#000] border-2 border-slate-900'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Table className="w-3.5 h-3.5" /> Excel
          </button>

          <button
            onClick={() => setActiveTab('matches')}
            className={`shrink-0 sm:shrink-1 py-2 md:py-3 px-4 font-black transition-all flex items-center justify-center gap-1 text-[11px] md:text-xs uppercase tracking-wider cursor-pointer rounded ${
              activeTab === 'matches'
                ? 'bg-red-500 text-white shadow-[2px_2px_0px_#000] border-2 border-slate-900'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" /> Trận
          </button>

          <button
            onClick={() => setActiveTab('participants')}
            className={`shrink-0 sm:shrink-1 py-2 md:py-3 px-4 font-black transition-all flex items-center justify-center gap-1 text-[11px] md:text-xs uppercase tracking-wider cursor-pointer rounded ${
              activeTab === 'participants'
                ? 'bg-red-500 text-white shadow-[2px_2px_0px_#000] border-2 border-slate-900'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Nhân Sự
          </button>

          <button
            onClick={() => setActiveTab('fines')}
            className={`shrink-0 sm:shrink-1 py-2 md:py-3 px-3 md:px-4 font-black transition-all flex items-center justify-center gap-1 text-[11px] md:text-xs uppercase tracking-wider cursor-pointer rounded ${
              activeTab === 'fines'
                ? 'bg-yellow-400 text-slate-950 shadow-[2px_2px_0px_#000] border-2 border-slate-900'
                : 'text-yellow-300 hover:text-yellow-400 hover:bg-slate-850'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-red-650 animate-pulse fill-current" /> Phạt 🔮
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`shrink-0 sm:shrink-1 py-2 md:py-3 px-4 font-black transition-all flex items-center justify-center gap-1 text-[11px] md:text-xs uppercase tracking-wider cursor-pointer rounded ${
              activeTab === 'rules'
                ? 'bg-[#10B981] text-white shadow-[2px_2px_0px_#000] border-2 border-slate-900'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>📜</span> Quy Chế
          </button>
        </div>

        {/* ACTIVE MODULE CONTAINER */}
        <div className={`id-tab-view bg-slate-50 min-h-[450px] ${isSimulatedMobile ? 'p-3' : 'p-3 md:p-8'}`}>
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
        <footer className="border-t-4 border-[#1E293B] bg-[#1E293B] text-slate-400 py-6 text-center text-[10px] md:text-xs space-y-1 select-none px-4">
          <p className="font-extrabold text-white tracking-widest uppercase">⚽ SÁNG TÂM HỒN - TỐI TÂM TRẠNG WORLD CUP 2026</p>
          <p className="text-slate-400 text-[10px] md:text-[11px]">Hỗ trợ Excel tự động tính toán chính xác • Hoàn toàn không cá độ ăn tiền thực tế.</p>
          <p className="text-[9px] md:text-[10px] text-slate-500 font-mono tracking-tight">CRAFTED WITH GEOMETRIC BALANCE DESIGN CONCEPT © 2026 AI STUDIO</p>
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
    );
  };

  return (
    <div className={`min-h-screen bg-[#F1F5F9] text-slate-800 font-sans leading-normal antialiased transition-all duration-300 ${
      useIPhoneFrame 
        ? 'flex items-center justify-center py-6 px-4 bg-slate-800' 
        : 'p-0 sm:p-4 md:p-6 lg:p-8'
    }`}>
      
      {/* FLOATING FRAME TOGGLE BUTTON (DESKTOP ONLY) */}
      <div className="fixed bottom-6 right-6 z-50 hidden md:flex items-center gap-2">
        <button
          onClick={() => setUseIPhoneFrame(!useIPhoneFrame)}
          className={`px-5 py-3 rounded-full font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0px_6px_20px_rgba(0,0,0,0.3)] border-2 border-slate-900 cursor-pointer ${
            useIPhoneFrame
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>📱</span> {useIPhoneFrame ? 'Tắt Khung iPhone' : 'Bật bộ khung iPhone 13 Pro Max'}
        </button>
      </div>

      {useIPhoneFrame ? (
        /* INSTANT HIGH-FIDELITY PHYSICAL IPHONE 13 PRO MAX SIMULATOR CHASSIS */
        <div className="relative mx-auto w-[428px] h-[926px] bg-[#111827] rounded-[60px] p-[12px] shadow-[0px_25px_60px_-15px_rgba(0,0,0,0.8)] border-[6px] border-[#374151] shrink-0 flex flex-col overflow-hidden">
          
          {/* PHYSICAL SIDE VOLUME BUTTONS CHROME */}
          <div className="absolute left-[-6px] top-[140px] w-[6px] h-[60px] bg-slate-700 rounded-l-md"></div>
          <div className="absolute left-[-6px] top-[210px] w-[6px] h-[60px] bg-slate-700 rounded-l-md"></div>
          {/* POWER BUTTON */}
          <div className="absolute right-[-6px] top-[180px] w-[6px] h-[90px] bg-slate-700 rounded-r-md"></div>

          {/* IPHONE 13 PRO MAX CAMERA NOTCH */}
          <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[150px] h-[30px] bg-black rounded-b-[18px] z-50 flex items-center justify-center shadow-inner">
            {/* Camera dot reflection */}
            <div className="w-2.5 h-2.5 bg-[#0f172a] rounded-full border border-slate-800 absolute right-4 font-sans text-[8px] text-slate-400"></div>
            {/* Speaker lines */}
            <div className="w-14 h-1 bg-slate-800 rounded-full"></div>
          </div>

          {/* INTERNAL VIEWPORT SCREEN */}
          <div className="w-full h-full bg-[#F8FAFC] rounded-[48px] overflow-hidden border-[4px] border-black flex flex-col relative">
            
            {/* iOS Status Bar */}
            <div className="h-11 bg-[#1E293B] text-white flex items-center justify-between px-7 shrink-0 select-none text-[10px] font-bold tracking-tight">
              <span>09:41</span>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>

            {/* Inner responsive viewport client area */}
            <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col bg-slate-50">
              {renderAppContent(true)}
            </div>

            {/* iOS Bottom Navigation Bar Home Indicator */}
            <div className="h-5 bg-slate-900 flex items-center justify-center shrink-0 w-full z-40 select-none">
              <div className="w-32 h-1 bg-white/60 rounded-full"></div>
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD VIEWPORT FULL-REPRESENTATION */
        <div className="w-full h-full">
          {renderAppContent(false)}
        </div>
      )}
    </div>
  );
}
