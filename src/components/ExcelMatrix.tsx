import React, { useState, useRef } from 'react';
import { Match, Participant, Prediction, ScoringConfig } from '../types';
import { calculatePoints, getFineAmountForStage } from '../utils';
import { Check, X, Save, Info, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';

interface ExcelMatrixProps {
  participants: Participant[];
  matches: Match[];
  predictions: Prediction[];
  scoringConfig: ScoringConfig;
  onUpdatePrediction: (participantId: string, matchId: string, choice: 'A' | 'B' | null) => void;
}

export default function ExcelMatrix({
  participants,
  matches,
  predictions,
  scoringConfig,
  onUpdatePrediction,
}: ExcelMatrixProps) {
  // Store cell being edited: { participantId, matchId }
  const [editingCell, setEditingCell] = useState<{ pId: string; mId: string } | null>(null);
  const [screenshotMode, setScreenshotMode] = useState(false);
  const [match1IdState, setMatch1IdState] = useState<string>('');
  const [match2IdState, setMatch2IdState] = useState<string>('');
  const [downloading, setDownloading] = useState(false);
  const [downloadingFull, setDownloadingFull] = useState(false);
  const [downloadingFocused, setDownloadingFocused] = useState(false);
  const screenshotRef = useRef<HTMLDivElement>(null);
  const fullTableRef = useRef<HTMLDivElement>(null);
  const focusedTableRef = useRef<HTMLDivElement>(null);

  const startEditCell = (pId: string, mId: string) => {
    setEditingCell({ pId, mId });
  };

  const handleSelectChoice = (choice: 'A' | 'B' | null) => {
    if (editingCell) {
      onUpdatePrediction(editingCell.pId, editingCell.mId, choice);
      setEditingCell(null);
    }
  };

  // Find default 2 most recent matches (completed or sequential)
  const completed = matches.filter(m => m.scoreA !== null && m.scoreB !== null);
  let defaultMatchId1 = matches[0]?.id || '';
  let defaultMatchId2 = matches[1]?.id || '';

  if (completed.length >= 2) {
    defaultMatchId1 = completed[completed.length - 2].id;
    defaultMatchId2 = completed[completed.length - 1].id;
  } else if (completed.length === 1) {
    defaultMatchId1 = completed[0].id;
    const otherMatches = matches.filter(m => m.id !== defaultMatchId1);
    defaultMatchId2 = otherMatches[0]?.id || matches[1]?.id || '';
  }

  const match1Id = match1IdState || defaultMatchId1;
  const match2Id = match2IdState || defaultMatchId2;

  const match1 = matches.find(m => m.id === match1Id) || matches[0];
  const match2 = matches.find(m => m.id === match2Id) || matches[1] || matches[0];

  // Counts for match 1
  const count1A = predictions.filter(pr => pr.matchId === match1Id && pr.choice === 'A').length;
  const count1B = predictions.filter(pr => pr.matchId === match1Id && pr.choice === 'B').length;
  const correct1 = participants.filter(p => {
    const pred = predictions.find(pr => pr.participantId === p.id && pr.matchId === match1Id);
    const { status } = calculatePoints(pred, match1, scoringConfig);
    return status === 'outcome';
  }).length;
  const wrong1 = participants.length - correct1;

  // Counts for match 2
  const count2A = predictions.filter(pr => pr.matchId === match2Id && pr.choice === 'A').length;
  const count2B = predictions.filter(pr => pr.matchId === match2Id && pr.choice === 'B').length;
  const correct2 = participants.filter(p => {
    const pred = predictions.find(pr => pr.participantId === p.id && pr.matchId === match2Id);
    const { status } = calculatePoints(pred, match2, scoringConfig);
    return status === 'outcome';
  }).length;
  const wrong2 = participants.length - correct2;

  const halfLength = Math.ceil(participants.length / 2);
  const leftParticipants = participants.slice(0, halfLength);
  const rightParticipants = participants.slice(halfLength);

  // Find the index of the most recently finished match
  const getCenterIndex = () => {
    let lastCompletedIndex = -1;
    for (let i = matches.length - 1; i >= 0; i--) {
      if (matches[i].scoreA !== null && matches[i].scoreB !== null) {
        lastCompletedIndex = i;
        break;
      }
    }
    return lastCompletedIndex !== -1 ? lastCompletedIndex : 0;
  };

  const centerIndex = getCenterIndex();

  const getFocusedMatches = () => {
    if (matches.length <= 5) return matches;
    
    // 2 before, 1 center, 2 after
    let startIndex = centerIndex - 2;
    let endIndex = centerIndex + 2;
    
    // Clamp to bounds
    if (startIndex < 0) {
      startIndex = 0;
      endIndex = 4;
    }
    if (endIndex >= matches.length) {
      endIndex = matches.length - 1;
      startIndex = endIndex - 4;
    }
    
    if (startIndex < 0) startIndex = 0;
    
    return matches.slice(startIndex, endIndex + 1);
  };

  const focusedMatches = getFocusedMatches();

  const handleDownloadFocusedTable = async () => {
    if (!focusedTableRef.current) return;
    setDownloadingFocused(true);
    try {
      // Small delay to make sure rendering states are quiet
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const element = focusedTableRef.current;
      const scrollContainer = element.querySelector('.overflow-x-auto') as HTMLDivElement;
      const table = element.querySelector('table') as HTMLTableElement;
      
      if (!scrollContainer || !table) {
        throw new Error("Table elements not found");
      }

      // Record original style fields
      const originalScrollOverflow = scrollContainer.style.overflowX;
      const originalWidth = element.style.width;
      const originalMaxWidth = element.style.maxWidth;
      
      // Calculate true dimensions of the 5-match focused matrix table
      const targetWidth = table.scrollWidth + 16; 
      const targetHeight = element.scrollHeight;

      // Expand to wide layout for high-res rendering capture
      scrollContainer.style.overflowX = 'visible';
      element.style.width = `${targetWidth}px`;
      element.style.maxWidth = 'none';

      const dataUrl = await toPng(element, {
        backgroundColor: '#FFFFFF',
        pixelRatio: 2, // Double-density high-res
        width: targetWidth,
        height: targetHeight,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: `${targetWidth}px`,
          height: `${targetHeight}px`,
        }
      });

      // Restore style properties immediately
      scrollContainer.style.overflowX = originalScrollOverflow;
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;

      // Find center match name for the output file
      const centerMatch = matches[centerIndex] || matches[0];
      const matchLabel = centerMatch ? `${centerMatch.teamA.split(' ')[0]}_vs_${centerMatch.teamB.split(' ')[0]}` : 'Tieudiem';

      const link = document.createElement('a');
      link.download = `Du_Doan_PKT_Tieu_Diem_${matchLabel}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error generating focused chart image:', error);
      alert('Có lỗi xảy ra khi xuất ảnh tiêu điểm. Bạn hãy thử chụp màn hình nhé!');
    } finally {
      setDownloadingFocused(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!screenshotRef.current) return;
    setDownloading(true);
    try {
      // Small timeout to ensure fonts and layout pass completed
      await new Promise((resolve) => setTimeout(resolve, 200));

      const width = screenshotRef.current.offsetWidth;
      const height = screenshotRef.current.offsetHeight;

      const dataUrl = await toPng(screenshotRef.current, {
        backgroundColor: '#FFFFFF',
        pixelRatio: 2, // crisp double definition resolution
        width: width,
        height: height,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
      });

      const match1Label = match1 ? `${match1.teamA.split(' ')[0]}_vs_${match1.teamB.split(' ')[0]}` : 'Tran1';
      const match2Label = match2 ? `${match2.teamA.split(' ')[0]}_vs_${match2.teamB.split(' ')[0]}` : 'Tran2';

      const link = document.createElement('a');
      link.download = `Du_Doan_PKT_${match1Label}_${match2Label}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Có lỗi xảy ra khi tạo ảnh. Bạn hãy thử chụp màn hình gốc của máy hoặc click lại nhé!');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadFullTable = async () => {
    if (!fullTableRef.current) return;
    setDownloadingFull(true);
    try {
      // Small delay to make sure rendering states are quiet
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const element = fullTableRef.current;
      const scrollContainer = element.querySelector('.overflow-x-auto') as HTMLDivElement;
      const table = element.querySelector('table') as HTMLTableElement;
      
      if (!scrollContainer || !table) {
        throw new Error("Table elements not found");
      }

      // Keep original layout styles
      const originalScrollOverflow = scrollContainer.style.overflowX;
      const originalWidth = element.style.width;
      const originalMaxWidth = element.style.maxWidth;
      
      // Compute actual full wide size of the table matrix
      const targetWidth = table.scrollWidth + 16; 
      const targetHeight = element.scrollHeight;

      // Expand to wide layout for high-res rendering capture
      scrollContainer.style.overflowX = 'visible';
      element.style.width = `${targetWidth}px`;
      element.style.maxWidth = 'none';

      const dataUrl = await toPng(element, {
        backgroundColor: '#FFFFFF',
        pixelRatio: 2, // High clarity double-density capture
        width: targetWidth,
        height: targetHeight,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: `${targetWidth}px`,
          height: `${targetHeight}px`,
        }
      });

      // Instantly restore responsive scaling for browser view
      scrollContainer.style.overflowX = originalScrollOverflow;
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;

      const link = document.createElement('a');
      link.download = `Bang_Du_Doan_PKT_Tat_Ca_Tran.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error generating full chart image:', error);
      alert('Có lỗi xảy ra khi xuất ảnh bảng đầy đủ. Bạn hãy thử chụp màn hình nhé!');
    } finally {
      setDownloadingFull(false);
    }
  };

  const renderParticipantRow = (p: Participant) => {
    // Match 1
    const pred1 = predictions.find((pr) => pr.participantId === p.id && pr.matchId === match1Id);
    const m1Played = match1.scoreA !== null && match1.scoreB !== null;
    let text1 = 'Chưa Vote';
    let badgeClass1 = 'bg-slate-100 text-slate-400 border-slate-200';
    
    if (pred1) {
      const choiceName = pred1.choice === 'A' ? match1.teamA : match1.teamB;
      const shortChoice = choiceName.split(' ')[0]; // E.g., Mexico or Nam
      if (m1Played) {
        const { status } = calculatePoints(pred1, match1, scoringConfig);
        if (status === 'outcome') {
          text1 = `${shortChoice} ✅`;
          badgeClass1 = 'bg-emerald-300 text-emerald-950 border-emerald-450 font-black shadow-[1px_1px_0px_rgba(0,0,0,0.1)]';
        } else {
          text1 = `${shortChoice} ❌`;
          badgeClass1 = 'bg-red-100 text-red-800 border-red-300 font-extrabold';
        }
      } else {
        text1 = `${shortChoice} 🔒`;
        badgeClass1 = 'bg-blue-50 text-blue-700 border-blue-200 font-extrabold';
      }
    } else {
      if (m1Played) {
        text1 = 'Chưa vote ❌';
        badgeClass1 = 'bg-red-100 text-red-800 border-red-300 font-extrabold';
      } else {
        text1 = 'Chưa chốt ✍';
        badgeClass1 = 'bg-yellow-50 text-amber-600 border-yellow-250 font-bold border-dashed';
      }
    }

    // Match 2
    const pred2 = predictions.find((pr) => pr.participantId === p.id && pr.matchId === match2Id);
    const m2Played = match2.scoreA !== null && match2.scoreB !== null;
    let text2 = 'Chưa Vote';
    let badgeClass2 = 'bg-slate-100 text-slate-400 border-slate-200';
    
    if (pred2) {
      const choiceName = pred2.choice === 'A' ? match2.teamA : match2.teamB;
      const shortChoice = choiceName.split(' ')[0];
      if (m2Played) {
        const { status } = calculatePoints(pred2, match2, scoringConfig);
        if (status === 'outcome') {
          text2 = `${shortChoice} ✅`;
          badgeClass2 = 'bg-emerald-300 text-emerald-950 border-emerald-450 font-black shadow-[1px_1px_0px_rgba(0,0,0,0.1)]';
        } else {
          text2 = `${shortChoice} ❌`;
          badgeClass2 = 'bg-red-100 text-red-800 border-red-300 font-extrabold';
        }
      } else {
        text2 = `${shortChoice} 🔒`;
        badgeClass2 = 'bg-blue-50 text-blue-700 border-blue-200 font-extrabold';
      }
    } else {
      if (m2Played) {
        text2 = 'Chưa vote ❌';
        badgeClass2 = 'bg-red-100 text-red-800 border-red-300 font-extrabold';
      } else {
        text2 = 'Chưa chốt ✍';
        badgeClass2 = 'bg-yellow-50 text-amber-600 border-yellow-250 border-dashed font-bold';
      }
    }

    return (
      <div 
        key={p.id} 
        className="flex items-center justify-between py-1 px-2 bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-100/70 transition-all rounded text-[11px] font-semibold h-[32px]"
      >
        <div className="flex items-center gap-1.5 truncate max-w-[120px] sm:max-w-[155px]">
          <span className={`w-2 h-2 rounded-sm border border-slate-350 ${p.avatarColor} shrink-0`}></span>
          <span className="font-extrabold text-slate-950 uppercase tracking-tight truncate text-[11px]">{p.name}</span>
        </div>
        
        <div className="flex items-center gap-2 w-[185px] shrink-0">
          <div 
            onClick={(e) => {
              e.stopPropagation();
              startEditCell(p.id, match1Id);
            }}
            className={`flex-1 text-center py-0.5 px-1 bg-white border rounded text-[10px] truncate max-w-[90px] leading-tight cursor-pointer select-none ${badgeClass1}`}
            title={`Đặt/Đổi vote cho ${p.name}`}
          >
            {text1}
          </div>
          <div 
            onClick={(e) => {
              e.stopPropagation();
              startEditCell(p.id, match2Id);
            }}
            className={`flex-1 text-center py-0.5 px-1 bg-white border rounded text-[10px] truncate max-w-[90px] leading-tight cursor-pointer select-none ${badgeClass2}`}
            title={`Đặt/Đổi vote cho ${p.name}`}
          >
            {text2}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" id="excel-matrix-wrapper">
      {/* EXCEL MODE & SCREENSHOT MODE TOGGLE HEADER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#1E293B] border-4 border-[#1E293B] p-4 rounded-xl shadow-[4px_4px_0px_#000]">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-sans font-black text-xs md:text-sm text-yellow-400 uppercase italic tracking-tight flex items-center justify-center sm:justify-start gap-1.5">
            🥅 BẢNG CHECK DỰ ĐOÁN & CHỌN ĐỘI THẮNG ĐỒNG BÀNG
          </h3>
          <p className="text-[10px] text-slate-300 font-bold uppercase">
            Nơi tổng kết chi tiết lựa chọn của từng thành viên gia đình PKT
          </p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setScreenshotMode(false)}
            className={`flex-1 sm:flex-none py-1.5 px-3.5 text-[11px] font-black uppercase tracking-wider rounded border-2 transition-all cursor-pointer ${
              !screenshotMode
                ? 'bg-emerald-500 text-white border-slate-950 shadow-[2px_2px_0px_#000]'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            📊 SPREADSHEET ĐẦY ĐỦ
          </button>
          
          <button
            onClick={() => setScreenshotMode(true)}
            className={`flex-1 sm:flex-none py-1.5 px-3.5 text-[11px] font-black uppercase tracking-wider rounded border-2 transition-all cursor-pointer flex items-center justify-center gap-1 ${
              screenshotMode
                ? 'bg-amber-400 text-slate-950 border-slate-950 shadow-[2px_2px_0px_#000]'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            📸 CHẾ ĐỘ CHỤP ẢNH (2 TRẬN)
          </button>
        </div>
      </div>

      {screenshotMode ? (
        <div className="space-y-4 animate-fade-in">
          {/* SCREENSHOT MODE CONTROLS (NOT CAPTURED IN IMAGE) */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 border-2 border-slate-950 rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,0.15)]">
            <div>
              <h4 className="font-sans font-black text-xs uppercase italic tracking-tight text-indigo-650 flex items-center gap-1">
                📸 BỘ XUẤT ẢNH BÁO CÁO ZALO CHUYÊN NGHIỆP
              </h4>
              <p className="text-[10px] text-slate-500 font-extrabold uppercase mt-0.5">
                Chọn nhanh 2 trận cần xem, hệ thống sẽ tự động xuất file ảnh độ phân giải cao dưới đây!
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1.5 rounded border border-slate-300 flex-1 md:flex-none justify-center">
                <span className="text-[10px] font-black uppercase text-slate-700">Trận 1:</span>
                <select 
                  value={match1Id} 
                  onChange={(e) => setMatch1IdState(e.target.value)}
                  className="bg-white border border-slate-350 text-slate-900 px-1 py-0.5 rounded text-[10px] font-black uppercase font-mono max-w-[120px] focus:outline-none"
                >
                  {matches.map(m => (
                    <option key={m.id} value={m.id}>{m.teamA.split(' ')[0]} x {m.teamB.split(' ')[0]} ({m.id})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1.5 rounded border border-slate-300 flex-1 md:flex-none justify-center">
                <span className="text-[10px] font-black uppercase text-slate-750">Trận 2:</span>
                <select 
                  value={match2Id} 
                  onChange={(e) => setMatch2IdState(e.target.value)}
                  className="bg-white border border-slate-350 text-slate-900 px-1 py-0.5 rounded text-[10px] font-black uppercase font-mono max-w-[120px] focus:outline-none"
                >
                  {matches.map(m => (
                    <option key={m.id} value={m.id}>{m.teamA.split(' ')[0]} x {m.teamB.split(' ')[0]} ({m.id})</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleDownloadImage}
                disabled={downloading}
                className="w-full md:w-auto flex items-center justify-center gap-1.5 py-1.5 px-3.5 text-[11px] font-black uppercase tracking-wider rounded border-2 border-slate-950 bg-indigo-600 text-white shadow-[2px_2px_0px_#000] hover:bg-slate-950 hover:text-white disabled:opacity-50 disabled:cursor-wait active:translate-y-0.5 transition-all cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                {downloading ? 'ĐANG TẠO FILE...' : '📥 TẢI ẢNH GỬI ZALO'}
              </button>
            </div>
          </div>

          {/* MAIN CAPTURE CARD COVERED BY REF (THE DOWNLOADED IMAGE CANVAS) */}
          <div 
            ref={screenshotRef} 
            className="bg-white rounded-xl border-4 border-slate-950 p-5 shadow-[8px_8px_0px_#1E293B] space-y-4"
            id="screenshot-capture-area"
          >
            {/* BRANDING HEADER INSIDE CAPTURED IMAGE */}
            <div className="bg-slate-900 border-2 border-slate-950 p-3 rounded-lg text-white flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-[1px_1px_0px_rgba(0,0,0,0.1)]">
              <div className="text-center sm:text-left">
                <h4 className="font-sans font-black text-xs md:text-sm uppercase italic tracking-tight text-yellow-400 flex items-center gap-1.5 justify-center sm:justify-start">
                  ⚽ BẢNG CHECK VOTE ĐỒNG BÀNG - GIA ĐÌNH PKT VN
                </h4>
                <p className="text-[9px] text-slate-300 font-bold uppercase mt-0.5">
                  Bản tin cập nhật tự động • Đồng lòng quyết tâm thi đấu lành mạnh
                </p>
              </div>
              <div className="text-[9px] font-semibold tracking-wider text-slate-405 font-mono border border-slate-700/60 bg-slate-950/40 px-2.5 py-1 rounded">
                CÚP THẾ GIỚI 2026 🏆
              </div>
            </div>

            {/* SIDE-BY-SIDE MATCH STATS BANNER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="screenshot-match-factsheet">
            {/* Match 1 Card */}
            <div className="p-2.5 bg-slate-50 border-2 border-slate-900 rounded-lg text-slate-900 font-sans shadow-[2px_2px_0px_rgba(0,0,0,0.1)] flex flex-col justify-between">
              <div>
                <div className="text-[8px] font-black uppercase text-indigo-600 tracking-wider">TRẬN 1 • {match1?.stage}</div>
                <div className="text-xs font-black uppercase tracking-tight flex items-center justify-between mt-0.5">
                  <span className="text-slate-950 font-sans">{match1?.teamA} VS {match1?.teamB}</span>
                  {match1?.scoreA !== null && match1?.scoreB !== null ? (
                    <span className="px-1.5 py-0.5 bg-emerald-500 border border-slate-950 text-white font-mono text-[9px] rounded font-black shadow-[1px_1px_0px_#000]">
                      KQ: {match1?.scoreA}-{match1?.scoreB}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-slate-200 border border-slate-350 text-slate-600 font-mono text-[9px] rounded font-black">
                      CHỜ ĐIỀN KQ
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-dashed border-slate-200 text-[9px] font-bold text-slate-600 uppercase">
                <div>
                  🗳️ VOTE: <span className="text-blue-600 font-black">{count1A} Đội A</span> | <span className="text-red-500 font-black">{count1B} Đội B</span>
                </div>
                {match1?.scoreA !== null && match1?.scoreB !== null && (
                  <div>
                    🔥 ĐÚNG: <span className="text-emerald-600 font-black">{correct1}</span> | 💀 SAI: <span className="text-red-500 font-black">{wrong1}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Match 2 Card */}
            <div className="p-2.5 bg-slate-50 border-2 border-slate-900 rounded-lg text-slate-900 font-sans shadow-[2px_2px_0px_rgba(0,0,0,0.1)] flex flex-col justify-between">
              <div>
                <div className="text-[8px] font-black uppercase text-indigo-600 tracking-wider">TRẬN 2 • {match2?.stage}</div>
                <div className="text-xs font-black uppercase tracking-tight flex items-center justify-between mt-0.5">
                  <span className="text-slate-950 font-sans">{match2?.teamA} VS {match2?.teamB}</span>
                  {match2?.scoreA !== null && match2?.scoreB !== null ? (
                    <span className="px-1.5 py-0.5 bg-emerald-500 border border-slate-950 text-white font-mono text-[9px] rounded font-black shadow-[1px_1px_0px_#000]">
                      KQ: {match2?.scoreA}-{match2?.scoreB}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-slate-200 border border-slate-350 text-slate-600 font-mono text-[9px] rounded font-black">
                      CHỜ ĐIỀN KQ
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-dashed border-slate-200 text-[9px] font-bold text-slate-600 uppercase">
                <div>
                  🗳️ VOTE: <span className="text-blue-600 font-black">{count2A} Đội A</span> | <span className="text-red-500 font-black">{count2B} Đội B</span>
                </div>
                {match2?.scoreA !== null && match2?.scoreB !== null && (
                  <div>
                    🔥 ĐÚNG: <span className="text-emerald-600 font-black">{correct2}</span> | 💀 SAI: <span className="text-red-500 font-black">{wrong2}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TWO COLUMN COMPACT PANEL OF MEMBERS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-1" id="screenshot-players-container">
            {/* Column Left (First 14) */}
            <div className="space-y-1">
              {leftParticipants.map(renderParticipantRow)}
            </div>

            {/* Column Right (Last 14) */}
            <div className="space-y-1">
              {rightParticipants.map(renderParticipantRow)}
            </div>
          </div>

          <div className="pt-2 text-center border-t border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 leading-relaxed block sm:inline">
              💡 mẹo: Click bất kì ô Dự Đoán nào để thay đổi nhanh vote và bấm "Tải Ảnh Gửi Zalo" để tạo file ảnh báo cáo cực đẹp!
            </span>
          </div>
        </div>
      </div>
      ) : (
        <>
          {/* OFFSCREEN HIGH-RES RENDER COMPONENT FOR 5-MATCH ZALO CAPTURE */}
          <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '1000px' }}>
            <div ref={focusedTableRef} className="bg-white p-5 rounded-xl border-4 border-[#1E293B] space-y-4 shadow-[6px_6px_0px_rgba(0,0,0,0.15)] select-none">
              {/* BRANDING TITLE INSIDE THE CAPTURED FILE */}
              <div className="bg-[#111827] p-3.5 rounded-lg text-white flex flex-col sm:flex-row items-center justify-between gap-2.5 border-2 border-slate-950 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                <div className="text-center sm:text-left">
                  <h4 className="font-sans font-black text-xs md:text-sm uppercase italic tracking-tight text-yellow-450 text-yellow-400 flex items-center gap-1.5 justify-center sm:justify-start">
                    ⚽ BẢNG VOTE 5 TRẬN TIÊU ĐIỂM - GIA ĐÌNH PKT VN 🏆
                  </h4>
                  <p className="text-[9px] text-[#38BDF8] font-extrabold uppercase tracking-wide">
                    Tiêu điểm trận vừa kết thúc & các trận đấu lân cận (Tổng 5 trận)
                  </p>
                </div>
                <div className="text-[9px] font-mono font-black uppercase bg-[#000]/35 px-2.5 py-1 rounded border border-[#38BDF8]/40 text-[#38BDF8]">
                  CÚP THẾ GIỚI 2026 • PHOTO RECAP ⚡
                </div>
              </div>

              {/* HORIZONTAL SPREADSHEET SCROLL CONTAINER (LIMITED TO FOCUSED MATCHES) */}
              <div className="bg-white rounded-xl border-4 border-[#1E293B] overflow-hidden" id="excel-focused-table-container">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[750px]">
                    <thead>
                      <tr className="bg-[#1E293B] text-white border-b-4 border-slate-900">
                        <th className="py-4 px-4 font-black text-xs uppercase tracking-wider border-r-4 border-slate-900 w-48 sticky left-0 bg-[#1E293B] text-white z-10">
                          THÀNH VIÊN VĂN PHÒNG
                        </th>
                        {focusedMatches.map((m) => {
                          const hasResult = m.scoreA !== null && m.scoreB !== null;
                          const isCenter = m.id === matches[centerIndex]?.id;
                          return (
                            <th 
                              key={m.id} 
                              className={`py-4 px-3 text-center border-r-2 border-slate-800 ${isCenter ? 'bg-amber-500/10 text-yellow-300 border-amber-500 border-x-2' : ''} min-w-[140px] font-sans`}
                            >
                              {isCenter && (
                                <div className="text-[8px] uppercase tracking-widest text-amber-500 font-extrabold mb-1 bg-amber-500/20 py-0.5 rounded border border-amber-500/30">
                                  ⭐ TRẬN VỪA ĐẤU ⭐
                                </div>
                              )}
                              {!isCenter && (
                                <div className="text-[8px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                                  {m.stage}
                                </div>
                              )}
                              <div className="font-extrabold text-slate-100 text-[11px] truncate max-w-[140px] px-1 uppercase italic tracking-tight">
                                {m.teamA} x {m.teamB}
                              </div>
                              <div className="mt-2">
                                {hasResult ? (
                                  <span className="inline-block px-1.5 py-0.5 rounded border border-white bg-emerald-500 font-mono font-black text-[8px] shadow-[1px_1px_0px_#000]">
                                    KQ: {m.scoreA}-{m.scoreB}
                                  </span>
                                ) : (
                                  <span className="inline-block px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-400 font-mono font-black text-[8px]">
                                    CHỜ ĐIỀN KQ
                                  </span>
                                )}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-150">
                      {participants.map((p) => (
                        <tr key={p.id} className="font-bold">
                          {/* STICKY COLUMN */}
                          <td className="py-2.5 px-3 border-r-4 border-slate-900 font-sans sticky left-0 bg-slate-100/95 z-10 shadow-[2px_0px_0px_#1E293B]">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2.5 h-2.5 rounded-sm border border-slate-950 ${p.avatarColor} shrink-0`}></span>
                              <div className="text-[11px] font-black text-slate-950 uppercase tracking-tight truncate max-w-[125px]">
                                {p.name}
                              </div>
                            </div>
                          </td>

                          {/* PREDICTION CELLS LIMIT TO FOCUS */}
                          {focusedMatches.map((m) => {
                            const pred = predictions.find((pr) => pr.participantId === p.id && pr.matchId === m.id);
                            const hasResult = m.scoreA !== null && m.scoreB !== null;
                            const isCenter = m.id === matches[centerIndex]?.id;
                            
                            let cellClasses = isCenter ? 'bg-amber-500/5' : 'bg-white';
                            let label = 'Chưa đấu';

                            if (hasResult) {
                              const { status } = calculatePoints(pred, m, scoringConfig);
                              if (status === 'outcome') {
                                cellClasses = `${isCenter ? 'bg-emerald-300' : 'bg-emerald-200'} text-slate-950 border-r border-slate-900 font-black`;
                                label = 'ĐÚNG (🔥 0 cá)';
                              } else {
                                const stageFine = getFineAmountForStage(m.stage);
                                cellClasses = 'bg-red-50 text-red-800 border-r border-slate-200 font-extrabold';
                                label = `SAI (+${stageFine} cá)`;
                              }
                            } else if (pred) {
                              cellClasses = 'bg-indigo-50/65 text-indigo-950 border-r border-slate-200';
                              label = 'ĐÃ CHỐT VOTE';
                            } else {
                              cellClasses = 'bg-yellow-50/45 text-amber-600/80 italic border-r border-slate-250 border-dashed';
                              label = 'CHƯA VOTE';
                            }

                            let displayValue = '?';
                            if (pred) {
                              displayValue = pred.choice === 'A' ? m.teamA : m.teamB;
                            }

                            return (
                              <td
                                key={m.id}
                                className={`text-center p-2 border-r border-slate-200 min-w-[140px] select-none h-12 ${cellClasses}`}
                              >
                                <div className="flex flex-col justify-center items-center h-full">
                                  <span className="text-[11px] font-black truncate max-w-[130px] uppercase tracking-tight text-slate-900">
                                    {pred ? displayValue : <span className="text-slate-400 font-normal">Chưa dự đoán</span>}
                                  </span>
                                  <span className="block text-[7px] uppercase tracking-wider text-slate-500 mt-0.5 font-bold">
                                    {label}
                                  </span>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* CONTROL PANEL TO EXPORT TO IMAGE (NOT CAPTURED) */}
          <div className="bg-[#EEF2F6] rounded-xl border-4 border-[#1E293B] p-5 shadow-[4px_4px_0px_#1E293B] space-y-4 animate-fade-in mb-4">
            <div className="border-b-2 border-slate-200 pb-3">
              <h4 className="font-sans font-black text-xs md:text-sm text-slate-900 uppercase italic tracking-tight flex items-center gap-1.5 justify-center md:justify-start">
                📸 BỘ XUẤT ẢNH BÁO CÁO CỰC NÉT CHO ZALO NHÓM
              </h4>
              <p className="text-[10px] text-slate-600 font-extrabold uppercase mt-1 leading-normal text-center md:text-left">
                Để tránh ảnh gửi Zalo bị co nhỏ/mờ chữ khi xem trên điện thoại, hãy chọn bản chụp 5 trận tiêu điểm dưới đây!
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Option 1: Focused 5 Match Image */}
              <div className="bg-emerald-50 rounded-lg border-2 border-emerald-950 p-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-[2px_2px_0px_rgba(0,0,0,0.05)]">
                <div className="space-y-1 text-center md:text-left">
                  <span className="inline-block px-2 py-0.5 bg-emerald-600 border border-slate-950 text-white rounded font-mono text-[8px] font-black uppercase tracking-wider">
                    ⭐ KHUYÊN DÙNG GỬI ZALO
                  </span>
                  <h5 className="font-sans font-extrabold text-[11px] text-slate-900 uppercase">
                    Ảnh 5 trận trọng tâm (±2 trận liền kề)
                  </h5>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">
                    Có trận vừa đá làm trung tâm ({focusedMatches.length} trận). Gọn và chữ siêu to!
                  </p>
                </div>
                <button
                  onClick={handleDownloadFocusedTable}
                  disabled={downloadingFocused}
                  className="w-full md:w-auto flex items-center justify-center gap-1.5 py-2 px-4 text-[10px] font-black uppercase tracking-wider rounded border-2 border-slate-950 bg-emerald-500 text-white shadow-[2px_2px_0px_#000] hover:bg-slate-950 hover:text-white disabled:opacity-50 disabled:cursor-wait active:translate-y-0.5 transition-all cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  {downloadingFocused ? 'ĐANG TẠO...' : '📥 TẢI ẢNH 5 TRẬN (HD)'}
                </button>
              </div>

              {/* Option 2: Full Table Image */}
              <div className="bg-slate-50 rounded-lg border-2 border-slate-950 p-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-[2px_2px_0px_rgba(0,0,0,0.05)]">
                <div className="space-y-1 text-center md:text-left">
                  <span className="inline-block px-1.5 py-0.5 bg-slate-600 border border-slate-950 text-white rounded font-mono text-[8px] font-black uppercase tracking-wider">
                    🌐 BẢN ĐẦY ĐỦ
                  </span>
                  <h5 className="font-sans font-extrabold text-[11px] text-slate-900 uppercase">
                    Ảnh trọn bộ tất cả các trận
                  </h5>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">
                    Toàn bộ tất cả {matches.length} trận đấu (Thích hợp lưu trữ hoặc xem PC)
                  </p>
                </div>
                <button
                  onClick={handleDownloadFullTable}
                  disabled={downloadingFull}
                  className="w-full md:w-auto flex items-center justify-center gap-1.5 py-2 px-4 text-[10px] font-black uppercase tracking-wider rounded border-2 border-slate-950 bg-indigo-600 text-white shadow-[2px_2px_0px_#000] hover:bg-slate-950 hover:text-white disabled:opacity-50 disabled:cursor-wait active:translate-y-0.5 transition-all cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  {downloadingFull ? 'ĐANG TẠO...' : '📥 TẢI ẢNH FULL BẢNG'}
                </button>
              </div>
            </div>
          </div>

          <div ref={fullTableRef} className="bg-white p-5 rounded-xl border-4 border-[#1E293B] space-y-4 shadow-[6px_6px_0px_rgba(0,0,0,0.15)]">
            {/* BRANDING TITLE INSIDE THE CAPTURED FILE */}
            <div className="bg-[#1E293B] p-3 rounded-lg text-white flex flex-col sm:flex-row items-center justify-between gap-2 border-2 border-slate-950 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
              <div className="text-center sm:text-left">
                <h4 className="font-sans font-black text-xs md:text-sm uppercase italic tracking-tight text-yellow-300">
                  ⚽ BẢNG CHECK VOTE DỰ ĐOÁN ĐỒNG BÀNG - GIA ĐÌNH PKT VN
                </h4>
                <p className="text-[9px] text-[#38BDF8] font-bold uppercase tracking-wide">
                  Cập nhật tự động • Không bỏ sót bất kỳ lựa chọn của thành viên nào
                </p>
              </div>
              <div className="text-[9px] font-mono font-black uppercase bg-[#000]/30 px-2.5 py-1 rounded border border-[#38BDF8]/40 text-[#38BDF8]">
                BÁO CÁO FULL TRẬN ĐẤU 🏆
              </div>
            </div>

            {/* EXPLANATORY HEADER & TOOLTIP */}
            <div className="bg-white rounded-xl border-2 border-[#1E293B] p-4.5 space-y-4" id="excel-matrix-help">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-indigo-500 rounded border-2 border-slate-900 text-white shrink-0 mt-0.5 shadow-[2px_2px_0px_#000]">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans font-black text-base text-slate-900 uppercase italic tracking-tight">HƯỚNG DẪN BẢNG SPREADSHEET CHỌN ĐỘI THẮNG (MATCH MATRIX)</h3>
            <p className="text-xs text-slate-600 mt-1 font-bold leading-relaxed">
              Dự đoán đội giành chiến thắng trận đấu: <strong className="text-slate-900">Không có tùy chọn Hòa</strong>. 
              Bạn chỉ cần chọn đội bóng mà bạn tin là sẽ giành chiến thắng. Nếu bạn đoán đúng, <strong className="text-emerald-600 uppercase">bạn sẽ không phải gánh phạt nào (0 cá)</strong>. Ngược lại, nếu kết quả thực tế không trùng với lựa chọn của bạn (hoặc bạn quên không dự đoán), số cá phạt sẽ tự động cộng dồn vào quỹ chung tùy theo vòng đấu.
              <br />
              <span className="text-indigo-650 text-indigo-600 font-extrabold mt-1.5 block">
                🚀 Mẹo: Bạn có thể nhấn nút <strong className="underline">⚡ Chia Nhanh Vote</strong> ở góc trên đầu trang để tích chọn nhanh những ai vote cho Đội A, toàn bộ thành viên còn lại sẽ được tự động điền Đội B chỉ trong 1 click!
              </span>
            </p>
          </div>
        </div>

        {/* LEGEND BADGES (GEOMETRIC FLAT BLOCKS) */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 border-t-2 border-slate-200 text-[10px] font-black uppercase tracking-tight" id="excel-legend">
          <span className="flex items-center gap-1.5 text-slate-800">
            <span className="px-2 py-0.5 rounded border-2 border-slate-950 bg-emerald-300 text-slate-950 font-mono font-black shadow-[1px_1px_0px_#000]">0 CÁ</span>
            Đoán đúng: Không phải đóng cá nộp quỹ 🌟
          </span>
          <span className="flex items-center gap-1.5 text-slate-850">
            <span className="px-1.5 py-0.5 rounded border-2 border-slate-950 bg-red-100 text-red-800 font-mono font-black shadow-[1px_1px_0px_#000]">+10 CÁ</span>
            Sai Vòng bảng & 32 đội
          </span>
          <span className="flex items-center gap-1.5 text-slate-850">
            <span className="px-1.5 py-0.5 rounded border-2 border-slate-950 bg-indigo-50 text-indigo-800 font-mono font-black shadow-[1px_1px_0px_#000]">+20 CÁ</span>
            Sai Vòng 16 (1/8)
          </span>
          <span className="flex items-center gap-1.5 text-slate-850">
            <span className="px-1.5 py-0.5 rounded border-2 border-slate-950 bg-amber-55 bg-amber-50 text-amber-800 font-mono font-black shadow-[1px_1px_0px_#000]">+30 CÁ</span>
            Sai Tứ kết
          </span>
          <span className="flex items-center gap-1.5 text-slate-850">
            <span className="px-1.5 py-0.5 rounded border-2 border-slate-950 bg-orange-50 text-orange-800 font-mono font-black shadow-[1px_1px_0px_#000]">+40 CÁ</span>
            Sai Bán kết
          </span>
          <span className="flex items-center gap-1.5 text-slate-850">
            <span className="px-1.5 py-0.5 rounded border-2 border-slate-950 bg-red-500 text-white font-mono font-black shadow-[1px_1px_0px_#000]">+50 CÁ</span>
            Sai Chung kết
          </span>
        </div>
      </div>

      {/* HORIZONTAL SPREADSHEET SCROLL CONTAINER */}
      <div className="bg-white rounded-xl border-4 border-[#1E293B] shadow-[8px_8px_0px_#1E293B] overflow-hidden" id="excel-matrix-table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead>
              {/* HEADER ROW 1: MATCH TEAMS */}
              <tr className="bg-[#1E293B] text-white border-b-4 border-slate-900" id="excel-header-row">
                <th className="py-4 px-4 font-black text-xs uppercase tracking-wider border-r-4 border-slate-900 w-56 sticky left-0 bg-[#1E293B] z-10">
                  THÀNH VIÊN VĂN PHÒNG
                </th>
                {matches.map((m) => {
                  const hasResult = m.scoreA !== null && m.scoreB !== null;
                  return (
                    <th key={m.id} className="py-4 px-3 text-center border-r-2 border-slate-800 min-w-[150px] font-sans">
                      <div className="text-[8px] uppercase tracking-wider text-[#38BDF8] font-black mb-1">
                        {m.stage}
                      </div>
                      <div className="font-black text-slate-100 text-xs truncate max-w-[150px] px-1 uppercase italic tracking-tight">
                        {m.teamA} x {m.teamB}
                      </div>
                      <div className="text-[9px] text-[#F3F4F6]/75 mt-0.5 font-mono">
                        Chọn đội thắng 🎯
                      </div>
                      <div className="mt-2">
                        {hasResult ? (
                          <span className="inline-block px-2 py-0.5 rounded border border-white bg-emerald-500 font-mono font-black text-[9px] shadow-[1px_1px_0px_#000]">
                            KQ: {m.scoreA}-{m.scoreB}
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-400 font-mono font-black text-[9px]">
                            CHỜ ĐIỀN KQ
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            
            <tbody className="divide-y-2 divide-slate-200">
              {participants.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-all font-bold">
                  {/* LEFT STICKY MEMBER NAME COLUMN */}
                  <td className="py-3 px-4 border-r-4 border-slate-900 font-sans sticky left-0 bg-slate-100/95 z-10 h-16 shadow-[3px_0px_0px_#1E293B]">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3 h-3 rounded-sm border border-slate-900 ${p.avatarColor} shrink-0`}></span>
                      <div>
                        <div className="text-sm font-black text-slate-950 uppercase tracking-tight">{p.name}</div>
                      </div>
                    </div>
                  </td>

                  {/* PREDICTIONS CELLS */}
                  {matches.map((m) => {
                    const pred = predictions.find((pr) => pr.participantId === p.id && pr.matchId === m.id);
                    const hasResult = m.scoreA !== null && m.scoreB !== null;
                    
                    let cellClasses = 'bg-white text-slate-900 border-r-2 border-slate-200';
                    let label = 'Chưa đấu';

                    if (hasResult) {
                      const { status } = calculatePoints(pred, m, scoringConfig);
                      if (status === 'outcome') {
                        cellClasses = 'bg-emerald-300 text-slate-950 border-r-2 border-slate-900 font-black';
                        label = 'ĐÚNG (🔥 0 cá)';
                      } else {
                        const stageFine = getFineAmountForStage(m.stage);
                        cellClasses = 'bg-red-105 bg-red-100 text-red-800 border-r-2 border-slate-200 font-black';
                        label = `SAI (+${stageFine} cá 💀)`;
                      }
                    } else if (pred) {
                      cellClasses = 'bg-indigo-50 text-indigo-900 border-r-2 border-slate-200';
                      label = 'ĐÃ CHỐT VOTE 🔒';
                    } else {
                      cellClasses = 'bg-yellow-50 text-amber-600/80 italic border-r-2 border-slate-200 border-dashed';
                      label = 'CHƯA VOTE ✍️';
                    }

                    const isCellEditing = editingCell?.pId === p.id && editingCell?.mId === m.id;

                    // Get prediction display text
                    let displayValue = '?';
                    if (pred) {
                      displayValue = pred.choice === 'A' ? m.teamA : m.teamB;
                    }

                    return (
                      <td
                        key={m.id}
                        onClick={() => !isCellEditing && startEditCell(p.id, m.id)}
                        className={`text-center p-2.5 cursor-pointer min-w-[150px] relative h-16 select-none transition-colors duration-150 ${cellClasses}`}
                        id={`cell-${p.id}-${m.id}`}
                      >
                        {isCellEditing ? (
                          <div className="absolute inset-0 bg-[#F1F5F9] border-2 border-slate-950 z-20 flex flex-col items-center justify-center p-1 shadow-md animate-fade-in">
                            <span className="text-[8px] text-slate-900 font-extrabold uppercase tracking-wider absolute top-0.5">VOTE ĐỘI THẮNG GIỜ G</span>
                            <div className="flex gap-1 mt-2.5 w-full px-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectChoice('A');
                                }}
                                className="flex-1 py-1 bg-blue-500 hover:bg-blue-600 border border-slate-950 text-white rounded text-[10px] font-black uppercase truncate px-0.5"
                                title={m.teamA}
                              >
                                {m.teamA.split(' ')[0]}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectChoice('B');
                                }}
                                className="flex-1 py-1 bg-red-500 hover:bg-red-600 border border-slate-950 text-white rounded text-[10px] font-black uppercase truncate px-0.5"
                                title={m.teamB}
                              >
                                {m.teamB.split(' ')[0]}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCell(null);
                                }}
                                className="px-1 bg-white hover:bg-slate-200 border border-slate-950 rounded text-slate-800 text-[9px] font-bold"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col justify-center items-center h-full">
                            <span className="text-xs font-black truncate max-w-[140px] uppercase tracking-tight text-slate-900 flex items-center gap-1">
                              {pred ? (
                                <>
                                  <span className="text-indigo-600">🎯</span> {displayValue}
                                </>
                              ) : (
                                <span className="text-slate-400 font-medium">Chưa dự đoán</span>
                              )}
                            </span>
                            <span className="block text-[8px] uppercase tracking-wider text-slate-500 mt-1 font-extrabold font-sans">
                              {label}
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
          </div>
        </>
      )}

      {/* QUICK FLOATING MODAL FOR CELL EDIT */}
      <AnimatePresence>
        {editingCell && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditingCell(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-xl w-full max-w-sm p-6 border-4 border-slate-900 shadow-[10px_10px_0px_#1E293B] space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b-2 border-slate-200 pb-3">
                <h4 className="font-sans font-black text-lg text-slate-900 uppercase italic tracking-tight">
                  🔮 DỰ ĐOÁN ĐỘI THẮNG TRẬN ĐẤU
                </h4>
                <p className="text-[11px] text-slate-600 mt-1 font-bold">
                  Bình chọn của <strong className="text-indigo-600">{participants.find(p => p.id === editingCell.pId)?.name}</strong> cho cặp:
                  <br />
                  <span className="text-slate-950 text-xs italic tracking-tight bg-slate-100 px-2 py-1 rounded inline-block mt-1 font-extrabold">
                    {matches.find(m => m.id === editingCell.mId)?.teamA} VS {matches.find(m => m.id === editingCell.mId)?.teamB}
                  </span>
                </p>
              </div>

              {/* TWO CHOICE INTERACTIVE BUTTONS WITH PERCENTAGES / ARROWS */}
              <div className="space-y-3">
                <span className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase">VUI LÒNG BẤM CHỌN ĐỘI CHOOSE TEAM:</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSelectChoice('A')}
                    className="p-4 bg-slate-50 hover:bg-blue-500 hover:text-white border-2 border-slate-900 rounded-lg text-xs font-black uppercase text-center transition-all cursor-pointer shadow-[3px_3px_0px_#1E293B] flex flex-col items-center justify-center gap-1"
                  >
                    <span className="text-[10px] opacity-75 font-bold">ĐỘI A</span>
                    <span className="text-sm tracking-tight">{matches.find(m => m.id === editingCell.mId)?.teamA}</span>
                    <span className="text-[9px] font-black mt-1 text-blue-650 hover:text-white">Chọn Đội A Thắng</span>
                  </button>

                  <button
                    onClick={() => handleSelectChoice('B')}
                    className="p-4 bg-slate-50 hover:bg-red-500 hover:text-white border-2 border-slate-900 rounded-lg text-xs font-black uppercase text-center transition-all cursor-pointer shadow-[3px_3px_0px_#1E293B] flex flex-col items-center justify-center gap-1"
                  >
                    <span className="text-[10px] opacity-75 font-bold">ĐỘI B</span>
                    <span className="text-sm tracking-tight">{matches.find(m => m.id === editingCell.mId)?.teamB}</span>
                    <span className="text-[9px] font-black mt-1 text-[#DC2626] hover:text-white">Chọn Đội B Thắng</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t-2 border-slate-150">
                {predictions.some(
                  (pr) => pr.participantId === editingCell?.pId && pr.matchId === editingCell?.mId
                ) && (
                  <button
                    type="button"
                    onClick={() => handleSelectChoice(null)}
                    className="flex-1 py-2 text-xs bg-amber-500 hover:bg-amber-600 text-white rounded border-2 border-slate-950 font-black uppercase tracking-wider cursor-pointer"
                  >
                    ❌ Huỷ Vote
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditingCell(null)}
                  className="flex-1 py-2 text-xs bg-white hover:bg-slate-100 text-slate-800 rounded border-2 border-slate-950 font-black uppercase tracking-wider cursor-pointer"
                >
                  Đóng Hủy
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
