import useReviewPuzzle from "./use-review-puzzle"
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
        playerColor,
        currentCheck,
        isPromotion,
        promotionMoveTo,
        isReviewComplete,
        currentPuzzleFinished,
        easeFeedbackHandler,
        onMove,
        onPromotion,
        cancelPromotion
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
                    playerColor={playerColor}
                    currentCheck={currentCheck}
                    showPromotionMenu={isPromotion}
                    promotionMoveTo={promotionMoveTo}
                    onMove={onMove}
                    onPromotion={onPromotion}
                    onCancelPromotion={cancelPromotion}
                />
            )}
            {currentPuzzleFinished && <EaseFeedback onClick={easeFeedbackHandler}/>}
            {isReviewComplete && (
                <>
                <p>Congratulations! You finished the puzzle review.</p>
                <p>Close this window and rest you brain.</p>
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
