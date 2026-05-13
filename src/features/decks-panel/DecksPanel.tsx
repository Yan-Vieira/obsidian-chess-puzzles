import ListItem from "./ListItem"

export interface DecksPanelProps {
    decks: PuzzleDeck[]
}

export default function DecksPanel ({ decks }:DecksPanelProps) {

    return (
        <ul>
            {decks.map((deck, i) => <ListItem key={i} deck={deck}/>)}
        </ul>
    )
}