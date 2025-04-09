'use client';

import { useState, useEffect } from 'react';
import { LeadWithReports, getAllLeadsWithReports } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function AdminDashboard() {
  const [leadsWithReports, setLeadsWithReports] = useState<LeadWithReports[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeadsWithReports = async () => {
      try {
        setLoading(true);
        const data = await getAllLeadsWithReports();
        setLeadsWithReports(data);
        // Select the first lead by default if available
        if (data && data.length > 0 && data[0].id) {
          setSelectedLead(data[0].id);
        }
      } catch (err) {
        setError('Failed to load leads and reports');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadsWithReports();
  }, []);

  // Find the selected lead's reports
  const selectedLeadData = leadsWithReports?.find(lead => lead.id === selectedLead);

  if (loading) {
    return <div className="p-6 text-center">Loading lead and report data...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (!leadsWithReports || leadsWithReports.length === 0) {
    return <div className="p-6 text-center">No SEO reports have been generated yet.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">SEO Report Dashboard</h1>
      
      <div className="mb-6 flex justify-between items-center">
        <div>
          <span className="text-gray-600">Total leads: {leadsWithReports.length}</span>
          <span className="mx-2">•</span>
          <span className="text-gray-600">Total reports: {leadsWithReports.reduce((acc, lead) => acc + lead.reports.length, 0)}</span>
        </div>
        <div>
          <Link href="/admin/setup-guide">
            <Button variant="outline" size="sm">Database Setup Guide</Button>
          </Link>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Lead List */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">Leads</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {leadsWithReports.map((lead) => (
                <div 
                  key={lead.id} 
                  className={`p-3 rounded-md cursor-pointer ${
                    selectedLead === lead.id ? 'bg-blue-100 border-l-4 border-blue-500' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedLead(lead.id || null)}
                >
                  <div className="font-medium">{lead.name}</div>
                  <div className="text-sm text-gray-600">{lead.email}</div>
                  <div className="text-sm text-gray-500 truncate">{lead.url}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(lead.created_at || '').toLocaleDateString()}
                    {' • '}
                    {lead.reports.length} report{lead.reports.length !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Report Details */}
        <div className="w-full lg:w-2/3">
          {selectedLeadData ? (
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">{selectedLeadData.name}'s Reports</h2>
                <p className="text-gray-600">{selectedLeadData.email}</p>
                <p className="text-gray-500">
                  <a href={selectedLeadData.url} target="_blank" rel="noopener noreferrer" className="underline">
                    {selectedLeadData.url}
                  </a>
                </p>
              </div>
              
              {selectedLeadData.reports.length === 0 ? (
                <div className="text-center py-6 text-gray-500">No reports generated for this lead yet.</div>
              ) : (
                <div className="space-y-4">
                  {selectedLeadData.reports.map((report) => (
                    <div key={report.id} className="border rounded-md p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium">Report for {report.url}</h3>
                          <p className="text-sm text-gray-500">
                            Generated on {new Date(report.created_at || '').toLocaleString()}
                          </p>
                        </div>
                        <Link href={`/admin/reports/${report.id}`}>
                          <Button variant="outline" size="sm">View Full Report</Button>
                        </Link>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="bg-gray-100 p-2 rounded text-center">
                          <div className="text-lg font-semibold">{report.scores.seo}</div>
                          <div className="text-xs">SEO</div>
                        </div>
                        <div className="bg-gray-100 p-2 rounded text-center">
                          <div className="text-lg font-semibold">{report.scores.performance}</div>
                          <div className="text-xs">Performance</div>
                        </div>
                        <div className="bg-gray-100 p-2 rounded text-center">
                          <div className="text-lg font-semibold">{report.scores.accessibility}</div>
                          <div className="text-xs">Accessibility</div>
                        </div>
                        <div className="bg-gray-100 p-2 rounded text-center">
                          <div className="text-lg font-semibold">{report.scores.bestPractices}</div>
                          <div className="text-xs">Best Practices</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Top Recommendations:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                          {report.recommendations.slice(0, 3).map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                          {report.recommendations.length > 3 && (
                            <li className="list-none text-blue-500">
                              <Link href={`/admin/reports/${report.id}`}>
                                + {report.recommendations.length - 3} more recommendations
                              </Link>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
              Select a lead to view their reports
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 