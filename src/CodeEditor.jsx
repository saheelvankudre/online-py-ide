import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";

// Default code template for reset
const defaultCode = `print("Hello, world!")`;

const CodeEditor = () => {
  const [code, setCode] = useState(() => localStorage.getItem("code") || defaultCode);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [errorLine, setErrorLine] = useState(null);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("code", code);
  }, [code]);

  const handleRun = async () => {
    try {
      const res = await axios.post("https://python-backend-w6l2.onrender.com/run", {
        code,
        input,
      });

      setOutput(res.data.output);
      setError(res.data.error);
      setErrorLine(res.data.line_number);
    } catch (err) {
      setOutput("");
      setError("Error connecting to server.");
      setErrorLine(null);
    }
  };

  const toggleTheme = () => setIsDarkTheme((prev) => !prev);

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "code.py";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setCode(e.target.result);
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    setCode(defaultCode);
    setOutput("");
    setError("");
    setErrorLine(null);
    localStorage.setItem("code", defaultCode);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>
          <span role="img" aria-label="snake">🐍</span> Online Python IDE
        </h2>
        <button
          onClick={toggleTheme}
          style={{
            padding: "6px 12px",
            backgroundColor: "#333",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {isDarkTheme ? (
            <>
              <span role="img" aria-label="sun">☀️</span> Light Mode
            </>
          ) : (
            <>
              <span role="img" aria-label="moon">🌙</span> Dark Mode
            </>
          )}
        </button>
      </div>

      {/* Code Editor */}
      <div style={{ marginBottom: "10px", border: "1px solid #ccc" }}>
        <CodeMirror
          value={code}
          height="300px"
          extensions={[python()]}
          onChange={(value) => setCode(value)}
          theme={isDarkTheme ? oneDark : "light"}
        />
      </div>

      {/* Input Area */}
      <div>
        <label>Input:</label>
        <textarea
          rows={3}
          style={{ width: "100%", resize: "vertical" }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      {/* Buttons */}
      <div style={{ marginTop: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={handleRun}
          style={{
            padding: "8px 16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Run ▶
        </button>

        <button
          onClick={handleDownload}
          style={{
            padding: "8px 16px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          <span role="img" aria-label="floppy disk">💾</span> Download Code
        </button>

        <button
          onClick={() => fileInputRef.current.click()}
          style={{
            padding: "8px 16px",
            backgroundColor: "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          <span role="img" aria-label="folder">📂</span> Upload File
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".py"
          onChange={handleUpload}
          style={{ display: "none" }}
        />

        <button
          onClick={handleReset}
          style={{
            padding: "8px 16px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          <span role="img" aria-label="recycle">♻️</span> Reset Code
        </button>
      </div>

      {/* Output/Error */}
      <div style={{ marginTop: "20px" }}>
        <h3>Output:</h3>
        <pre style={{ backgroundColor: "#f0f0f0", padding: "10px" }}>{output}</pre>

        {error && (
          <>
            <h3 style={{ color: "red" }}>Error:</h3>
            <pre style={{ color: "red", backgroundColor: "#ffe6e6", padding: "10px" }}>
              {errorLine ? `Line ${errorLine}: ` : ""}
              {error}
            </pre>
          </>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
