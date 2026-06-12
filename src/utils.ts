import { Match, Participant, Prediction, ScoringConfig, StandingRow } from './types';

/**
 * Calculates cash fine for a wrong prediction based on the tournament stage names.
 */
export function getFineAmountForStage(stage: string): number {
  if (!stage) return 10;
  const norm = stage.toLowerCase().trim();
  
  if (norm.includes('chung kết') || norm.includes('final')) {
    return 50; // Chung kết: 50 cá
  }
  if (norm.includes('bán kết') || norm.includes('semi')) {
    return 40; // Bán kết: 40 cá
  }
  if (norm.includes('tứ kết') || norm.includes('quarter')) {
    return 30; // Tứ kết: 30 cá
  }
  if (
    norm.includes('16') || 
    norm.includes('1/8') ||
    norm.includes('octofinal')
  ) {
    return 20; // Vòng 16: 20 cá
  }
  
  // Vòng bảng & Vòng 32: 10 cá
  return 10;
}

/**
 * Calculates negative points for a wrong prediction based on the tournament stage names.
 */
export function getPenaltyForStage(stage: string): number {
  if (!stage) return -20;
  const norm = stage.toLowerCase().trim();
  
  // Bán kết, Chung kết, Tranh hạng ba
  if (
    norm.includes('bán kết') || 
    norm.includes('chung kết') || 
    norm.includes('hạng ba') ||
    norm.includes('semi') || 
    norm.includes('final')
  ) {
    return -100;
  }
  
  // Vòng 16, Tứ kết
  if (
    norm.includes('16') || 
    norm.includes('1/8') ||
    norm.includes('tứ kết') || 
    norm.includes('quarter')
  ) {
    return -50;
  }
  
  // Mặc định cho Vòng bảng và Vòng 32 đội
  return -20;
}

/**
 * Calculates score for a single prediction vs an actual match result.
 * Returns points won and the type of prediction status.
 */
export function calculatePoints(
  pred: Prediction | undefined,
  match: Match | undefined,
  config: ScoringConfig
): { points: number; status: 'exact' | 'outcome' | 'wrong' | 'unplayed' } {
  // If match has not been played yet or is undefined
  if (!match || match.scoreA === null || match.scoreB === null) {
    return { points: 0, status: 'unplayed' };
  }

  // If no prediction was made
  if (!pred) {
    const penalty = getPenaltyForStage(match.stage);
    return { points: penalty, status: 'wrong' };
  }

  const aA = match.scoreA;
  const aB = match.scoreB;

  let isCorrect = false;
  if (aA > aB) {
    isCorrect = pred.choice === 'A';
  } else if (aB > aA) {
    isCorrect = pred.choice === 'B';
  } else {
    // Trận đấu hòa, cả 2 lựa chọn A và B đều không thắng thực tế -> Sai
    isCorrect = false;
  }

  if (isCorrect) {
    return { points: config.correctOutcome, status: 'outcome' };
  }

  // Wrong prediction
  const penalty = getPenaltyForStage(match.stage);
  return { points: penalty, status: 'wrong' };
}

/**
 * Calculates standings of all participants based on all evaluated matches
 */
export function getStandings(
  participants: Participant[],
  matches: Match[],
  predictions: Prediction[],
  config: ScoringConfig
): StandingRow[] {
  // Index predictions for O(1) fast lookup
  const predictionsMap = new Map<string, Prediction>();
  predictions.forEach((pr) => {
    predictionsMap.set(`${pr.participantId}_${pr.matchId}`, pr);
  });

  const standings: StandingRow[] = participants.map((p) => {
    let exactCount = 0;
    let outcomeCount = 0;
    let wrongCount = 0;
    let predictedCount = 0;
    let totalFines = 0;

    matches.forEach((m) => {
      // Find prediction for this participant and match via O(1) Map lookup
      const pred = predictionsMap.get(`${p.id}_${m.id}`);

      if (pred) {
        predictedCount++;
      }

      if (m.scoreA !== null && m.scoreB !== null) {
        const { status } = calculatePoints(pred, m, config);
        if (status === 'outcome') {
          outcomeCount++;
        } else {
          wrongCount++;
          totalFines += getFineAmountForStage(m.stage);
        }
      }
    });

    return {
      participant: p,
      points: outcomeCount, // We use correct outcome count as the points indicator
      exactCount: 0,
      outcomeCount,
      wrongCount,
      predictedCount,
      fines: totalFines
    };
  });

  // Sort by: Lowest fines first (top of the board pays 0đ / least)
  // Tie breakers:
  // 1. More correct predictions
  // 2. Alphabetical name
  return standings.sort((a, b) => {
    if (a.fines !== b.fines) {
      return a.fines - b.fines;
    }
    if (b.outcomeCount !== a.outcomeCount) {
      return b.outcomeCount - a.outcomeCount;
    }
    return a.participant.name.localeCompare(b.participant.name);
  });
}

/**
 * Exports prediction matrix and standings as CSV for Excel compatibility.
 */
export function exportToCSV(
  participants: Participant[],
  matches: Match[],
  predictions: Prediction[],
  standings: StandingRow[]
): string {
  let csvContent = '\uFEFF'; // Add BOM for Excel UTF-8 support (important for Vietnamese signs!)

  // --- SECTION 1: STANDINGS ---
  csvContent += 'BẢNG XẾP HẠNG THÀNH VIÊN VĂN PHÒNG\n';
  csvContent += 'Hạng,Tên thành viên,Vai trò,Nộp Quỹ Cộng Dồn (Cá),Đoán Đúng,Đoán Sai / Trễ,Đã dự đoán\n';

  standings.forEach((row, index) => {
    csvContent += `"${index + 1}","${row.participant.name}","${row.participant.role || ''}","${row.fines}","${row.outcomeCount}","${row.wrongCount}","${row.predictedCount}"\n`;
  });

  csvContent += '\n\n';

  // --- SECTION 2: MATCH MATCH DETAILS & PREDICTIONS ---
  csvContent += 'BẢNG CHI TIẾT DỰ ĐOÁN WORLD CUP 2026\n';

  // Header row: Member, Role, then each Match description
  let header = 'Thành viên,Vai trò';
  matches.forEach((m) => {
    const scoreStr = m.scoreA !== null ? ` (${m.scoreA}-${m.scoreB})` : ' (Chưa đá)';
    header += `,"${m.teamA} VS ${m.teamB}${scoreStr}"`;
  });
  csvContent += header + '\n';

  // Participant prediction row
  participants.forEach((p) => {
    let rowStr = `"${p.name}","${p.role || ''}"`;
    matches.forEach((m) => {
      const pred = predictions.find((pr) => pr.participantId === p.id && pr.matchId === m.id);
      if (pred) {
        rowStr += `,"Chọn: ${pred.choice === 'A' ? m.teamA : m.teamB}"`;
      } else {
        rowStr += ',"-"';
      }
    });
    csvContent += rowStr + '\n';
  });

  return csvContent;
}
