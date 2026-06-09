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
  {
    id: 'm1',
    teamA: 'Mexico 🇲🇽',
    teamB: 'Nam Phi 🇿🇦',
    dateTime: '2026-06-12T04:00:00',
    stage: 'Bảng A (Sân Mexico 🇲🇽)',
    scoreA: 2,
    scoreB: 1,
    handicap: 0.5
  },
  {
    id: 'm2',
    teamA: 'Hàn Quốc 🇰🇷',
    teamB: 'TBD ❓',
    dateTime: '2026-06-12T11:00:00',
    stage: 'Bảng B (Sân Mỹ 🇺🇸)',
    scoreA: 1,
    scoreB: 1,
    handicap: 1.5
  },
  {
    id: 'm3',
    teamA: 'Canada 🇨🇦',
    teamB: 'TBD ❓',
    dateTime: '2026-06-13T03:00:00',
    stage: 'Bảng C (Sân Canada 🇨🇦)',
    scoreA: null,
    scoreB: null,
    handicap: 0.5
  },
  {
    id: 'm4',
    teamA: 'Mỹ 🇺🇸',
    teamB: 'Paraguay 🇵🇾',
    dateTime: '2026-06-13T12:00:00',
    stage: 'Bảng D (Sân Mỹ 🇺🇸)',
    scoreA: null,
    scoreB: null,
    handicap: 0.5
  },
  {
    id: 'm5',
    teamA: 'Qatar 🇶🇦',
    teamB: 'Thụy Sĩ 🇨🇭',
    dateTime: '2026-06-14T06:00:00',
    stage: 'Bảng A (Sân Mỹ 🇺🇸)',
    scoreA: null,
    scoreB: null,
    handicap: -0.5
  },
  {
    id: 'm6',
    teamA: 'Brazil 🇧🇷',
    teamB: 'Morocco 🇲🇦',
    dateTime: '2026-06-14T06:00:00',
    stage: 'Bảng B (Sân Canada 🇨🇦)',
    scoreA: null,
    scoreB: null,
    handicap: 1.5
  },
  {
    id: 'm7',
    teamA: 'Haiti 🇭🇹',
    teamB: 'Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    dateTime: '2026-06-14T09:00:00',
    stage: 'Bảng D (Sân Mỹ 🇺🇸)',
    scoreA: null,
    scoreB: null,
    handicap: -0.5
  },
  {
    id: 'm8',
    teamA: 'Australia 🇦🇺',
    teamB: 'TBD ❓',
    dateTime: '2026-06-14T15:00:00',
    stage: 'Bảng C (Sân Mexico 🇲🇽)',
    scoreA: null,
    scoreB: null,
    handicap: 0.5
  },
  {
    id: 'm9',
    teamA: 'Đức 🇩🇪',
    teamB: 'Curacao 🇨🇼',
    dateTime: '2026-06-15T02:00:00',
    stage: 'Bảng E (Sân Mỹ 🇺🇸)',
    scoreA: null,
    scoreB: null,
    handicap: 1.5
  },
  {
    id: 'm10',
    teamA: 'Hà Lan 🇳🇱',
    teamB: 'Nhật Bản 🇯🇵',
    dateTime: '2026-06-15T05:00:00',
    stage: 'Bảng F (Sân Canada 🇨🇦)',
    scoreA: null,
    scoreB: null,
    handicap: 0.5
  },
  {
    id: 'm11',
    teamA: 'Bờ Biển Ngà 🇨🇮',
    teamB: 'Ecuador 🇪🇨',
    dateTime: '2026-06-15T07:00:00',
    stage: 'Bảng E (Sân Mỹ 🇺🇸)',
    scoreA: null,
    scoreB: null,
    handicap: 0.5
  },
  {
    id: 'm12',
    teamA: 'TBD ❓',
    teamB: 'Tunisia 🇹🇳',
    dateTime: '2026-06-15T11:00:00',
    stage: 'Bảng F (Sân Mexico 🇲🇽)',
    scoreA: null,
    scoreB: null,
    handicap: -0.5
  },
  {
    id: 'm13',
    teamA: 'Tây Ban Nha 🇪🇸',
    teamB: 'Cape Verde 🇨🇻',
    dateTime: '2026-06-16T03:00:00',
    stage: 'Bảng G (Sân Canada 🇨🇦)',
    scoreA: null,
    scoreB: null,
    handicap: 1.5
  },
  {
    id: 'm14',
    teamA: 'Bỉ 🇧🇪',
    teamB: 'Ai Cập 🇪🇬',
    dateTime: '2026-06-16T06:00:00',
    stage: 'Bảng H (Sân Mỹ 🇺🇸)',
    scoreA: null,
    scoreB: null,
    handicap: 0.5
  },
  {
    id: 'm15',
    teamA: 'Saudi Arabia 🇸🇦',
    teamB: 'Uruguay 🇺🇾',
    dateTime: '2026-06-16T06:00:00',
    stage: 'Bảng G (Sân Mexico 🇲🇽)',
    scoreA: null,
    scoreB: null,
    handicap: -0.5
  },
  {
    id: 'm16',
    teamA: 'Iran 🇮🇷',
    teamB: 'New Zealand 🇳🇿',
    dateTime: '2026-06-16T12:00:00',
    stage: 'Bảng H (Sân Mexico 🇲🇽)',
    scoreA: null,
    scoreB: null,
    handicap: 0.5
  },
  {
    id: 'm17',
    teamA: 'Pháp 🇫🇷',
    teamB: 'Senegal 🇸🇳',
    dateTime: '2026-06-17T03:00:00',
    stage: 'Bảng I (Sân Canada 🇨🇦)',
    scoreA: null,
    scoreB: null,
    handicap: 1.5
  },
  {
    id: 'm18',
    teamA: 'TBD ❓',
    teamB: 'Na Uy 🇳🇴',
    dateTime: '2026-06-17T06:00:00',
    stage: 'Bảng J (Sân Mỹ 🇺🇸)',
    scoreA: null,
    scoreB: null,
    handicap: -0.5
  },
  {
    id: 'm19',
    teamA: 'Argentina 🇦🇷',
    teamB: 'Algeria 🇩🇿',
    dateTime: '2026-06-17T10:00:00',
    stage: 'Bảng I (Sân Mỹ 🇺🇸)',
    scoreA: null,
    scoreB: null,
    handicap: 1.5
  },
  {
    id: 'm20',
    teamA: 'Áo 🇦🇹',
    teamB: 'Jordan 🇯🇴',
    dateTime: '2026-06-17T15:00:00',
    stage: 'Bảng J (Sân Mexico 🇲🇽)',
    scoreA: null,
    scoreB: null,
    handicap: 0.5
  },
  {
    id: 'm21',
    teamA: 'Bồ Đào Nha 🇵🇹',
    teamB: 'TBD ❓',
    dateTime: '2026-06-18T02:00:00',
    stage: 'Bảng K (Sân Mỹ 🇺🇸)',
    scoreA: null,
    scoreB: null,
    handicap: 1.5
  },
  {
    id: 'm22',
    teamA: 'Anh 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    teamB: 'Croatia 🇭🇷',
    dateTime: '2026-06-18T05:00:00',
    stage: 'Bảng L (Sân Canada 🇨🇦)',
    scoreA: null,
    scoreB: null,
    handicap: 0.5
  },
  {
    id: 'm23',
    teamA: 'Ghana 🇬🇭',
    teamB: 'Panama 🇵🇦',
    dateTime: '2026-06-18T07:00:00',
    stage: 'Bảng K (Sân Mỹ 🇺🇸)',
    scoreA: null,
    scoreB: null,
    handicap: 0.5
  },
  {
    id: 'm24',
    teamA: 'Uzbekistan 🇺🇿',
    teamB: 'Colombia 🇨🇴',
    dateTime: '2026-06-18T11:00:00',
    stage: 'Bảng L (Sân Mexico 🇲🇽)',
    scoreA: null,
    scoreB: null,
    handicap: -0.5
  },
  {
    id: 'm25',
    teamA: 'TBD ❓',
    teamB: 'Nam Phi 🇿🇦',
    dateTime: '2026-06-19T00:00:00',
    stage: 'Bảng A (Sân Mỹ 🇺🇸)',
    scoreA: null,
    scoreB: null,
    handicap: -0.5
  },
  {
    id: 'm26',
    teamA: 'Thụy Sĩ 🇨🇭',
    teamB: 'TBD ❓',
    dateTime: '2026-06-19T06:00:00',
    stage: 'Bảng A (Sân Canada 🇨🇦)',
    scoreA: null,
    scoreB: null,
    handicap: 0.5
  },
  {
    id: 'm27',
    teamA: 'Canada 🇨🇦',
    teamB: 'Qatar 🇶🇦',
    dateTime: '2026-06-19T07:00:00',
    stage: 'Bảng C (Sân Canada 🇨🇦)',
    scoreA: null,
    scoreB: null,
    handicap: 0.5
  },
  {
    id: 'm28',
    teamA: 'Mexico 🇲🇽',
    teamB: 'Hàn Quốc 🇰🇷',
    dateTime: '2026-06-19T10:00:00',
    stage: 'Bảng B (Sân Mexico 🇲🇽)',
    scoreA: null,
    scoreB: null,
    handicap: 0.5
  },
  {
    id: 'm38',
    teamA: 'CHUNG KẾT 🏆',
    teamB: 'WINNER SÂN MỸ',
    dateTime: '2026-07-20T03:00:00',
    stage: 'Chung Kết Toàn Cầu 🏆 (Sân Mỹ 🇺🇸)',
    scoreA: null,
    scoreB: null,
    handicap: 0.5
  }
];

export const INITIAL_PREDICTIONS: Prediction[] = [
  // Trận m1 (Mexico vs Nam Phi) -> Mexico chấp 0.5. Actual score 2 - 1 -> Mexico wins handicap.
  { participantId: 'p1', matchId: 'm1', choice: 'A' },
  { participantId: 'p2', matchId: 'm1', choice: 'A' },
  { participantId: 'p3', matchId: 'm1', choice: 'A' },
  { participantId: 'p4', matchId: 'm1', choice: 'B' },
  { participantId: 'p5', matchId: 'm1', choice: 'A' },
  { participantId: 'p6', matchId: 'm1', choice: 'A' },
  { participantId: 'p7', matchId: 'm1', choice: 'B' },
  { participantId: 'p8', matchId: 'm1', choice: 'A' },
  { participantId: 'p9', matchId: 'm1', choice: 'A' },
  { participantId: 'p10', matchId: 'm1', choice: 'B' },
  { participantId: 'p11', matchId: 'm1', choice: 'A' },
  { participantId: 'p12', matchId: 'm1', choice: 'A' },
  { participantId: 'p13', matchId: 'm1', choice: 'A' },
  { participantId: 'p14', matchId: 'm1', choice: 'B' },
  { participantId: 'p15', matchId: 'm1', choice: 'A' },
  { participantId: 'p16', matchId: 'm1', choice: 'B' },
  { participantId: 'p17', matchId: 'm1', choice: 'A' },
  { participantId: 'p18', matchId: 'm1', choice: 'A' },
  { participantId: 'p19', matchId: 'm1', choice: 'A' },
  { participantId: 'p20', matchId: 'm1', choice: 'B' },
  { participantId: 'p21', matchId: 'm1', choice: 'A' },
  { participantId: 'p22', matchId: 'm1', choice: 'A' },
  { participantId: 'p23', matchId: 'm1', choice: 'B' },
  { participantId: 'p24', matchId: 'm1', choice: 'A' },
  { participantId: 'p25', matchId: 'm1', choice: 'A' },
  { participantId: 'p26', matchId: 'm1', choice: 'A' },
  { participantId: 'p27', matchId: 'm1', choice: 'B' },
  { participantId: 'p28', matchId: 'm1', choice: 'A' },

  // Trận m2 (Hàn Quốc 1 - 1 TBD) -> Hàn Quốc -1.5 -> -0.5 < 1, B thắng handicap
  { participantId: 'p1', matchId: 'm2', choice: 'B' },
  { participantId: 'p2', matchId: 'm2', choice: 'B' },
  { participantId: 'p3', matchId: 'm2', choice: 'B' },
  { participantId: 'p4', matchId: 'm2', choice: 'A' },
  { participantId: 'p5', matchId: 'm2', choice: 'B' },
  { participantId: 'p6', matchId: 'm2', choice: 'B' },
  { participantId: 'p7', matchId: 'm2', choice: 'A' },
  { participantId: 'p8', matchId: 'm2', choice: 'B' },
  { participantId: 'p9', matchId: 'm2', choice: 'A' },
  { participantId: 'p10', matchId: 'm2', choice: 'B' },
  { participantId: 'p11', matchId: 'm2', choice: 'B' },
  { participantId: 'p12', matchId: 'm2', choice: 'A' },
  { participantId: 'p13', matchId: 'm2', choice: 'B' },
  { participantId: 'p14', matchId: 'm2', choice: 'B' },
  { participantId: 'p15', matchId: 'm2', choice: 'B' },
  { participantId: 'p16', matchId: 'm2', choice: 'A' },
  { participantId: 'p17', matchId: 'm2', choice: 'B' },
  { participantId: 'p18', matchId: 'm2', choice: 'A' },
  { participantId: 'p19', matchId: 'm2', choice: 'B' },
  { participantId: 'p20', matchId: 'm2', choice: 'A' },
  { participantId: 'p21', matchId: 'm2', choice: 'B' },
  { participantId: 'p22', matchId: 'm2', choice: 'A' },
  { participantId: 'p23', matchId: 'm2', choice: 'B' },
  { participantId: 'p24', matchId: 'm2', choice: 'B' },
  { participantId: 'p25', matchId: 'm2', choice: 'A' },
  { participantId: 'p26', matchId: 'm2', choice: 'B' },
  { participantId: 'p27', matchId: 'm2', choice: 'B' },
  { participantId: 'p28', matchId: 'm2', choice: 'B' },

  // Trận 3 (Canada vs TBD) làm ví dụ dự báo
  { participantId: 'p1', matchId: 'm3', choice: 'A' },
  { participantId: 'p2', matchId: 'm3', choice: 'A' },
  { participantId: 'p3', matchId: 'm3', choice: 'A' }
];

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
