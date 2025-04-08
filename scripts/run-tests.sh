#!/bin/bash

# Script to run all tests
echo "===== Running SEO Report Tests ====="

# Test SEO Analyzer
echo -e "\n\n===== Testing SEO Analyzer ====="
node scripts/test-analyzer.js

# Test PDF Generation
echo -e "\n\n===== Testing PDF Generation ====="
node scripts/test-pdf.js

# Test Email Sending
echo -e "\n\n===== Testing Email Sending ====="
node scripts/test-email.js

echo -e "\n\n===== All Tests Completed =====" 