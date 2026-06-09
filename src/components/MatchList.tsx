import React, { useState } from 'react';
import { Match } from '../types';
import { Calendar, Plus, Trash2, CheckCircle2, Trophy, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MatchListProps {
  matches: Match[];
  onUpdateMatchScore: (matchId: string, scoreA: number | null, scoreB: number | null) => void;
  onAddMatch: (match: Omit<Match, 'id'>) => void;
  onDeleteMatch: (matchId: string) => void;
}

export default function MatchList({
  matches,
  onUpdateMatchScore,
  onAddMatch,
  onDeleteMatch
}: MatchListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'unplayed' | 'played'>('all');
  
  // Add match form states
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [stage, setStage] = useState('Vòng Bảng');
  const [handicap, setHandicap] = useState('0.5');

  // Score editing states per match id
  const [editScores, setEditScores] = useState<{ [matchId: string]: { scoreA: string; scoreB: string } }>({});

  const handleStartEditScore = (m: Match) => {
    setEditScores({
      ...editScores,
      [m.id]: {
        scoreA: m.scoreA !== null ? m.scoreA.toString() : '',
        scoreB: m.scoreB !== null ? m.scoreB.toString() : ''
      }
    });
  };

  const handleSaveScore = (matchId: string) => {
    const scores = editScores[matchId];
    if (scores) {
      if (scores.scoreA === '' || scores.scoreB === '') {
        // If empty, set back to null (unplayed)
        onUpdateMatchScore(matchId, null, null);
      } else {
        onUpdateMatchScore(matchId, parseInt(scores.scoreA) || 0, parseInt(scores.scoreB) || 0);
      }
      
      // Remove match id from edit list to exit edit mode
      const updated = { ...editScores };
      delete updated[matchId];
      setEditScores(updated);
    }
  };

  const handleClearScore = (matchId: string) => {
    onUpdateMatchScore(matchId, null, null);
    const updated = { ...editScores };
    delete updated[matchId];
    setEditScores(updated);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamA || !teamB || !dateTime) {
      return;
    }
    onAddMatch({
      teamA,
      teamB,
      dateTime,
      stage,
      scoreA: null,
      scoreB: null,
      handicap: parseFloat(handicap) || 0
    });
    // Reset form
    setTeamA('');
    setTeamB('');
    setDateTime('');
    setStage('Vòng Bảng');
    setHandicap('0.5');
    setShowAddForm(false);
  };

  // Filter and sort matches
  const filteredMatches = matches.filter((m) => {
    if (filterType === 'played') return m.scoreA !== null && m.scoreB !== null;
    if (filterType === 'unplayed') return m.scoreA === null || m.scoreB === null;
    return true;
  }).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  return (
    <div className="space-y-8">
      {/* FILTER TABS & ADD ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* FILTERS (GEOMETRIC MECHANICAL TABS) */}
        <div className="flex bg-slate-200 p-1.5 rounded-lg border-2 border-slate-900 flex-wrap gap-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded transition-all cursor-pointer ${
              filterType === 'all' 
                ? 'bg-[#1E293B] text-white shadow-[2px_2px_0px_#000] border border-slate-950' 
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-300'
            }`}
          >
            TẤT CẢ ({matches.length})
          </button>
          <button
            onClick={() => setFilterType('unplayed')}
            className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded transition-all cursor-pointer ${
              filterType === 'unplayed' 
                ? 'bg-red-500 text-white shadow-[2px_2px_0px_#000] border border-slate-950' 
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-300'
            }`}
          >
            SẮP THI ĐẤU ({matches.filter((m) => m.scoreA === null).length})
          </button>
          <button
            onClick={() => setFilterType('played')}
            className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded transition-all cursor-pointer ${
              filterType === 'played' 
                ? 'bg-emerald-500 text-slate-950 shadow-[2px_2px_0px_#000] border border-slate-950' 
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-300'
            }`}
          >
            ĐÃ Xong ({matches.filter((m) => m.scoreA !== null).length})
          </button>
        </div>

        {/* ADD MATCH TRIGGER */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-350 text-slate-950 px-4 py-2.5 rounded border-2 border-slate-900 text-xs font-black uppercase tracking-wider transition-all shadow-[3px_3px_0px_#000] active:translate-y-0.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3px]" /> THÊM TRẬN ĐẤU MỚI
        </button>
      </div>

      {/* EXPANDABLE ADD MATCH FORM */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white border-4 border-slate-900 rounded-xl shadow-[6px_6px_0px_#1E293B]"
          >
            <form onSubmit={handleSubmitAdd} className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-[10px] text-slate-900 font-extrabold mb-1.5 uppercase tracking-wider">Đội nhà (Chủ nhà)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Anh 🏴󠁧󠁢󠁥󠁮󠁧󠁿"
                  value={teamA}
                  onChange={(e) => setTeamA(e.target.value)}
                  className="w-full bg-white border-2 border-slate-900 text-xs font-bold px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-900 font-extrabold mb-1.5 uppercase tracking-wider">Đội khách</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Pháp 🇫🇷"
                  value={teamB}
                  onChange={(e) => setTeamB(e.target.value)}
                  className="w-full bg-white border-2 border-slate-900 text-xs font-bold px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-900 font-extrabold mb-1.5 uppercase tracking-wider">Thời gian thi đấu</label>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full bg-white border-2 border-slate-900 text-xs font-black px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-slate-800"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] text-slate-900 font-extrabold mb-1.5 uppercase tracking-wider">Vòng đấu / Bảng</label>
                <input
                  type="text"
                  placeholder="Bảng B, Vòng 1/8, Tứ Kết..."
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full bg-white border-2 border-slate-900 text-xs font-bold px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="md:col-span-5 flex justify-end gap-2 pt-3 border-t-2 border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border-2 border-slate-900 hover:bg-slate-100 rounded text-xs font-black uppercase tracking-wider text-slate-950 transition-all cursor-pointer"
                >
                  HỦY BỎ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded border-2 border-slate-950 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> TẠO TRẬN ĐẤU MỚI
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIST OF MATCHES Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((m) => {
            const hasResult = m.scoreA !== null && m.scoreB !== null;
            const isEditing = editScores[m.id] !== undefined;

            // Formatted date
            const dateObj = new Date(m.dateTime);
            const formattedDate = dateObj.toLocaleDateString('vi-VN', {
              weekday: 'long',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
            const formattedTime = dateObj.toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <motion.div
                key={m.id}
                layout
                className={`bg-white rounded-xl border-4 border-slate-900 p-5 shadow-[4px_4px_0px_#1E293B] space-y-4 relative flex flex-col justify-between hover:scale-[1.01] transition-transform ${
                  hasResult
                    ? 'bg-emerald-50/40'
                    : ''
                }`}
              >
                {/* MATCH STAGE & HEADER ACTIONS */}
                <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] px-2.5 py-1 rounded border-2 border-slate-900 bg-white text-slate-800 font-black uppercase tracking-wider">
                      {m.stage}
                    </span>
                    {hasResult && (
                      <span className="text-[9px] px-2.5 py-1 rounded border-2 border-slate-900 bg-emerald-300 text-slate-950 font-black uppercase tracking-wide flex items-center gap-1 shadow-[1px_1px_0px_#000]">
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[3px]" /> ĐÃ KẾT THÚC
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteMatch(m.id)}
                    className="p-1 px-2 border-2 border-transparent hover:border-red-950 hover:bg-red-100 text-slate-500 hover:text-red-700 rounded transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                    title="Xóa trận đấu này"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> XÓA
                  </button>
                </div>

                {/* TEAMS VERSUS LAYOUT */}
                <div className="flex items-center justify-between py-2 text-center select-none font-sans">
                  {/* TEAM A */}
                  <div className="flex-1 text-center font-black text-slate-900 flex flex-col items-center">
                    <span className="text-2xl mb-1.5">
                      ⚽
                    </span>
                    <span className="text-sm block line-clamp-1 max-w-[120px] uppercase italic tracking-tight">{m.teamA}</span>
                  </div>

                  {/* VS / GOALS FIELD */}
                  <div className="w-28 flex flex-col items-center justify-center">
                    {isEditing ? (
                      /* EDIT SCORE CONTAINER */
                      <div className="flex items-center gap-1 bg-yellow-50 p-1.5 rounded border-2 border-slate-900">
                        <input
                          type="number"
                          placeholder="スコアA"
                          value={editScores[m.id].scoreA}
                          onChange={(e) =>
                            setEditScores({
                              ...editScores,
                              [m.id]: {
                                ...editScores[m.id],
                                scoreA: e.target.value
                              }
                            })
                          }
                          className="w-8 h-8 rounded text-center text-sm font-black bg-white border-2 border-slate-900 text-slate-900"
                        />
                        <span className="text-slate-900 font-black text-xs">-</span>
                        <input
                          type="number"
                          placeholder="スコアB"
                          value={editScores[m.id].scoreB}
                          onChange={(e) =>
                            setEditScores({
                              ...editScores,
                              [m.id]: {
                                ...editScores[m.id],
                                scoreB: e.target.value
                              }
                            })
                          }
                          className="w-8 h-8 rounded text-center text-sm font-black bg-white border-2 border-slate-900 text-slate-900"
                        />
                      </div>
                    ) : (
                      /* STATIC DISPLAY SCORE */
                      <div className="text-2xl font-mono font-black italic text-slate-900 tracking-wider">
                        {hasResult ? (
                          <span className="text-red-500 bg-white border-2 border-slate-900 px-3 py-1.5 rounded shadow-[2px_2px_0px_#000]">
                            {m.scoreA} - {m.scoreB}
                          </span>
                        ) : (
                          <span className="text-slate-300">VS</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* TEAM B */}
                  <div className="flex-1 text-center font-black text-slate-900 flex flex-col items-center">
                    <span className="text-2xl mb-1.5">⚽</span>
                    <span className="text-sm block line-clamp-1 max-w-[120px] uppercase italic tracking-tight">{m.teamB}</span>
                  </div>
                </div>

                {/* SCORE SAVING / CANCELLING / CALENDAR INFO */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t-2 border-slate-200 pt-3 text-[10px] text-slate-500 font-black uppercase tracking-wide gap-2">
                  <span className="flex items-center gap-1 font-mono text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {formattedTime} • {formattedDate}
                  </span>

                  <div className="flex justify-end">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleClearScore(m.id)}
                          className="px-2 py-1 border-2 border-red-900 bg-red-50 hover:bg-red-100 text-red-900 rounded font-black text-[9px] cursor-pointer"
                        >
                          HỦY KQ
                        </button>
                        <button
                          onClick={() => handleSaveScore(m.id)}
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 border-2 border-slate-950 rounded font-black text-[9px] shadow-[1px_1px_0px_#000] cursor-pointer"
                        >
                          LƯU LẠI
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEditScore(m)}
                        className={`px-3 py-1.5 border-2 rounded font-black uppercase tracking-wider text-[9px] transition-all cursor-pointer ${
                          hasResult
                            ? 'border-slate-900 text-slate-700 bg-white hover:bg-slate-100 shadow-[2px_2px_0px_#000]'
                            : 'border-slate-900 bg-yellow-400 hover:bg-yellow-350 text-slate-950 shadow-[2px_2px_0px_#000]'
                        }`}
                      >
                        {hasResult ? '✏️ SỬA TỈ SỐ CHUNG' : '⚽ ĐIỀN KẾT QUẢ'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-2 py-12 text-center text-slate-400 bg-white border-4 border-slate-900 rounded-xl shadow-[4px_4px_0px_#1E293B]">
            <Trophy className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-black uppercase italic tracking-tight text-slate-800">Không tìm thấy trận đấu nào!</p>
            <p className="text-xs text-slate-400 mt-1 uppercase font-bold">Bấm nút "THÊM TRẬN ĐẤU MỚI" để bắt đầu xếp lịch mới.</p>
          </div>
        )}
      </div>
    </div>
  );
}
