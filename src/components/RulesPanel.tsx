import React from 'react';
import { motion } from 'motion/react';
import { Award, ShieldAlert, Coins, HelpCircle, Trophy, Sparkles, BookOpen, Clock, Coffee } from 'lucide-react';

export default function RulesPanel() {
  return (
    <div className="space-y-8" id="rules-panel-wrapper">
      {/* HEADER HERO */}
      <div className="bg-slate-900 border-4 border-slate-950 text-white rounded-xl p-6 md:p-8 shadow-[8px_8px_0px_#1E293B] relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-amber-500 opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute -left-16 -top-16 w-64 h-64 bg-indigo-500 opacity-10 rounded-full blur-2xl"></div>
        
        <div className="relative space-y-4 max-w-3xl">
          <span className="px-3 py-1 bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-widest rounded shadow-[2px_2px_0px_#000]">
            VĂN PHÒNG PKT - WORLD CUP 2026 ⚽
          </span>
          <h2 className="text-2xl md:text-4xl font-sans font-black italic uppercase tracking-tight text-white leading-none">
            QUY CHẾ SÂN CHƠI <br className="sm:hidden" />
            <span className="text-amber-405 text-amber-400 underline decoration-indigo-500">SÁNG TÂM HỒN 🌟</span>
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-350 leading-relaxed max-w-2xl">
            Để tăng thêm không khí rực cháy cùng trái bóng tròn World Cup và thắt chặt tình đoàn kết gia đình PKT, 
            nay ban hành quy chế dự đoán trúng thưởng & đóng góp quỹ ăn liên hoan như sau. AE tham khảo và chấp hành nghiêm chỉnh!
          </p>
        </div>
      </div>

      {/* THREE PILLAR PANELS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* PANEL 1: CƠ CHẾ ĐÓNG GÓP QUỸ (TIỀN BỐI THƯỜNG) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border-4 border-slate-950 rounded-xl p-5 shadow-[6px_6px_0px_#1E293B] relative"
        >
          <div className="flex items-center justify-between mb-4 border-b-2 border-slate-200 pb-3">
            <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider rounded border border-red-200 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" /> 1. CƠ CHẾ QUỸ HIỆN KIM
            </span>
            <span className="text-lg">💰</span>
          </div>

          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">SỐ TIỀN PHẠT CHO MỖI LƯỢT ĐOÁN SAI:</h3>
          <div className="space-y-2 font-mono">
            {[
              { stage: 'VÒNG BẢNG & 32 ĐỘI', fine: '10.000 VNĐ', badge: '10K', color: 'bg-slate-100 border-slate-300 text-slate-700' },
              { stage: 'VÒNG 16 ĐỘI (1/8)', fine: '20.000 VNĐ', badge: '20K', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
              { stage: 'TỨ KẾT', fine: '30.000 VNĐ', badge: '30K', color: 'bg-amber-50 border-amber-200 text-amber-700' },
              { stage: 'BÁN KẾT', fine: '40.000 VNĐ', badge: '40K', color: 'bg-orange-50 border-orange-200 text-orange-700' },
              { stage: 'CHUNG KẾT', fine: '50.000 VNĐ', badge: '50K', color: 'bg-red-50 border-red-200 text-red-700' },
            ].map((rule, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <span className="text-[11px] font-bold text-slate-800 uppercase font-sans">{rule.stage}</span>
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${rule.color}`}>
                  +{rule.badge}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-2.5 bg-yellow-50 border border-yellow-250 rounded text-[10px] font-bold text-yellow-905 flex gap-2 items-start leading-relaxed">
            <span className="text-sm">💡</span>
            <span>Không vote: Mặc định tính dự đoán sai và phạt tương đương theo vòng đấu!</span>
          </div>
        </motion.div>

        {/* PANEL 2: LUẬT CHƠI MỚI GIỜ G */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white border-4 border-slate-950 rounded-xl p-5 shadow-[6px_6px_0px_#1E293B] relative"
        >
          <div className="flex items-center justify-between mb-4 border-b-2 border-slate-200 pb-3">
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded border border-indigo-150 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 2. QUY TẮC GIỜ VÀNG (G)
            </span>
            <span className="text-lg">⏰</span>
          </div>

          <p className="text-xs font-bold text-slate-600 leading-relaxed mb-4">
            Đảm bảo tính trung thực, bảo vệ lợi ích và gia tăng cảm xúc thăng hoa:
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-extrabold border border-slate-350 shrink-0 font-mono">1</span>
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase">HẠN CHÓT CHỐT VOTE</h4>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed mt-0.5">
                  Phải dự đoán & vote trên bảng tỉ lệ chậm nhất <strong className="text-red-600 font-black font-mono">60 phút</strong> trước khi tiếng còi khai cuộc vang lên.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-extrabold border border-slate-350 shrink-0 font-mono">2</span>
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase">AI QUÊN LÀ AUTO BẠI</h4>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed mt-0.5">
                  Mọi trường hợp quên hoặc dự đoán muộn đều tính là thua và phải nộp phạt cho lượt đấu đó. Hệ thống sẽ báo nguy cơ nộp cốc trà sữa đỏ để nhắc nhở!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-extrabold border border-slate-350 shrink-0 font-mono">3</span>
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase">CHỐT CHẶT VÀ THANH TOÁN</h4>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed mt-0.5">
                  Phạt trà sữa hay đồ ăn sáng chốt chặn, thống kê một cục duy nhất ngay sau khi tiếng còi trận Chung kết World Cup 2026 khép lại!
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* PANEL 3: DANH HIỆU SÁNG TÂM HỒN */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-white border-4 border-slate-950 rounded-xl p-5 shadow-[6px_6px_0px_#1E293B] relative"
        >
          <div className="flex items-center justify-between mb-4 border-b-2 border-slate-200 pb-3">
            <span className="px-2.5 py-1 bg-yellow-50 text-yellow-750 text-[10px] font-black uppercase tracking-wider rounded border border-yellow-200 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> 3. HỆ THỐNG DANH HIỆU
            </span>
            <span className="text-lg">🏆</span>
          </div>

          <p className="text-xs font-bold text-slate-600 leading-relaxed mb-4">
            Đại lễ tổng kết vinh danh & phục vụ sau trận chung kết bóng đá:
          </p>

          <div className="space-y-3 font-sans text-xs">
            {/* AWARD 1 */}
            <div className="p-2.5 rounded border border-slate-900 bg-yellow-45 overflow-hidden relative bg-yellow-101 bg-yellow-50/50">
              <div className="font-sans font-black text-xs text-yellow-700 flex items-center gap-1 uppercase">
                <span>👑</span> NHÀ TÀI TRỢ KIM CƯƠNG
              </div>
              <p className="text-[10px] text-slate-600 font-bold mt-1 leading-relaxed">
                Thành viên đứng đầu bảng xếp hạng. Có đặc quyền tối thượng là được phục vụ tận răng khi liên hoan!
              </p>
            </div>

            {/* AWARD 2 */}
            <div className="p-2.5 rounded border border-indigo-950 bg-indigo-50/50">
              <div className="font-sans font-black text-xs text-indigo-700 flex items-center gap-1 uppercase">
                <span>🍽️</span> THÁNH ĂN CHỰC
              </div>
              <p className="text-[10px] text-slate-650 font-bold text-slate-600 mt-1 leading-relaxed">
                AE có phong độ may mắn, đoán sai ít nhất và đóng ít phạt nhất. Nhận nhiệm vụ Chăm Sóc cho nhà tài trợ Kim Cương.
              </p>
            </div>

            {/* AWARD 3 */}
            <div className="p-2.5 rounded border border-red-950 bg-red-50/50">
              <div className="font-sans font-black text-xs text-red-700 flex items-center gap-1 uppercase">
                <span>💀</span> ĐỘI ĐÓNG TỦ NỘP XIỀN HẮC ÁM
              </div>
              <p className="text-[10px] text-slate-600 font-bold mt-1 leading-relaxed">
                Nhóm bét bảng với số tiền phạt cộng dồn cao nhất: Nhà tài trợ chính gánh vác túi tiền tiệc buffet, bia bọt cho phòng!
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* FOOTER QUOTE */}
      <div className="p-4 bg-slate-900 border-4 border-slate-950 text-white text-center rounded-xl font-sans font-black uppercase italic text-xs tracking-wider">
        🎰 "THUA LÀ BẠN, KHÔNG VOTE LÀ PHẠT - PKT CHIẾN ĐẤU ĐẾN PHÚT CUỐI CÙNG!"
      </div>
    </div>
  );
}
