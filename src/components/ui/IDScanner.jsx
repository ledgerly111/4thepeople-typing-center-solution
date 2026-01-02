import React, { useState, useRef } from 'react';
import { Camera, Upload, Scan, Check, AlertCircle, X, Loader2 } from 'lucide-react';
import { extractCustomerFromID, fileToBase64 } from '../../services/geminiAI';

const IDScanner = ({ onScanComplete, onClose }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        setError(null);
        setResult(null);

        // Create preview
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);

        // Process with AI
        setIsScanning(true);
        try {
            const { base64, mimeType } = await fileToBase64(file);
            const response = await extractCustomerFromID(base64, mimeType);

            if (response.success) {
                setResult(response.data);
            } else {
                setError(response.error || 'Failed to read document');
            }
        } catch (err) {
            setError(err.message || 'Failed to process image');
        } finally {
            setIsScanning(false);
        }
    };

    const handleConfirm = () => {
        if (result && onScanComplete) {
            onScanComplete({
                name: result.name || '',
                mobile: '',
                emirates_id: result.document_type === 'emirates_id' ? result.id_number : '',
                nationality: result.nationality || '',
                date_of_birth: result.date_of_birth || '',
                gender: result.gender || '',
                passport_number: result.document_type === 'passport' ? result.id_number : '',
                expiry_date: result.expiry_date || ''
            });
            // Close the scanner after passing data
            if (onClose) onClose();
        }
    };

    const handleReset = () => {
        setPreview(null);
        setResult(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
        }}>
            <div style={{
                background: 'var(--bg-card)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Scan size={20} color="white" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>AI Document Scanner</h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Upload Emirates ID or Passport
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem' }}>
                    {/* Upload Area */}
                    {!preview && (
                        <label style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '3rem 2rem',
                            border: '2px dashed var(--border)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            background: 'var(--bg-accent)'
                        }}>
                            <Upload size={48} style={{ color: 'var(--accent)', marginBottom: '1rem' }} />
                            <p style={{ margin: 0, fontWeight: '600', marginBottom: '0.5rem' }}>
                                Click to upload document
                            </p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Emirates ID or Passport (PNG, JPG)
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                        </label>
                    )}

                    {/* Preview */}
                    {preview && (
                        <div>
                            <div style={{
                                borderRadius: '12px',
                                overflow: 'hidden',
                                marginBottom: '1rem',
                                position: 'relative'
                            }}>
                                <img
                                    src={preview}
                                    alt="Document preview"
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        display: 'block'
                                    }}
                                />
                                {isScanning && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'rgba(0,0,0,0.7)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}>
                                        <Loader2 size={40} className="spin" style={{ marginBottom: '1rem' }} />
                                        <p style={{ margin: 0, fontWeight: '600' }}>Scanning document...</p>
                                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', opacity: 0.8 }}>
                                            AI is extracting information
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Error */}
                            {error && (
                                <div style={{
                                    padding: '1rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid var(--danger)',
                                    borderRadius: '8px',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}>
                                    <AlertCircle size={20} style={{ color: 'var(--danger)' }} />
                                    <div>
                                        <p style={{ margin: 0, fontWeight: '500', color: 'var(--danger)' }}>
                                            Scan Failed
                                        </p>
                                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                            {error}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Results */}
                            {result && (
                                <div style={{
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    border: '1px solid var(--success)',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    marginBottom: '1rem'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginBottom: '1rem'
                                    }}>
                                        <Check size={20} style={{ color: 'var(--success)' }} />
                                        <span style={{ fontWeight: '600', color: 'var(--success)' }}>
                                            Document scanned successfully!
                                        </span>
                                        {result.confidence && (
                                            <span style={{
                                                fontSize: '0.7rem',
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '4px',
                                                background: result.confidence === 'high' ? 'var(--success)' : 'var(--warning)',
                                                color: 'white'
                                            }}>
                                                {result.confidence} confidence
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                                        {result.name && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Name:</span>
                                                <span style={{ fontWeight: '600' }}>{result.name}</span>
                                            </div>
                                        )}
                                        {result.id_number && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>ID Number:</span>
                                                <span style={{ fontWeight: '600' }}>{result.id_number}</span>
                                            </div>
                                        )}
                                        {result.nationality && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nationality:</span>
                                                <span style={{ fontWeight: '600' }}>{result.nationality}</span>
                                            </div>
                                        )}
                                        {result.date_of_birth && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Date of Birth:</span>
                                                <span style={{ fontWeight: '600' }}>{result.date_of_birth}</span>
                                            </div>
                                        )}
                                        {result.expiry_date && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Expiry:</span>
                                                <span style={{ fontWeight: '600' }}>{result.expiry_date}</span>
                                            </div>
                                        )}
                                        {result.document_type && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Document:</span>
                                                <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                                                    {result.document_type.replace('_', ' ')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={handleReset}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        background: 'var(--bg)',
                                        color: 'var(--text)',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    Scan Another
                                </button>
                                {result && (
                                    <button
                                        onClick={handleConfirm}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            border: 'none',
                                            borderRadius: '8px',
                                            background: 'var(--success)',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <Check size={18} />
                                        Use This Data
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default IDScanner;
