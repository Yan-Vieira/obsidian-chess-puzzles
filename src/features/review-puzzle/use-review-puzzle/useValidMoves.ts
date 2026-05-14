import { Chess, Move } from "chess.js"
import { useMemo } from "react"
import type { Dests, Key } from "chessground/types"

export default function useValidMoves(chessInstance:Chess, positionKey:string) {

    const validMoves = useMemo(
        () => getValidMoves(chessInstance),
        [chessInstance, positionKey]
    )

    return validMoves
}

const getValidMoves = (chessInstance:Chess):Dests => {

    const moves:Move[] = chessInstance.moves({ verbose: true })

    const parsedMoves:Dests = new Map()

    for (const move of moves) {
        const from = move.from as Key
        const to = move.to as Key
        const destinations = parsedMoves.get(from) ?? []

        destinations.push(to)
        parsedMoves.set(from, destinations)
    }

    return parsedMoves
}
