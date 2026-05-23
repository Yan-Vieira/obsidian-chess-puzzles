import Chessground from "@react-chess/chessground"
import formatPuzzlePath from "./utils/formatPuzzlePath"
import type { Dests, Color, Key } from "chessground/types"
import PromotionMenu from "./PromotionMenu"
import { PieceSymbol } from "chess.js"
import { useEffect, useRef, useState } from "react"
import getChessgroundStyle from "./ChessgroundStyle"

const DEFAULT_BOARD_SIZE = 400
const CHESSGROUND_SIZE_RATE = 90

export interface BoardProps {
    currentPuzzle?: ChessPuzzle
    currentFen: string
    boardResetVersion: number
    lastMove?: [Key, Key]
    validMoves: Dests
    currentColor: Color
    playerColor: Color
    currentCheck?: Color
    showPromotionMenu: boolean
    promotionMoveTo?: string
    onMove: (from: string, to: string) => void
    onPromotion: (promotion: PieceSymbol) => void
    onCancelPromotion: () => void
}

export default function Board({
    currentPuzzle,
    currentFen,
    boardResetVersion,
    lastMove,
    validMoves,
    currentColor,
    playerColor,
    currentCheck,
    showPromotionMenu,
    promotionMoveTo,
    onMove,
    onPromotion,
    onCancelPromotion
}:BoardProps) {

    const boardRef = useRef<HTMLDivElement>(null)
    const [boardSize, setBoardSize] = useState(DEFAULT_BOARD_SIZE)
    const promotionMenuPosition = getPromotionMenuPosition(promotionMoveTo, playerColor, boardSize)

    useEffect(() => {

        const boardEl = boardRef.current

        if (!boardEl) return

        const updateBoardSize = () => {

            const nextBoardSize = Math.floor(boardEl.getBoundingClientRect().width)

            if (nextBoardSize > 0) setBoardSize(nextBoardSize)
        }

        updateBoardSize()

        const resizeObserver = new ResizeObserver(updateBoardSize)

        resizeObserver.observe(boardEl)

        return () => resizeObserver.disconnect()
    }, [])

    return (
        <>
        <em>{formatPuzzlePath(currentPuzzle)}</em>
        <div ref={boardRef} className="chess-puzzle-board">
            <Chessground
                key={`${boardResetVersion}-${boardSize}`}
                width={boardSize}
                height={boardSize}
                config={{
                    turnColor: currentColor,
                    orientation: playerColor,
                    fen: currentFen,
                    check: currentCheck,
                    lastMove: lastMove,
                    movable: {
                        free: false,
                        dests: validMoves
                    },
                    events: {
                        move: onMove
                    }
                }}
            />
            {showPromotionMenu && promotionMenuPosition && (
                <PromotionMenu
                    position={promotionMenuPosition}
                    color={currentColor}
                    onClick={onPromotion}
                    onCancel={onCancelPromotion}
                />
            )}
        </div>
        <style>
            {`
                .chess-puzzle-board {
                    position: relative;
                    width: ${CHESSGROUND_SIZE_RATE}%;
                    aspect-ratio: 1 / 1;
                    margin: 0 auto;
                }
            `}
            {getChessgroundStyle()}
        </style>
        </>
    )
}

const getPromotionMenuPosition = (
    square: string | undefined,
    orientation: Color,
    boardSize: number
) => {

    if (!square || square.length !== 2) return undefined

    const fileIndex = square.charCodeAt(0) - "a".charCodeAt(0)
    const rank = Number(square.charAt(1))

    if (fileIndex < 0 || fileIndex > 7 || rank < 1 || rank > 8) return undefined

    const visualFileIndex = orientation === "white" ? fileIndex : 7 - fileIndex
    const visualRankIndex = orientation === "white" ? 8 - rank : rank - 1
    const squareSize = boardSize / 8
    const squareLeft = visualFileIndex * squareSize
    const squareTop = visualRankIndex * squareSize
    const horizontalPosition =
        visualFileIndex === 0 ? "left" :
        visualFileIndex === 7 ? "right" :
        "center"
    const verticalPosition =
        visualRankIndex === 0 ? "top" :
        visualRankIndex === 7 ? "bottom" :
        "center"
    const left =
        horizontalPosition === "left" ? squareLeft :
        horizontalPosition === "right" ? squareLeft + squareSize :
        squareLeft + squareSize / 2
    const top =
        verticalPosition === "top" ? squareTop :
        verticalPosition === "bottom" ? squareTop + squareSize :
        squareTop + squareSize / 2
    const translateX =
        horizontalPosition === "left" ? "0" :
        horizontalPosition === "right" ? "-100%" :
        "-50%"
    const translateY =
        verticalPosition === "top" ? "0" :
        verticalPosition === "bottom" ? "-100%" :
        "-50%"

    return {
        left,
        top,
        transform: `translate(${translateX}, ${translateY})`,
    }
}
