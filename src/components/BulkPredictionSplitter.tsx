import React, { useState, useEffect } from 'react';
import { Match, Participant, Prediction } from '../types';
import { Check, Info, Search, HelpCircle, X, Shuffle, ArrowRightLeft, CheckSquare } from 'lucide-react';

interface BulkPredictionSplitterProps {
  participants: Participant[];
  matches: Match[];
  predictions: Prediction[];
  onSaveAllPredictions: (predictionsArray: { participantId: string; choice: 'A' | 'B' }[], matchId: string) => void;
  onClose: () => void;
}

export default function BulkPredictionSplitter({
  participants,
  matches,
  predictions,
  onSaveAllPredictions,
  onClose,
}: BulkPredictionSplitterProps) {
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Local state representing the mapping of participantId -> 'A' | 'B'
  const [choices, setChoices] = useState<Record<string, 'A' | 'B'>>({});

  // Auto-select first unplayed match on mount
  useEffect(() => {
    const upcoming = matches.find(m => m.scoreA === null);
    if (upcoming) {
      setSelectedMatchId(upcoming.id);
    } else if (matches.length > 0) {
      setSelectedMatchId(matches[0].id);
    }
  }, [matches]);

  // Load existing predictions for the selected match when match changes
  useEffect(() => {
    if (!selectedMatchId) return;

    const initialChoices: Record<string, 'A' | 'B'> = {};
    
    // Default everyone to 'B' first as requested by the user, 
    // or populate with their existing choice if they had one stored
    participants.forEach(p => {
      const existing = predictions.find(pred => pred.matchId === selectedMatchId && pred.participantId === p.id);
      initialChoices[p.id] = existing ? existing.choice : 'B';
    });

    setChoices(initialChoices);
  }, [selectedMatchId, participants, predictions]);

  const currentMatch = matches.find(m => m.id === selectedMatchId);

  if (!currentMatch) return null;

  // Toggle single member choice
  const toggleChoice = (pId: string) => {
    setChoices(prev => ({
      ...prev,
      [pId]: prev[pId] === 'A' ? 'B' : 'A',
    }));
  };

  // Set individual choice directly
  const setIndividualChoice = (pId: string, choice: 'A' | 'B') => {
    setChoices(prev => ({
      ...prev,
      [pId]: choice,
    }));
  };

  // Bulk actions
  const setAllToA = () => {
    const updated = { ...choices };
    participants.forEach(p => {
      updated[p.id] = 'A';
    });
    setChoices(updated);
  };

  const setAllToB = () => {
    const updated = { ...choices };
    participants.forEach(p => {
      updated[p.id] = 'B';
    });
    setChoices(updated);
  };

  const invertAll = () => {
    const updated = { ...choices };
    participants.forEach(p => {
      updated[p.id] = updated[p.id] === 'A' ? 'B' : 'A';
    });
    setChoices(updated);
  };

  // Filter participants
  const filteredParticipants = participants.filter(p => {
    const cleanSearch = searchQuery.toLowerCase().trim();
    if (!cleanSearch) return true;
    return p.name.toLowerCase().includes(cleanSearch);
  });

  // Count distribution
  const countA = participants.filter(p => choices[p.id] === 'A').length;
  const countB = participants.filter(p => choices[p.id] === 'B').length;

  const handleSave = () => {
    const payload = participants.map(p => ({
      participantId: p.id,
      choice: choices[p.id] || 'B'
    }));

    onSaveAllPredictions(payload, selectedMatchId);
    alert(`Đã lưu phân chia cho 28 thành viên PKT thành công! \n- ${currentMatch.teamA}: ${countA} người \n- ${currentMatch.teamB}: ${countB} người`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" id="bulk-vote-splitter">
      <div 
        className="bg-white rounded-2xl w-full max-w-4xl border-4 border-slate-900 shadow-[12px_12px_0px_#1E293B] flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-5 bg-indigo-900 text-white border-b-4 border-slate-900 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-yellow-400 border-2 border-slate-950 shadow-[2px_2px_0px_#000] flex items-center justify-center text-slate-950 text-xl font-black">
              📊
            </div>
            <div>
              <h3 className="font-sans font-black text-lg uppercase italic tracking-tight text-white flex items-center gap-2">
                CHIA NHANH VOTE CHO 28 SẾP VÀ NHÂN VIÊN PKT ⚡
              </h3>
              <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-black">
                Chọn ai vote Đội A - Tất cả những người còn lại sẽ tự động điền Đội B
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 bg-indigo-950 hover:bg-red-500 rounded text-slate-350 hover:text-white border-2 border-indigo-800 hover:border-slate-850 cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTAINER WORKPLACE */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
          
          {/* STEP 1: CHOOSE TARGET MATCH & INSTRUCTIONS */}
          <div className="bg-white p-5 rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_#1E293B] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px]">1</span> CHỌN TRẬN ĐẤU CẦN ĐIỀN VOTE:
              </span>
              
              <div className="text-[11px] font-bold text-slate-500 italic bg-amber-50 border border-amber-200 px-3 py-1 rounded">
                💡 Người được chọn xanh sẽ là Đội A, người không được chọn (xám/trắng) sẽ là Đội B.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <select
                  value={selectedMatchId}
                  onChange={(e) => setSelectedMatchId(e.target.value)}
                  className="w-full bg-white border-2 border-slate-900 rounded-lg p-3 text-sm font-black focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer uppercase font-mono"
                >
                  {matches.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.scoreA !== null ? '✅ ' : '⏳ '} {m.teamA.toUpperCase()} VS {m.teamB.toUpperCase()} ({m.stage.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* LIVE RATIO PREVIEW PANEL */}
              <div className="p-2 border-2 border-slate-900 rounded-lg bg-slate-950 text-white flex items-center justify-between overflow-hidden">
                {/* Team A side */}
                <div className="flex-1 text-center p-1.5 bg-blue-900/45 rounded">
                  <div className="text-[9px] uppercase tracking-widest text-sky-400 font-extrabold">{currentMatch.teamA}</div>
                  <div className="text-lg font-black text-white font-mono">{countA} người</div>
                  <div className="text-[8px] text-slate-350 uppercase font-bold">({Math.round(countA/28*100)}% vote)</div>
                </div>

                <div className="px-3 text-center">
                  <ArrowRightLeft className="w-4 h-4 text-slate-400 rotate-0" />
                </div>

                {/* Team B side */}
                <div className="flex-1 text-center p-1.5 bg-red-900/40 rounded">
                  <div className="text-[9px] uppercase tracking-widest text-[#F87171] font-extrabold">{currentMatch.teamB}</div>
                  <div className="text-lg font-black text-white font-mono">{countB} người</div>
                  <div className="text-[8px] text-slate-350 uppercase font-bold">({Math.round(countB/28*100)}% vote)</div>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK BULK ASSIGNER CONTROLS */}
          <div className="flex flex-flow md:flex-row flex-wrap gap-2.5 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={setAllToB}
                className="px-3 py-1.5 text-xs font-black uppercase rounded border-2 border-slate-900 bg-white hover:bg-slate-50 shadow-[2px_2px_0px_#000] cursor-pointer text-slate-800 flex items-center gap-1.5"
              >
                🔴 Cho tất cả vote {currentMatch.teamB}
              </button>
              <button
                type="button"
                onClick={setAllToA}
                className="px-3 py-1.5 text-xs font-black uppercase rounded border-2 border-slate-950 bg-blue-50 hover:bg-blue-100 shadow-[2px_2px_0px_#000] cursor-pointer text-blue-900 flex items-center gap-1.5"
              >
                🔵 Cho tất cả vote {currentMatch.teamA}
              </button>
              <button
                type="button"
                onClick={invertAll}
                className="px-3 py-1.5 text-xs font-black uppercase rounded border-2 border-slate-900 bg-[#E2E8F0] hover:bg-slate-200 shadow-[2px_2px_0px_#000] cursor-pointer text-slate-700 flex items-center gap-1.5"
                title="Đảo toàn bộ lựa chọn giữa Đội A và B"
              >
                <Shuffle className="w-3.5 h-3.5 stroke-[2.5px]" /> Đảo lựa chọn
              </button>
            </div>

            {/* SEARCH */}
            <div className="relative w-full md:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Tìm tên thành viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-2 border-slate-900 rounded-lg py-1.5 pl-9 pr-4 text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* MAIN 28 MEMBER GRID FOR SELECTION */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px]">2</span> CHỌN BẢN VOTE CHI TIẾT ({filteredParticipants.length} người hiển thị):
            </span>

            {/* GRID LAYOUT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredParticipants.map((p) => {
                const isVoteA = choices[p.id] === 'A';
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleChoice(p.id)}
                    className={`p-2.5 rounded-xl border-3 transition-all cursor-pointer flex flex-col justify-between h-[85px] relative ${
                      isVoteA
                        ? 'bg-blue-50 border-blue-650 border-blue-500 shadow-[3px_3px_0px_rgba(59,130,246,0.3)]'
                        : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-[3px_3px_0px_rgba(0,0,0,0.05)]'
                    }`}
                  >
                    {/* Upper Line: color tag & name */}
                    <div className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded border border-slate-900 shrink-0 ${p.avatarColor}`}></span>
                      <div className="truncate font-sans font-black text-xs uppercase text-slate-900 tracking-tight">
                        {p.name}
                      </div>
                    </div>

                    {/* Choice Badge Status & Action */}
                    <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-100">
                      <div className="text-[8px] font-black uppercase text-slate-500 tracking-wider">
                        VOTE CHO:
                      </div>

                      {/* Display Label choice */}
                      <span className={`text-[9.5px] px-2.5 py-0.5 rounded border font-black uppercase tracking-tight ${
                        isVoteA 
                          ? 'bg-blue-500 text-white border-blue-700' 
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {isVoteA ? currentMatch.teamA.split(' ')[0] : currentMatch.teamB.split(' ')[0]}
                      </span>
                    </div>

                    {/* Small checkbox indicating Team A selection */}
                    <div className="absolute top-2.5 right-2.5">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        isVoteA 
                          ? 'bg-blue-500 border-blue-700 text-white' 
                          : 'bg-white border-slate-350'
                      }`}>
                        {isVoteA && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                      </div>
                    </div>

                  </div>
                );
              })}

              {filteredParticipants.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-400 font-semibold text-xs uppercase">
                  Không tìm thấy thành viên nào khớp với tìm kiếm!
                </div>
              )}
            </div>
          </div>

          {/* ATTENTION INFO CARD */}
          <div className="p-3.5 bg-yellow-50 rounded-lg border-2 border-yellow-250 border-yellow-200 flex items-start gap-2.5 text-xs text-yellow-950 font-sans">
            <Info className="w-4 h-4 shrink-0 text-yellow-700 mt-0.5" />
            <div className="font-bold leading-relaxed">
              <strong>Quy chế chia cực nhanh:</strong> Bạn chỉ cần tích chọn những ai vote cho <strong className="text-blue-600 uppercase">{currentMatch.teamA}</strong> (sau khi xem ảnh rạp chat Viber). Với tất cả những người không tích, hệ thống sẽ tự động điền họ vote cho <strong className="text-slate-800 uppercase">{currentMatch.teamB}</strong> khi bạn nhấn lưu! Tiết kiệm 100% sức lực click lẻ loi.
            </div>
          </div>

        </div>

        {/* MODAL ACTION BAR */}
        <div className="p-4 bg-slate-100 border-t-4 border-slate-900 flex flex-col sm:flex-row justify-between gap-3 shrink-0 items-center">
          <div className="text-slate-500 font-mono text-[9px] uppercase font-bold text-center sm:text-left">
            Tính Năng Phân Chia Nhóm Auto-Fit Bản Quyền PKT
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-xs bg-white hover:bg-slate-50 rounded border-2 border-slate-950 font-black uppercase tracking-wider cursor-pointer"
            >
              Hủy bỏ, Đóng
            </button>
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-none px-6 py-2 rounded text-xs bg-emerald-600 hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0 text-white border-2 border-slate-950 font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] cursor-pointer inline-flex items-center justify-center gap-1.5 transition-all"
            >
              <CheckSquare className="w-4 h-4 shrink-0" />
              Lưu toàn bộ 28 dự đoán
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
