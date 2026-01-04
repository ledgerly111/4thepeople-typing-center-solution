import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Shield, Upload, FileCheck, AlertTriangle, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { detectDocumentFraud, extractAndValidateData, checkCompliance } from '../services/geminiAI_verification';
import { fileToBase64 } from '../services/geminiAI';

const AIDocumentVerification = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [documentType, setDocumentType] = useState('emirates_id');
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeFeature, setActiveFeature] = useState(null);
    const [results, setResults] = useState(null);

    // Handle file upload
    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        setSelectedFile(file);
        setImagePreview(URL.createObjectURL(file));
        setResults(null); // Clear previous results
    };

    // Process document with selected AI feature
    const processDocument = async (feature) => {
        if (!selectedFile) {
            alert('Please upload a document first');
            return;
        }

        setIsProcessing(true);
        setActiveFeature(feature);
        setResults(null);

        try {
            // Convert file to base64
            // fileToBase64 returns {base64, mimeType} where base64 is already stripped of prefix
            const { base64: base64Data } = await fileToBase64(selectedFile);

            let result;
            switch (feature) {
                case 'fraud':
                    result = await detectDocumentFraud(base64Data, selectedFile.type);
                    break;
                case 'extract':
                    result = await extractAndValidateData(base64Data, documentType, selectedFile.type);
                    break;
                case 'compliance':
                    result = await checkCompliance(base64Data, documentType, selectedFile.type);
                    break;
                default:
                    throw new Error('Invalid feature');
            }

            setResults(result);
        } catch (error) {
            console.error('Processing error:', error);
            alert(`Failed to process document: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    // Clear all data
    const clearData = () => {
        setSelectedFile(null);
        setImagePreview(null);
        setResults(null);
        setActiveFeature(null);
    };

    return (
        <div style={{ padding: '1rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>AI Document Verification</h2>
                <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Verify documents before government submission. All processing done locally - no documents saved.
                </p>
            </div>

            {/* Upload Section */}
            <Card style={{ marginBottom: '1rem' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>1. Upload Document</h3>

                {!imagePreview ? (
                    <label style={{
                        display: 'block',
                        padding: '3rem 1rem',
                        border: '2px dashed var(--border)',
                        borderRadius: '8px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: 'var(--bg-accent)',
                        transition: 'all 0.2s'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                        <Upload size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                        <p style={{ margin: '0 0 0.5rem', fontWeight: '600' }}>Click to upload document image</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Supports JPG, PNG (max 5MB)
                        </p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </label>
                ) : (
                    <div>
                        <img
                            src={imagePreview}
                            alt="Document preview"
                            style={{
                                width: '100%',
                                maxHeight: '400px',
                                objectFit: 'contain',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                marginBottom: '1rem'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <Button variant="secondary" onClick={clearData}>
                                <Trash2 size={16} />
                                Clear
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Action Buttons */}
            {imagePreview && (
                <Card style={{ marginBottom: '1rem' }}>
                    <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>2. Select Verification Type</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
                        <button
                            onClick={() => processDocument('fraud')}
                            disabled={isProcessing}
                            style={{
                                padding: '1rem',
                                border: '2px solid var(--border)',
                                borderRadius: '8px',
                                background: activeFeature === 'fraud' ? 'var(--accent-light)' : 'var(--bg-card)',
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Shield size={20} style={{ color: '#ef4444' }} />
                                <span style={{ fontWeight: '600' }}>Fraud Detection</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Detect forged or manipulated documents
                            </p>
                        </button>

                        <button
                            onClick={() => processDocument('extract')}
                            disabled={isProcessing}
                            style={{
                                padding: '1rem',
                                border: '2px solid var(--border)',
                                borderRadius: '8px',
                                background: activeFeature === 'extract' ? 'var(--accent-light)' : 'var(--bg-card)',
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <FileCheck size={20} style={{ color: '#3b82f6' }} />
                                <span style={{ fontWeight: '600' }}>Data Extraction</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Extract and validate all document data
                            </p>
                        </button>

                        <button
                            onClick={() => processDocument('compliance')}
                            disabled={isProcessing}
                            style={{
                                padding: '1rem',
                                border: '2px solid var(--border)',
                                borderRadius: '8px',
                                background: activeFeature === 'compliance' ? 'var(--accent-light)' : 'var(--bg-card)',
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <CheckCircle size={20} style={{ color: '#22c55e' }} />
                                <span style={{ fontWeight: '600' }}>Compliance Check</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Verify ICP/GDRFA submission requirements
                            </p>
                        </button>
                    </div>

                    {isProcessing && (
                        <div style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            background: 'var(--bg-accent)',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            <div className="spinner" style={{
                                width: '24px',
                                height: '24px',
                                border: '3px solid var(--border)',
                                borderTop: '3px solid var(--accent)',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto 0.5rem'
                            }} />
                            <p style={{ margin: 0, fontSize: '0.875rem' }}>Analyzing document with AI...</p>
                        </div>
                    )}
                </Card>
            )}

            {/* Results Display */}
            {results && !isProcessing && (
                <Card>
                    <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>3. Verification Results</h3>

                    {/* Fraud Detection Results */}
                    {activeFeature === 'fraud' && (
                        <div>
                            <div style={{
                                padding: '1rem',
                                background: results.isFraudulent ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                border: `2px solid ${results.isFraudulent ? '#ef4444' : '#22c55e'}`,
                                borderRadius: '8px',
                                marginBottom: '1rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    {results.isFraudulent ? (
                                        <XCircle size={24} style={{ color: '#ef4444' }} />
                                    ) : (
                                        <CheckCircle size={24} style={{ color: '#22c55e' }} />
                                    )}
                                    <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                                        {results.isFraudulent ? 'Potential Fraud Detected' : 'No Fraud Detected'}
                                    </span>
                                </div>
                                <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                                    Risk Level: <strong style={{ textTransform: 'uppercase' }}>{results.riskLevel}</strong>
                                </p>
                                <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                                    Confidence: <strong>{(results.confidence * 100).toFixed(1)}%</strong>
                                </p>
                            </div>

                            {results.indicators && results.indicators.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>Fraud Indicators:</h4>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                        {results.indicators.map((indicator, i) => (
                                            <li key={i} style={{ marginBottom: '0.25rem', fontSize: '0.875rem' }}>{indicator}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {results.recommendations && results.recommendations.length > 0 && (
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>Recommendations:</h4>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                        {results.recommendations.map((rec, i) => (
                                            <li key={i} style={{ marginBottom: '0.25rem', fontSize: '0.875rem' }}>{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Data Extraction Results */}
                    {activeFeature === 'extract' && (
                        <div>
                            <div style={{ marginBottom: '1rem' }}>
                                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>Extracted Data:</h4>
                                <div style={{
                                    padding: '0.75rem',
                                    background: 'var(--bg-accent)',
                                    borderRadius: '8px',
                                    fontFamily: 'monospace',
                                    fontSize: '0.8rem'
                                }}>
                                    {Object.entries(results.data || {}).map(([key, value]) => (
                                        <div key={key} style={{ marginBottom: '0.25rem' }}>
                                            <strong>{key}:</strong> {value || 'N/A'}
                                        </div>
                                    ))}
                                </div>
                                <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem' }}>
                                    Confidence: <strong>{(results.confidence * 100).toFixed(1)}%</strong>
                                </p>
                            </div>

                            {results.validationErrors && results.validationErrors.length > 0 && (
                                <div style={{
                                    padding: '0.75rem',
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    border: '1px solid var(--warning)',
                                    borderRadius: '8px',
                                    marginBottom: '1rem'
                                }}>
                                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--warning)' }}>
                                        <AlertTriangle size={16} style={{ marginRight: '0.25rem' }} />
                                        Validation Errors:
                                    </h4>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                        {results.validationErrors.map((error, i) => (
                                            <li key={i} style={{ marginBottom: '0.25rem', fontSize: '0.875rem' }}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {results.missingFields && results.missingFields.length > 0 && (
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>Missing Fields:</h4>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                        {results.missingFields.map((field, i) => (
                                            <li key={i} style={{ marginBottom: '0.25rem', fontSize: '0.875rem' }}>{field}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Compliance Check Results */}
                    {activeFeature === 'compliance' && (
                        <div>
                            <div style={{
                                padding: '1rem',
                                background: results.isCompliant ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                border: `2px solid ${results.isCompliant ? '#22c55e' : '#ef4444'}`,
                                borderRadius: '8px',
                                marginBottom: '1rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    {results.isCompliant ? (
                                        <CheckCircle size={24} style={{ color: '#22c55e' }} />
                                    ) : (
                                        <XCircle size={24} style={{ color: '#ef4444' }} />
                                    )}
                                    <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                                        {results.isCompliant ? 'Document is Compliant' : 'Compliance Issues Found'}
                                    </span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.875rem' }}>
                                    Overall Score: <strong>{(results.overallScore * 100).toFixed(1)}%</strong>
                                </p>
                            </div>

                            {results.issues && results.issues.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--danger)' }}>Issues:</h4>
                                    < ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                        {results.issues.map((issue, i) => (
                                            <li key={i} style={{ marginBottom: '0.25rem', fontSize: '0.875rem', color: 'var(--danger)' }}>{issue}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {results.warnings && results.warnings.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--warning)' }}>Warnings:</h4>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                        {results.warnings.map((warning, i) => (
                                            <li key={i} style={{ marginBottom: '0.25rem', fontSize: '0.875rem', color: 'var(--warning)' }}>{warning}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {results.recommendations && results.recommendations.length > 0 && (
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>How to Fix:</h4>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                        {results.recommendations.map((rec, i) => (
                                            <li key={i} style={{ marginBottom: '0.25rem', fontSize: '0.875rem' }}>{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            )}

            {/* Privacy Notice */}
            <div style={{
                marginTop: '1.5rem',
                padding: '0.75rem',
                background: 'var(--bg-accent)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                textAlign: 'center'
            }}>
                🔒 <strong>Privacy Protected:</strong> All documents are processed locally in your browser.
                Nothing is saved to our servers or database.
            </div>
        </div>
    );
};

export default AIDocumentVerification;
