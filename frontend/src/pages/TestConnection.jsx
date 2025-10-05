/**
 * Test Connection Component
 * 
 * This component provides a UI to test the connection between
 * frontend and backend API. It displays test results and allows
 * you to verify all API endpoints are working correctly.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Loader, 
  AlertCircle,
  RefreshCw,
  Server,
  Database,
  Code
} from 'lucide-react';
import {
  checkApiHealth,
  getApiInfo,
  searchLiterature,
  checkPlagiarism,
  getErrorMessage
} from '../api';

export default function TestConnection() {
  const [healthStatus, setHealthStatus] = useState({
    status: 'idle', // idle, loading, success, error
    data: null,
    error: null,
  });
  
  const [apiInfo, setApiInfo] = useState({
    status: 'idle',
    data: null,
    error: null,
  });
  
  const [searchTest, setSearchTest] = useState({
    status: 'idle',
    data: null,
    error: null,
  });
  
  const [plagiarismTest, setPlagiarismTest] = useState({
    status: 'idle',
    data: null,
    error: null,
  });

  /**
   * Test health check endpoint
   */
  const testHealthCheck = async () => {
    setHealthStatus({ status: 'loading', data: null, error: null });
    
    try {
      const isHealthy = await checkApiHealth();
      setHealthStatus({ 
        status: 'success', 
        data: { healthy: isHealthy }, 
        error: null 
      });
    } catch (error) {
      setHealthStatus({ 
        status: 'error', 
        data: null, 
        error: getErrorMessage(error) 
      });
    }
  };

  /**
   * Test API info endpoint
   */
  const testApiInfo = async () => {
    setApiInfo({ status: 'loading', data: null, error: null });
    
    try {
      const info = await getApiInfo();
      setApiInfo({ status: 'success', data: info, error: null });
    } catch (error) {
      setApiInfo({ 
        status: 'error', 
        data: null, 
        error: getErrorMessage(error) 
      });
    }
  };

  /**
   * Test literature search endpoint
   */
  const testSearch = async () => {
    setSearchTest({ status: 'loading', data: null, error: null });
    
    try {
      const result = await searchLiterature({
        keyword: 'machine learning',
        limit: 5,
        source: 'crossref'
      });
      setSearchTest({ status: 'success', data: result, error: null });
    } catch (error) {
      setSearchTest({ 
        status: 'error', 
        data: null, 
        error: getErrorMessage(error) 
      });
    }
  };

  /**
   * Test plagiarism check endpoint
   */
  const testPlagiarism = async () => {
    setPlagiarismTest({ status: 'loading', data: null, error: null });
    
    try {
      const result = await checkPlagiarism({
        text: 'This is a sample text for testing plagiarism detection.',
        reference_texts: [
          'This is a sample text for testing plagiarism detection system.',
          'Completely different text about something else.'
        ],
        method: 'tfidf',
        threshold: 0.7
      });
      setPlagiarismTest({ status: 'success', data: result, error: null });
    } catch (error) {
      setPlagiarismTest({ 
        status: 'error', 
        data: null, 
        error: getErrorMessage(error) 
      });
    }
  };

  /**
   * Run all tests
   */
  const runAllTests = async () => {
    await testHealthCheck();
    await testApiInfo();
    await testSearch();
    await testPlagiarism();
  };

  /**
   * Auto-run health check on mount
   */
  useEffect(() => {
    testHealthCheck();
    testApiInfo();
  }, []);

  /**
   * Render status indicator
   */
  const StatusIndicator = ({ status }) => {
    switch (status) {
      case 'loading':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  /**
   * Render test card
   */
  const TestCard = ({ title, description, status, data, error, onTest, icon: Icon }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-purple-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <StatusIndicator status={status} />
      </div>

      <button
        onClick={onTest}
        disabled={status === 'loading'}
        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
      >
        {status === 'loading' ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Testing...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            Run Test
          </>
        )}
      </button>

      {/* Results Section */}
      {(data || error) && (
        <div className="mt-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700 font-medium">Error:</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {data && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700 font-medium mb-2">Success:</p>
              <pre className="text-xs text-gray-700 overflow-x-auto max-h-40 overflow-y-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                API Connection Test
              </h1>
              <p className="text-gray-600">
                Test the connection between frontend and backend API
              </p>
            </div>
            <button
              onClick={runAllTests}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Run All Tests
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Server className="w-6 h-6 text-purple-600" />
            Connection Status
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Backend URL</p>
              <p className="font-mono text-sm text-purple-700">
                {process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Health Status</p>
              <p className="font-semibold text-lg">
                {healthStatus.status === 'success' ? (
                  <span className="text-green-600">✓ Healthy</span>
                ) : healthStatus.status === 'error' ? (
                  <span className="text-red-600">✗ Unhealthy</span>
                ) : (
                  <span className="text-gray-400">Unknown</span>
                )}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">API Version</p>
              <p className="font-semibold text-lg text-gray-800">
                {apiInfo.data?.version || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Test Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TestCard
            title="Health Check"
            description="Test if backend API is running"
            status={healthStatus.status}
            data={healthStatus.data}
            error={healthStatus.error}
            onTest={testHealthCheck}
            icon={Server}
          />

          <TestCard
            title="API Information"
            description="Fetch API metadata and endpoints"
            status={apiInfo.status}
            data={apiInfo.data}
            error={apiInfo.error}
            onTest={testApiInfo}
            icon={Code}
          />

          <TestCard
            title="Literature Search"
            description="Test searching for papers"
            status={searchTest.status}
            data={searchTest.data}
            error={searchTest.error}
            onTest={testSearch}
            icon={Database}
          />

          <TestCard
            title="Plagiarism Check"
            description="Test plagiarism detection"
            status={plagiarismTest.status}
            data={plagiarismTest.data}
            error={plagiarismTest.error}
            onTest={testPlagiarism}
            icon={AlertCircle}
          />
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Instructions
          </h2>
          <ol className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-bold text-purple-600">1.</span>
              <span>Make sure your backend server is running on port 8000</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-purple-600">2.</span>
              <span>Click "Run All Tests" or test individual endpoints</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-purple-600">3.</span>
              <span>Check the results - green means success, red means error</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-purple-600">4.</span>
              <span>If tests fail, check console for detailed error messages</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}