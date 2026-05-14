export default function formatPuzzlePath (puzzle?:ChessPuzzle) {

    if (!puzzle) return ""

    const end = puzzle.filePath.indexOf(".")

    return puzzle.filePath.slice(0, end).replace("/", " > ")
}