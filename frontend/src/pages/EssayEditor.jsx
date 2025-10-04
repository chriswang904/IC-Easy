import React, { useState } from "react";
import {
  ArrowLeft,
  Save,
  Download,
  Menu,
  Edit,
  Home,
  FileText,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $getRoot } from "lexical";
import Sidebar from "../components/Sidebar";

function EssayEditor() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("Untitled Essay");
  const [content, setContent] = useState("");

  const navigationItems = [
    { icon: Home, label: "Home" },
    { icon: FileText, label: "Notes" },
    { icon: Settings, label: "Settings" },
    { icon: HelpCircle, label: "Help" },
  ];

  const initialConfig = {
    namespace: "EssayEditor",
    theme: {
      paragraph: "mb-2",
      heading: {
        h1: "text-3xl font-bold mb-4",
        h2: "text-2xl font-bold mb-3",
        h3: "text-xl font-bold mb-2",
      },
      list: {
        ul: "list-disc ml-5 mb-2",
        ol: "list-decimal ml-5 mb-2",
      },
    },
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
    onError: (error) => {
      console.error(error);
    },
  };

  const handleSave = () => {
    console.log("Saving essay:", { title, content });
    alert("Essay saved!");
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/html" });
    element.href = URL.createObjectURL(file);
    element.download = `${title}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const onChange = (editorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const textContent = root.getTextContent();
      setContent(textContent);
    });
  };

  return (
    <main className="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen overflow-hidden border-8 border-purple-200">
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar Navigation */}
        <Sidebar />
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/")}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <ArrowLeft size={20} />
                </button>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xl font-semibold border-none outline-none focus:ring-0 bg-transparent"
                  placeholder="Untitled Essay"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                >
                  <Save size={18} />
                  Save
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
                >
                  <Download size={18} />
                  Download
                </button>
              </div>
            </div>
          </header>

          {/* Editor */}
          <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 min-h-[600px]">
              <LexicalComposer initialConfig={initialConfig}>
                <div className="relative">
                  <RichTextPlugin
                    contentEditable={
                      <ContentEditable
                        className="outline-none min-h-[500px] text-gray-900"
                        style={{ caretColor: "#9333EA" }}
                      />
                    }
                    placeholder={
                      <div className="absolute top-0 left-0 text-gray-400 pointer-events-none">
                        Start writing your essay...
                      </div>
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                  />
                  <HistoryPlugin />
                  <OnChangePlugin onChange={onChange} />
                </div>
              </LexicalComposer>
            </div>
          </main>
        </div>
      </div>
    </main>
  );
}

export default EssayEditor;
