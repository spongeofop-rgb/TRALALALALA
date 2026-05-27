import type { TravelCardData } from "../types.js";

export type DraftPlayerState = {
  name: string;
  pool: TravelCardData[];
  picked: TravelCardData[];
};

export type DraftPickResult = {
  playerIndex: number;
  pickedCard: TravelCardData;
};

export type CreateDailyDraftPlayersParams = {
  deck: TravelCardData[];
  initialDeck: TravelCardData[];
  handSize: number;
  playerCount: number;
  shuffleCards: (cards: TravelCardData[]) => TravelCardData[];
};

export type CreateDailyDraftPlayersResult = {
  deck: TravelCardData[];
  draftPlayers: DraftPlayerState[];
};

export function getDraftPlayerNames(): string[] {
  return ["Cường", "An", "Minh", "Khánh"];
}

export function getActiveDraftPlayerIndex(): number {
  return 1; // An
}

export function getCurrentDraftPlayer(
  draftPlayers: DraftPlayerState[],
  activeIndex = getActiveDraftPlayerIndex()
): DraftPlayerState | undefined {
  return draftPlayers[activeIndex];
}

export function pickRandomCard(cards: TravelCardData[]): TravelCardData | null {
  if (cards.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * cards.length);
  return cards[randomIndex];
}

export function rotateDraftPoolsClockwise(
  draftPlayers: DraftPlayerState[]
): DraftPlayerState[] {
  const oldPools = draftPlayers.map((player) => [...player.pool]);

  return draftPlayers.map((player, index) => {
    const sourceIndex = (index - 1 + draftPlayers.length) % draftPlayers.length;

    return {
      ...player,
      pool: oldPools[sourceIndex],
    };
  });
}

export function createDailyDraftPlayers({
  deck,
  initialDeck,
  handSize,
  playerCount,
  shuffleCards,
}: CreateDailyDraftPlayersParams): CreateDailyDraftPlayersResult {
  const requiredCards = playerCount * handSize;
  const sourceDeck =
    deck.length >= requiredCards ? deck : shuffleCards([...deck, ...initialDeck]);

  const draftDeck = shuffleCards(sourceDeck);
  const dailyCards = draftDeck.slice(0, requiredCards);
  const nextDeck = draftDeck.slice(requiredCards);
  const names = getDraftPlayerNames();

  return {
    deck: nextDeck,
    draftPlayers: names.map((name, index) => {
      const start = index * handSize;

      return {
        name,
        pool: dailyCards.slice(start, start + handSize),
        picked: [],
      };
    }),
  };
}
