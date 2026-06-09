import React, { useState } from 'react';
import { Participant } from '../types';
import { UserPlus, Trash2, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface ParticipantsListProps {
  participants: Participant[];
  onAddParticipant: (participant: Omit<Participant, 'id'>) => void;
  onDeleteParticipant: (participantId: string) => void;
}

export default function ParticipantsList({
  participants,
  onAddParticipant,
  onDeleteParticipant
}: ParticipantsListProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-teal-500');

  const colorOptions = [
    { bg: 'bg-rose-500', name: 'Đỏ hồng' },
    { bg: 'bg-emerald-500', name: 'Xanh lục' },
    { bg: 'bg-indigo-500', name: 'Xanh chàm' },
    { bg: 'bg-amber-500', name: 'Vàng cam' },
    { bg: 'bg-purple-500', name: 'Tím khói' },
    { bg: 'bg-cyan-500', name: 'Xanh ngọc' },
    { bg: 'bg-pink-500', name: 'Hồng sen' },
    { bg: 'bg-zinc-650', name: 'Xám đậm' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }
    onAddParticipant({
      name: name.trim(),
      role: '',
      avatarColor: selectedColor
    });
    setName('');
    setRole('');
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ADD FORM */}
        <div className="bg-white rounded-xl border-4 border-slate-900 p-6 shadow-[6px_6px_0px_#1E293B] space-y-4 h-fit">
          <div className="flex items-center gap-2 border-b-2 border-slate-150 pb-3">
            <UserPlus className="w-5 h-5 text-red-500 stroke-[3px]" />
            <h3 className="font-sans font-black text-slate-900 text-xs uppercase tracking-wider">ĐĂNG KÝ HỘ ĐỒNG NGHIỆP</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] text-slate-900 font-black mb-1.5 uppercase tracking-wider">Họ và Tên</label>
              <input
                type="text"
                placeholder="Ví dụ: Anh Sếp, Lan Kế Toán..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border-2 border-slate-900 text-xs px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500 font-black uppercase text-slate-900"
                required
              />
            </div>

            {/* COLOR ACCENT PICKER */}
            <div className="space-y-2">
              <label className="block text-[10px] text-slate-900 font-black uppercase tracking-wider">Màu sắc nhận diện</label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.bg}
                    type="button"
                    onClick={() => setSelectedColor(opt.bg)}
                    className={`h-8 rounded-sm ${opt.bg} border-2 border-slate-950 transition-all relative ${
                      selectedColor === opt.bg ? 'ring-2 ring-red-500 ring-offset-1 scale-[1.05]' : 'opacity-85 hover:opacity-100'
                    }`}
                    title={opt.name}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white py-3 rounded border-2 border-slate-950 text-xs font-black uppercase tracking-widest transition-all shadow-[3px_3px_0px_#000] cursor-pointer"
            >
              ĐĂNG KÝ VÀO BẢNG
            </button>
          </form>
        </div>

        {/* CURRENT LIST */}
        <div className="bg-white rounded-xl border-4 border-slate-900 p-6 shadow-[8px_8px_0px_#1E293B] lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-slate-150 pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#1E293B] stroke-[2.5px]" />
              <h3 className="font-sans font-black text-slate-900 text-xs uppercase tracking-wider">DANH SÁCH NHÂN SỰ ĐÃ ĐƯỢC CHỐT</h3>
            </div>
            <span className="text-[10px] font-black text-slate-950 bg-yellow-300 px-3 py-1.5 rounded border-2 border-slate-950 uppercase tracking-widest">
              XÕA BÀN: {participants.length} NGƯỜI
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-1">
            {participants.map((p) => (
              <motion.div
                key={p.id}
                layout
                className="flex items-center justify-between p-3.5 border-2 border-slate-900 rounded bg-white hover:bg-slate-50 transition-all shadow-[2px_2px_0px_#000] group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-sm border-2 border-slate-950 ${p.avatarColor} flex items-center justify-center text-white font-black text-xs shadow-[1.5px_1.5px_0px_#000]`}>
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-950 text-xs uppercase italic tracking-tight">{p.name}</h4>
                  </div>
                </div>

                {/* DELETE OPTION (ALWAYS ACCESSIBLE WITH NO TRANSPARENT HOVER TRAPS) */}
                <button
                  onClick={() => {
                    if (confirm(`Bạn chắc chắn muốn loại người chơi: ${p.name.toUpperCase()}? Toàn bộ lịch sử dự đoán của người này sẽ bị xóa khỏi Excel Matrix.`)) {
                      onDeleteParticipant(p.id);
                    }
                  }}
                  className="p-1.5 rounded text-slate-400 hover:text-red-650 hover:bg-red-50 border-2 border-transparent hover:border-red-950 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
