import React, { useRef, useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { DocumentUpload, PresetDemo } from '../../types';
import { SAMPLE_PRESETS } from '../../data/presets';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  Layers,
  AlertCircle,
  Image as ImageIcon,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface InputStageProps {
  userPrompt: string;
  setUserPrompt: (val: string) => void;
  documents: DocumentUpload[];
  onAddDocument: (file: File) => void;
  onRemoveDocument: (id: string) => void;
  selectedPresetId: string | null;
  onLoadPreset: (preset: PresetDemo) => void;
  onAdvance: () => void;
  isProcessing: boolean;
  errorMessage: string | null;
}

export const InputStage: React.FC<InputStageProps> = ({
  userPrompt,
  setUserPrompt,
  documents,
  onAddDocument,
  onRemoveDocument,
  selectedPresetId,
  onLoadPreset,
  onAdvance,
  isProcessing,
  errorMessage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'live' | 'presets'>(selectedPresetId ? 'presets' : 'live');
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach((file) => onAddDocument(file));
      setActiveTab('live');
      setValidationWarning(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      Array.from(e.dataTransfer.files).forEach((file) => onAddDocument(file));
      setActiveTab('live');
      setValidationWarning(null);
    }
  };

  const handleAnalyzeClick = () => {
    if (activeTab === 'live' && !selectedPresetId) {
      if (documents.length === 0) {
        setValidationWarning('Please attach at least one document (PDF, PNG, JPG, or scan) for live analysis.');
        return;
      }
      if (!userPrompt.trim()) {
        setValidationWarning('Please describe what you need or the civic program requested in your own words.');
        return;
      }
    }

    setValidationWarning(null);
    onAdvance();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e3e8ee] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#1f1f1f] tracking-tight flex items-center gap-2">
            <span>Stage 01: Paperwork &amp; Intent Ingestion</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5e5e5e] mt-0.5">
            Provide the documents you have. Describe your situation or program in natural language.
          </p>
        </div>

        <div className="flex items-center bg-[#f0f4f9] p-1 rounded-full border border-[#e3e8ee] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'live'
                ? 'bg-white text-[#0b57d0] shadow-sm'
                : 'text-[#5e5e5e] hover:text-[#1f1f1f]'
            }`}
          >
            Live Upload &amp; Prompt
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-white text-[#0b57d0] shadow-sm'
                : 'text-[#5e5e5e] hover:text-[#1f1f1f]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Benchmark Scenarios</span>
          </button>
        </div>
      </div>

      {/* Validation Warning Alert */}
      {(validationWarning || errorMessage) && (
        <div className="p-4 rounded-2xl bg-[#fce8e6] border border-[#f5c2cb] flex items-start space-x-3 text-[#c5221f] text-xs sm:text-sm shadow-sm">
          <AlertCircle className="w-5 h-5 text-[#c5221f] shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block mb-0.5">Action Needed:</span>
            <span>{validationWarning || errorMessage}</span>
          </div>
        </div>
      )}

      {/* DEMO / TEST SCENARIOS SECTION */}
      {activeTab === 'presets' && (
        <div className="bg-white border border-[#e3e8ee] rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#e3e8ee] pb-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#0b57d0]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#1f1f1f]">
                Pre-Loaded Benchmark Evaluation Scenarios
              </span>
            </div>
            <span className="text-xs text-[#5e5e5e]">
              Select a benchmark case study to test deterministic verification
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SAMPLE_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    onLoadPreset(preset);
                    setValidationWarning(null);
                  }}
                  className={`text-left p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-[#f0f7ff] border-[#0b57d0] shadow-sm text-[#1f1f1f] ring-2 ring-[#0b57d0]/20'
                      : 'bg-white border-[#e3e8ee] hover:border-[#c2e7ff] hover:bg-[#f8fafd] text-[#1f1f1f]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-bold text-sm text-[#1f1f1f] group-hover:text-[#0b57d0] leading-snug transition-colors">
                        {preset.title}
                      </span>
                    </div>
                    <Badge variant={isSelected ? 'info' : 'outline'} size="sm" className="mb-3">
                      {preset.category}
                    </Badge>
                    <p className="text-xs text-[#5e5e5e] line-clamp-3 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#e3e8ee] flex items-center justify-between text-xs">
                    <span className="text-[#5e5e5e] font-medium">{preset.sampleDocuments.length} sample docs</span>
                    {preset.expectedIssuesCount > 0 ? (
                      <span className="text-[#b06000] font-semibold flex items-center gap-1">
                        ● {preset.expectedIssuesCount} conflict to verify
                      </span>
                    ) : (
                      <span className="text-[#137333] font-semibold flex items-center gap-1">
                        ✓ Clean records
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedPresetId && (
            <div className="bg-[#fef7e0] border border-[#feefc3] p-4 rounded-2xl flex items-center justify-between text-xs text-[#b06000]">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#b06000] shrink-0" />
                <span>Active Scenario: <strong className="text-[#1f1f1f] font-semibold">{SAMPLE_PRESETS.find(p => p.id === selectedPresetId)?.title}</strong></span>
              </span>
              <Badge variant="warning" size="sm">Loaded</Badge>
            </div>
          )}
        </div>
      )}

      {/* TWO COLUMN INPUT: PROMPT & DOCUMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Natural Language Intent */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-6 flex flex-col h-full justify-between bg-white border-[#e3e8ee] shadow-sm rounded-3xl">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1f1f1f] flex items-center gap-1.5">
                  <span>Applicant Natural Language Request</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs text-[#5e5e5e] bg-[#f0f4f9] px-2.5 py-0.5 rounded-full border border-[#e3e8ee]">
                  {userPrompt.length} chars
                </span>
              </div>
              <p className="text-xs text-[#5e5e5e] mb-3.5 leading-relaxed">
                Describe the situation, what assistance is needed, and any context (such as address changes or recent claims).
              </p>
              <textarea
                rows={8}
                value={userPrompt}
                onChange={(e) => {
                  setUserPrompt(e.target.value);
                  setValidationWarning(null);
                }}
                placeholder="Example: I need help preparing an emergency relief grant application using these two documents. Please ensure my details are verified and any discrepancy is flagged."
                className="w-full bg-[#f8fafd] border border-[#e3e8ee] rounded-2xl p-4 text-xs sm:text-sm text-[#1f1f1f] placeholder-[#8e8e8e] focus:outline-none focus:ring-2 focus:ring-[#0b57d0]/30 focus:border-[#0b57d0] transition-all resize-none font-sans leading-relaxed"
              />
            </div>

            <div className="mt-4 pt-4 border-t border-[#e3e8ee] flex items-center justify-between text-xs text-[#5e5e5e]">
              <span className="flex items-center gap-1.5 font-medium text-[#0b57d0]">
                <Sparkles className="w-3.5 h-3.5 text-[#1a73e8]" />
                Gemini decomposes intent
              </span>
              <span className="text-[11px] text-[#8e8e8e]">Unstructured &rarr; Structured</span>
            </div>
          </Card>
        </div>

        {/* Right Column: Document Uploads & Previews */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-6 flex flex-col h-full justify-between bg-white border-[#e3e8ee] shadow-sm rounded-3xl">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1f1f1f] flex items-center gap-1.5">
                  <span>Supporting Messy Paperwork</span>
                  <span className="text-rose-500">*</span>
                </label>
                <Badge variant={documents.length > 0 ? 'success' : 'outline'} size="sm">
                  {documents.length} File{documents.length !== 1 ? 's' : ''} Attached
                </Badge>
              </div>
              <p className="text-xs text-[#5e5e5e] mb-3.5">
                Upload real-world scans, phone photos, utility statements, leases, or identity records.
              </p>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#c2e7ff] hover:border-[#0b57d0] bg-[#f8fafd] hover:bg-[#f0f7ff] rounded-2xl p-6 text-center cursor-pointer transition-all mb-4 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
                />
                <div className="flex flex-col items-center justify-center space-y-2.5">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#0b57d0] shadow-sm border border-[#e3e8ee] group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-xs sm:text-sm text-[#1f1f1f]">
                    <span className="font-semibold text-[#0b57d0]">Click to upload files</span> or drag &amp; drop
                  </div>
                  <p className="text-[11px] text-[#8e8e8e]">
                    PDF, PNG, JPG, JPEG, or Scans up to 25MB
                  </p>
                </div>
              </div>

              {/* Uploaded Documents List with Thumbnails & Previews */}
              {documents.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {documents.map((doc) => {
                    const isImage = doc.type.startsWith('image/') || doc.previewUrl;
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-[#f8fafd] border border-[#e3e8ee] text-xs hover:border-[#c2e7ff] transition-colors shadow-sm"
                      >
                        <div className="flex items-center space-x-3 truncate">
                          {doc.previewUrl ? (
                            <img
                              src={doc.previewUrl}
                              alt={doc.name}
                              className="w-10 h-10 rounded-xl object-cover border border-[#e3e8ee] shrink-0"
                            />
                          ) : isImage ? (
                            <div className="w-10 h-10 rounded-xl bg-[#f0f7ff] border border-[#d3e3fd] flex items-center justify-center text-[#0b57d0] shrink-0">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-[#f0f4f9] border border-[#e3e8ee] flex items-center justify-center text-[#5e5e5e] shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                          )}

                          <div className="truncate">
                            <p className="font-semibold text-[#1f1f1f] truncate">{doc.name}</p>
                            <div className="flex items-center space-x-2 text-[11px] text-[#5e5e5e]">
                              <span>{formatFileSize(doc.size)}</span>
                              {doc.extractedText && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[200px] text-[#8e8e8e] italic">{doc.extractedText}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveDocument(doc.id)}
                          className="p-2 hover:bg-[#fce8e6] text-[#8e8e8e] hover:text-[#c5221f] rounded-full transition-colors shrink-0 ml-2"
                          title="Remove document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-[#f8fafd] rounded-2xl border border-[#e3e8ee] text-center text-[#8e8e8e] text-xs">
                  No documents attached yet
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-[#e3e8ee] flex items-center justify-between text-xs text-[#5e5e5e]">
              <span className="flex items-center gap-1.5 font-medium text-[#137333]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#137333]" />
                Server-side multimodal ingestion
              </span>
              <span className="text-[11px] text-[#8e8e8e]">Zero Client Secrets</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Primary Action Bar */}
      <div className="p-5 rounded-3xl bg-white border border-[#e3e8ee] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-xs sm:text-sm text-[#444746]">
          <div className="w-9 h-9 rounded-full bg-[#f0f4f9] border border-[#d3e3fd] flex items-center justify-center text-[#0b57d0] shrink-0">
            <Sparkles className="w-4 h-4 text-[#1a73e8]" />
          </div>
          <div>
            <span className="font-semibold text-[#1f1f1f] block">Next: Multimodal Extraction &amp; Decomposition</span>
            <span className="text-xs text-[#5e5e5e]">
              Gemini extracts candidate evidence &rarr; CivicLens independently verifies every field.
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          loading={isProcessing}
          onClick={handleAnalyzeClick}
          icon={<Sparkles className="w-4 h-4" />}
          className="w-full sm:w-auto px-8 py-3 text-sm font-semibold shadow-sm"
        >
          <span>Analyze with CivicLens</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );
};
