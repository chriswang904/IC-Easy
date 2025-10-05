/**
 * API Connection Test Script
 * 
 * Run this script to test backend API connectivity
 * Usage: node scripts/test-api.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
const TIMEOUT = 10000;

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Print colored message
 */
function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Print test result
 */
function printResult(testName, success, data = null, error = null) {
  const status = success ? '✓' : '✗';
  const statusColor = success ? 'green' : 'red';
  
  print(`${status} ${testName}`, statusColor);
  
  if (success && data) {
    console.log(`  → ${JSON.stringify(data).substring(0, 100)}...`);
  }
  
  if (error) {
    print(`  → Error: ${error}`, 'red');
  }
  
  console.log('');
}

/**
 * Test 1: Health Check
 */
async function testHealthCheck() {
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: TIMEOUT });
    printResult('Health Check', true, response.data);
    return true;
  } catch (error) {
    printResult('Health Check', false, null, error.message);
    return false;
  }
}

/**
 * Test 2: API Information
 */
async function testApiInfo() {
  try {
    const response = await axios.get(`${BASE_URL}/`, { timeout: TIMEOUT });
    printResult('API Information', true, response.data);
    return true;
  } catch (error) {
    printResult('API Information', false, null, error.message);
    return false;
  }
}

/**
 * Test 3: Literature Search
 */
async function testLiteratureSearch() {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/literature/search`,
      {
        keyword: 'machine learning',
        limit: 5,
        source: 'crossref',
      },
      { timeout: TIMEOUT }
    );
    printResult('Literature Search', true, response.data);
    return true;
  } catch (error) {
    printResult('Literature Search', false, null, error.message);
    return false;
  }
}

/**
 * Test 4: Plagiarism Check
 */
async function testPlagiarismCheck() {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/plagiarism/check`,
      {
        text: 'This is a test text for plagiarism detection.',
        reference_texts: ['This is a test text for detection.'],
        method: 'tfidf',
        threshold: 0.7,
      },
      { timeout: TIMEOUT }
    );
    printResult('Plagiarism Check', true, response.data);
    return true;
  } catch (error) {
    printResult('Plagiarism Check', false, null, error.message);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  print('\n========================================', 'cyan');
  print('  API Connection Tests', 'cyan');
  print('========================================\n', 'cyan');
  
  print(`Testing backend at: ${BASE_URL}`, 'blue');
  print(`Timeout: ${TIMEOUT}ms\n`, 'blue');
  
  const results = {
    healthCheck: false,
    apiInfo: false,
    literatureSearch: false,
    plagiarismCheck: false,
  };
  
  // Run tests sequentially
  results.healthCheck = await testHealthCheck();
  results.apiInfo = await testApiInfo();
  results.literatureSearch = await testLiteratureSearch();
  results.plagiarismCheck = await testPlagiarismCheck();
  
  // Summary
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  print('========================================', 'cyan');
  print(`  Summary: ${passed}/${total} tests passed`, 'cyan');
  print('========================================\n', 'cyan');
  
  if (passed === total) {
    print('✓ All tests passed! Frontend-backend connection is working.', 'green');
    process.exit(0);
  } else {
    print('✗ Some tests failed. Please check the errors above.', 'red');
    print('\nTroubleshooting:', 'yellow');
    print('1. Make sure backend is running: python main.py', 'yellow');
    print('2. Check backend is on port 8000', 'yellow');
    print('3. Verify CORS settings in backend .env', 'yellow');
    print('4. Check backend logs for errors\n', 'yellow');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  print('\n✗ Fatal error during tests:', 'red');
  console.error(error);
  process.exit(1);
});