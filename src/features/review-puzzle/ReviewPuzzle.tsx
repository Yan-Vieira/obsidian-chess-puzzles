import Chessground from "@react-chess/chessground"
import useReviewPuzzle from "./use-review-puzzle"
import formatPuzzlePath from "./utils/formatPuzzlePath"

export interface ReviewPuzzleProps {
    puzzles: ChessPuzzle[]
}

export default function ReviewPuzzle({ puzzles }:ReviewPuzzleProps) {

    const {
        currentPuzzle,
        currentFen,
        boardResetVersion,
        validMoves,
        currentColor,
        currentCheck,
        isReviewComplete,
        onMove,
    } = useReviewPuzzle(puzzles)

    return (
        <>
        <main className={"review-puzzle"}>
            {!isReviewComplete && (
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
            )}
            {isReviewComplete && (
                <>
                <p>Congratulations! You finished the puzzle review.</p>
                <p>Close this window and go rest you brain.</p>
                </>
            )}
        </main>
        <style>
            {`
                main.review-puzzle {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;

                    width: 100%;
                    height: 100%;
                }
            `}
        </style>
        </>
    )
}
