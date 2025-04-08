// Test script for client-compatible SEO analyzer
const path = require('path');
const { analyzeSeo } = require(path.join(__dirname, '../src/lib/client-seo-analyzer'));

// Sample URLs to test
const urls = [
  'example.com',
  'https://www.example.com',
  'http://example.com/blog/post/123?utm_source=twitter',
  'https://subdomain.example.com/index.html#section',
  'www.example.com/blog/category/technology/article.html',
];

// Run the tests
function runTests() {
  console.log('Testing Client-Compatible SEO Analyzer');
  console.log('======================================\n');
  
  urls.forEach((url, index) => {
    try {
      console.log(`Test ${index + 1}: ${url}`);
      console.log('-------------------');
      
      const result = analyzeSeo(url);
      
      // Log the URL analysis
      console.log('URL Analysis:');
      console.log(`  Protocol: ${result.technicalAnalysis.httpsProtocol ? 'HTTPS' : 'HTTP'}`);
      console.log(`  Domain Structure: ${result.technicalAnalysis.domainStructure}`);
      console.log(`  WWW Prefix: ${result.technicalAnalysis.domainHasWww ? 'Yes' : 'No'}`);
      console.log(`  Path Depth: ${result.technicalAnalysis.pathDepth}`);
      console.log(`  Query Parameters: ${result.technicalAnalysis.hasQueryParams ? 'Yes' : 'No'}`);
      console.log(`  Fragment: ${result.technicalAnalysis.hasFragment ? 'Yes' : 'No'}`);
      
      // Log the scores
      console.log('\nScores:');
      console.log(`  Technical Score: ${result.scores.technicalScore}`);
      console.log(`  Meta Score: ${result.scores.metaScore}`);
      console.log(`  Content Score: ${result.scores.contentScore}`);
      console.log(`  Overall Score: ${result.scores.overallScore}`);
      
      // Log the first 3 recommendations
      console.log('\nTop 3 Recommendations:');
      result.recommendations.slice(0, 3).forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
      
      console.log('\n');
    } catch (error) {
      console.error(`Error analyzing ${url}:`, error.message);
      console.log('\n');
    }
  });
  
  console.log('Tests completed!');
}

runTests(); 