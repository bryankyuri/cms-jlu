import React, { useState } from 'react';

const ContactSubmissionModal = ({ submission, onClose, onUpdate }) => {
  const [status, setStatus] = useState(submission.status);
  const [adminNotes, setAdminNotes] = useState(submission.admin_notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(submission.id, {
        status,
        admin_notes: adminNotes
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-orange-100 text-orange-800',
      reviewed: 'bg-blue-100 text-blue-800',
      responded: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getFormTypeBadge = (formType) => {
    const typeColors = {
      career: 'bg-purple-100 text-purple-800',
      pitch: 'bg-indigo-100 text-indigo-800',
      produce: 'bg-teal-100 text-teal-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[formType] || 'bg-gray-100 text-gray-800'}`}>
        {formType}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Contact Submission Details</h3>
            <p className="text-sm text-gray-500">ID: {submission.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Submission Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Form Type</label>
                <div className="mt-1">
                  {getFormTypeBadge(submission.form_type)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{submission.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">
                  <a href={`mailto:${submission.email}`} className="text-indigo-600 hover:text-indigo-500">
                    {submission.email}
                  </a>
                </p>
              </div>

              {submission.company_name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <p className="mt-1 text-sm text-gray-900">{submission.company_name}</p>
                </div>
              )}

              {submission.subject && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <p className="mt-1 text-sm text-gray-900">{submission.subject}</p>
                </div>
              )}

              {submission.portfolio_link && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Portfolio Link</label>
                  <p className="mt-1 text-sm text-gray-900">
                    <a href={submission.portfolio_link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                      {submission.portfolio_link}
                    </a>
                  </p>
                </div>
              )}

              {submission.document_link && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Document Link</label>
                  <p className="mt-1 text-sm text-gray-900">
                    <a href={submission.document_link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                      {submission.document_link}
                    </a>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{submission.message}</p>
                </div>
              </div>
            </div>

            {/* Right Column - Management */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Status</label>
                <div className="mt-1">
                  {getStatusBadge(submission.status)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Update Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="responded">Responded</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Add internal notes about this submission..."
                />
              </div>

              <div className="space-y-2 text-sm text-gray-500">
                <div>
                  <span className="font-medium">Submitted:</span> {formatDate(submission.created_at)}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {formatDate(submission.updated_at)}
                </div>
                {submission.responded_at && (
                  <div>
                    <span className="font-medium">Responded:</span> {formatDate(submission.responded_at)}
                  </div>
                )}
                <div>
                  <span className="font-medium">IP Address:</span> {submission.ip_address}
                </div>
                {submission.user_agent && (
                  <div>
                    <span className="font-medium">User Agent:</span> 
                    <div className="text-xs mt-1 break-all">{submission.user_agent}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactSubmissionModal;