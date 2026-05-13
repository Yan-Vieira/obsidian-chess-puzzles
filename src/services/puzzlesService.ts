import { App, getAllTags, TFile } from "obsidian";

export class PuzzlesManager {

    app:App

    constructor(app:App) {

        this.app = app
    }

    public async getDecks() {

        const decks:PuzzleDeck[] = []

        const markdownFiles = this.app.vault.getMarkdownFiles()

        for (const file of markdownFiles) {

            const cache = this.app.metadataCache.getFileCache(file)

            if (!cache) continue

            const tags = getAllTags(cache)

            if (!tags || !tags.some(tag => tag === "#chess-puzzles")) continue

           const content = await this.app.vault.read(file)
           
           const puzzles = this.extractChessPuzzleBlocks(file, content)

           decks.push({
            name: file.basename,
            filePath: file.path,
            puzzles
           })
        }

        return decks
    }

    private extractChessPuzzleBlocks(file: TFile, content: string) {

        const puzzles: ChessPuzzle[] = []
        const lines = content.split("\n")

        let isInsideChessPuzzleBlock = false;
        let blockStartLine = 0;
        let blockContent: string[] = [];

        let i = 0
        for (const line of lines) {

            const trimmed = line.trim()

            if (!isInsideChessPuzzleBlock && trimmed === "```chess-puzzle") {

                isInsideChessPuzzleBlock = true;
                blockStartLine = i;
                blockContent = [];

                i++

                continue;
            }

            if (isInsideChessPuzzleBlock && line === "```") {
        
                const parsed = this.parseChessPuzzleBlock(blockContent.join("\n"));

                if (parsed) {

                    puzzles.push({
                        blockStartLine,
                        blockEndLine: i,
                        ...parsed
                    });
                }

                isInsideChessPuzzleBlock = false;
                continue;
            }

            if (isInsideChessPuzzleBlock) {

                blockContent.push(line);
            }
        }

        return puzzles
    }

    private parseChessPuzzleBlock(content: string): Partial<ChessPuzzle> | null {

        const data: Record<string, string> = {};

        for (const line of content.split("\n")) {

            const trimmed = line.trim();

            if (!trimmed || trimmed.startsWith("#")) continue;

            const separatorIndex = trimmed.indexOf(":");

            if (separatorIndex === -1) continue;

            const key = trimmed.slice(0, separatorIndex).trim();
            const value = trimmed.slice(separatorIndex + 1).trim();

            data[key] = value;
        }

        return {
            name: data.name,
            fen: data.fen,
            answer: data.answer,
            lastReview: data.lastReview,
            nextReview: data.nextReview,
            ease: data.ease ? Number(data.ease) : undefined,
            interval: data.interval ? Number(data.interval) : undefined,
        };
    }
}

