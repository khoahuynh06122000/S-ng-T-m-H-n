import React, { useState, useEffect } from 'react';
import { Participant, StandingRow, Match, Prediction } from '../types';
import { CalendarDays, AlertTriangle, Info, Clock, Save, Users, TrendingUp, Sparkles, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FinesTrackerProps {
  participants: Participant[];
  standings: StandingRow[];
  matches: Match[];
  predictions: Prediction[];
  onUpdatePrediction: (pId: string, mId: string, choice: 'A' | 'B') => void;
}

export default function FinesTracker({
  participants,
  standings,
  matches,
  predictions,
  onUpdatePrediction
}: FinesTrackerProps) {
  
  // Find the next upcoming matches (scoreA is null, sorted by dateTime)
  const upcomingMatches = matches
    .filter(m => m.scoreA === null)
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  // Current selected match for preview
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');

  // Auto-select the first upcoming match when component loads
  useEffect(() => {
    if (upcomingMatches.length > 0 && !selectedMatchId) {
      setSelectedMatchId(upcomingMatches[0].id);
    } else if (matches.length > 0 && !selectedMatchId) {
      setSelectedMatchId(matches[0].id);
    }
  }, [upcomingMatches, matches, selectedMatchId]);

  // Selected match object
  const currentMatch = matches.find(m => m.id === selectedMatchId) || matches[0];

  // Quick edit states
  const [editingParticipantId, setEditingParticipantId] = useState<string | null>(null);

  // Sổ phạt chốt sau chung kết
  // Check if the World Cup Final is completed
  const finalMatch = matches.find(
    m => m.id === 'm38' || m.stage.toLowerCase().includes('chung kết') || m.stage.toLowerCase().includes('final')
  );
  
  const isFinalFinished = finalMatch ? finalMatch.scoreA !== null && finalMatch.scoreB !== null : false;

  // Find top donor(s) (highest fines) for final penalties
  const highestFines = standings.length > 0 ? Math.max(...standings.map(s => s.fines)) : 0;
  const bottomStandingsGroup = standings.filter(s => s.fines === highestFines && highestFines > 0);

  // Active prediction list for the selected match
  const matchPredictions = predictions.filter(p => p.matchId === selectedMatchId);

  // Calculate statistics for the selected match
  const totalPredicted = matchPredictions.length;
  let homeWins = 0;
  let awayWins = 0;

  matchPredictions.forEach(pred => {
    if (pred.choice === 'A') homeWins++;
    else if (pred.choice === 'B') awayWins++;
  });

  // Calculate percentages
  const pctHome = totalPredicted > 0 ? Math.round((homeWins / totalPredicted) * 100) : 0;
  const pctAway = totalPredicted > 0 ? Math.round((awayWins / totalPredicted) * 100) : 0;

  const handleSelectChoiceForParticipant = (pId: string, choice: 'A' | 'B') => {
    onUpdatePrediction(pId, selectedMatchId, choice);
    setEditingParticipantId(null);
  };

  return (
    <div className="space-y-8" id="fines-tracker-main">
      
      {/* BANNER THÔNG BÁO VỀ HÌNH PHẠT CHUNG CUỘC */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border-4 rounded-xl p-5 shadow-[6px_6px_0px_#1E293B] flex flex-col md:flex-row items-start md:items-center gap-4 ${
          isFinalFinished 
            ? 'bg-emerald-100 border-emerald-950 text-emerald-950 shadow-[6px_6px_0px_#064E3B]' 
            : 'bg-amber-50 border-amber-800 text-amber-950 shadow-[6px_6px_0px_#78350F]'
        }`}
        id="penalty-announcement-banner"
      >
        <div className={`p-3 rounded-lg border-2 ${isFinalFinished ? 'bg-emerald-500 border-emerald-950 text-white' : 'bg-yellow-450 bg-yellow-400 border-amber-950 text-slate-900'}`}>
          <AlertTriangle className="w-6 h-6 stroke-[2.5px] animate-pulse" />
        </div>
        <div className="space-y-1 flex-1">
          <h3 className="font-sans font-black text-xs uppercase tracking-wider">
            {isFinalFinished ? '🏆 GIẢI ĐẤU ĐÃ KẾT THÚC - CHỐT DANH SÁCH PHẠT CHUNG CUỘC!' : '⚠️ QUY CHẾ VĂN PHÒNG: HÌNH PHẠT CHỈ CHỐT SAU CHUNG KẾT'}
          </h3>
          <p className="text-xs font-bold leading-relaxed opacity-90">
            {isFinalFinished 
              ? `Chung kết đã hoàn tất! Chúc mừng các chiến thần đứng đầu. Xin chia buồn, các thành viên đứng chót bảng bắt đầu gánh phạt chiêu đãi cả phòng!`
              : `Toàn bộ hình phạt lo nước uống/đồ ăn chỉ được CHỐT CHÍNH THỨC sau khi trận Chung kết khép lại. Danh sách đội sổ bên dưới hiện tại chỉ mang tính tham khảo để tăng nhiệt độ kịch tính!`}
          </p>
        </div>
        <div className="text-xs font-black px-3 py-1.5 rounded border-2 uppercase font-mono tracking-wider bg-white border-slate-900 shadow-[2px_2px_0px_rgba(0,0,0,0.15)] text-slate-800 self-start md:self-auto shrink-0">
          {isFinalFinished ? 'ĐÃ KHÓA SỔ PHẠT 🔒' : 'ĐANG UPDATE ⏰'}
        </div>
      </motion.div>

      {/* CORE LAYOUT: TWO SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* LEFT COLUMN: UPCOMING MATCH DOCK & QUICK EDIT PREDICTIONS (3/5 width) */}
        <div className="bg-white border-4 border-slate-900 rounded-xl p-6 shadow-[8px_8px_0px_#1E293B] col-span-1 lg:col-span-3 space-y-6" id="matching-vote-panel">
          
          {/* HEADER ROW */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-200 pb-4 gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-600 stroke-[3px]" />
              <h3 className="font-sans font-black text-xs uppercase tracking-wider text-slate-900">DỰ ĐOÁN CHỌN ĐỘI THẮNG TRẬN ĐẤU GIỜ G</h3>
            </div>
            
            {/* MATCH SELECTOR */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedMatchId}
                onChange={(e) => setSelectedMatchId(e.target.value)}
                className="bg-white border-2 border-slate-900 rounded text-xs font-black p-1.5 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer uppercase font-mono max-w-[210px]"
                id="select-active-match"
              >
                <optgroup label="Trận chưa diễn ra" className="font-bold">
                  {matches.filter(m => m.scoreA === null).map(m => (
                    <option key={m.id} value={m.id}>
                      {m.teamA.split(' ')[0]} VS {m.teamB.split(' ')[0]} ({m.stage.split(' ')[0]})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Trận đã hoàn thành" className="font-bold text-slate-400">
                  {matches.filter(m => m.scoreA !== null).map(m => (
                    <option key={m.id} value={m.id}>
                      ✅ {m.teamA.split(' ')[0]} VS {m.teamB.split(' ')[0]} ({m.stage.split(' ')[0]})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* ACTIVE MATCH HIGHLIGHT CARD */}
          {currentMatch && (
            <div className="bg-slate-950 text-white rounded border-2 border-slate-900 p-5 relative overflow-hidden shadow-inner flex flex-col gap-4">
              <div className="absolute top-0 right-0 bg-red-500 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl">
                {currentMatch.stage}
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* TEAMS AND LOGOS */}
                <div className="flex items-center justify-center gap-6 py-2 w-full sm:w-auto">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-black uppercase italic tracking-tight text-white">{currentMatch.teamA}</div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                      Đội A (Chủ nhà)
                    </span>
                  </div>
                  
                  <div className="text-center font-black text-red-500 text-sm italic font-sans animate-pulse">VS</div>
                  
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-black uppercase italic tracking-tight text-white">{currentMatch.teamB}</div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                      Đội B (Khách)
                    </span>
                  </div>
                </div>

                {/* DATE & TIME INFO */}
                <div className="flex flex-col items-center sm:items-end justify-center shrink-0 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-5 text-center sm:text-right w-full sm:w-auto">
                  <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-black uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5" /> GIỜ THI ĐẤU
                  </div>
                  <div className="text-xs font-black font-mono mt-1">
                    {new Date(currentMatch.dateTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} • {new Date(currentMatch.dateTime).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'})}
                  </div>
                  <div className="text-[9px] mt-1 text-slate-400 uppercase font-mono">
                    Chọn Đội Thắng Hoặc Thua
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TEAM OPINION STATISTICS */}
          <div className="p-4 bg-slate-50 rounded border-2 border-slate-200" id="psychological-stats">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-650" /> TỶ LỆ VOTE TRẬN ĐẤU VĂN PHÒNG
            </span>

            {totalPredicted > 0 ? (
              <div className="space-y-3">
                {/* Visual horizontal bar */}
                <div className="h-6 w-full rounded overflow-hidden flex text-[10px] font-black text-white text-center border border-slate-900">
                  {pctHome > 0 && (
                    <div className="bg-blue-500 flex items-center justify-center transition-all px-1 truncate" style={{ width: `${pctHome}%` }}>
                      {currentMatch?.teamA.split(' ')[0]} ({pctHome}%)
                    </div>
                  )}
                  {pctAway > 0 && (
                    <div className="bg-red-500 flex items-center justify-center transition-all px-1 truncate" style={{ width: `${pctAway}%` }}>
                      {currentMatch?.teamB.split(' ')[0]} ({pctAway}%)
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-extrabold uppercase">
                  <div className="text-blue-700 bg-blue-50 py-1 rounded border border-blue-150">Chọn {currentMatch?.teamA.split(' ')[0]}: <strong className="font-mono text-xs">{homeWins} người</strong></div>
                  <div className="text-red-700 bg-red-50 py-1 rounded border border-red-150">Chọn {currentMatch?.teamB.split(' ')[0]}: <strong className="font-mono text-xs">{awayWins} người</strong></div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-2 font-bold uppercase">Chưa có ai vote dự đoán trận đấu này!</p>
            )}
          </div>

          {/* ALL PARTICIPANTS PREDICTIONS LIST */}
          <div className="space-y-3" id="live-predict-participants">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2">
              <span className="text-[10px] text-slate-900 font-black uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-850" /> DANH SÁCH CHỌN CỦA PHÒNG ({participants.length} thành viên)
              </span>
              <span className="text-[9px] text-slate-500 font-semibold italic">Nhấp vào dòng để chốt nhanh dự đoán</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {participants.map(p => {
                const pred = matchPredictions.find(pr => pr.participantId === p.id);
                const isEditing = editingParticipantId === p.id;

                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 border-2 border-slate-900 rounded bg-white hover:bg-slate-50 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.1)] group"
                  >
                    {/* LEFT: Participant Info */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 rounded border-2 border-slate-900 ${p.avatarColor} flex items-center justify-center text-white font-black text-[10px] uppercase shrink-0`}>
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-950 text-xs uppercase italic truncate block max-w-[125px]">{p.name}</span>
                    </div>

                    {/* RIGHT: Quick toggle options */}
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleSelectChoiceForParticipant(p.id, 'A')}
                            className="bg-blue-500 hover:bg-blue-600 border border-slate-950 text-white font-black text-[9px] px-2 py-1 rounded uppercase"
                          >
                            {currentMatch?.teamA.split(' ')[0]}
                          </button>
                          <button
                            onClick={() => handleSelectChoiceForParticipant(p.id, 'B')}
                            className="bg-red-500 hover:bg-red-600 border border-slate-950 text-white font-black text-[9px] px-2 py-1 rounded uppercase"
                          >
                            {currentMatch?.teamB.split(' ')[0]}
                          </button>
                          <button
                            onClick={() => setEditingParticipantId(null)}
                            className="bg-slate-200 hover:bg-slate-350 text-slate-700 text-[9px] font-bold px-1.5 py-1 rounded"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => setEditingParticipantId(p.id)}
                          className="flex items-center gap-2 cursor-pointer group-hover:bg-slate-100 p-0.5 px-2 rounded border border-transparent group-hover:border-slate-300 transition-all"
                        >
                          {pred ? (
                            <span className={`font-black text-white px-2 py-0.5 rounded text-[10px] uppercase border shadow-sm ${
                              pred.choice === 'A' 
                                ? 'bg-blue-500 border-blue-600' 
                                : 'bg-red-500 border-red-600'
                            }`}>
                              {pred.choice === 'A' ? currentMatch?.teamA : currentMatch?.teamB}
                            </span>
                          ) : (
                            <span className="text-[9px] text-amber-600 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded uppercase font-black tracking-tighter">
                              VOTE NGAY ⚡
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SỔ NỢ PHẠT TẠM THỜI CHỐT TRƯỚC VĂN PHÒNG (2/5 width) */}
        <div className="bg-white border-4 border-slate-900 rounded-xl p-6 shadow-[8px_8px_0px_#1E293B] col-span-1 lg:col-span-2 flex flex-col justify-between space-y-4" id="penalty-manifest-panel">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-slate-200 pb-3 font-sans">
              <span className="text-xl">🏆</span>
              <div>
                <h3 className="font-sans font-black text-slate-950 text-xs uppercase tracking-wider">GIỎ PHẠT VĂN PHÒNG</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">Xếp hạng bét bảng khi vòng đấu kết thúc</p>
              </div>
            </div>

            {/* LEADER TO REPORT BANNER */}
            {bottomStandingsGroup.length > 0 ? (
              <div className="bg-rose-50 border-2 border-red-500 rounded p-4 text-slate-950 space-y-2.5 shadow-[2px_2px_0px_#991B1B]">
                <div className="flex items-center gap-1.5 text-xs font-black text-red-600 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-red-650 animate-bounce" /> TOP NỘP PHẠT NỔI BẬT HIỆN TẠI
                </div>
                
                <div className="space-y-2">
                  {bottomStandingsGroup.map((stood) => (
                    <div key={stood.participant.id} className="flex items-center justify-between border-b border-red-200 pb-1.5 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-red-650 text-white rounded font-mono font-black w-4.5 h-4.5 flex items-center justify-center text-[10px]">
                          💀
                        </span>
                        <span className="text-xs font-black uppercase italic text-slate-900">{stood.participant.name}</span>
                      </div>
                      <span className="text-xs font-black font-mono bg-white px-2 py-0.5 border border-red-400 rounded text-red-700">
                        {stood.fines.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-slate-600 font-bold uppercase leading-relaxed pt-1.5 border-t border-dashed border-red-300">
                  {isFinalFinished 
                    ? '🔒 GIỎ PHẠT ĐÃ KHÓA CHỐT: Các thành viên trên chịu trách nhiệm chiêu đãi cả phòng trà sữa / đồ thơm ngọt!' 
                    : '⌛ ĐANG THI ĐẤU: Thứ hạng nộp phạt sẽ chốt chặt và đóng lại ngay khi Trọng tài nổi còi mãn cuộc trận Chung kết.'}
                </p>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 font-bold text-xs uppercase tracking-wider border-2 border-dashed border-slate-300 rounded bg-slate-50">
                Chưa có dữ liệu nộp phạt...
              </div>
            )}

            {/* QUY CHẾ GIAO KÈO PHÒNG BAN */}
            <div className="p-4 bg-slate-105 bg-slate-100 rounded border-2 border-slate-900 shadow-[2px_2px_0px_#000]">
              <span className="text-[10px] font-black uppercase text-slate-900 block mb-2 tracking-widest flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-700" /> THỂ LỆ GÁNH PHẠT BAN PKT
              </span>
              <ul className="text-[10.5px] font-bold text-slate-700 space-y-2 leading-relaxed font-sans">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#10B981] shrink-0 select-none">✔</span>
                  <span>Đoán trúng đội giành chiến thắng trận đấu: <strong className="text-emerald-600">0 VNĐ</strong> phạt.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-650 shrink-0 select-none">•</span>
                  <span>Không có tùy chọn Hòa. Dự đoán sai kết quả hoặc trễ hạn sẽ phát sinh phí phạt tương ứng.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-750 shrink-0 select-none">•</span>
                  <span><strong>Biểu phí quy chế nộp quỹ khi đoán sai:</strong>
                    <br />- Vòng bảng & 32 đội: <strong className="text-red-650">10k VNĐ</strong>
                    <br />- Vòng 16 (1/8): <strong className="text-red-650">20k VNĐ</strong>
                    <br />- Vòng Tứ kết: <strong className="text-red-650">30k VNĐ</strong>
                    <br />- Vòng Bán kết: <strong className="text-red-650">40k VNĐ</strong>
                    <br />- Trận Chung kết: <strong className="text-red-650 font-black">50k VNĐ</strong>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center border-t border-slate-200 pt-3 italic font-mono select-none">
            Không vi phạm pháp luật cá cược • Vui tươi văn phòng lành mạnh
          </div>
        </div>

      </div>
    </div>
  );
}
