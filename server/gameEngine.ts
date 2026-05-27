import type { PlayerId, PublicBoardCell, RoomState, ServerTravelCardData } from "./types.js";

export const PLAYER_IDS: PlayerId[] = ["p1", "p2", "p3", "p4"];

export function createEmptyBoard(): PublicBoardCell[][] {
  return Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => null));
}

export function createRoomId(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function shuffleCards<T>(cards: T[]): T[] {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const temp = shuffled[index];
    shuffled[index] = shuffled[randomIndex];
    shuffled[randomIndex] = temp;
  }

  return shuffled;
}

/*
  Server deck tạm thời.
  Bước sau mình sẽ giúp bạn import/generate deck này từ src/data/cards.phase1.ts
  để không phải duplicate data.
*/
export function createServerDeck(): ServerTravelCardData[] {
  const names = [
    ["sg_food_001", "Cà Phê Bệt", "Quận 1", 5, 1, 0, "☕"],
    ["sg_food_002", "Bánh Tráng", "Quận 3", 5, 1, 0, "🍘"],
    ["sg_food_003", "Cà Phê Vợt", "Quận 3", 8, 1, 0, "☕"],
    ["sg_food_004", "Phá Lấu", "Quận 4", 5, 1, 0, "🍲"],
    ["sg_food_005", "Súp Cua", "Quận 1", 5, 1, 0, "🦀"],
    ["sg_food_006", "Bánh Mì", "Quận 1", 10, 2, 0, "🥖"],
    ["sg_food_007", "Dimsum", "Quận 5", 25, 4, 0, "🥟"],
    ["sg_food_008", "Hồ Thị Kỷ", "Quận 10", 15, 2, 1, "🍜"],
    ["sg_food_009", "Cơm Tấm", "Phú Nhuận", 15, 2, 0, "🍚"],
    ["sg_food_010", "Phở Hòa", "Quận 3", 15, 3, 0, "🍜"],
    ["sg_food_011", "Sủi Cảo", "Quận 11", 12, 2, 0, "🥟"],
    ["sg_food_012", "Bánh Xèo", "Quận 1", 10, 2, 0, "🥞"],
    ["sg_food_013", "Cơm Quê", "Khu trung tâm", 35, 5, 0, "🍱"],
    ["sg_food_014", "Lẩu Cá Kèo", "Quận 3", 18, 3, 0, "🍲"],
    ["sg_food_015", "Nhà Hàng Chay", "Quận 1", 20, 4, 0, "🥗"],
    ["sg_food_016", "Ăn Tối Du Thuyền", "Sông Sài Gòn", 35, 5, 0, "⛴️"],
    ["sg_food_017", "Phố Ốc", "Quận 4", 12, 2, 0, "🐚"],
    ["sg_food_018", "Phố Sủi Cảo", "Quận 11", 12, 2, 0, "🥟"],
    ["sg_food_019", "Landmark 81", "Bình Thạnh", 45, 6, 0, "🏙️"],
    ["sg_food_020", "Du Thuyền Tối", "Quận 4", 35, 5, 0, "⛴️"],
    ["sg_food_021", "Cà Phê 42", "Quận 1", 12, 2, 0, "☕"],
  ] as const;

  return names.map(([id, name, city, vp, coin, stamina, icon]) => {
    return {
      id,
      name,
      shortName: name,
      city,
      shortCity: city,
      image: `assets/cards/saigon/food/${id}.jpg`,
      rarity: vp >= 35 ? "epic" : vp >= 15 ? "uncommon" : "common",
      rarityLabel: vp >= 35 ? "★★★★" : vp >= 15 ? "★★" : "★",
      vp,
      coin,
      stamina,
      tag: "food",
      tagLabel: "Ẩm thực",
      tags: ["FOOD"],
      icon,
      description: "Một điểm ẩm thực trong hành trình Sài Gòn.",
      bonusText: "Nếu có 2 lá Ẩm thực: +5 VP",
    };
  });
}

export function createEmptyPlayer(
  id: PlayerId,
  name: string,
  isConnected: boolean
): RoomState["players"][PlayerId] {
  return {
    id,
    name,
    hasJoined: isConnected,
    score: 0,
    coin: 1640,
    stamina: 45,
    usedSlots: 0,
    isConnected,
    isReady: false,
    board: createEmptyBoard(),
    draftPool: [],
    pickedDraftCards: [],
    hand: [],
    selectedDraftCardId: null,
  };
}

export function getPublicPlayers(state: RoomState) {
  return {
    p1: stripPrivatePlayerState(state.players.p1),
    p2: stripPrivatePlayerState(state.players.p2),
    p3: stripPrivatePlayerState(state.players.p3),
    p4: stripPrivatePlayerState(state.players.p4),
  };
}

function stripPrivatePlayerState(player: RoomState["players"][PlayerId]) {
  return {
    id: player.id,
    name: player.name,
    score: player.score,
    coin: player.coin,
    stamina: player.stamina,
    usedSlots: player.usedSlots,
    isConnected: player.isConnected,
    isReady: player.isReady,
    hasJoined: player.hasJoined,
    board: player.board,
  };
}

export function getPlayerViewState(state: RoomState, playerId: PlayerId) {
  const player = state.players[playerId];

  return {
    roomId: state.roomId,
    phase: state.phase,
    phaseNumber: state.phaseNumber ?? 1,
    dayIndex: state.dayIndex,
    draftRound: state.draftRound,
    timer: state.timer,
    selfPlayerId: playerId,
    players: getPublicPlayers(state),
    self: {
      draftPool: player.draftPool,
      pickedDraftCards: player.pickedDraftCards,
      hand: player.hand,
      selectedDraftCardId: player.selectedDraftCardId,
    },
  };
}
