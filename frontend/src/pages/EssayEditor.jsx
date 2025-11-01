// pages/PolishPage.jsx

import React, { useState, useEffect, useRef } from "react";
import {
  RefreshCw,
  Loader,
  AlertCircle,
  CheckCheck,
  X,
  Wand2,
  Type,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Table,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Minus,
  Quote,
  Sparkles,
  MessageSquare,
  Lightbulb,
  FileText,
  ListChecks,
  Brain,
  Zap,
  FileCheck,
  Search,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Download,
  Upload,
  Cloud,
  CloudUpload,
  Save,
  FolderOpen,
  LogIn,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { checkAIOnly } from "../api";
import { getStoredUser } from "../api/auth";

export default function EssayEditor() {
  const [inputText, setInputText] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState(null);
  const [error, setError] = useState(null);

  // AI Panel state
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [activeTab, setActiveTab] = useState("grammar");

  // Rephrase state
  const [tone, setTone] = useState("as-is");
  const [length, setLength] = useState("as-is");
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [rephrasedResult, setRephrasedResult] = useState("");

  const [aiAssistantMode, setAiAssistantMode] = useState("research");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [promptSession, setPromptSession] = useState(null);

  // Table modal state
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // Dynamic checking state
  const [isChecking, setIsChecking] = useState(false);
  const checkTimeoutRef = useRef(null);

  // Interactive corrections state
  const [corrections, setCorrections] = useState([]);
  const editorRef = useRef(null);
  const isUpdatingRef = useRef(false);

  // NEW: Google Docs integration state
  const [showGoogleDocsModal, setShowGoogleDocsModal] = useState(false);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [gapiReady, setGapiReady] = useState(false);
  const [googleDocs, setGoogleDocs] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentGoogleDocId, setCurrentGoogleDocId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Initialize Google API client
  useEffect(() => {
    const initGapi = async () => {
      console.log("[Google Docs] Starting GAPI initialization...");

      try {
        // Check if gapi.client is already initialized
        if (window.gapi?.client?.docs && window.gapi?.client?.drive) {
          console.log(
            "[Google Docs] ✓ GAPI already initialized from another component!"
          );
          setGapiReady(true);
          setError(null);
          return;
        }

        // Load client library
        await new Promise((resolve, reject) => {
          window.gapi.load("client", {
            callback: resolve,
            onerror: reject,
          });
        });

        console.log("[Google Docs] Client library loaded");

        // Initialize WITHOUT API key (we're using OAuth tokens)
        console.log("[Google Docs] Initializing GAPI client for OAuth...");
        await window.gapi.client.init({
          // No apiKey needed - we'll use the OAuth access token
        });
        console.log("[Google Docs] GAPI client initialized for OAuth");

        // Load APIs
        if (!window.gapi.client.docs) {
          console.log("[Google Docs] Loading Docs API...");
          await window.gapi.client.load(
            "https://docs.googleapis.com/$discovery/rest?version=v1"
          );
          console.log("[Google Docs] Docs API loaded");
        }

        if (!window.gapi.client.drive) {
          console.log("[Google Docs] Loading Drive API...");
          await window.gapi.client.load(
            "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
          );
          console.log("[Google Docs] Drive API loaded");
        }

        // Final verification
        const docsLoaded = !!window.gapi.client.docs;
        const driveLoaded = !!window.gapi.client.drive;

        console.log(
          "[Google Docs] Final check - Docs API:",
          docsLoaded,
          "Drive API:",
          driveLoaded
        );

        if (docsLoaded && driveLoaded) {
          console.log("[Google Docs] ✓ All APIs ready!");
          setGapiReady(true);
          setError(null);
        } else {
          console.error("[Google Docs] APIs not properly loaded");
          setError("Some Google APIs failed to load. Please refresh the page.");
        }
      } catch (error) {
        console.error("[Google Docs] GAPI init error:", error);
        console.error("[Google Docs] Error details:", {
          message: error.message,
          stack: error.stack,
        });

        setError(
          `API initialization failed: ${error.message}. Check browser console for details.`
        );
      }
    };

    // Check if gapi script already exists and is loaded
    const existingScript = document.querySelector(
      'script[src="https://apis.google.com/js/api.js"]'
    );

    if (existingScript && window.gapi) {
      console.log("[Google Docs] GAPI script already loaded, initializing...");
      initGapi();
      return;
    }

    if (existingScript && !window.gapi) {
      console.log(
        "[Google Docs] GAPI script exists but not loaded yet, waiting..."
      );
      existingScript.onload = initGapi;
      return;
    }

    // Load the gapi script
    console.log("[Google Docs] Loading GAPI script...");
    const gapiScript = document.createElement("script");
    gapiScript.src = "https://apis.google.com/js/api.js";
    gapiScript.async = true;
    gapiScript.defer = true;
    gapiScript.onload = () => {
      console.log("[Google Docs] GAPI script loaded successfully");
      initGapi();
    };
    gapiScript.onerror = (e) => {
      console.error("[Google Docs] Failed to load GAPI script:", e);
      setError(
        "Failed to load Google API script. Please check your internet connection and refresh."
      );
    };

    document.body.appendChild(gapiScript);

    return () => {
      // Don't remove the script on unmount
    };
  }, []);

  // Check for Google user
  useEffect(() => {
    const user = getStoredUser();
    if (user?.google_access_token) {
      setAccessToken(user.google_access_token);
      setIsGoogleSignedIn(true);
    }
  }, []);

  // Load Google Docs when signed in
  useEffect(() => {
    if (accessToken && gapiReady && window.gapi?.client) {
      console.log("[Google Docs] Setting up token and loading docs...");
      window.gapi.client.setToken({ access_token: accessToken });
      loadGoogleDocs();
    }
  }, [accessToken, gapiReady]);

  // Initialize Prompt API session
  // Initialize Prompt API session
  useEffect(() => {
    const initPromptAPI = async () => {
      if ("LanguageModel" in window) {
        try {
          const availability = await window.LanguageModel.availability();
          console.log("[Prompt API] Availability:", availability);

          if (availability === "readily") {
            // Model is ready to use
            console.log("[Prompt API] Model is ready");
          }
        } catch (err) {
          console.error("[Prompt API] Initialization error:", err);
        }
      }
    };

    initPromptAPI();
  }, []);
  // Load Google Docs list
  const loadGoogleDocs = async () => {
    if (!gapiReady || !window.gapi?.client?.drive) {
      console.log("[Google Docs] GAPI not ready yet");
      return;
    }

    if (!accessToken) {
      console.log("[Google Docs] No access token available");
      return;
    }

    try {
      // Ensure token is set
      window.gapi.client.setToken({ access_token: accessToken });

      console.log("[Google Docs] Loading documents...");
      const response = await window.gapi.client.drive.files.list({
        pageSize: 10,
        fields: "files(id, name, modifiedTime, webViewLink)",
        q: "mimeType='application/vnd.google-apps.document' and trashed=false",
        orderBy: "modifiedTime desc",
      });
      setGoogleDocs(response.result.files || []);
      setError(null);
      console.log(
        "[Google Docs] Loaded",
        response.result.files?.length || 0,
        "documents"
      );
    } catch (error) {
      console.error("[Google Docs] Error loading docs:", error);
      if (error.status === 401) {
        setError("Your Google session has expired. Please sign in again.");
        setIsGoogleSignedIn(false);
        setAccessToken(null);
      } else {
        setError("Failed to load Google Docs. Please try again.");
      }
    }
  };

  // Handle Google Sign-in
  const handleGoogleSignIn = async () => {
    try {
      localStorage.setItem("redirect_after_login", window.location.pathname);
      const response = await fetch(
        "https://ic-easy-backend.onrender.com/api/auth/google/login"
      );
      const data = await response.json();
      if (data.auth_url) {
        window.location.href = data.auth_url;
      }
    } catch (error) {
      console.error("[Google Docs] Login error:", error);
      setError("Failed to start Google login");
    }
  };

  // Upload current document to Google Docs
  const uploadToGoogleDocs = async () => {
    if (!isGoogleSignedIn) {
      setError("Please sign in with Google first");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!inputText.trim()) {
      setError("Please write some content before uploading");
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Check if GAPI is ready
    if (!gapiReady || !window.gapi?.client?.docs) {
      setError("Google API not ready. Please wait a moment and try again.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Check if token is set
    if (!accessToken) {
      setError("Google authentication token not found. Please sign in again.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const title = prompt("Enter document title:", "Polished Document");
    if (!title) return;

    setIsUploading(true);
    setError(null);

    try {
      console.log("[Upload] Starting upload process...");

      // Ensure token is set
      window.gapi.client.setToken({ access_token: accessToken });

      // Get plain text content
      const plainText = editorRef.current
        ? editorRef.current.textContent
        : inputText;

      console.log("[Upload] Creating document with title:", title);

      // Create new Google Doc
      const createResponse = await window.gapi.client.docs.documents.create({
        title: title,
      });

      if (!createResponse?.result?.documentId) {
        throw new Error("Failed to create document - no document ID returned");
      }

      const docId = createResponse.result.documentId;
      console.log("[Upload] Document created with ID:", docId);

      // Insert content into the document
      console.log("[Upload] Inserting content...");
      await window.gapi.client.docs.documents.batchUpdate({
        documentId: docId,
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: plainText,
            },
          },
        ],
      });

      console.log("[Upload] Content inserted successfully");
      setCurrentGoogleDocId(docId);
      await loadGoogleDocs();

      setIsUploading(false);
      setShowGoogleDocsModal(false);

      alert(`Document "${title}" uploaded successfully to Google Docs!`);

      // Ask if user wants to open it
      const openNow = window.confirm(
        "Would you like to open the document in Google Docs?"
      );
      if (openNow) {
        window.open(
          `https://docs.google.com/document/d/${docId}/edit`,
          "_blank"
        );
      }
    } catch (error) {
      console.error("[Upload Error]:", error);
      console.error("[Upload Error Details]:", {
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        result: error.result,
      });

      let errorMessage = "Failed to upload to Google Docs";

      if (error.status === 401) {
        errorMessage = "Authentication expired. Please sign in again.";
        setIsGoogleSignedIn(false);
        setAccessToken(null);
      } else if (error.status === 403) {
        errorMessage =
          "Permission denied. Please check your Google account permissions.";
      } else if (error.status === 404) {
        errorMessage = "Google Docs API not found. Please check your setup.";
      } else if (error.message) {
        errorMessage = `Upload failed: ${error.message}`;
      }

      setError(errorMessage);
      setIsUploading(false);

      // Keep error visible longer
      setTimeout(() => setError(null), 5000);
    }
  };

  // Sync changes to existing Google Doc
  const syncToGoogleDoc = async () => {
    if (!currentGoogleDocId) {
      setError("No Google Doc linked. Please upload first.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!gapiReady || !window.gapi?.client?.docs) {
      setError("Google API not ready. Please wait a moment and try again.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      console.log("[Sync] Starting sync to document:", currentGoogleDocId);

      // Ensure token is valid
      window.gapi.client.setToken({ access_token: accessToken });

      // Get document metadata
      const docResponse = await window.gapi.client.docs.documents.get({
        documentId: currentGoogleDocId,
      });
      console.log("[Sync] Retrieved document structure");

      // Extract editor content
      const plainText = editorRef.current
        ? editorRef.current.textContent?.trim()
        : inputText?.trim();

      if (!plainText || plainText.length === 0) {
        console.warn("[Sync] Skipped empty content update.");
        setIsSyncing(false);
        setError("Document is empty — nothing to sync.");
        setTimeout(() => setError(null), 3000);
        return;
      }

      // endIndex
      const content = docResponse.result.body?.content || [];
      const endIndex =
        content.length > 0 ? content[content.length - 1].endIndex - 1 : 1;

      console.log("[Sync] Updating content... (chars:", plainText.length, ")");

      // Update documentation
      await window.gapi.client.docs.documents.batchUpdate({
        documentId: currentGoogleDocId,
        requests: [
          {
            deleteContentRange: {
              range: { startIndex: 1, endIndex: endIndex },
            },
          },
          {
            insertText: {
              location: { index: 1 },
              text: plainText,
            },
          },
        ],
      });

      console.log("[Sync] Content updated successfully");
      alert("Document synced successfully!");
      setIsSyncing(false);
    } catch (error) {
      console.error("[Sync Error]:", error);
      console.error("[Sync Error Details]:", {
        status: error.status,
        statusText: error.statusText,
        message: error.message,
      });

      let errorMessage = "Failed to sync with Google Docs";
      if (error.status === 401) {
        errorMessage = "Authentication expired. Please sign in again.";
        setIsGoogleSignedIn(false);
        setAccessToken(null);
      } else if (error.status === 404) {
        errorMessage = "Document not found. It may have been deleted.";
        setCurrentGoogleDocId(null);
      } else if (error.message) {
        errorMessage = `Sync failed: ${error.message}`;
      }

      setError(errorMessage);
      setIsSyncing(false);
      setTimeout(() => setError(null), 5000);
    }
  };

  let syncCooldown = false;

  const safeSync = async () => {
    if (syncCooldown) {
      console.warn("[Sync] Cooldown active, ignoring click.");
      return;
    }
    syncCooldown = true;
    await syncToGoogleDoc();
    setTimeout(() => (syncCooldown = false), 3000); // 3 秒冷却
  };
  // Load content from selected Google Doc
  const loadFromGoogleDoc = async (docId) => {
    if (!gapiReady || !window.gapi?.client?.docs) {
      setError("Google API not ready. Please wait a moment and try again.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      console.log("[Load] Loading document:", docId);

      // Ensure token is set
      window.gapi.client.setToken({ access_token: accessToken });

      const response = await window.gapi.client.docs.documents.get({
        documentId: docId,
      });

      console.log("[Load] Document retrieved");

      // Extract text content
      let text = "";
      response.result.body.content.forEach((element) => {
        if (element.paragraph) {
          element.paragraph.elements.forEach((elem) => {
            if (elem.textRun) {
              text += elem.textRun.content;
            }
          });
        }
      });

      console.log("[Load] Extracted", text.length, "characters");

      setInputText(text);
      if (editorRef.current) {
        editorRef.current.textContent = text;
      }
      setCurrentGoogleDocId(docId);
      setShowGoogleDocsModal(false);

      alert("Document loaded successfully! You can now edit and sync changes.");
    } catch (error) {
      console.error("[Load Error]:", error);
      console.error("[Load Error Details]:", {
        status: error.status,
        statusText: error.statusText,
        message: error.message,
      });

      let errorMessage = "Failed to load document from Google Docs";

      if (error.status === 401) {
        errorMessage = "Authentication expired. Please sign in again.";
        setIsGoogleSignedIn(false);
        setAccessToken(null);
      } else if (error.status === 404) {
        errorMessage = "Document not found. It may have been deleted.";
      } else if (error.status === 403) {
        errorMessage =
          "Permission denied. You don't have access to this document.";
      } else if (error.message) {
        errorMessage = `Load failed: ${error.message}`;
      }

      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    }
  };

  // (Keep all existing grammar check logic unchanged...)
  useEffect(() => {
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    if (
      editorRef.current?.querySelector("ul, ol, h1, h2, h3, blockquote, table")
    ) {
      setCorrections([]);
      return;
    }

    if (!inputText.trim() || inputText.trim().length < 3) {
      setCorrections([]);
      return;
    }

    setIsChecking(true);

    checkTimeoutRef.current = setTimeout(async () => {
      await performGrammarCheck(inputText);
      setIsChecking(false);
    }, 800);

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [inputText]);

  const performGrammarCheck = async (text) => {
    const plainText = editorRef.current ? editorRef.current.textContent : text;

    if ("Proofreader" in window && window.Proofreader) {
      try {
        const availability = await window.Proofreader.availability();
        if (availability === "no") {
          setCorrections([]);
          return;
        }

        const proofreader = await window.Proofreader.create();
        const proofreadResult = await proofreader.proofread(plainText);

        if (
          !proofreadResult.corrections ||
          proofreadResult.corrections.length === 0
        ) {
          proofreader.destroy();
          setCorrections([]);
          return;
        }

        const correctionsWithIds = proofreadResult.corrections.map(
          (corr, idx) => ({
            ...corr,
            id: `correction-${idx}-${Date.now()}`,
            original: plainText.slice(corr.startIndex, corr.endIndex),
            applied: false,
          })
        );

        setCorrections(correctionsWithIds);
        proofreader.destroy();
      } catch (err) {
        console.error("[Grammar Check] Error:", err);
        setCorrections([]);
      }
    } else {
      setCorrections([]);
    }
  };

  const applyGrammarHighlights = () => {
    if (!editorRef.current || corrections.length === 0) return;

    const hasLists = editorRef.current.querySelector(
      "ul, ol, li, h1, h2, h3, blockquote, table"
    );
    if (hasLists) {
      return;
    }

    const textContent = editorRef.current.textContent;
    const selection = window.getSelection();
    let cursorPosition = 0;

    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editorRef.current);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      cursorPosition = preCaretRange.toString().length;
    }

    let segments = [];
    let lastIndex = 0;

    const sortedForward = [...corrections].sort(
      (a, b) => a.startIndex - b.startIndex
    );

    sortedForward.forEach((correction) => {
      if (correction.startIndex > lastIndex) {
        segments.push({
          text: textContent.substring(lastIndex, correction.startIndex),
          isError: false,
        });
      }

      segments.push({
        text: textContent.substring(correction.startIndex, correction.endIndex),
        isError: true,
        correctionId: correction.id,
        correction: correction,
      });

      lastIndex = correction.endIndex;
    });

    if (lastIndex < textContent.length) {
      segments.push({
        text: textContent.substring(lastIndex),
        isError: false,
      });
    }

    let newHTML = "";
    segments.forEach((segment) => {
      const escapedText = segment.text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");

      if (segment.isError) {
        newHTML += `<span class="grammar-error" data-correction-id="${segment.correctionId}">${escapedText}</span>`;
      } else {
        newHTML += escapedText;
      }
    });

    editorRef.current.innerHTML = newHTML;

    try {
      const range = document.createRange();
      const sel = window.getSelection();
      let charCount = 0;
      let nodeStack = [editorRef.current];
      let node,
        foundStart = false;

      while (!foundStart && (node = nodeStack.pop())) {
        if (node.nodeType === Node.TEXT_NODE) {
          const nextCharCount = charCount + node.length;
          if (cursorPosition <= nextCharCount) {
            range.setStart(node, cursorPosition - charCount);
            range.collapse(true);
            foundStart = true;
          }
          charCount = nextCharCount;
        } else {
          for (let i = node.childNodes.length - 1; i >= 0; i--) {
            nodeStack.push(node.childNodes[i]);
          }
        }
      }

      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) {
      console.log("Cursor restoration failed:", e);
    }
  };

  useEffect(() => {
    if (!isUpdatingRef.current && corrections.length > 0) {
      applyGrammarHighlights();
    }
  }, [corrections]);

  const handleInput = (e) => {
    isUpdatingRef.current = true;
    const text = e.target.textContent || "";
    setInputText(text);
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selected = selection.toString().trim();

    if (
      selected.length > 0 &&
      editorRef.current?.contains(selection.anchorNode)
    ) {
      setSelectedText(selected);

      const range = selection.getRangeAt(0);
      const preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(editorRef.current);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      const start = preSelectionRange.toString().length;

      setSelectionRange({
        start: start,
        end: start + selected.length,
      });
    } else {
      setSelectedText("");
      setSelectionRange(null);
    }
  };

  useEffect(() => {
    document.addEventListener("selectionchange", handleTextSelection);
    return () => {
      document.removeEventListener("selectionchange", handleTextSelection);
    };
  }, []);

  const handleRephrase = async () => {
    const textToRephrase = selectedText || inputText;

    if (!textToRephrase.trim()) {
      setError("Please select or write some text to rewrite!");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsRephrasing(true);
    setRephrasedResult("");

    if ("Rewriter" in window && window.Rewriter) {
      try {
        const availability = await window.Rewriter.availability();

        if (availability === "no") {
          setRephrasedResult(
            "⚠️ Chrome Rewriter API is not available in this browser."
          );
          setIsRephrasing(false);
          return;
        }

        const options = {
          tone: tone,
          format: "plain-text",
          length: length,
        };

        const rewriter = await window.Rewriter.create(options);
        const stream = rewriter.rewriteStreaming(textToRephrase);
        let rephrased = "";

        for await (const chunk of stream) {
          rephrased += chunk;
          setRephrasedResult(rephrased);
        }

        rewriter.destroy();
      } catch (err) {
        console.error("[Rephrase] Error:", err);
        setRephrasedResult(`⚠️ Error: ${err.message}`);
      }
    } else {
      setRephrasedResult(
        "⚠️ Chrome Rewriter API is not available in this browser."
      );
    }

    setIsRephrasing(false);
  };

  const handleUseRephrasedText = () => {
    isUpdatingRef.current = true;

    if (selectedText && selectionRange) {
      const newText =
        inputText.substring(0, selectionRange.start) +
        rephrasedResult +
        inputText.substring(selectionRange.end);
      setInputText(newText);
      if (editorRef.current) {
        editorRef.current.textContent = newText;
      }
    } else {
      setInputText(rephrasedResult);
      if (editorRef.current) {
        editorRef.current.textContent = rephrasedResult;
      }
    }

    setRephrasedResult("");
    setSelectedText("");
    setSelectionRange(null);

    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 100);
  };

  // Helper functions for AI Assistant

  const getSystemPrompt = (mode) => {
    const prompts = {
      research:
        "You are a research assistant helping with academic writing. Provide factual, well-structured information with clear points.",
      outline:
        "You are an expert at creating document outlines. Generate clear, logical structures with main points and subpoints.",
      brainstorm:
        "You are a creative brainstorming partner. Generate diverse, interesting ideas and perspectives.",
      expand:
        "You are a writing assistant. Help expand ideas into full, well-written paragraphs with proper flow and detail.",
      continue:
        "You are a writing continuation assistant. Analyze the existing text and continue writing in the same style and tone.",
    };
    return prompts[mode] || prompts.research;
  };

  const buildPrompt = (mode, userPrompt, documentText, selectedText) => {
    const prompts = {
      research: `Research Task: ${userPrompt}\n\nProvide 5-7 key points with brief explanations. Focus on facts and useful information.`,
      outline: `Create a detailed outline for: ${userPrompt}\n\nProvide a structured outline with main sections and subsections. Use clear hierarchy.`,
      brainstorm: `Brainstorm ideas for: ${userPrompt}\n\nGenerate 8-10 diverse ideas or angles. Be creative and think from different perspectives.`,
      expand: selectedText
        ? `Expand this text into a full paragraph:\n\n"${selectedText}"\n\nRequirements: ${userPrompt}\n\nWrite a well-developed paragraph with proper flow.`
        : `Write a paragraph about: ${userPrompt}\n\nCreate a well-structured, detailed paragraph.`,
      continue: documentText
        ? `Continue writing this document:\n\n${documentText.slice(
            -500
          )}\n\nContinue in the same style and tone. Write the next 2-3 paragraphs.`
        : `Start writing about: ${userPrompt}\n\nWrite an engaging introduction (2-3 paragraphs).`,
    };
    return prompts[mode] || prompts.research;
  };
  // AI Assistant Functions
  const handleAIAssist = async () => {
    if (!aiPrompt.trim() && aiAssistantMode !== "continue") {
      setError("Please enter a prompt!");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsAiThinking(true);
    setAiResponse("");
    setError(null);

    try {
      // Check if API exists
      if (!window.LanguageModel) {
        setAiResponse(
          "⚠️ Prompt API not available. Please:\n1. Use Chrome 127+ (Dev or Canary recommended)\n2. Enable 'Prompt API for Gemini Nano' at chrome://flags\n3. Ensure 22GB free disk space\n4. Restart Chrome"
        );
        setIsAiThinking(false);
        return;
      }

      console.log("[AI Assistant] Checking availability...");
      const availability = await window.LanguageModel.availability();
      console.log("[AI Assistant] Availability:", availability);

      if (availability === "no") {
        setAiResponse(
          "⚠️ Model not available. Requirements:\n• 22 GB free disk space\n• GPU with >4GB VRAM OR 16GB RAM + 4 CPU cores\n• Enable flag at chrome://flags/#prompt-api-for-gemini-nano"
        );
        setIsAiThinking(false);
        return;
      }

      if (availability === "after-download") {
        setAiResponse(
          "⏳ Model needs to be downloaded (~22GB). Click 'Generate' again to start download.\n\nNote: Requires user interaction (click/tap) to begin."
        );
        setIsAiThinking(false);

        // This will trigger download on next click
        return;
      }

      // Create session with monitor for download progress
      console.log("[AI Assistant] Creating session...");
      const session = await window.LanguageModel.create({
        systemPrompt: getSystemPrompt(aiAssistantMode),
        monitor(m) {
          m.addEventListener("downloadprogress", (e) => {
            console.log(`Downloaded ${e.loaded * 100}%`);
            setAiResponse(
              `⏳ Downloading model... ${Math.round(e.loaded * 100)}%`
            );
          });
        },
      });

      const fullPrompt = buildPrompt(
        aiAssistantMode,
        aiPrompt,
        inputText,
        selectedText
      );
      console.log("[AI Assistant] Sending prompt...");

      // Stream response
      const stream = session.promptStreaming(fullPrompt);

      for await (const chunk of stream) {
        setAiResponse((prev) => prev + chunk);
      }

      session.destroy();
      console.log("[AI Assistant] Response complete");
    } catch (err) {
      console.error("[AI Assistant] Error:", err);

      let errorMsg = `⚠️ Error: ${err.message}`;
      if (err.name === "NotSupportedError") {
        errorMsg +=
          "\n\nThis might be due to:\n• Insufficient disk space\n• Hardware requirements not met\n• Model not downloaded";
      }

      setAiResponse(errorMsg);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleInsertAIResponse = () => {
    if (!aiResponse || aiResponse.includes("⚠️") || aiResponse.includes("⏳")) {
      return;
    }

    isUpdatingRef.current = true;

    if (selectedText && selectionRange) {
      const newText =
        inputText.substring(0, selectionRange.start) +
        aiResponse +
        inputText.substring(selectionRange.end);
      setInputText(newText);
      if (editorRef.current) {
        editorRef.current.textContent = newText;
      }
    } else {
      const newText = inputText + "\n\n" + aiResponse;
      setInputText(newText);
      if (editorRef.current) {
        editorRef.current.textContent = newText;
      }
    }

    setAiResponse("");
    setAiPrompt("");
    setSelectedText("");
    setSelectionRange(null);

    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 100);
  };
  // Formatting functions
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleBold = () => execCommand("bold");
  const handleItalic = () => execCommand("italic");
  const handleUnderline = () => execCommand("underline");
  const handleAlignLeft = () => execCommand("justifyLeft");
  const handleAlignCenter = () => execCommand("justifyCenter");
  const handleAlignRight = () => execCommand("justifyRight");
  const handleAlignJustify = () => execCommand("justifyFull");

  const handleH1 = () => execCommand("formatBlock", "<h1>");
  const handleH2 = () => execCommand("formatBlock", "<h2>");
  const handleH3 = () => execCommand("formatBlock", "<h3>");
  const handleBlockquote = () => execCommand("formatBlock", "<blockquote>");
  const handleParagraph = () => execCommand("formatBlock", "<p>");
  const handleHorizontalRule = () => execCommand("insertHorizontalRule");

  const handleInsertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  const handleInsertTable = () => {
    setShowTableModal(true);
  };

  const insertTable = () => {
    let tableHTML =
      '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 16px 0;">';

    for (let i = 0; i < tableRows; i++) {
      tableHTML += "<tr>";
      for (let j = 0; j < tableCols; j++) {
        if (i === 0) {
          tableHTML +=
            '<th style="background-color: #f3f4f6; padding: 8px; border: 1px solid #d1d5db;">Header</th>';
        } else {
          tableHTML +=
            '<td style="padding: 8px; border: 1px solid #d1d5db;">Cell</td>';
        }
      }
      tableHTML += "</tr>";
    }
    tableHTML += "</table>";

    execCommand("insertHTML", tableHTML);
    setShowTableModal(false);
    setTableRows(3);
    setTableCols(3);
  };

  return (
    <main className="bg-gray-50 min-h-screen flex">
      <Sidebar />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          showAIPanel ? "mr-96" : ""
        }`}
      >
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-2">
            {/* Title and Buttons */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Type className="w-5 h-5 text-gray-600" />
                <h1 className="text-lg font-semibold text-gray-800">
                  Polish Document
                </h1>
                {currentGoogleDocId && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <Cloud size={12} />
                    Linked to Google Docs
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* NEW: Google Docs Button */}
                <button
                  onClick={() => setShowGoogleDocsModal(true)}
                  className="bg-white border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-all flex items-center gap-2 shadow-sm"
                >
                  <CloudUpload size={18} />
                  Google Docs
                </button>

                {/* Sync Button (shown when linked) */}
                {currentGoogleDocId && (
                  <button
                    onClick={safeSync}
                    disabled={isSyncing}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {isSyncing ? (
                      <Loader size={18} className="animate-spin" />
                    ) : (
                      <RefreshCw size={18} />
                    )}
                    Sync
                  </button>
                )}

                <button
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg relative"
                >
                  <Sparkles size={18} />
                  AI Assistance
                  {corrections.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {corrections.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Formatting Toolbar */}
            <div className="flex items-center gap-1 py-2 border-t border-gray-100 flex-wrap">
              <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
                <ToolbarButton
                  onClick={handleBold}
                  icon={<Bold size={18} />}
                  title="Bold (Ctrl+B)"
                />
                <ToolbarButton
                  onClick={handleItalic}
                  icon={<Italic size={18} />}
                  title="Italic (Ctrl+I)"
                />
                <ToolbarButton
                  onClick={handleUnderline}
                  icon={<UnderlineIcon size={18} />}
                  title="Underline (Ctrl+U)"
                />
              </div>

              <div className="flex items-center gap-1 px-3 border-r border-gray-200">
                <ToolbarButton
                  onClick={handleH1}
                  icon={<Heading1 size={18} />}
                  title="Heading 1"
                />
                <ToolbarButton
                  onClick={handleH2}
                  icon={<Heading2 size={18} />}
                  title="Heading 2"
                />
                <ToolbarButton
                  onClick={handleH3}
                  icon={<Heading3 size={18} />}
                  title="Heading 3"
                />
                <ToolbarButton
                  onClick={handleParagraph}
                  icon={<Type size={18} />}
                  title="Normal Text"
                />
              </div>

              <div className="flex items-center gap-1 px-3 border-r border-gray-200">
                <ToolbarButton
                  onClick={handleAlignLeft}
                  icon={<AlignLeft size={18} />}
                  title="Align Left"
                />
                <ToolbarButton
                  onClick={handleAlignCenter}
                  icon={<AlignCenter size={18} />}
                  title="Align Center"
                />
                <ToolbarButton
                  onClick={handleAlignRight}
                  icon={<AlignRight size={18} />}
                  title="Align Right"
                />
                <ToolbarButton
                  onClick={handleAlignJustify}
                  icon={<AlignJustify size={18} />}
                  title="Justify"
                />
              </div>

              <div className="flex items-center gap-1 px-3 border-r border-gray-200">
                <ToolbarButton
                  onClick={handleInsertLink}
                  icon={<Link size={18} />}
                  title="Insert Link"
                />
                <ToolbarButton
                  onClick={handleHorizontalRule}
                  icon={<Minus size={18} />}
                  title="Horizontal Line"
                />
              </div>

              <div className="flex items-center gap-1 pl-3">
                <ToolbarButton
                  onClick={handleBlockquote}
                  icon={<Quote size={18} />}
                  title="Quote"
                />
              </div>
            </div>
          </div>

          {selectedText && (
            <div className="max-w-6xl mx-auto px-6 py-2 border-t border-gray-100 bg-blue-50">
              <div className="text-sm text-blue-700 flex items-center gap-2">
                <CheckCheck className="w-4 h-4" />
                <span className="font-medium">
                  {selectedText.length} characters selected
                </span>
                <span className="text-blue-400">•</span>
                <span>
                  Open AI Assistance and go to "Rewrite" tab to rephrase
                  selection
                </span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="max-w-6xl mx-auto w-full px-6 pt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Writing Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="bg-white rounded-lg shadow-lg min-h-[800px] p-16">
              <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onClick={(e) => {
                  const target = e.target;
                  if (target.classList.contains("grammar-error")) {
                    const correctionId =
                      target.getAttribute("data-correction-id");
                    const correction = corrections.find(
                      (c) => c.id === correctionId
                    );
                    if (correction) {
                      setShowAIPanel(true);
                      setActiveTab("grammar");
                      setTimeout(() => {
                        const correctionElement = document.querySelector(
                          `[data-correction-card="${correctionId}"]`
                        );
                        if (correctionElement) {
                          correctionElement.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                          correctionElement.classList.add(
                            "highlight-correction"
                          );
                          setTimeout(() => {
                            correctionElement.classList.remove(
                              "highlight-correction"
                            );
                          }, 2000);
                        }
                      }, 100);
                    }
                  }
                }}
                className="min-h-[700px] focus:outline-none text-gray-800 leading-relaxed"
                style={{
                  fontSize: "16px",
                  lineHeight: "1.8",
                  fontFamily:
                    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}
                data-placeholder="Start writing your document..."
                suppressContentEditableWarning
              />
            </div>

            <div className="mt-4 text-center text-sm text-gray-500">
              {inputText.length} characters •{" "}
              {inputText.split(/\s+/).filter((w) => w.length > 0).length} words
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistance Slide-in Panel (Keep existing panel code...) */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          showAIPanel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Panel Header */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 text-gray-800 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold">AI Assistance</h2>
          </div>
          <button
            onClick={() => setShowAIPanel(false)}
            className="hover:bg-white/30 p-2 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-purple-700" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 flex">
          <button
            onClick={() => setActiveTab("grammar")}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "grammar"
                ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FileCheck size={16} />
            Grammar
            {corrections.length > 0 && activeTab !== "grammar" && (
              <span className="bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {corrections.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("rewrite")}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "rewrite"
                ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Wand2 size={16} />
            Rewrite
          </button>
          <button
            onClick={() => setActiveTab("assistant")}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "assistant"
                ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Brain size={16} />
            Assistant
          </button>
        </div>

        {/* Panel Content */}
        <div className="h-full overflow-y-auto pb-32">
          {/* Grammar Tab */}
          {activeTab === "grammar" && (
            <>
              {corrections.length > 0 ? (
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <h3 className="font-bold text-gray-800 text-lg">
                      Grammar Issues ({corrections.length})
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {corrections.map((correction, index) => (
                      <div
                        key={correction.id}
                        data-correction-card={correction.id}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all"
                      >
                        <div className="text-xs text-gray-500 font-semibold mb-2">
                          Issue {index + 1}
                        </div>

                        <div className="mb-3">
                          <div className="text-xs text-gray-600 mb-1">
                            Original:
                          </div>
                          <div className="text-sm text-red-600 line-through bg-red-50 p-2 rounded">
                            {correction.original}
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="text-xs text-gray-600 mb-1">
                            Suggestion:
                          </div>
                          <div className="text-sm text-green-700 font-semibold bg-green-50 p-2 rounded">
                            {correction.correction}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const plainText = editorRef.current.textContent;
                              const newText =
                                plainText.substring(0, correction.startIndex) +
                                correction.correction +
                                plainText.substring(correction.endIndex);

                              editorRef.current.textContent = newText;
                              setInputText(newText);
                              setCorrections((prev) =>
                                prev.filter((c) => c.id !== correction.id)
                              );
                            }}
                            className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-all font-semibold text-sm flex items-center justify-center gap-2"
                          >
                            <CheckCheck size={16} />
                            Accept
                          </button>
                          <button
                            onClick={() => {
                              setCorrections((prev) =>
                                prev.filter((c) => c.id !== correction.id)
                              );
                            }}
                            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-400 transition-all font-semibold text-sm flex items-center justify-center gap-2"
                          >
                            <X size={16} />
                            Ignore
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="text-center py-12">
                    <CheckCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      No Issues Found
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Your document looks great! No grammar issues detected.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Rewrite Tab */}
          {activeTab === "rewrite" && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Wand2 className="w-5 h-5 text-purple-500" />
                <h3 className="font-bold text-gray-800 text-lg">
                  Rewrite Text
                </h3>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Text to Rewrite
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
                  {selectedText || inputText ? (
                    <p className="text-gray-800 text-sm whitespace-pre-wrap">
                      {selectedText || inputText}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm italic">
                      Write or select text in the editor to rewrite it
                    </p>
                  )}
                </div>
                {selectedText && (
                  <p className="text-xs text-blue-600 mt-2">
                    ✓ Selection will be rewritten
                  </p>
                )}
              </div>

              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    disabled={isRephrasing}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-800 shadow-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 hover:border-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                  >
                    <option value="as-is">As Is</option>
                    <option value="more-formal">More Formal</option>
                    <option value="more-casual">More Casual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Length
                  </label>
                  <select
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    disabled={isRephrasing}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-800 shadow-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 hover:border-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                  >
                    <option value="as-is">As Is</option>
                    <option value="shorter">Shorter</option>
                    <option value="longer">Longer</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleRephrase}
                disabled={isRephrasing || (!selectedText && !inputText.trim())}
                className="w-full bg-gradient-to-r from-purple-100 to-pink-100 text-gray-800 px-6 py-3 rounded-xl font-semibold shadow-sm hover:from-purple-200 hover:to-pink-200 focus:ring-2 focus:ring-purple-300 focus:outline-none transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {isRephrasing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Rewriting...
                  </>
                ) : (
                  <>
                    <Wand2 size={20} />
                    Generate Rewrite
                  </>
                )}
              </button>

              {isRephrasing && !rephrasedResult && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-700 text-xs">
                    🔄 Initializing AI rewriter... This may take a moment on
                    first use.
                  </p>
                </div>
              )}

              {rephrasedResult && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Rewritten Result
                  </label>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-green-200 min-h-32 mb-4">
                    <p className="text-gray-800 text-sm whitespace-pre-wrap">
                      {rephrasedResult}
                    </p>
                  </div>

                  {!rephrasedResult.includes("⚠️") && (
                    <button
                      onClick={handleUseRephrasedText}
                      className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCheck size={20} />
                      {selectedText ? "Replace Selection" : "Replace Document"}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Originality/Plagiarism Tab */}

          {/* AI Assistant Tab */}
          {activeTab === "assistant" && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-gray-800 text-lg">
                  AI Writing Assistant
                </h3>
              </div>

              {/* Mode Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3 text-sm">
                  What do you need help with?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAiAssistantMode("research")}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      aiAssistantMode === "research"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                    }`}
                  >
                    <Search className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-xs font-semibold">Research</div>
                  </button>

                  <button
                    onClick={() => setAiAssistantMode("outline")}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      aiAssistantMode === "outline"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                    }`}
                  >
                    <ListChecks className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-xs font-semibold">Outline</div>
                  </button>

                  <button
                    onClick={() => setAiAssistantMode("brainstorm")}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      aiAssistantMode === "brainstorm"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                    }`}
                  >
                    <Lightbulb className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-xs font-semibold">Brainstorm</div>
                  </button>

                  <button
                    onClick={() => setAiAssistantMode("expand")}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      aiAssistantMode === "expand"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                    }`}
                  >
                    <FileText className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-xs font-semibold">Expand</div>
                  </button>

                  <button
                    onClick={() => setAiAssistantMode("continue")}
                    className={`p-3 rounded-lg border-2 transition-all col-span-2 ${
                      aiAssistantMode === "continue"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                    }`}
                  >
                    <Zap className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-xs font-semibold">
                      Continue Writing
                    </div>
                  </button>
                </div>
              </div>

              {/* Helper Text */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600">
                  {aiAssistantMode === "research" &&
                    "💡 Get key facts and information about your topic"}
                  {aiAssistantMode === "outline" &&
                    "📋 Generate a structured outline for your document"}
                  {aiAssistantMode === "brainstorm" &&
                    "🎨 Explore different ideas and perspectives"}
                  {aiAssistantMode === "expand" &&
                    "✍️ Turn your ideas into full paragraphs"}
                  {aiAssistantMode === "continue" &&
                    "⚡ AI will continue writing based on your document"}
                </p>
              </div>

              {/* Prompt Input */}
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  {aiAssistantMode === "continue"
                    ? "Additional Instructions (optional)"
                    : "Your Prompt"}
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={
                    aiAssistantMode === "research"
                      ? "e.g., 'Climate change effects on polar bears'"
                      : aiAssistantMode === "outline"
                      ? "e.g., 'Essay on renewable energy'"
                      : aiAssistantMode === "brainstorm"
                      ? "e.g., 'Ways to reduce plastic waste'"
                      : aiAssistantMode === "expand"
                      ? "e.g., 'Make it more formal and detailed'"
                      : "e.g., 'Continue in an academic tone'"
                  }
                  disabled={isAiThinking}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-sm disabled:opacity-50"
                  rows="4"
                />
                {selectedText && aiAssistantMode === "expand" && (
                  <p className="text-xs text-blue-600 mt-2">
                    ✓ Will expand selected text: "
                    {selectedText.substring(0, 50)}..."
                  </p>
                )}
              </div>

              {/* Generate Button */}
              <button
                onClick={handleAIAssist}
                disabled={
                  isAiThinking ||
                  (aiAssistantMode !== "continue" && !aiPrompt.trim())
                }
                className="w-full bg-gradient-to-r from-purple-100 to-pink-100 text-gray-800 px-6 py-3 rounded-xl font-semibold shadow-sm hover:from-purple-200 hover:to-pink-200 focus:ring-2 focus:ring-purple-300 focus:outline-none transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {isAiThinking ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate
                  </>
                )}
              </button>

              {/* AI Response */}
              {aiResponse && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    AI Response
                  </label>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 min-h-32 mb-4 max-h-96 overflow-y-auto">
                    <p className="text-gray-800 text-sm whitespace-pre-wrap">
                      {aiResponse}
                    </p>
                  </div>

                  {!aiResponse.includes("⚠️") && !aiResponse.includes("⏳") && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleInsertAIResponse}
                        className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCheck size={16} />
                        {selectedText ? "Replace" : "Insert"}
                      </button>
                      <button
                        onClick={() => {
                          setAiResponse("");
                          setAiPrompt("");
                        }}
                        className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* NEW: Google Docs Modal */}
      {showGoogleDocsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-50 via-purple-100 to-pink-50
             text-gray-700 p-6 flex items-center justify-between 
             rounded-xl shadow-sm hover:from-purple-100 hover:via-purple-200 hover:to-pink-100
             transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <CloudUpload className="w-6 h-6" />
                <h2 className="text-xl font-bold">Google Docs Integration</h2>
              </div>
              <button
                onClick={() => setShowGoogleDocsModal(false)}
                className="hover:bg-white/20 p-2 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-88px)]">
              {!isGoogleSignedIn ? (
                <div className="text-center py-8">
                  <Cloud className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Sign in to Google
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Connect your Google account to upload, sync, and manage your
                    documents in Google Docs
                  </p>
                  <button
                    onClick={handleGoogleSignIn}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
                  >
                    <LogIn size={18} />
                    Sign in with Google
                  </button>
                </div>
              ) : (
                <>
                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <button
                      onClick={uploadToGoogleDocs}
                      disabled={isUploading || !inputText.trim()}
                      className="
    w-full 
    bg-gradient-to-r from-purple-200 via-purple-300 to-pink-200
    text-gray-800
    px-6 py-4 
    rounded-xl 
    font-semibold 
    shadow-md 
    hover:from-purple-300 hover:via-purple-400 hover:to-pink-300
    transition-all duration-300 
    flex items-center justify-center gap-3 
    disabled:opacity-50 disabled:cursor-not-allowed
  "
                    >
                      {isUploading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={20} />
                          Upload to Google Docs
                        </>
                      )}
                    </button>

                    {currentGoogleDocId && (
                      <button
                        onClick={safeSync}
                        disabled={isSyncing}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                        {isSyncing ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <RefreshCw size={20} />
                            Sync Current Document
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Recent Google Docs */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FolderOpen size={16} />
                      Your Google Docs
                    </h3>

                    {googleDocs.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-sm">
                          No Google Docs found. Upload your first document!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {googleDocs.map((doc) => (
                          <div
                            key={doc.id}
                            className={`p-4 rounded-lg border transition-all hover:border-blue-300 cursor-pointer ${
                              currentGoogleDocId === doc.id
                                ? "bg-blue-50 border-blue-300"
                                : "bg-gray-50 border-gray-200"
                            }`}
                            onClick={() => loadFromGoogleDoc(doc.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {doc.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Modified:{" "}
                                  {new Date(
                                    doc.modifiedTime
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(doc.webViewLink, "_blank");
                                }}
                                className="p-2 hover:bg-blue-100 rounded-lg transition"
                              >
                                <FolderOpen
                                  size={16}
                                  className="text-blue-600"
                                />
                              </button>
                            </div>
                            {currentGoogleDocId === doc.id && (
                              <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                                <CheckCircle size={12} />
                                Currently linked
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style>{`
        [contenteditable] h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; }
        [contenteditable] h2 { font-size: 1.5em; font-weight: bold; margin: 0.75em 0; }
        [contenteditable] h3 { font-size: 1.17em; font-weight: bold; margin: 0.83em 0; }
        [contenteditable] blockquote { border-left: 4px solid #e5e7eb; padding-left: 16px; margin: 16px 0; color: #6b7280; font-style: italic; }
        [contenteditable] ul, [contenteditable] ol { padding-left: 40px; margin: 16px 0; }
        [contenteditable] li { margin: 8px 0; }
        [contenteditable] a { color: #2563eb; text-decoration: underline; }
        [contenteditable] hr { border: none; border-top: 2px solid #e5e7eb; margin: 24px 0; }
        [contenteditable] table { border-collapse: collapse; width: 100%; margin: 16px 0; }
        [contenteditable] table th { background-color: #f3f4f6; font-weight: 600; text-align: left; }
        [contenteditable] table th, [contenteditable] table td { border: 1px solid #d1d5db; padding: 8px 12px; }
        [contenteditable][data-placeholder]:empty:before { content: attr(data-placeholder); color: #9ca3af; cursor: text; }
        [contenteditable] { -webkit-user-select: text; user-select: text; }

        .grammar-error {
          text-decoration: underline wavy red;
          text-decoration-thickness: 2px;
          cursor: pointer;
          background-color: transparent;
          border-radius: 3px;
          padding: 0 2px;
        }
        .grammar-error:hover { background-color: rgba(239, 68, 68, 0.1); }
        .highlight-correction { animation: highlight-pulse 2s ease-in-out; }
        @keyframes highlight-pulse {
          0%, 100% { background-color: transparent; }
          50% { background-color: rgba(59, 130, 246, 0.2); }
        }
      `}</style>

      {/* Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Table className="w-6 h-6" />
                <h2 className="text-xl font-bold">Insert Table</h2>
              </div>
              <button
                onClick={() => setShowTableModal(false)}
                className="hover:bg-white/20 p-2 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Number of Rows
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Number of Columns
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={insertTable}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                >
                  Insert Table
                </button>
                <button
                  onClick={() => setShowTableModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// Toolbar Button Component
function ToolbarButton({ onClick, icon, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 hover:text-gray-900"
    >
      {icon}
    </button>
  );
}
