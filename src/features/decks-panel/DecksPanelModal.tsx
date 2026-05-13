import { App, Modal } from "obsidian"
import { createRoot, Root } from "react-dom/client"
import ModalComponent from "./DecksPanel"
import { PuzzlesManager } from "services/puzzlesService"

export default class DecksPanelModal extends Modal {

    root?:Root

    puzzlesManager:PuzzlesManager

    constructor(app:App) {

        super(app)

        this.puzzlesManager = new PuzzlesManager(app)
    }

    async onOpen() {

        const decks = await this.puzzlesManager.getDecks()

        this.root = createRoot(this.contentEl)

        this.root.render(<ModalComponent decks={decks}/>)
    }

    onClose(): void {
        
        this.root?.unmount()
    }
}