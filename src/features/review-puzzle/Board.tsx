import Chessground from "@react-chess/chessground"
import formatPuzzlePath from "./utils/formatPuzzlePath"
import type { Dests, Color } from "chessground/types"

export interface BoardProps {
    currentPuzzle?: ChessPuzzle,
    currentFen: string,
    boardResetVersion: number,
    validMoves: Dests,
    currentColor: Color,
    currentCheck?: Color,
    onMove: (from: string, to: string) => void
}

export default function Board({
    currentPuzzle,
    currentFen,
    boardResetVersion,
    validMoves,
    currentColor,
    currentCheck,
    onMove
}:BoardProps) {

    return (
        <>
        <em>{formatPuzzlePath(currentPuzzle)}</em>
        <Chessground
            key={boardResetVersion}
            width={400}
            height={400}
            config={{
                turnColor: currentColor,
                fen: currentFen,
                check: currentCheck,
                movable: {
                    free: false,
                    dests: validMoves
                },
                events: {
                    move: onMove
                }
            }}
        />
        </>
    )
}