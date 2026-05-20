import { Chess, Move, PieceSymbol, Square } from "chess.js"
import { Notice } from "obsidian"
import { useMemo, useState } from "react"
import type { Key } from "chessground/types"
import useValidMoves from "./useValidMoves"
import useCurrentColor from "./useCurrentColor"
import useCurrentCheck from "./useCurrentCheck"
import useReviewStateReducer from "./useReviewStateReducer"
import { PuzzlesService } from "services/PuzzlesService"
import toChessgroundColor from "./toChessgroundColor"

export default function useReviewPuzzle(
    puzzles: ChessPuzzle[], updatePuzzle: (puzzle:ChessPuzzle) => Promise<void>) {

    const { reviewState, updateReviewState } = useReviewStateReducer(puzzles)

    const currentPuzzle = puzzles[reviewState.currentPuzzleIndex]

    const chess =
        useMemo(
            () => currentPuzzle?.fen ? new Chess(currentPuzzle.fen) : new Chess(),
            [currentPuzzle?.fen]
        )

    const validMoves = useValidMoves(chess, reviewState.currentFen)
    const currentColor = useCurrentColor(chess, reviewState.currentFen)
    const playerColor = useMemo(
        () => toChessgroundColor(currentPuzzle?.fen ? new Chess(currentPuzzle.fen).turn() : new Chess().turn()),
        [currentPuzzle?.fen]
    )
    const currentCheck = useCurrentCheck(chess, currentColor, reviewState.currentFen)

    const [isReviewComplete, setIsReviewComplete] = useState(false)
    const [currentPuzzleFinished, setCurrentPuzzleFinished] = useState(false)

    const onMove = (from:string, to:string) => {

        try {

            const piece = chess.get(from as Square)

            if (
                !reviewState.isPromotion
                && piece
                && isPromotion(piece.type, to, currentColor)
            ) {

                if (!isBestLinePromotionDestination(chess, from, to, currentPuzzle?.bestLine, reviewState.bestLineIndex)) {

                    updateReviewState({ type: "reject-move" })

                    new Notice("Wrong move")

                    return
                }

                updateReviewState({
                    type: "begin-promotion",
                    promotionMoveFrom: from,
                    promotionMoveTo: to
                })

                return
            }

            if (!isBestLineMove(chess, from, to, undefined, currentPuzzle?.bestLine, reviewState.bestLineIndex)) {

                updateReviewState({ type: "reject-move" })

                new Notice("Wrong move")

                return
            }

            chess.move({ from, to })

            acceptPlayerMove(chess, [from as Key, to as Key])

        } catch (error) {

            console.log(error)

            new Notice("Chess puzzles error: invaid move.")
        }
    }

    const onPromotion = (promotion: PieceSymbol) => {

        try {

            if (!reviewState.promotionMoveFrom || !reviewState.promotionMoveTo)
                throw new Error("Either reviewState.promotionMoveFrom or reviewState.promotionMoveTo is undefined")

            if (
                !isBestLineMove(
                    chess,
                    reviewState.promotionMoveFrom,
                    reviewState.promotionMoveTo,
                    promotion,
                    currentPuzzle?.bestLine,
                    reviewState.bestLineIndex
                )
            ) {

                updateReviewState({ type: "reject-move" })

                new Notice("Wrong promotion")

                return
            }

            chess.move({
                from: reviewState.promotionMoveFrom,
                to: reviewState.promotionMoveTo,
                promotion
            })

            acceptPlayerMove(
                chess,
                [reviewState.promotionMoveFrom as Key, reviewState.promotionMoveTo as Key],
                true
            )

        } catch (error) {

            console.log(error)

            new Notice("Chess puzzles error: invaid promotion.")
        }
    }

    const cancelPromotion = () => {

        updateReviewState({ type: "cancel-promotion" })
    }

    const acceptPlayerMove = (
        chessInstance: Chess,
        playerMove: [Key, Key],
        isPromotionMove = false
    ) => {

        let nextBestLineIndex = reviewState.bestLineIndex + 1
        let lastMove = playerMove

        const opponentMove = playOpponentMove(chessInstance, currentPuzzle?.bestLine, nextBestLineIndex)

        if (opponentMove) {

            nextBestLineIndex++
            lastMove = [opponentMove.from as Key, opponentMove.to as Key]
        }

        const actionType = isPromotionMove ? "end-promotion" : "accept-move"

        if (isBestLineComplete(currentPuzzle?.bestLine, nextBestLineIndex)) {

            setCurrentPuzzleFinished(true)

            updateReviewState({
                type: actionType,
                currentFen: chessInstance.fen(),
                bestLineIndex: nextBestLineIndex,
                lastMove
            })

            return
        }

        updateReviewState({
            type: actionType,
            currentFen: chessInstance.fen(),
            bestLineIndex: nextBestLineIndex,
            lastMove
        })
    }

    const easeFeedbackHandler = async (value:ReviewResult) => {

        if (!currentPuzzle) return;

        try {

            if (!PuzzlesService.wasReviewedToday(currentPuzzle.lastReview)) {

                const { lastReview, nextReview, interval, ease } =
                    PuzzlesService.calculateNextReview(
                        value, currentPuzzle.interval, currentPuzzle.ease)

                currentPuzzle.lastReview = lastReview
                currentPuzzle.nextReview = nextReview
                currentPuzzle.interval = interval
                currentPuzzle.ease = ease

                await updatePuzzle(currentPuzzle)
            }

            setCurrentPuzzleFinished(false)

            if (!puzzles[reviewState.currentPuzzleIndex + 1]) {

                setIsReviewComplete(true)

                return;
            }

            updateReviewState({ type: "go-to-next-puzzle" })

        } catch (error) {

            console.log("Chess puzzles error: ", error)

            new Notice("Chess puzzles error: could not update review fields.")
        }
    }

    return {
        currentPuzzle,
        currentFen: reviewState.currentFen,
        boardResetVersion: reviewState.boardResetVersion,
        lastMove: reviewState.lastMove,
        validMoves,
        currentColor,
        playerColor,
        currentCheck,
        currentPuzzleFinished,
        isPromotion: reviewState.isPromotion,
        promotionMoveTo: reviewState.promotionMoveTo,
        isReviewComplete,
        setCurrentPuzzleFinished,
        easeFeedbackHandler,
        onMove,
        onPromotion,
        cancelPromotion
    }
}


const isPromotion = (piece: PieceSymbol, square:string, currentColor:"white"|"black") => {

    if (piece !== "p") return false

    if (currentColor === "white" && square.charAt(1) === "8") return true

    if (currentColor === "black" && square.charAt(1) === "1") return true

    return false
}

const isBestLineComplete = (
    bestLine: string[] | undefined,
    bestLineIndex: number
) => Boolean(bestLine?.length && bestLineIndex >= bestLine.length)

const isBestLineMove = (
    chessInstance: Chess,
    from: string,
    to: string,
    promotion: PieceSymbol | undefined,
    bestLine: string[] | undefined,
    bestLineIndex: number
) => {

    const expectedMove = bestLine?.[bestLineIndex]

    if (!expectedMove) return true
    if (bestLineIndex % 2 !== 0) return false

    const move = getCandidateMove(chessInstance, from, to, promotion)

    if (!move) return false

    const acceptedMoves = [
        `${move.from}${move.to}${move.promotion ?? ""}`,
        move.san,
    ].map(normalizeMoveText)

    return acceptedMoves.includes(normalizeMoveText(expectedMove))
}

const playOpponentMove = (
    chessInstance: Chess,
    bestLine: string[] | undefined,
    bestLineIndex: number
) => {

    const opponentMove = bestLine?.[bestLineIndex]

    if (!opponentMove || bestLineIndex % 2 === 0) return null

    const move = findMove(chessInstance, opponentMove)

    if (!move) return null

    chessInstance.move(move)

    return move
}

const getCandidateMove = (
    chessInstance: Chess,
    from: string,
    to: string,
    promotion?: PieceSymbol
): Move | null => {

    const candidate = new Chess(chessInstance.fen())

    try {

        return candidate.move({ from, to, promotion })

    } catch {

        return null
    }
}

const isBestLinePromotionDestination = (
    chessInstance: Chess,
    from: string,
    to: string,
    bestLine: string[] | undefined,
    bestLineIndex: number
) => {

    const expectedMove = bestLine?.[bestLineIndex]

    if (!expectedMove) return true

    return ["q", "n", "r", "b"].some((promotion) =>
        isBestLineMove(chessInstance, from, to, promotion as PieceSymbol, bestLine, bestLineIndex)
    )
}

const findMove = (chessInstance: Chess, expectedMove: string): Move | null => {

    const normalizedExpectedMove = normalizeMoveText(expectedMove)

    return chessInstance.moves({ verbose: true }).find((move) => {

        const acceptedMoves = [
            `${move.from}${move.to}${move.promotion ?? ""}`,
            move.san,
        ].map(normalizeMoveText)

        return acceptedMoves.includes(normalizedExpectedMove)
    }) ?? null
}

const normalizeMoveText = (move: string) => move
    .trim()
    .replace(/\s+/g, "")
    .replace(/[=+#-]/g, "")
    .replace(/x/g, "")
    .toLowerCase()
