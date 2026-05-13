export interface ListItemProps {
    deck:PuzzleDeck
}

export default function ListItem({ deck }:ListItemProps) {

    return (
        <li>
            <p>{deck.name || ""}</p>
            <p>Total: {deck.puzzles.length}</p>
        </li>
    )
}