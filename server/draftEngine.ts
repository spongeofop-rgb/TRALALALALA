import type { PlayerId, RoomState, ServerTravelCardData } from "./types.js";
import { PLAYER_IDS, createServerDeck, shuffleCards } from "./gameEngine.js";

function getActiveDraftPlayerIds(state: RoomState): PlayerId[] {
  const connectedPlayerIds = PLAYER_IDS.filter((playerId) => {
    return state.players[playerId].isConnected;
  });

  /*
    Online: chỉ người đang connected mới tham gia draft/pass.
    Mỗi người đang chơi luôn được phát 5 lá/ngày.
  */
  return connectedPlayerIds.length > 0 ? connectedPlayerIds : ["p1"];
}

function getGeneratedCardSuffix(state: RoomState, index: number) {
  const phaseNumber = state.phaseNumber ?? 1;

  return `p${phaseNumber}_d${state.dayIndex + 1}_${state.draftRound}_${index}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function createGeneratedCardFromTemplate(
  template: ServerTravelCardData,
  state: RoomState,
  index: number
): ServerTravelCardData {
  /*
    Khi deck thật không đủ, tạo bài ảo có data thật dựa trên template.
    Không dùng virtual_blank / Thẻ Trống nữa.
    ID riêng để không trùng, tên cũng khác để người chơi không thấy bị phát lại y nguyên.
  */
  const suffix = getGeneratedCardSuffix(state, index);

  return {
    ...template,
    id: `${template.id}_generated_${suffix}`,
    name: `${template.name} Mở Rộng`,
    shortName: template.shortName
      ? `${template.shortName} MR`
      : `${template.name} MR`,
    description:
      template.description ||
      "Điểm đến mở rộng được hệ thống bổ sung để đủ số lượng bài draft.",
    bonusText: template.bonusText || "Không có hiệu ứng đặc biệt.",
  };
}

function createGeneratedCards(state: RoomState, minimumCards: number): ServerTravelCardData[] {
  const baseDeck = createServerDeck();

  if (baseDeck.length === 0) return [];

  const result: ServerTravelCardData[] = [];

  while (result.length < minimumCards) {
    const shuffledTemplates = shuffleCards(baseDeck);

    for (const template of shuffledTemplates) {
      if (result.length >= minimumCards) break;

      result.push(createGeneratedCardFromTemplate(template, state, result.length));
    }
  }

  return result;
}

function ensureDeckHasCards(state: RoomState, requiredCards: number) {
  if (state.deck.length >= requiredCards) return;

  const missingCards = requiredCards - state.deck.length;
  const generatedCards = createGeneratedCards(state, missingCards);

  state.deck = [...state.deck, ...generatedCards];
}

export function startDraftForCurrentDay(state: RoomState) {
  state.phase = "draft";
  state.draftRound = 1;
  state.timer = 10;

  const activePlayerIds = getActiveDraftPlayerIds(state);
  const requiredCards = activePlayerIds.length * 5;

  /*
    Luật giữ nguyên: mỗi người đang chơi được phát đúng 5 lá/ngày.
    Không trả hand ngày cũ về deck ngay lập tức, vì làm vậy bài ngày 1 có thể bị phát lại
    ở ngày 2. Nếu deck thiếu, tạo bài generated có data thật để lấp đủ.
  */
  ensureDeckHasCards(state, requiredCards);

  const draftCards = state.deck.slice(0, requiredCards);
  state.deck = state.deck.slice(requiredCards);

  PLAYER_IDS.forEach((playerId) => {
    const player = state.players[playerId];

    player.draftPool = [];
    player.pickedDraftCards = [];
    player.hand = [];
    player.selectedDraftCardId = null;
  });

  activePlayerIds.forEach((playerId, index) => {
    const player = state.players[playerId];
    const start = index * 5;

    player.draftPool = draftCards.slice(start, start + 5);
  });
}

export function selectDraftCard(
  state: RoomState,
  payload: {
    playerId: PlayerId;
    cardId: string;
  }
): string | null {
  if (state.phase !== "draft") {
    return "Chưa tới phase chia bài.";
  }

  const player = state.players[payload.playerId];

  if (!player) return "Không tìm thấy người chơi.";
  if (!player.isConnected) return "Người chơi chưa kết nối.";
  if (!player.draftPool.some((card) => card.id === payload.cardId)) {
    return "Lá này không nằm trong bài đang được chọn.";
  }

  player.selectedDraftCardId =
    player.selectedDraftCardId === payload.cardId ? null : payload.cardId;

  return null;
}

export function finishDraftRound(state: RoomState) {
  if (state.phase !== "draft") return;

  const activePlayerIds = getActiveDraftPlayerIds(state);

  /*
    Mỗi người pick đúng 1 lá từ pool hiện tại.
    Sau đó chỉ phần bài còn lại mới được chuyền cho người kế tiếp.
    Không rút/random pool mới ở giữa draft.
  */
  for (const playerId of activePlayerIds) {
    const player = state.players[playerId];

    if (player.draftPool.length === 0) continue;

    const selectedCard =
      player.draftPool.find((card) => card.id === player.selectedDraftCardId) ??
      player.draftPool[0];

    player.pickedDraftCards.push(selectedCard);
    player.draftPool = player.draftPool.filter((card) => card.id !== selectedCard.id);
    player.selectedDraftCardId = null;
  }

  const hasMoreCards = activePlayerIds.some((playerId) => {
    return state.players[playerId].draftPool.length > 0;
  });

  if (!hasMoreCards) {
    finishDraftAndStartPlanning(state);
    return;
  }

  rotateDraftPoolsClockwise(state, activePlayerIds);
  state.draftRound += 1;
  state.timer = 10;
}

function rotateDraftPoolsClockwise(state: RoomState, activePlayerIds: PlayerId[]) {
  if (activePlayerIds.length <= 1) return;

  const oldPools = activePlayerIds.map((playerId) => {
    return [...state.players[playerId].draftPool];
  });

  activePlayerIds.forEach((playerId, index) => {
    const sourceIndex = (index - 1 + activePlayerIds.length) % activePlayerIds.length;
    state.players[playerId].draftPool = oldPools[sourceIndex];
  });
}

function finishDraftAndStartPlanning(state: RoomState) {
  state.phase = "planning";
  state.timer = 5;

  for (const playerId of PLAYER_IDS) {
    const player = state.players[playerId];

    player.hand = [...player.pickedDraftCards];
    player.draftPool = [];
    player.selectedDraftCardId = null;
  }
}
