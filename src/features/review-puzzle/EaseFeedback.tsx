export interface EaseFeedbackProps {
    onClick: (value: ReviewResult) => void
}

export default function EaseFeedback({ onClick }:EaseFeedbackProps) {

    return (
        <div style={{display: "flex", flexDirection: "row", justifyContent: "center", gap: "10px"}}>
            <button
                style={{backgroundColor: "white"}}
                onClick={() => onClick("again")}
            >
                Again
            </button>
            <button
                style={{color: "white", backgroundColor: "red"}}
                onClick={() => onClick("again")}
            >
                Hard
            </button>
            <button
                style={{color: "white", backgroundColor: "blue"}}
                onClick={() => onClick("good")}
            >
                Good
            </button>
            <button
                style={{color: "white", backgroundColor: "green"}}
                onClick={() => onClick("easy")}
            >
                Easy
            </button>
        </div>
    )
}