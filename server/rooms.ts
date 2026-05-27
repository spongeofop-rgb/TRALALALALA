import type { PlayerId, RoomState } from "./types.js";
import {
  createEmptyPlayer,
  createRoomId,
  createServerDeck,
  shuffleCards,
} from "./gameEngine.js";
import { startDraftForCurrentDay } from "./draftEngine.js";

const PLAYER_IDS: PlayerId[] = ["p1", "p2", "p3", "p4"];

export function createRoom(firstPlayerName: string): {
  roomId: string;
  playerId: PlayerId;
  state: RoomState;
} {
  const roomId = createRoomId();

  const state: RoomState = {
    roomId,
    phase: "lobby",
    phaseNumber: 1,
    dayIndex: 0,
    draftRound: 0,
    timer: 0,
    deck: shuffleCards(createServerDeck()),
    players: {
      p1: createEmptyPlayer("p1", firstPlayerName || "An", true),
      p2: createEmptyPlayer("p2", "Cường", false),
      p3: createEmptyPlayer("p3", "Minh", false),
      p4: createEmptyPlayer("p4", "Khánh", false),
    },
  };

  return {
    roomId,
    playerId: "p1",
    state,
  };
}

export function joinRoom(state: RoomState, playerName: string): PlayerId | null {
  const openPlayerId = PLAYER_IDS.find((playerId) => !state.players[playerId].hasJoined);

  if (!openPlayerId) {
    return null;
  }

  state.players[openPlayerId] = {
    ...state.players[openPlayerId],
    name: playerName || state.players[openPlayerId].name,
    isConnected: true,
    isReady: false,
    hasJoined: true,
  };

  return openPlayerId;
}

export function reconnectRoom(
  state: RoomState,
  payload: {
    playerId: PlayerId;
    playerName: string;
  }
): PlayerId | null {
  const player = state.players[payload.playerId];

  if (!player) return null;

  player.isConnected = true;
  player.hasJoined = true;

  if (payload.playerName) {
    player.name = payload.playerName;
  }

  return payload.playerId;
}

export function setPlayerReady(
  state: RoomState,
  payload: {
    playerId: PlayerId;
    isReady: boolean;
  }
): string | null {
  if (state.phase !== "lobby") {
    return "Chỉ có thể sẵn sàng khi phòng đang chờ.";
  }

  const player = state.players[payload.playerId];

  if (!player || !player.isConnected) {
    return "Người chơi chưa ở trong phòng.";
  }

  player.isReady = payload.isReady;
  return null;
}

function getConnectedPlayers(state: RoomState) {
  return PLAYER_IDS
    .map((playerId) => state.players[playerId])
    .filter((player) => player.isConnected);
}

function areAllConnectedPlayersReady(state: RoomState) {
  const connectedPlayers = getConnectedPlayers(state);

  return connectedPlayers.length > 0 && connectedPlayers.every((player) => player.isReady);
}

export function leaveRoom(
  state: RoomState,
  payload: {
    playerId: PlayerId;
  }
): string | null {
  const player = state.players[payload.playerId];

  if (!player) {
    return "Không tìm thấy người chơi.";
  }

  player.isConnected = false;
  player.isReady = false;
  player.hasJoined = true;

  /*
    Thoát phòng chỉ chuyển sang offline/reserved.
    Không cho người khác dùng room code để chiếm lại slot này.
    Người cũ chỉ quay lại bằng reconnect session.
  */
  return null;
}

export function startGame(
  state: RoomState,
  payload: {
    playerId: PlayerId;
  }
): string | null {
  if (state.phase !== "lobby") {
    return "Phòng đã bắt đầu.";
  }

  if (payload.playerId !== "p1") {
    return "Chỉ host p1 mới được bắt đầu.";
  }

  const host = state.players.p1;

  if (!host || !host.isConnected) {
    return "Host chưa ở trong phòng.";
  }

  if (!areAllConnectedPlayersReady(state)) {
    return "Cần tất cả người chơi trong phòng bấm Sẵn sàng.";
  }

  state.dayIndex = 0;

  for (const playerId of PLAYER_IDS) {
    state.players[playerId].isReady = false;
  }

  startDraftForCurrentDay(state);

  return null;
}


export function placeCardOnPlayerBoard(
  state: RoomState,
  payload: {
    playerId: PlayerId;
    cardId: string;
    rowIndex: number;
    colIndex: number;
    tag?: string;
    icon?: string;
    vp?: number;
    coin?: number;
    stamina?: number;
    name?: string;
  }
): string | null {
  const player = state.players[payload.playerId];

  if (!player) return "Không tìm thấy người chơi.";
  if (state.phase !== "planning") return "Chưa tới phase xếp bài.";
  if (payload.colIndex !== state.dayIndex) return "Chỉ được xếp bài vào ngày hiện tại.";

  const cell = player.board[payload.rowIndex]?.[payload.colIndex];

  if (cell === undefined) return "Ô không hợp lệ.";
  if (cell !== null) return "Ô này đã có bài.";

  const handIndex = player.hand.findIndex((card) => card.id === payload.cardId);
  const card = handIndex >= 0 ? player.hand[handIndex] : null;

  const cardId = card?.id ?? payload.cardId;
  const cardName = card?.name ?? payload.name ?? payload.cardId;
  const cardTag = card?.tag ?? payload.tag;
  const cardIcon = card?.icon ?? payload.icon;
  const cardVp = card?.vp ?? payload.vp;
  const cardCoin = card?.coin ?? payload.coin ?? 0;
  const cardStamina = card?.stamina ?? payload.stamina ?? 0;

  if (!cardTag || !cardIcon || typeof cardVp !== "number") {
    return "Không đủ dữ liệu lá bài để xếp.";
  }

  if (player.coin < cardCoin) {
    return "Không đủ xu để xếp lá này.";
  }

  if (player.stamina < cardStamina) {
    return "Không đủ thể lực để xếp lá này.";
  }

  if (handIndex >= 0) {
    player.hand.splice(handIndex, 1);
  }

  player.coin -= cardCoin;
  player.stamina -= cardStamina;
  player.usedSlots += 1;

  player.board[payload.rowIndex][payload.colIndex] = {
    cardId,
    name: cardName,
    tag: cardTag,
    icon: cardIcon,
    vp: cardVp,
    coin: cardCoin,
    stamina: cardStamina,
  };

  return null;
}


export function discardCardFromPlayerHand(
  state: RoomState,
  payload: {
    playerId: PlayerId;
    cardId: string;
    coin?: number;
    stamina?: number;
    name?: string;
  }
): string | null {
  const player = state.players[payload.playerId];

  if (!player) return "Không tìm thấy người chơi.";
  if (state.phase !== "planning") return "Chỉ được discard trong phase xếp bài.";

  const handIndex = player.hand.findIndex((card) => card.id === payload.cardId);
  const card = handIndex >= 0 ? player.hand[handIndex] : null;

  if (!card) {
    return "Không tìm thấy lá bài trên tay để discard.";
  }

  player.hand.splice(handIndex, 1);

  /*
    Discard = bỏ lá khỏi tay để nhận lại tài nguyên bằng cost của lá.
    Không tăng usedSlots, không đặt lên board, không tính điểm.
  */
  player.coin += card.coin ?? payload.coin ?? 0;
  player.stamina += card.stamina ?? payload.stamina ?? 0;

  return null;
}
