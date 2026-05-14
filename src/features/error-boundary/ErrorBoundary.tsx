import { Notice } from "obsidian";
import React, { ReactNode } from "react";

export interface ErrorBoundaryProps {
    children: ReactNode
}

export interface ErrorBoundaryState {
    error?: Error
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {

    state:ErrorBoundaryState = {}

    static getDerivedStateFromError(error:Error): ErrorBoundaryState {

        return { error }
    }

    componentDidCatch(error: Error): void {

        console.error("Chess puzzles error: ", error)
        
        new Notice("Chess puzzles error: " + error.message, 5000)
    }

    render(): ReactNode {
        
        if (this.state.error) {

            return <p>Could not load this screen</p>
        }

        return this.props.children
    }
}