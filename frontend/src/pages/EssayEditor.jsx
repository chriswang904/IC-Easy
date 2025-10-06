import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  FolderOpen,
  Home,
  FileText,
  Settings,
  HelpCircle,
  LogIn,
  LogOut,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

// Google API Configuration
const CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  "YOUR_CLIENT_ID.apps.googleusercontent.com";
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY || "YOUR_API_KEY";
const SCOPES =
  "https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file";

function EssayEditor() {
  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [documentId, setDocumentId] = useState(null);
  const [gapiReady, setGapiReady] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [tokenClient, setTokenClient] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [documentTitle, setDocumentTitle] = useState("New Document");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Initialize Google Identity Services
  useEffect(() => {
    console.log("Starting Google API initialization...");

    const initGapi = () => {
      window.gapi.load("client", async () => {
        try {
          // Initialize without discoveryDocs first
          await window.gapi.client.init({
            apiKey: API_KEY,
          });

          console.log("GAPI client initialized with API key");

          // Load APIs one by one with error handling
          try {
            await window.gapi.client.load(
              "https://docs.googleapis.com/$discovery/rest?version=v1"
            );
            console.log("Docs API loaded");
          } catch (error) {
            console.error("Error loading Docs API:", error);
          }

          try {
            await window.gapi.client.load(
              "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
            );
            console.log("Drive API loaded");
          } catch (error) {
            console.error("Error loading Drive API:", error);
          }

          console.log("GAPI client fully initialized");
          setGapiReady(true);
        } catch (error) {
          console.error("Error initializing GAPI client:", error);
          console.error("Error details:", JSON.stringify(error, null, 2));
          setGapiReady(true); // Set to true anyway to allow sign-in attempt
        }
      });
    };

    const initGIS = () => {
      if (window.google) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (response) => {
            if (response.error) {
              console.error("Token error:", response);
              alert(`Authentication failed: ${response.error}`);
              return;
            }
            console.log("Access token received");
            setAccessToken(response.access_token);
            setIsSignedIn(true);
          },
        });
        setTokenClient(client);
        console.log("GIS initialized");
      }
    };

    const gapiScript = document.createElement("script");
    gapiScript.src = "https://apis.google.com/js/api.js";
    gapiScript.onload = initGapi;
    document.body.appendChild(gapiScript);

    const gisScript = document.createElement("script");
    gisScript.src = "https://accounts.google.com/gsi/client";
    gisScript.onload = initGIS;
    document.body.appendChild(gisScript);

    return () => {
      if (document.body.contains(gapiScript)) {
        document.body.removeChild(gapiScript);
      }
      if (document.body.contains(gisScript)) {
        document.body.removeChild(gisScript);
      }
    };
  }, []);

  useEffect(() => {
    if (accessToken && gapiReady) {
      window.gapi.client.setToken({ access_token: accessToken });
      loadRecentDocs();
    }
  }, [accessToken, gapiReady]);

  const handleSignIn = () => {
    console.log("Sign in clicked");
    console.log("gapiReady:", gapiReady);
    console.log("tokenClient:", tokenClient);

    if (!gapiReady || !tokenClient) {
      alert("Google API is still loading. Please wait a moment and try again.");
      return;
    }

    try {
      tokenClient.requestAccessToken();
    } catch (error) {
      console.error("Error requesting token:", error);
      alert(`Sign in error: ${error.message}`);
    }
  };

  const handleSignOut = () => {
    if (accessToken) {
      window.google.accounts.oauth2.revoke(accessToken, () => {
        console.log("Token revoked");
      });
      setAccessToken(null);
      setIsSignedIn(false);
      setDocumentId(null);
      setRecentDocs([]);
      window.gapi.client.setToken(null);
    }
  };

  // Load recent Google Docs
  const loadRecentDocs = async () => {
    try {
      const response = await window.gapi.client.drive.files.list({
        pageSize: 10,
        fields: "files(id, name, modifiedTime, webViewLink)",
        q: "mimeType='application/vnd.google-apps.document' and trashed=false",
        orderBy: "modifiedTime desc",
      });

      setRecentDocs(response.result.files || []);
      console.log("Loaded recent docs:", response.result.files);
    } catch (error) {
      console.error("Error loading recent docs:", error);
    }
  };

  // Create a new Google Doc
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
      loadRecentDocs();
      console.log("Created new document:", newDocId);
      alert(`Document created! Opening in editor...`);
    } catch (error) {
      console.error("Error creating document:", error);
      alert("Failed to create document. Make sure you're signed in.");
    }
  };

  // Open existing document
  const openDocument = (docId, docName) => {
    setDocumentId(docId);
    setDocumentTitle(docName);
  };

  // Open document by ID
  const handleOpenByID = () => {
    const docId = prompt("Enter Google Doc ID:");
    if (docId) {
      setDocumentId(docId);
      setDocumentTitle("Document");
    }
  };

  // Delete document
  const deleteDocument = async (docId, docName) => {
    setDeleteConfirm({ docId, docName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await window.gapi.client.drive.files.delete({
        fileId: deleteConfirm.docId,
      });

      alert("Document deleted!");
      loadRecentDocs();

      if (documentId === deleteConfirm.docId) {
        setDocumentId(null);
      }

      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document");
      setDeleteConfirm(null);
    }
  };

  // Open in new tab
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
                {!isSignedIn ? (
                  <button
                    onClick={handleSignIn}
                    disabled={!gapiReady || !tokenClient}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <LogIn size={18} />
                    Sign in with Google
                  </button>
                ) : (
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
                      disabled={!gapiReady || !tokenClient}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto disabled:opacity-50"
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
