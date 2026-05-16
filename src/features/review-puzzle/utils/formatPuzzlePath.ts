export default function formatPuzzlePath (puzzle?:ChessPuzzle) {

    if (!puzzle) return ""

    const end = puzzle.filePath.lastIndexOf(".")
    const pathWithoutExtension = end === -1
        ? puzzle.filePath
        : puzzle.filePath.slice(0, end)

    return pathWithoutExtension.replace(/\//g, " > ")
}
