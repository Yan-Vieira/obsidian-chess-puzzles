import ListItem from "./ListItem"

export interface DecksPanelProps {
    decks: PuzzleDeck[]
    onItemClick: (deck:PuzzleDeck) => void
}

export default function DecksPanel ({ decks, onItemClick }:DecksPanelProps) {

    return (
        <>
        <ul style={{padding: "10px"}}>
            {decks.map((deck, i) => <ListItem key={i} deck={deck} onClick={onItemClick}/>)}
        </ul>
        </>
    )
}