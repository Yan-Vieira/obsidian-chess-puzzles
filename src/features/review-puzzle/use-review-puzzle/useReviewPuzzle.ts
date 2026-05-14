import { Chess, Move } from "chess.js"
import { Notice } from "obsidian"
import { useMemo, useReducer, useState } from "react"
import useValidMoves from "./useValidMoves"
import useCurrentColor from "./useCurrentColor"
import useCurrentCheck from "./useCurrentCheck"
import useReviewStateReducer from "./useReviewStateReducer"

export default function useReviewPuzzle(puzzles: ChessPuzzle[]) {

    const { reviewState, updateReviewState } = useReviewStateReducer(puzzles)

    const currentPuzzle = puzzles[reviewState.currentPuzzleIndex]

    const chess =
        useMemo(
            () => currentPuzzle?.fen ? new Chess(currentPuzzle.fen) : new Chess(),
            [currentPuzzle?.fen]
        )
    
    const validMoves = useValidMoves(chess, reviewState.currentFen)
    const currentColor = useCurrentColor(chess, reviewState.currentFen)
    const currentCheck = useCurrentCheck(chess, currentColor, reviewState.currentFen)

    const [isReviewComplete, setIsReviewComplete] = useState(false)

    const onMove = (from:string, to:string) => {

        try {

            if (!isBestLineMove(chess, from, to, currentPuzzle?.bestLine, reviewState.bestLineIndex)) {

                updateReviewState({ type: "reject-move" })

                new Notice("Wrong move")

                return
            }

            chess.move({from, to})

            let nextBestLineIndex = reviewState.bestLineIndex + 1

            if (playOpponentMove(chess, currentPuzzle?.bestLine, nextBestLineIndex)) {
                
                nextBestLineIndex++
            }

            if (isBestLineComplete(currentPuzzle?.bestLine, nextBestLineIndex)) {

                if (!puzzles[reviewState.currentPuzzleIndex + 1]) {

                    setIsReviewComplete(true)

                    return
                }

                updateReviewState({ type: "go-to-next-puzzle" })

                return
            }

            updateReviewState({
                type: "accept-move",
                currentFen: chess.fen(),
                bestLineIndex: nextBestLineIndex
            })

        } catch (error) {

            console.log(error)

            new Notice("Chess puzzles error: invaid move.")
        }
    }

    return {
        currentPuzzle,
        currentFen: reviewState.currentFen,
        boardResetVersion: reviewState.boardResetVersion,
        validMoves,
        currentColor,
        currentCheck,
        isReviewComplete,
        onMove
    }
}

const isBestLineComplete = (
    bestLine: string[] | undefined,
    bestLineIndex: number
) => Boolean(bestLine?.length && bestLineIndex >= bestLine.length)

const isBestLineMove = (
    chessInstance: Chess,
    from: string,
    to: string,
    bestLine: string[] | undefined,
    bestLineIndex: number
) => {

    const expectedMove = bestLine?.[bestLineIndex]

    if (!expectedMove) return true
    if (bestLineIndex % 2 !== 0) return false

    const move = getCandidateMove(chessInstance, from, to)

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

    if (!opponentMove || bestLineIndex % 2 === 0) return false

    const move = findMove(chessInstance, opponentMove)

    if (!move) return false

    chessInstance.move(move)

    return true
}

const getCandidateMove = (chessInstance: Chess, from: string, to: string): Move | null => {

    const candidate = new Chess(chessInstance.fen())

    try {

        return candidate.move({ from, to })

    } catch {

        return null
    }
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
    .replace(/[-x]/g, "")
    .toLowerCase()
