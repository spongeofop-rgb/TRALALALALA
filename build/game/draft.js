export function getDraftPlayerNames() {
    return ["Cường", "An", "Minh", "Khánh"];
}
export function getActiveDraftPlayerIndex() {
    return 1; // An
}
export function getCurrentDraftPlayer(draftPlayers, activeIndex = getActiveDraftPlayerIndex()) {
    return draftPlayers[activeIndex];
}
export function pickRandomCard(cards) {
    if (cards.length === 0)
        return null;
    const randomIndex = Math.floor(Math.random() * cards.length);
    return cards[randomIndex];
}
export function rotateDraftPoolsClockwise(draftPlayers) {
    const oldPools = draftPlayers.map((player) => [...player.pool]);
    return draftPlayers.map((player, index) => {
        const sourceIndex = (index - 1 + draftPlayers.length) % draftPlayers.length;
        return Object.assign(Object.assign({}, player), { pool: oldPools[sourceIndex] });
    });
}
export function createDailyDraftPlayers({ deck, initialDeck, handSize, playerCount, shuffleCards, }) {
    const requiredCards = playerCount * handSize;
    const sourceDeck = deck.length >= requiredCards ? deck : shuffleCards([...deck, ...initialDeck]);
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
