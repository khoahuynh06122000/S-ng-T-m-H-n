import React, { useState } from 'react';
import { StandingRow, ScoringConfig } from '../types';
import { Trophy, ShieldAlert, Award, Search, Coins, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LeaderboardProps {
  standings: StandingRow[];
  scoringConfig: ScoringConfig;
  onNavigateToFines: () => void;
  onNavigateToSpreadsheet: () => void;
}

export default function Leaderboard({
  standings,
  scoringConfig,
  onNavigateToFines,
  onNavigateToSpreadsheet,
}: LeaderboardProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStandings = standings.filter((row) =>
    row.participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Find the top player (Nhà tài trợ Kim Cương)
  const leader = standings[0];
  
  // Calculate Total Accumulated fund for the party
  const totalAccruedFund = standings.reduce((sum, row) => sum + (row.fines || 0), 0);

  // Find "Thánh Ăn Chực" / May mắn thua ít nhất
  const evaluatedParticipants = standings.filter(s => s.predictedCount > 0);
  const scrounger = leader; 

  // Find "Nhà Tài Trợ Vàng Hắc Ám" (highest fines / guessed wrong most)
  const sortedByFinesDesc = [...evaluatedParticipants].sort((a, b) => b.fines - a.fines);
  const worstFineAmount = sortedByFinesDesc[0]?.fines ?? 0;
  const worstLeaguers = evaluatedParticipants.filter(s => s.fines === worstFineAmount && worstFineAmount > 0);

  return (
    <div className="space-y-8" id="leaderboard-wrapper">
      {/* SECTION: GENERAL ALERTS & HEADERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CARD 1: TỔNG QUỸ LIÊN HOAN TỔNG KẾT */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border-4 border-slate-950 text-white rounded-xl p-5 shadow-[6px_6px_0px_#1E293B] flex flex-col justify-between"
          id="leaderboard-card-fund"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded border border-amber-500 flex items-center gap-1.5 animate-pulse">
                <span>🍺</span> TIỆC TỔNG KẾT PKT
              </span>
              <Coins className="w-8 h-8 text-amber-400 stroke-[2px]" />
            </div>
            
            <h3 className="font-sans text-xs font-bold text-slate-400 uppercase tracking-wider">TỔNG QUỸ HOÀN TRÁCH</h3>
            <div className="text-3xl font-black text-amber-400 font-mono italic tracking-tight mt-1">
              {totalAccruedFund.toLocaleString('vi-VN')} VNĐ
            </div>
            <p className="text-[11px] text-slate-350 leading-relaxed font-bold mt-3">
              Mỗi lượt đoán sai tự động cộng dồn tiền phạt vào quỹ. Không tính điểm số rườm rà - quỹ dùng 100% tài trợ buffet bia bọt liên hoan cho cả phòng PKT!
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">Ủng hộ quỹ, vui là chính!</span>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">CHƠI HẾT MÌNH 🔥</span>
          </div>
        </motion.div>

        {/* CARD 2: NHÀ TÀI TRỢ KIM CƯƠNG */}
        {leader && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="bg-[#FCD34D] border-4 border-[#1E293B] rounded-xl p-5 shadow-[6px_6px_0px_#1E293B] flex flex-col justify-between"
            id="leaderboard-card-leader"
          >
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-yellow-500/35 pb-2">
                <span className="px-2.5 py-1 bg-[#1E293B] text-white text-[10px] font-black uppercase tracking-wider rounded border border-[#1E293B] flex items-center gap-1">
                  <Award className="w-3 h-3 text-yellow-400" /> NHÀ TÀI TRỢ KIM CƯƠNG 💎
                </span>
                <Trophy className="w-8 h-8 text-[#1E293B]" />
              </div>
              <h3 className="font-sans text-xl font-black text-[#1E293B] leading-none uppercase italic truncate">
                {leader.participant.name}
              </h3>
              <p className="text-[#6B21A8] text-[10px] font-black uppercase tracking-wider mt-1.5 min-h-[30px] leading-relaxed">
                Đóng phạt ít nhất phòng! Gánh team uy tín, có đặc quyền được AE phục vụ tận răng tại bữa tiệc!
              </p>
              
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="bg-white border-2 border-slate-900 p-2 rounded">
                  <div className="text-slate-500 text-[8px] uppercase font-black tracking-tight">ĐÃ PHẠT</div>
                  <div className="text-base font-black text-amber-600 font-mono italic">{leader.fines.toLocaleString('vi-VN')}đ</div>
                </div>
                <div className="bg-white border-2 border-slate-900 p-2 rounded">
                  <div className="text-slate-500 text-[8px] uppercase font-black tracking-tight">ĐOÁN TRÚNG</div>
                  <div className="text-base font-black text-emerald-700 font-mono italic">{leader.outcomeCount} trận</div>
                </div>
              </div>
            </div>
            
            <button
              onClick={onNavigateToSpreadsheet}
              className="mt-4 text-[10px] font-black text-slate-950 uppercase tracking-widest hover:underline flex items-center gap-1 justify-start cursor-pointer"
            >
              Coi Trực Tiếp Ma Trận Excel →
            </button>
          </motion.div>
        )}

        {/* CARD 3: THÁNH ĂN CHỰC / DANGER ZONE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-red-600 text-white border-4 border-slate-950 rounded-xl p-5 shadow-[6px_6px_0px_#1E293B] flex flex-col justify-between"
          id="leaderboard-card-losers"
        >
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-red-700/40 pb-2">
              <span className="px-2.5 py-1 bg-white text-red-700 text-[10px] font-black uppercase tracking-wider rounded border border-white flex items-center gap-1">
                💀 NỘP XIỀN HẮC ÁM 💸
              </span>
              <span className="text-lg animate-bounce">⚠️</span>
            </div>

            {worstLeaguers.length > 0 ? (
              <div>
                <h4 className="font-sans text-lg font-black uppercase italic tracking-tight truncate text-white">
                  {worstLeaguers.map(s => s.participant.name).join(', ')}
                </h4>
                <p className="text-red-100 text-[10px] mt-1.5 font-bold min-h-[30px] leading-relaxed">
                  Đội đóng tủ nộp quỹ nhiệt tình nhất! Đã tích lũy kỷ lục đóng phạt: <strong className="text-yellow-300">{(worstFineAmount).toLocaleString('vi-VN')}đ</strong>. Cố lên sếp ơi/AE ơi!
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-slate-900 font-mono">
                  <div className="bg-white border-2 border-slate-900 p-2 rounded">
                    <div className="text-slate-500 text-[8px] uppercase font-black tracking-tight font-sans">ĐOÁN SAI</div>
                    <div className="text-sm font-black text-red-600 italic">{worstLeaguers[0].wrongCount} trận</div>
                  </div>
                  <div className="bg-white border-2 border-slate-900 p-2 rounded">
                    <div className="text-slate-500 text-[8px] uppercase font-black tracking-tight font-sans">ÁP LỰC QUỸ</div>
                    <div className="text-sm font-black text-rose-750 italic">{worstLeaguers[0].fines.toLocaleString('vi-VN')}đ</div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h4 className="font-sans text-xs font-black uppercase italic text-yellow-300">CHƯA KHỎI TRANH CHỐT</h4>
                <p className="text-red-100 text-[10px] mt-2 font-bold leading-relaxed">
                  Chưa trận đấu nào có tỉ số! Khi kết quả cập nhật bóng lăn, BXH nộp tiền phạt sáng nhất văn phòng sẽ lộ diện!
                </p>
                <div className="mt-4 py-2 border border-dashed border-red-400 text-center bg-red-700/35 rounded text-[10px] font-bold text-slate-200">
                  ĐANG BÁM NÚT AN TOÀN
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-red-500/75 flex items-center justify-between">
            <span className="text-[9px] text-red-150 uppercase tracking-widest font-bold">Thua là bạn, nộp là vui</span>
            <button
              onClick={onNavigateToFines}
              className="text-[10px] font-black text-yellow-350 hover:underline uppercase cursor-pointer"
            >
              Vào Sổ Phạt →
            </button>
          </div>
        </motion.div>
      </div>

      {/* SEARCH AND RULES TABLE */}
      <div className="bg-white rounded-xl border-4 border-[#1E293B] shadow-[8px_8px_0px_#1E293B] overflow-hidden" id="leaderboard-table-section">
        
        {/* STATS HEADER */}
         <div className="p-5 md:p-6 bg-[#1E293B] border-b-4 border-[#1E293B] text-white flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h3 className="font-sans font-black text-lg uppercase italic tracking-tight text-white">BẢNG THEO DÕI NỘP QUỸ LIÊN HOAN PKT</h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-bold mt-1.5 uppercase text-slate-350">
              <span className="text-emerald-400 font-black">🎯 Đoán đúng: KHÔNG PHẢI NỘP QUỸ (0đ) ❌💸</span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-red-400">Sai Vòng bảng/32: <span className="font-mono text-xs">10kđ</span></span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-red-400">Sai Vòng 16: <span className="font-mono text-xs">20kđ</span></span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-red-400">Sai Tứ kết: <span className="font-mono text-xs">30kđ</span></span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-red-400">Sai Bán kết: <span className="font-mono text-xs">40kđ</span></span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-red-400">Sai Chung kết: <span className="font-mono text-xs">50kđ</span></span>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="relative">
            <input
              type="text"
              placeholder="TÌM THEO TÊN THÀNH VIÊN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border-2 border-white bg-slate-800 text-white placeholder-slate-400 text-xs font-bold rounded focus:outline-none focus:ring-2 focus:ring-red-500 w-full md:w-60 uppercase font-mono"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* STANDINGS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-900 border-b-4 border-slate-900 text-[10px] font-black uppercase tracking-wider">
                <th className="py-4 px-4 w-20 text-center">HẠNG</th>
                <th className="py-4 px-4">THÀNH VIÊN</th>
                <th className="py-4 px-4 text-center">ĐÃ DỰ ĐOÁN</th>
                <th className="py-4 px-4 text-center text-emerald-800 bg-emerald-50/30">ĐOÁN ĐÚNG (0đ) 🌟</th>
                <th className="py-4 px-4 text-center text-red-650">VOTE SAI / TRỄ 💀</th>
                <th className="py-4 px-5 text-right w-44 text-slate-950 bg-amber-100">NỘP QUỸ CỘNG DỒN (VNĐ) 💰</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-200">
              {filteredStandings.length > 0 ? (
                filteredStandings.map((row) => {
                  const originalIndex = standings.findIndex((s) => s.participant.id === row.participant.id);
                  const isFirst = originalIndex === 0;
                  const isSecond = originalIndex === 1;
                  const isThird = originalIndex === 2;
                  const isHighestFine = row.fines === worstFineAmount && worstFineAmount > 0;

                  return (
                    <motion.tr
                      key={row.participant.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-slate-50 transition-all font-mono font-bold ${
                        isHighestFine
                          ? 'bg-red-50 hover:bg-red-100/70'
                          : isFirst
                          ? 'bg-yellow-50 hover:bg-yellow-100/50'
                          : ''
                      }`}
                    >
                      {/* RANK COLUMN */}
                      <td className="py-4 px-4 text-center font-black text-sm">
                        {isFirst ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded border-2 border-slate-900 bg-yellow-400 text-slate-900 text-sm font-black shadow-[2px_2px_0px_#000]">
                            1
                          </span>
                        ) : isSecond ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded border-2 border-slate-900 bg-slate-200 text-slate-800 text-sm font-black shadow-[2px_2px_0px_#000]">
                            2
                          </span>
                        ) : isThird ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded border-2 border-slate-900 bg-[#CD7F32] text-white text-xs font-black shadow-[2px_2px_0px_#000]">
                            3
                          </span>
                        ) : isHighestFine ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded border-2 border-slate-900 bg-red-500 text-white text-xs font-black animate-pulse shadow-[2px_2px_0px_#000]">
                            💀
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-8 h-8 text-slate-600">
                            {originalIndex + 1}
                          </span>
                        )}
                      </td>

                      {/* PARTICIPANT INFO */}
                      <td className="py-4 px-4 font-sans">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded border-2 border-slate-900 ${row.participant.avatarColor} flex items-center justify-center text-white font-black shadow-[2px_2px_0px_rgba(0,0,0,0.15)] text-xs uppercase`}>
                            {row.participant.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-950 text-xs flex items-center gap-1.5 uppercase tracking-tight">
                              {row.participant.name}
                              {isHighestFine ? (
                                <span className="text-[8px] bg-red-650 text-white font-black px-1.5 py-0.5 rounded border border-slate-900 uppercase tracking-widest shadow-[1px_1px_0px_#000]">
                                  TÀI TRỢ CHÍNH ⚠️
                                </span>
                              ) : null}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* STATS */}
                      <td className="py-4 px-4 text-center text-slate-800 font-black text-xs">
                        {row.predictedCount} trận
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded border-2 border-slate-900 bg-emerald-100 text-emerald-950 text-xs font-black font-mono">
                          {row.outcomeCount}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded border-2 border-slate-900 bg-slate-100 text-slate-700 text-xs font-black font-mono">
                          {row.wrongCount}
                        </span>
                      </td>
                      
                      {/* ACCUMULATED FINE */}
                      <td className="py-4 px-5 text-right font-mono text-sm font-black pr-6">
                        <span className={`px-2.5 py-1 rounded border ${
                          isHighestFine 
                            ? 'text-red-700 bg-red-100 border-red-300' 
                            : isFirst 
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-300' 
                            : 'text-slate-900 bg-amber-50 border-amber-200'
                        }`}>
                          {(row.fines || 0).toLocaleString('vi-VN')} đ
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center text-slate-400 uppercase tracking-wider font-extrabold italic">
                    Không tìm thấy thành viên nào phù hợp!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
