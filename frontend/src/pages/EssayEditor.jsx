import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  FolderOpen,
  FileText,
  LogIn,
  LogOut,
  ExternalLink,
  Trash2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getStoredUser } from "../api/auth";

function EssayEditor() {
  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [documentId, setDocumentId] = useState(null);
  const [gapiReady, setGapiReady] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [documentTitle, setDocumentTitle] = useState("New Document");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState(null);
  const [tokenExpired, setTokenExpired] = useState(false);

  // Initialize Google API client when component loads
  useEffect(() => {
    const initGapi = () => {
      window.gapi.load("client", async () => {
        try {
          await window.gapi.client.init({
            apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
          });
          await window.gapi.client.load(
            "https://docs.googleapis.com/$discovery/rest?version=v1"
          );
          await window.gapi.client.load(
            "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
          );
          console.log("[Google Docs] GAPI initialized");
          setGapiReady(true);
        } catch (error) {
          console.error("[Google Docs] GAPI init failed:", error);
          setError("Failed to initialize Google API");
        }
      });
    };

    const gapiScript = document.createElement("script");
    gapiScript.src = "https://apis.google.com/js/api.js";
    gapiScript.onload = initGapi;
    document.body.appendChild(gapiScript);

    return () => {
      if (document.body.contains(gapiScript)) {
        document.body.removeChild(gapiScript);
      }
    };
  }, []);

  // Check user type: Google user or local user
  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      if (user.google_access_token) {
        console.log("[Google Docs] Google user detected");
        setAccessToken(user.google_access_token);
        setIsSignedIn(true);
      } else {
        console.log("[Local Docs] Local user detected");
        setIsSignedIn(true);
        loadLocalDocs();
      }
    }
  }, []);

  // Load Google Docs if Google account detected
  useEffect(() => {
    if (accessToken && gapiReady) {
      window.gapi.client.setToken({ access_token: accessToken });
      loadRecentDocs();
    }
  }, [accessToken, gapiReady]);

  // Load local documents from localStorage
  const loadLocalDocs = () => {
    const localDocs = JSON.parse(localStorage.getItem("local_docs") || "[]");
    setRecentDocs(localDocs);
    console.log("[Local Docs] Loaded local docs:", localDocs);
  };

  // Load Google Docs list
  const loadRecentDocs = async () => {
    try {
      const response = await window.gapi.client.drive.files.list({
        pageSize: 10,
        fields: "files(id, name, modifiedTime, webViewLink)",
        q: "mimeType='application/vnd.google-apps.document' and trashed=false",
        orderBy: "modifiedTime desc",
      });
      setRecentDocs(response.result.files || []);
      setError(null);
      setTokenExpired(false);
      console.log("[Google Docs] Loaded recent documents");
    } catch (error) {
      console.error("[Google Docs] Error loading docs:", error);
      if (error.status === 401) {
        setTokenExpired(true);
        setError("Your Google session has expired. Please sign in again.");
        setIsSignedIn(false);
      } else {
        setError("Failed to load documents");
      }
    }
  };

  // Handle Google Sign-in
  const handleSignIn = async () => {
    try {
      localStorage.setItem("redirect_after_login", "/essay/new");
      const response = await fetch("http://localhost:8000/api/auth/google/login");
      const data = await response.json();
      if (data.auth_url) {
        window.location.href = data.auth_url;
      }
    } catch (error) {
      console.error("[Google Docs] Login error:", error);
      setError("Failed to start Google login");
    }
  };

  // Handle Sign-out
  const handleSignOut = () => {
    setAccessToken(null);
    setIsSignedIn(false);
    setDocumentId(null);
    setRecentDocs([]);
    if (window.gapi?.client) window.gapi.client.setToken(null);
    const user = getStoredUser();
    if (user) {
      delete user.google_access_token;
      localStorage.setItem("user", JSON.stringify(user));
    }
  };

  // Create a new document (Google or Local)
  const createNewDoc = async () => {
    try {
      const user = getStoredUser();
      // Local user mode
      if (!user?.google_access_token) {
        const localDocs = JSON.parse(localStorage.getItem("local_docs") || "[]");
        if (localDocs.length >= 5) {
          alert("Free users can only create up to 5 local documents.");
          return;
        }
        const title = prompt("Enter document title:", "Untitled Document");
        if (!title) return;

        const newDocId = `local-${Date.now()}`;
        const newDoc = {
          id: newDocId,
          name: title,
          createdAt: new Date().toISOString(),
        };

        const updatedDocs = [...localDocs, newDoc].slice(-5);
        localStorage.setItem("local_docs", JSON.stringify(updatedDocs));
        localStorage.setItem(newDocId, "");
        setDocumentId(newDocId);
        setDocumentTitle(title);
        loadLocalDocs();
        alert("New local document created successfully!");
        return;
      }

      // Google Docs mode
      const title = prompt("Enter document title:", "Untitled Document");
      if (!title) return;
      const response = await window.gapi.client.docs.documents.create({ title });
      const newDocId = response.result.documentId;
      setDocumentId(newDocId);
      setDocumentTitle(title);
      loadRecentDocs();
      console.log("[Google Docs] Created new document:", newDocId);
    } catch (error) {
      console.error("[Create Doc Error]:", error);
      setError("Failed to create document");
    }
  };

  // Open a Google Doc by ID (for Google users)
  const handleOpenByID = () => {
    const docId = prompt("Enter the Google Document ID:");
    if (docId) {
      setDocumentId(docId);
      setDocumentTitle("Imported Google Document");
    }
  };


  // Open selected document
  const openDocument = (docId, docName) => {
    setDocumentId(docId);
    setDocumentTitle(docName);
  };

  // Delete document
  const deleteDocument = (docId, docName) => {
    setDeleteConfirm({ docId, docName });
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { docId } = deleteConfirm;
    try {
      if (accessToken) {
        // Delete from Google Drive
        await window.gapi.client.drive.files.delete({ fileId: docId });
        loadRecentDocs();
      } else {
        // Delete from localStorage
        const localDocs = JSON.parse(localStorage.getItem("local_docs") || "[]");
        const updatedDocs = localDocs.filter((d) => d.id !== docId);
        localStorage.setItem("local_docs", JSON.stringify(updatedDocs));
        localStorage.removeItem(docId);
        loadLocalDocs();
      }
      if (documentId === docId) setDocumentId(null);
      setDeleteConfirm(null);
    } catch (error) {
      console.error("[Delete Error]:", error);
      setError("Failed to delete document");
    }
  };

  // Sync all local docs to Google Docs
  const syncLocalToGoogle = async () => {
    try {
      if (!accessToken) {
        alert("You need to sign in with Google first!");
        return;
      }

      const localDocs = JSON.parse(localStorage.getItem("local_docs") || "[]");
      if (localDocs.length === 0) {
        alert("No local documents to sync.");
        return;
      }

      for (const doc of localDocs) {
        const content = localStorage.getItem(doc.id) || "";
        const newDoc = await window.gapi.client.docs.documents.create({
          title: doc.name,
        });
        const newDocId = newDoc.result.documentId;

        await window.gapi.client.docs.documents.batchUpdate({
          documentId: newDocId,
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: content,
              },
            },
          ],
        });

        console.log(`[Sync] Uploaded '${doc.name}' (${newDocId})`);
      }

      alert("All local documents have been uploaded to Google Docs.");
      localStorage.removeItem("local_docs");
      loadRecentDocs();
    } catch (error) {
      console.error("[Sync Error]:", error);
      alert("Failed to sync local documents. Please try again.");
    }
  };

  // Render section
  return (
    <main className="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen border-8 border-purple-200 overflow-hidden">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate("/")} className="p-2 hover:bg-gray-100 rounded-full transition">
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-semibold">
                  {documentId ? documentTitle : "Essay Editor"}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                {!isSignedIn ? (
                  <button
                    onClick={handleSignIn}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <LogIn size={18} /> Sign in with Google
                  </button>
                ) : (
                  <>
                    <button
                      onClick={createNewDoc}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                    >
                      <Plus size={18} /> New Document
                    </button>
                    {accessToken && (
                      <button
                        onClick={handleOpenByID}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
                      >
                        <FolderOpen size={18} /> Open by ID
                      </button>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition flex items-center gap-2"
                    >
                      <LogOut size={18} /> Sign Out
                    </button>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Warning for local users */}
          {!accessToken && isSignedIn && (
            <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-6 py-3 text-sm text-center">
              You are using a local account. You can create up to 5 local documents.
              After logging into Google, you can sync them to Google Docs.
              <div className="flex justify-center gap-3 mt-3">
                <button
                  onClick={handleSignIn}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Sign in with Google
                </button>
                <button
                  onClick={syncLocalToGoogle}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Sync to Google Docs
                </button>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 flex max-w-7xl w-full mx-auto">
            {/* Sidebar with document list */}
            {isSignedIn && (
              <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
                <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText size={16} />
                  {accessToken ? "Google Docs" : "Local Documents"}
                </h2>
                {recentDocs.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    {accessToken ? "No Google Docs yet" : "No local documents yet"}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {recentDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className={`p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition group ${
                          documentId === doc.id ? "bg-purple-50 border border-purple-200" : ""
                        }`}
                      >
                        <div onClick={() => openDocument(doc.id, doc.name)}>
                          <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            {doc.modifiedTime
                              ? new Date(doc.modifiedTime).toLocaleDateString()
                              : new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition">
                          {accessToken && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://docs.google.com/document/d/${doc.id}/edit`, "_blank");
                              }}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <ExternalLink size={14} />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDocument(doc.id, doc.name);
                            }}
                            className="p-1 hover:bg-red-100 text-red-600 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Main editor area */}
            <div className="flex-1 p-6">
              {!documentId ? (
                <div className="h-full flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="text-center">
                    <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                      No Document Open
                    </h2>
                    <p className="text-gray-500 mb-6">
                      Create a new document or open one from the sidebar
                    </p>
                  </div>
                </div>
              ) : accessToken ? (
                <iframe
                  src={`https://docs.google.com/document/d/${documentId}/edit?embedded=true`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  className="w-full h-full rounded-lg"
                  title="Google Docs"
                />
              ) : (
                <textarea
                  className="w-full h-full p-6 text-gray-800 text-base outline-none resize-none"
                  placeholder="Start writing your document here..."
                  defaultValue={localStorage.getItem(documentId) || ""}
                  onChange={(e) => localStorage.setItem(documentId, e.target.value)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Document?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "
              <strong>{deleteConfirm.docName}</strong>"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default EssayEditor;
