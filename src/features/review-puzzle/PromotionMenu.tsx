import { PieceSymbol } from "chess.js"
import type { Color } from "chessground/types"
import { useEffect, useRef } from "react"

const PIECE_SYMBOLS: Record<Color, Record<PieceSymbol, string>> = {
    white: {
        p: String.fromCharCode(9817),
        n: String.fromCharCode(9816),
        b: String.fromCharCode(9815),
        r: String.fromCharCode(9814),
        q: String.fromCharCode(9813),
        k: String.fromCharCode(9812),
    },
    black: {
        p: String.fromCharCode(9823),
        n: String.fromCharCode(9822),
        b: String.fromCharCode(9821),
        r: String.fromCharCode(9820),
        q: String.fromCharCode(9819),
        k: String.fromCharCode(9818),
    },
}

export interface PromotionMenuProps {
    position: {
        left: number
        top: number
        transform: string
    }
    color: Color
    onClick: (promotion:PieceSymbol) => void
    onCancel: () => void
}

export default function PromotionMenu({ position, color, onClick, onCancel }:PromotionMenuProps) {

    const pieces = PIECE_SYMBOLS[color]
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {

        const onPointerDown = (event: PointerEvent) => {

            if (menuRef.current?.contains(event.target as Node)) return

            onCancel()
        }

        document.addEventListener("pointerdown", onPointerDown)

        return () => document.removeEventListener("pointerdown", onPointerDown)
    }, [onCancel])

    return (
        <div
            ref={menuRef}
            className="chess-puzzle-promotion-menu"
            style={{
                left: `${position.left}px`,
                top: `${position.top}px`,
                transform: position.transform,
            }}
        >
            <button aria-label="Promote to queen" onClick={() => onClick("q")}>{pieces.q}</button>
            <button aria-label="Promote to knight" onClick={() => onClick("n")}>{pieces.n}</button>
            <button aria-label="Promote to rook" onClick={() => onClick("r")}>{pieces.r}</button>
            <button aria-label="Promote to bishop" onClick={() => onClick("b")}>{pieces.b}</button>
            <style>
                {`
                    .chess-puzzle-promotion-menu {
                        position: absolute;
                        z-index: 20;
                        display: grid;
                        grid-template-columns: repeat(2, 34px);
                        gap: 4px;
                        padding: 5px;
                        border: 1px solid var(--background-modifier-border);
                        border-radius: 8px;
                        background: var(--background-primary);
                        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
                    }

                    .chess-puzzle-promotion-menu button {
                        width: 34px;
                        height: 34px;
                        padding: 0;
                        font-size: 1.5rem;
                        font-weight: 700;
                        line-height: 1;
                        cursor: pointer;
                    }
                `}
            </style>
        </div>
    )
}
