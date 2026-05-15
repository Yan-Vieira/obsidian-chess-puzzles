import Chessground from "@react-chess/chessground"
import useReviewPuzzle from "./use-review-puzzle"
import formatPuzzlePath from "./utils/formatPuzzlePath"
import Board from "./Board"
import EaseFeedback from "./EaseFeedback"

export interface ReviewPuzzleProps {
    puzzles: ChessPuzzle[],
    updatePuzzle: (puzzle:ChessPuzzle) => Promise<void>
}

export default function ReviewPuzzle({ puzzles, updatePuzzle }:ReviewPuzzleProps) {

    const {
        currentPuzzle,
        currentFen,
        boardResetVersion,
        validMoves,
        currentColor,
        currentCheck,
        isReviewComplete,
        currentPuzzleFinished,
        easeFeedbackHandler,
        onMove,
    } = useReviewPuzzle(puzzles, updatePuzzle)

    return (
        <>
        <main className={"review-puzzle"}>
            {!isReviewComplete && (
                <Board
                    currentPuzzle={currentPuzzle}
                    currentFen={currentFen}
                    boardResetVersion={boardResetVersion}
                    validMoves={validMoves}
                    currentColor={currentColor}
                    currentCheck={currentCheck}
                    onMove={onMove}
                />
            )}
            {currentPuzzleFinished && <EaseFeedback onClick={easeFeedbackHandler}/>}
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
