export interface ListItemProps {
    deck:PuzzleDeck
    onClick: (deck:PuzzleDeck) => void
}

export default function ListItem({ deck, onClick }:ListItemProps) {

    return (
        <li
            style={{
                listStyle: "none",
                padding: "10px"
            }}
        >
            <p>{deck.name || ""}</p>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}
            >
                <p>Total: {deck.puzzles.length}</p>
                <button
                    style={{
                        color: "white",
                        backgroundColor: "var(--color-accent)",
                        cursor: "pointer"
                    }}
                    onClick={() => onClick(deck)}
                >
                    Review
                </button>
            </div>
        </li>
    )
}
