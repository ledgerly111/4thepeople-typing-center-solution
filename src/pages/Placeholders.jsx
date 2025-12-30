export const Services = () => (
    <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '2px solid var(--border-color)',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '6px 6px 0px var(--border-color)'
    }}>
        <h3 style={{ marginTop: 0, color: 'var(--accent-color)', borderBottom: '2px dashed var(--border-color)', paddingBottom: '0.5rem' }}>Services Catalog</h3>
        <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
            <h3>Services & Pricing</h3>
            <p>Coming Soon</p>
            <button style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '4px',
                border: '2px solid var(--text-primary)',
                backgroundColor: 'var(--accent-color)',
                color: 'white',
                fontWeight: 'bold',
                boxShadow: '4px 4px 0px var(--text-secondary)'
            }}>+ Add Service</button>
        </div>
    </div>
);

export const Invoices = () => (
    <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '2px solid var(--border-color)',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '6px 6px 0px var(--border-color)'
    }}>
        <h3 style={{ marginTop: 0, color: 'var(--accent-color)', borderBottom: '2px dashed var(--border-color)', paddingBottom: '0.5rem' }}>Invoicing System</h3>
        <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
            <h3>Invoice Generation (No VAT)</h3>
            <p>Coming Soon</p>
            <button style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '4px',
                border: '2px solid var(--text-primary)',
                backgroundColor: 'var(--accent-color)',
                color: 'white',
                fontWeight: 'bold',
                boxShadow: '4px 4px 0px var(--text-secondary)'
            }}>+ New Invoice</button>
        </div>
    </div>
);

export const Settings = () => (
    <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '2px solid var(--border-color)',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '6px 6px 0px var(--border-color)'
    }}>
        <h3 style={{ marginTop: 0, color: 'var(--accent-color)', borderBottom: '2px dashed var(--border-color)', paddingBottom: '0.5rem' }}>System Settings</h3>
        <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
            <h3>Application Preferences</h3>
            <p>Configure your printer and backup settings here.</p>
        </div>
    </div>
);
