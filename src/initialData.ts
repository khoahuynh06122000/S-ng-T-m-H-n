import { Match, Participant, Prediction, ScoringConfig } from './types';

export const INITIAL_PARTICIPANTS: Participant[] = [
  { id: 'p1', name: 'Huỳnh Đăng Khoa', avatarColor: 'bg-rose-500', role: '' },
  { id: 'p2', name: 'PKT A Nhân', avatarColor: 'bg-emerald-500', role: '' },
  { id: 'p3', name: 'PKT C Thu', avatarColor: 'bg-indigo-500', role: '' },
  { id: 'p4', name: 'Việt ròm', avatarColor: 'bg-amber-500', role: '' },
  { id: 'p5', name: 'Chị Thanh Hải', avatarColor: 'bg-purple-500', role: '' },
  { id: 'p6', name: 'C OANH pkt', avatarColor: 'bg-pink-500', role: '' },
  { id: 'p7', name: 'Duy Ngậu', avatarColor: 'bg-cyan-500', role: '' },
  { id: 'p8', name: 'Khánh Trang', avatarColor: 'bg-rose-600', role: '' },
  { id: 'p9', name: 'Sếp Linh', avatarColor: 'bg-emerald-600', role: '' },
  { id: 'p10', name: 'Anh Tuân', avatarColor: 'bg-indigo-600', role: '' },
  { id: 'p11', name: 'PKT A Mạnh', avatarColor: 'bg-amber-600', role: '' },
  { id: 'p12', name: 'PKT C Hiền', avatarColor: 'bg-purple-600', role: '' },
  { id: 'p13', name: 'PKT C Hạnh', avatarColor: 'bg-pink-600', role: '' },
  { id: 'p14', name: 'PKT C Hằng', avatarColor: 'bg-cyan-600', role: '' },
  { id: 'p15', name: 'PKT C Linh', avatarColor: 'bg-sky-500', role: '' },
  { id: 'p16', name: 'PKT C. P Hường', avatarColor: 'bg-teal-500', role: '' },
  { id: 'p17', name: 'PKT-Nguyễn Hữu Long', avatarColor: 'bg-orange-500', role: '' },
  { id: 'p18', name: 'PKT_Nguyễn Thị Vy', avatarColor: 'bg-yellow-500', role: '' },
  { id: 'p19', name: 'PKT_Trần Đình Tài', avatarColor: 'bg-lime-500', role: '' },
  { id: 'p20', name: 'A. Phan Anh', avatarColor: 'bg-red-500', role: '' },
  { id: 'p21', name: 'Phạm Thị Hồng Nhung', avatarColor: 'bg-violet-500', role: '' },
  { id: 'p22', name: 'TK A Vũ', avatarColor: 'bg-fuchsia-500', role: '' },
  { id: 'p23', name: 'Thi Vy Pham', avatarColor: 'bg-indigo-700', role: '' },
  { id: 'p24', name: 'Thị Thắm Hồ', avatarColor: 'bg-pink-700', role: '' },
  { id: 'p25', name: 'Trần Nhân', avatarColor: 'bg-cyan-700', role: '' },
  { id: 'p26', name: 'Tâm Võ', avatarColor: 'bg-red-700', role: '' },
  { id: 'p27', name: 'Viet Phong', avatarColor: 'bg-emerald-700', role: '' },
  { id: 'p28', name: 'Sếp Ân', avatarColor: 'bg-rose-700', role: '' }
];

export const INITIAL_MATCHES: Match[] = [
  // 12/06
  { id: 'm1', teamA: 'Mexico 🇲🇽', teamB: 'Nam Phi 🇿🇦', dateTime: '2026-06-12T04:00:00', stage: 'Bảng A', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm2', teamA: 'Hàn Quốc 🇰🇷', teamB: 'TBD ❓', dateTime: '2026-06-12T11:00:00', stage: 'Bảng A', scoreA: null, scoreB: null, handicap: 0 },
  // 13/06
  { id: 'm3', teamA: 'Canada 🇨🇦', teamB: 'TBD ❓', dateTime: '2026-06-13T03:00:00', stage: 'Bảng B', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm4', teamA: 'Mỹ 🇺🇸', teamB: 'Paraguay 🇵🇾', dateTime: '2026-06-13T12:00:00', stage: 'Bảng D', scoreA: null, scoreB: null, handicap: 0.75 },
  // 14/06
  { id: 'm5', teamA: 'Qatar 🇶🇦', teamB: 'Thụy Sĩ 🇨🇭', dateTime: '2026-06-14T06:00:00', stage: 'Bảng B', scoreA: null, scoreB: null, handicap: 0.25 },
  { id: 'm6', teamA: 'Brazil 🇧🇷', teamB: 'Morocco 🇲🇦', dateTime: '2026-06-14T06:00:00', stage: 'Bảng C', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm7', teamA: 'Haiti 🇭🇹', teamB: 'Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿', dateTime: '2026-06-14T09:00:00', stage: 'Bảng C', scoreA: null, scoreB: null, handicap: 0 },
  { id: 'm8', teamA: 'Australia 🇦🇺', teamB: 'TBD ❓', dateTime: '2026-06-14T15:00:00', stage: 'Bảng D', scoreA: null, scoreB: null, handicap: 0.25 },
  // 15/06
  { id: 'm9', teamA: 'Đức 🇩🇪', teamB: 'Curacao 🇨🇼', dateTime: '2026-06-15T02:00:00', stage: 'Bảng E', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm10', teamA: 'Hà Lan 🇳🇱', teamB: 'Nhật Bản 🇯🇵', dateTime: '2026-06-15T05:00:00', stage: 'Bảng F', scoreA: null, scoreB: null, handicap: 0.25 },
  { id: 'm11', teamA: 'Bờ Biển Ngà 🇨🇮', teamB: 'Ecuador 🇪🇨', dateTime: '2026-06-15T07:00:00', stage: 'Bảng E', scoreA: null, scoreB: null, handicap: 0.75 },
  { id: 'm12', teamA: 'TBD ❓', teamB: 'Tunisia 🇹🇳', dateTime: '2026-06-15T11:00:00', stage: 'Bảng F', scoreA: null, scoreB: null, handicap: 0 },
  // 16/06
  { id: 'm13', teamA: 'Tây Ban Nha 🇪🇸', teamB: 'Cape Verde 🇨🇻', dateTime: '2026-06-16T03:00:00', stage: 'Bảng G', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm14', teamA: 'Bỉ 🇧🇪', teamB: 'Ai Cập 🇪🇬', dateTime: '2026-06-16T06:00:00', stage: 'Bảng H', scoreA: null, scoreB: null, handicap: 0.25 },
  { id: 'm15', teamA: 'Saudi Arabia 🇸🇦', teamB: 'Uruguay 🇺🇾', dateTime: '2026-06-16T06:00:00', stage: 'Bảng G', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm16', teamA: 'Iran 🇮🇷', teamB: 'New Zealand 🇳🇿', dateTime: '2026-06-16T12:00:00', stage: 'Bảng H', scoreA: null, scoreB: null, handicap: 0 },
  // 17/06
  { id: 'm17', teamA: 'Pháp 🇫🇷', teamB: 'Senegal 🇸🇳', dateTime: '2026-06-17T03:00:00', stage: 'Bảng I', scoreA: null, scoreB: null, handicap: 0.25 },
  { id: 'm18', teamA: 'TBD ❓', teamB: 'Na Uy 🇳🇴', dateTime: '2026-06-17T06:00:00', stage: 'Bảng I', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm19', teamA: 'Argentina 🇦🇷', teamB: 'Algeria 🇩🇿', dateTime: '2026-06-17T10:00:00', stage: 'Bảng J', scoreA: null, scoreB: null, handicap: 0 },
  { id: 'm20', teamA: 'Áo 🇦🇹', teamB: 'Jordan 🇯🇴', dateTime: '2026-06-17T15:00:00', stage: 'Bảng J', scoreA: null, scoreB: null, handicap: 0.5 },
  // 18/06
  { id: 'm21', teamA: 'Bồ Đào Nha 🇵🇹', teamB: 'TBD ❓', dateTime: '2026-06-18T02:00:00', stage: 'Bảng K', scoreA: null, scoreB: null, handicap: 0.25 },
  { id: 'm22', teamA: 'Anh 🏴󠁧󠁢󠁥󠁮󠁧󠁿', teamB: 'Croatia 🇭🇷', dateTime: '2026-06-18T05:00:00', stage: 'Bảng L', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm23', teamA: 'Ghana 🇬🇭', teamB: 'Panama 🇵🇦', dateTime: '2026-06-18T07:00:00', stage: 'Bảng L', scoreA: null, scoreB: null, handicap: 0 },
  { id: 'm24', teamA: 'Uzbekistan 🇺🇿', teamB: 'Colombia 🇨🇴', dateTime: '2026-06-18T11:00:00', stage: 'Bảng K', scoreA: null, scoreB: null, handicap: 0.25 },

  // 19/06
  { id: 'm25', teamA: 'TBD ❓', teamB: 'Nam Phi 🇿🇦', dateTime: '2026-06-19T00:00:00', stage: 'Bảng A', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm26', teamA: 'Thụy Sĩ 🇨🇭', teamB: 'TBD ❓', dateTime: '2026-06-19T06:00:00', stage: 'Bảng B', scoreA: null, scoreB: null, handicap: 0.25 },
  { id: 'm27', teamA: 'Canada 🇨🇦', teamB: 'Qatar 🇶🇦', dateTime: '2026-06-19T07:00:00', stage: 'Bảng B', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm28', teamA: 'Mexico 🇲🇽', teamB: 'Hàn Quốc 🇰🇷', dateTime: '2026-06-19T10:00:00', stage: 'Bảng A', scoreA: null, scoreB: null, handicap: 0 },
  // 20/06
  { id: 'm29', teamA: 'Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿', teamB: 'Morocco 🇲🇦', dateTime: '2026-06-20T06:00:00', stage: 'Bảng C', scoreA: null, scoreB: null, handicap: 0.25 },
  { id: 'm30', teamA: 'Mỹ 🇺🇸', teamB: 'Australia 🇦🇺', dateTime: '2026-06-20T06:00:00', stage: 'Bảng D', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm31', teamA: 'Brazil 🇧🇷', teamB: 'Haiti 🇭🇹', dateTime: '2026-06-20T09:00:00', stage: 'Bảng C', scoreA: null, scoreB: null, handicap: 0.75 },
  { id: 'm32', teamA: 'TBD ❓', teamB: 'Paraguay 🇵🇾', dateTime: '2026-06-20T15:00:00', stage: 'Bảng D', scoreA: null, scoreB: null, handicap: 0 },
  // 21/06
  { id: 'm33', teamA: 'Hà Lan 🇳🇱', teamB: 'TBD ❓', dateTime: '2026-06-21T02:00:00', stage: 'Bảng F', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm34', teamA: 'Đức 🇩🇪', teamB: 'Bờ Biển Ngà 🇨🇮', dateTime: '2026-06-21T04:00:00', stage: 'Bảng E', scoreA: null, scoreB: null, handicap: 0.25 },
  { id: 'm35', teamA: 'Ecuador 🇪🇨', teamB: 'Curacao 🇨🇼', dateTime: '2026-06-21T11:00:00', stage: 'Bảng E', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm36', teamA: 'Tunisia 🇹🇳', teamB: 'Nhật Bản 🇯🇵', dateTime: '2026-06-21T13:00:00', stage: 'Bảng F', scoreA: null, scoreB: null, handicap: 0 },
  // 22/06
  { id: 'm37', teamA: 'Tây Ban Nha 🇪🇸', teamB: 'Saudi Arabia 🇸🇦', dateTime: '2026-06-22T00:00:00', stage: 'Bảng G', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm38', teamA: 'Bỉ 🇧🇪', teamB: 'Iran 🇮🇷', dateTime: '2026-06-22T06:00:00', stage: 'Bảng H', scoreA: null, scoreB: null, handicap: 0.25 },
  { id: 'm39', teamA: 'Uruguay 🇺🇾', teamB: 'Cape Verde 🇨🇻', dateTime: '2026-06-22T09:00:00', stage: 'Bảng G', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm40', teamA: 'New Zealand 🇳🇿', teamB: 'Ai Cập 🇪🇬', dateTime: '2026-06-22T12:00:00', stage: 'Bảng H', scoreA: null, scoreB: null, handicap: 0 },
  // 23/06
  { id: 'm41', teamA: 'Argentina 🇦🇷', teamB: 'Áo 🇦🇹', dateTime: '2026-06-23T02:00:00', stage: 'Bảng J', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm42', teamA: 'Pháp 🇫🇷', teamB: 'TBD ❓', dateTime: '2026-06-23T05:00:00', stage: 'Bảng I', scoreA: null, scoreB: null, handicap: 0.25 },
  { id: 'm43', teamA: 'Na Uy 🇳🇴', teamB: 'Senegal 🇸🇳', dateTime: '2026-06-23T08:00:00', stage: 'Bảng I', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm44', teamA: 'Jordan 🇯🇴', teamB: 'Algeria 🇩🇿', dateTime: '2026-06-23T14:00:00', stage: 'Bảng J', scoreA: null, scoreB: null, handicap: 0 },
  // 25/06
  { id: 'm45', teamA: 'Thụy Sĩ 🇨🇭', teamB: 'Canada 🇨🇦', dateTime: '2026-06-25T06:00:00', stage: 'Bảng B', scoreA: null, scoreB: null, handicap: 0.25 },
  { id: 'm46', teamA: 'TBD ❓', teamB: 'Qatar 🇶🇦', dateTime: '2026-06-25T06:00:00', stage: 'Bảng B', scoreA: null, scoreB: null, handicap: 0 },
  { id: 'm47', teamA: 'Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿', teamB: 'Brazil 🇧🇷', dateTime: '2026-06-25T06:00:00', stage: 'Bảng C', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm48', teamA: 'Morocco 🇲🇦', teamB: 'Haiti 🇭🇹', dateTime: '2026-06-25T06:00:00', stage: 'Bảng C', scoreA: null, scoreB: null, handicap: 0.25 },
  { id: 'm49', teamA: 'TBD ❓', teamB: 'Mexico 🇲🇽', dateTime: '2026-06-25T11:00:00', stage: 'Bảng A', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm50', teamA: 'Nam Phi 🇿🇦', teamB: 'Hàn Quốc 🇰🇷', dateTime: '2026-06-25T14:00:00', stage: 'Bảng A', scoreA: null, scoreB: null, handicap: 0 },
  // 26/06 (First Friday Box)
  { id: 'm51', teamA: 'Bồ Đào Nha 🇵🇹', teamB: 'Uzbekistan 🇺🇿', dateTime: '2026-06-26T02:00:00', stage: 'Bảng K', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm52', teamA: 'Anh 🏴󠁧󠁢󠁥󠁮󠁧󠁿', teamB: 'Ghana 🇬🇭', dateTime: '2026-06-26T05:00:00', stage: 'Bảng L', scoreA: null, scoreB: null, handicap: 0.25 },
  { id: 'm53', teamA: 'Panama 🇵🇦', teamB: 'Croatia 🇭🇷', dateTime: '2026-06-26T07:00:00', stage: 'Bảng L', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm54', teamA: 'Colombia 🇨🇴', teamB: 'TBD ❓', dateTime: '2026-06-26T11:00:00', stage: 'Bảng K', scoreA: null, scoreB: null, handicap: 0 },

  // 26/06 (Second Friday Box)
  { id: 'm55', teamA: 'Ecuador 🇪🇨', teamB: 'Đức 🇩🇪', dateTime: '2026-06-26T04:00:00', stage: 'Bảng E', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm56', teamA: 'Curacao 🇨🇼', teamB: 'Bờ Biển Ngà 🇨🇮', dateTime: '2026-06-26T04:00:00', stage: 'Bảng E', scoreA: null, scoreB: null, handicap: 0.25 },
  { id: 'm57', teamA: 'Nhật Bản 🇯🇵', teamB: 'TBD ❓', dateTime: '2026-06-26T08:00:00', stage: 'Bảng F', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm58', teamA: 'Tunisia 🇹🇳', teamB: 'Hà Lan 🇳🇱', dateTime: '2026-06-26T08:00:00', stage: 'Bảng F', scoreA: null, scoreB: null, handicap: 0.25 },
  { id: 'm59', teamA: 'TBD ❓', teamB: 'Mỹ 🇺🇸', dateTime: '2026-06-26T13:00:00', stage: 'Bảng D', scoreA: null, scoreB: null, handicap: 0.75 },
  { id: 'm60', teamA: 'Paraguay 🇵🇾', teamB: 'Australia 🇦🇺', dateTime: '2026-06-26T13:00:00', stage: 'Bảng D', scoreA: null, scoreB: null, handicap: 0 },
  // 27/06
  { id: 'm61', teamA: 'Na Uy 🇳🇴', teamB: 'Pháp 🇫🇷', dateTime: '2026-06-27T03:00:00', stage: 'Bảng I', scoreA: null, scoreB: null, handicap: 0.25 },
  { id: 'm62', teamA: 'Senegal 🇸🇳', teamB: 'TBD ❓', dateTime: '2026-06-27T03:00:00', stage: 'Bảng I', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm63', teamA: 'Cape Verde 🇨🇻', teamB: 'Saudi Arabia 🇸🇦', dateTime: '2026-06-27T09:00:00', stage: 'Bảng G', scoreA: null, scoreB: null, handicap: 0 },
  { id: 'm64', teamA: 'Uruguay 🇺🇾', teamB: 'Tây Ban Nha 🇪🇸', dateTime: '2026-06-27T09:00:00', stage: 'Bảng G', scoreA: null, scoreB: null, handicap: 0.25 },
  { id: 'm65', teamA: 'Ai Cập 🇪🇬', teamB: 'Iran 🇮🇷', dateTime: '2026-06-27T11:00:00', stage: 'Bảng H', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm66', teamA: 'New Zealand 🇳🇿', teamB: 'Bỉ 🇧🇪', dateTime: '2026-06-27T14:00:00', stage: 'Bảng H', scoreA: null, scoreB: null, handicap: 0 },
  // 28/06
  { id: 'm67', teamA: 'Panama 🇵🇦', teamB: 'Anh 🏴󠁧󠁢󠁥󠁮󠁧󠁿', dateTime: '2026-06-28T05:00:00', stage: 'Bảng L', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm68', teamA: 'Croatia 🇭🇷', teamB: 'Ghana 🇬🇭', dateTime: '2026-06-28T05:00:00', stage: 'Bảng L', scoreA: null, scoreB: null, handicap: 0.25 },
  { id: 'm69', teamA: 'Colombia 🇨🇴', teamB: 'Bồ Đào Nha 🇵🇹', dateTime: '2026-06-28T09:30:00', stage: 'Bảng K', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm70', teamA: 'TBD ❓', teamB: 'Uzbekistan 🇺🇿', dateTime: '2026-06-28T09:30:00', stage: 'Bảng K', scoreA: null, scoreB: null, handicap: 0 },
  { id: 'm71', teamA: 'Algeria 🇩🇿', teamB: 'Áo 🇦🇹', dateTime: '2026-06-28T11:00:00', stage: 'Bảng J', scoreA: null, scoreB: null, handicap: 0.25 },
  { id: 'm72', teamA: 'Jordan 🇯🇴', teamB: 'Argentina 🇦🇷', dateTime: '2026-06-28T11:00:00', stage: 'Bảng J', scoreA: null, scoreB: null, handicap: 0.5 },

  // Vòng Loại Trực Tiếp (Vòng cuối nổi bật)
  { id: 'm101', teamA: 'Bán Kết 1 🏆', teamB: 'Đối thủ 🏆', dateTime: '2026-07-15T04:00:00', stage: 'Bán Kết 1', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm102', teamA: 'Bán Kết 2 🏆', teamB: 'Đối thủ 🏆', dateTime: '2026-07-16T03:00:00', stage: 'Bán Kết 2', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm103', teamA: 'Tranh Hạng Ba 🥉', teamB: 'Đối thủ 🥉', dateTime: '2026-07-19T05:00:00', stage: 'Tranh Hạng Ba', scoreA: null, scoreB: null, handicap: 0.5 },
  { id: 'm104', teamA: 'Chung Kết 🏆', teamB: 'Thời Khắc Vàng', dateTime: '2026-07-20T03:00:00', stage: 'Chung Kết', scoreA: null, scoreB: null, handicap: 0.5 }
];

export const INITIAL_PREDICTIONS: Prediction[] = [];

export const DEFAULT_SCORING: ScoringConfig = {
  exactScore: 10,
  correctOutcome: 10,
  wrongOutcome: 0
};

export const SAMPLE_PENALTIES = [
  'Mua trà sữa chiêu đãi cả phòng',
  'Mua trà chanh + hướng dương chiều thứ 6',
  'Bao bữa sáng hôm sau cho người nhất',
  'Hát một bài trước giờ G',
  'Quét văn phòng dọn rác 1 tuần',
  'Nộp một ly cà phê giải nhiệt ☕',
  'Làm chân shipper lấy đồ ăn trưa cho phòng cả tuần',
  'Bị dán hình phạt phong thủy hài hước tại bàn'
];
