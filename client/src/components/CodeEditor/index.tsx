"use client"
import type React from "react"
import Editor from "@monaco-editor/react"

interface CodeEditorProps {
    value: string
    onChange: (value: string) => void
    language: string
    theme: string
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, language, theme }) => {
    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            onChange(value)
        }
    }

    return (
        <Editor
            height="100%"
            defaultLanguage={language}
            language={language}
            value={value}
            theme={theme === "dark" ? "vs-dark" : "vs-light"}
            onChange={handleEditorChange}
            options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                tabSize: 2,
                automaticLayout: true,
                wordWrap: "on",
                lineNumbers: "on",
                glyphMargin: false,
                folding: true,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3,
            }}
        />
    )
}

export default CodeEditor

