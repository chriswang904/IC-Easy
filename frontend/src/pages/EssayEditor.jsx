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

  // Validate users logged in via google
  useEffect(() => {
    const user = getStoredUser();
    
    if (user && user.google_access_token) {
      console.log('[Google Docs] User has Google token, auto-signing in');
      setAccessToken(user.google_access_token);
      setIsSignedIn(true);
    }
  }, []);

  // Initialize Google API
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

          console.log("[Google Docs] GAPI client initialized");
          setGapiReady(true);
        } catch (error) {
          console.error("[Google Docs] Error initializing GAPI:", error);
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

  // Set GPAI Token and Load doc
  useEffect(() => {
    if (accessToken && gapiReady) {
      window.gapi.client.setToken({ access_token: accessToken });
      loadRecentDocs();
    }
  }, [accessToken, gapiReady]);

  // Connect to backend OAUTH
  const handleSignIn = async () => {
    try {

      localStorage.setItem('redirect_after_login', '/essay/new');

      const response = await fetch('http://localhost:8000/api/auth/google/login');
      const data = await response.json();
      
      if (data.auth_url) {
        // Return to homepage after logged in 
        localStorage.setItem('redirect_after_login', '/essay/new');
        window.location.href = data.auth_url;
      }
    } catch (error) {
      console.error("[Google Docs] Login error:", error);
      setError("Failed to initiate Google login");
    }
  };

  const handleSignOut = () => {
    setAccessToken(null);
    setIsSignedIn(false);
    setDocumentId(null);
    setRecentDocs([]);
    window.gapi.client.setToken(null);
    

    const user = getStoredUser();
    if (user) {
      delete user.google_access_token;
      localStorage.setItem('user', JSON.stringify(user));
    }
  };

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
      console.log("[Google Docs] Loaded recent docs:", response.result.files);
    } catch (error) {
      console.error("[Google Docs] Error loading docs:", error);
      

      if (error.status === 401) {
        console.warn("[Google Docs] Token expired - need re-authentication");
        setTokenExpired(true);
        setError("Your Google session has expired. Please sign in again.");
        setIsSignedIn(false);
      } else {
        setError("Failed to load documents");
      }
    }
  };


  const createNewDoc = async () => {
    try {
      const title = prompt("Enter document title:", "Untitled Document");
      if (!title) return;

      const response = await window.gapi.client.docs.documents.create({
        title: title,
      });

      const newDocId = response.result.documentId;
      setDocumentId(newDocId);
      setDocumentTitle(title);
      setError(null);
      loadRecentDocs();
      console.log("[Google Docs] Created new document:", newDocId);
    } catch (error) {
      console.error("[Google Docs] Error creating document:", error);
      
      if (error.status === 401) {
        setTokenExpired(true);
        setError("Your Google session has expired. Please sign in again.");
        setIsSignedIn(false);
      } else {
        setError("Failed to create document");
      }
    }
  };


  const openDocument = (docId, docName) => {
    setDocumentId(docId);
    setDocumentTitle(docName);
  };

  const handleOpenByID = () => {
    const docId = prompt("Enter Google Doc ID:");
    if (docId) {
      setDocumentId(docId);
      setDocumentTitle("Document");
    }
  };

  const deleteDocument = async (docId, docName) => {
    setDeleteConfirm({ docId, docName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await window.gapi.client.drive.files.delete({
        fileId: deleteConfirm.docId,
      });

      loadRecentDocs();

      if (documentId === deleteConfirm.docId) {
        setDocumentId(null);
      }

      setDeleteConfirm(null);
    } catch (error) {
      console.error("[Google Docs] Error deleting document:", error);
      setError("Failed to delete document");
      setDeleteConfirm(null);
    }
  };

  const openInNewTab = (docId) => {
    window.open(`https://docs.google.com/document/d/${docId}/edit`, "_blank");
  };

  return (
    <main className="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen overflow-hidden border-8 border-purple-200">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/")}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-semibold">
                  {documentId ? documentTitle : "Google Docs Editor"}
                </h1>
                {documentId && (
                  <button
                    onClick={() => openInNewTab(documentId)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <ExternalLink size={16} />
                    Open in Google Docs
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {tokenExpired && (
                  <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                    <AlertCircle size={16} />
                    <span>Session expired</span>
                  </div>
                )}

                {!isSignedIn ? (
                  <button
                    onClick={handleSignIn}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <LogIn size={18} />
                    Sign in with Google
                  </button>
                ) : (
                  <>
                    {tokenExpired && (
                      <button
                        onClick={handleSignIn}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
                      >
                        <RefreshCw size={18} />
                        Re-authenticate
                      </button>
                    )}

                    {!tokenExpired && (
                      <>
                        <button
                          onClick={createNewDoc}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                        >
                          <Plus size={18} />
                          New Document
                        </button>
                        <button
                          onClick={handleOpenByID}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
                        >
                          <FolderOpen size={18} />
                          Open by ID
                        </button>
                      </>
                    )}

                    <button
                      onClick={handleSignOut}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition flex items-center gap-2"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Error Display */}
          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 flex max-w-7xl w-full mx-auto">
            {/* Sidebar with recent docs */}
            {isSignedIn && (
              <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
                <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText size={16} />
                  Recent Documents
                </h2>

                {recentDocs.length === 0 ? (
                  <p className="text-sm text-gray-500">No documents yet</p>
                ) : (
                  <div className="space-y-2">
                    {recentDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className={`p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition group ${
                          documentId === doc.id
                            ? "bg-purple-50 border border-purple-200"
                            : ""
                        }`}
                      >
                        <div
                          onClick={() => openDocument(doc.id, doc.name)}
                          className="flex-1"
                        >
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {doc.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(doc.modifiedTime).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openInNewTab(doc.id);
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Open in new tab"
                          >
                            <ExternalLink size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDocument(doc.id, doc.name);
                            }}
                            className="p-1 hover:bg-red-100 text-red-600 rounded"
                            title="Delete"
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

            {/* Google Docs Iframe */}
            <div className="flex-1 p-6">
              {!isSignedIn ? (
                <div className="h-full flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="text-center">
                    <FileText
                      size={64}
                      className="mx-auto text-gray-300 mb-4"
                    />
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                      Welcome to Google Docs Editor
                    </h2>
                    <p className="text-gray-500 mb-6">
                      Sign in with your Google account to start creating and
                      editing documents
                    </p>
                    <button
                      onClick={handleSignIn}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
                    >
                      <LogIn size={20} />
                      Sign in with Google
                    </button>
                  </div>
                </div>
              ) : !documentId ? (
                <div className="h-full flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="text-center">
                    <FileText
                      size={64}
                      className="mx-auto text-gray-300 mb-4"
                    />
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                      No Document Open
                    </h2>
                    <p className="text-gray-500 mb-6">
                      Create a new document or open an existing one from the
                      sidebar
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={createNewDoc}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                      >
                        <Plus size={20} />
                        Create New Document
                      </button>
                      <button
                        onClick={handleOpenByID}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
                      >
                        <FolderOpen size={20} />
                        Open by ID
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                  <iframe
                    src={`https://docs.google.com/document/d/${documentId}/edit?embedded=true`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    className="w-full h-full"
                    title="Google Docs Editor"
                  />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Document?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "
              <strong>{deleteConfirm.docName}</strong>"? This action cannot be
              undone.
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