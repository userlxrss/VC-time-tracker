/**
 * Export Modal Component
 *
 * Professional export functionality with multiple formats (CSV, Excel, PDF),
 * progress tracking, and customizable export options.
 */

import React, { useState } from 'react';

interface ExportModalProps {
  onClose: () => void;
  onExport: (format: 'csv' | 'excel' | 'pdf') => Promise<void>;
  progress: number;
  entriesCount: number;
}

/**
 * Export format card component
 */
const ExportFormatCard: React.FC<{
  format: 'csv' | 'excel' | 'pdf';
  title: string;
  description: string;
  features: string[];
  icon: string;
  isSelected: boolean;
  onSelect: () => void;
  isDisabled: boolean;
}> = ({ format, title, description, features, icon, isSelected, onSelect, isDisabled }) => {
  return (
    <div
      onClick={() => !isDisabled && onSelect()}
      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isDisabled
          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
          : isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>

          <div className="mt-3 space-y-1">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-green-600 text-xs">✓</span>
                <span className="text-xs text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {isSelected && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Progress bar component
 */
const ProgressBar: React.FC<{ progress: number; label: string }> = ({ progress, label }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-900 font-medium">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Main Export Modal Component
 */
export const ExportModal: React.FC<ExportModalProps> = ({
  onClose,
  onExport,
  progress,
  entriesCount
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [includeBreaks, setIncludeBreaks] = useState(true);
  const [includeAnalytics, setIncludeAnalytics] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
    {
      format: 'csv' as const,
      title: 'CSV',
      description: 'Comma-separated values for data analysis',
      features: [
        'All time entries',
        'Break details',
        'Basic analytics',
        'Compatible with Excel, Google Sheets'
      ],
      icon: '📊'
    },
    {
      format: 'excel' as const,
      title: 'Excel Workbook',
      description: 'Multi-sheet professional Excel report',
      features: [
        'Summary sheet',
        'Detailed time entries',
        'Analytics & charts',
        'Formatted for printing',
        'Pivot tables ready'
      ],
      icon: '📈'
    },
    {
      format: 'pdf' as const,
      title: 'PDF Report',
      description: 'Professional document for sharing',
      features: [
        'Professional layout',
        'Charts & graphs',
        'Print-ready format',
        'Company branding',
        'Executive summary'
      ],
      icon: '📄'
    }
  ];

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      await onExport(selectedFormat);
    } finally {
      setIsExporting(false);
    }
  };

  const getExportProgressLabel = () => {
    if (progress < 30) return 'Preparing data...';
    if (progress < 60) return 'Processing entries...';
    if (progress < 90) return 'Generating report...';
    return 'Finalizing export...';
  };

  const getFilenamePreview = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    return `timesheet_${dateStr}.${selectedFormat}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Export Timesheet</h2>
            <p className="text-gray-600 mt-1">
              {entriesCount} time entries ready for export
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isExporting}
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h3>
            <div className="space-y-3">
              {exportFormats.map(format => (
                <ExportFormatCard
                  key={format.format}
                  format={format.format}
                  title={format.title}
                  description={format.description}
                  features={format.features}
                  icon={format.icon}
                  isSelected={selectedFormat === format.format}
                  onSelect={() => setSelectedFormat(format.format)}
                  isDisabled={isExporting}
                />
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeBreaks}
                  onChange={(e) => setIncludeBreaks(e.target.checked)}
                  disabled={isExporting}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Include Break Details</span>
                  <p className="text-xs text-gray-600">Export all break periods and durations</p>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeAnalytics}
                  onChange={(e) => setIncludeAnalytics(e.target.checked)}
                  disabled={isExporting}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Include Analytics</span>
                  <p className="text-xs text-gray-600">Add summary statistics and insights</p>
                </div>
              </label>

              {selectedFormat === 'excel' && (
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={includeCharts}
                    onChange={(e) => setIncludeCharts(e.target.checked)}
                    disabled={isExporting}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Include Charts</span>
                    <p className="text-xs text-gray-600">Add visual charts and graphs</p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* File Preview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Preview</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">📁</span>
                <span className="text-sm font-medium text-gray-900">{getFilenamePreview()}</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                The file will be downloaded to your default download location
              </p>
            </div>
          </div>

          {/* Progress */}
          {isExporting && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Progress</h3>
              <ProgressBar
                progress={progress}
                label={getExportProgressLabel()}
              />
            </div>
          )}

          {/* Export Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Export Tips</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• CSV format is best for data analysis and importing into other systems</li>
              <li>• Excel format includes multiple sheets with detailed breakdowns</li>
              <li>• PDF format is ideal for sharing and printing professional reports</li>
              <li>• All exports are optimized for Manila Time (UTC+8) timezone</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting || progress > 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <span>📥</span>
                <span>Export {selectedFormat.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};