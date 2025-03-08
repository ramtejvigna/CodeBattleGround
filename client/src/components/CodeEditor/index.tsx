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
        <div className="lg:col-span-3 space-y-6">
            {/* Editor Panel */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <Editor
                    height="50vh"
                    defaultLanguage={language}
                    language={language}
                    value={value}
                    onChange={handleEditorChange}
                    theme={theme}
                    options={{
                        minimap: { enabled: true },
                        fontSize: 14,
                        wordWrap: 'on',
                        lineNumbers: 'on',
                        automaticLayout: true,
                        cursorBlinking: 'smooth',
                        smoothScrolling: true,
                    }}
                />
            </div>
        </div>
    )
}

export default CodeEditor

