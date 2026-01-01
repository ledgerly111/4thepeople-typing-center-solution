import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Building2, Users, Database, Plus, Settings, Shield, Trash2 } from 'lucide-react';

const SuperAdmin = () => {
    const { isSuperAdmin } = useAuth();
    const [organizations, setOrganizations] = useState([]);
    const [stats, setStats] = useState({ totalOrgs: 0, totalUsers: 0, totalInvoices: 0 });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState(null);

    // New Org form
    const [newOrgName, setNewOrgName] = useState('');
    const [newOrgUserLimit, setNewOrgUserLimit] = useState(5);

    // New User form
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserName, setNewUserName] = useState('');
    const [newUserRole, setNewUserRole] = useState('org_admin');

    useEffect(() => {
        if (isSuperAdmin()) {
            loadData();
        }
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch organizations with user count
            const { data: orgsData, error: orgsError } = await supabase
                .from('organizations')
                .select('*, profiles(count)')
                .order('created_at', { ascending: false });

            if (orgsError) throw orgsError;

            // Fetch stats
            const { count: invoiceCount } = await supabase
                .from('invoices')
                .select('*', { count: 'exact', head: true });

            const { count: userCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            setOrganizations(orgsData || []);
            setStats({
                totalOrgs: orgsData?.length || 0,
                totalUsers: userCount || 0,
                totalInvoices: invoiceCount || 0
            });
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const createOrganization = async () => {
        if (!newOrgName.trim()) {
            alert('Please enter organization name');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('organizations')
                .insert([{
                    name: newOrgName,
                    user_limit: newOrgUserLimit,
                    subscription_status: 'trial'
                }])
                .select()
                .single();

            if (error) throw error;

            setOrganizations([data, ...organizations]);
            setNewOrgName('');
            setNewOrgUserLimit(5);
            setIsModalOpen(false);
            alert('Organization created successfully!');
        } catch (error) {
            console.error('Error creating organization:', error);
            alert('Failed to create organization: ' + error.message);
        }
    };

    const createUser = async () => {
        if (!newUserEmail || !newUserPassword || !selectedOrg) {
            alert('Please fill all fields');
            return;
        }

        try {
            // Create user in Supabase Auth
            // Note: This requires service_role key or admin API
            // For now, we'll create via the normal signup and then update the profile
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: newUserEmail,
                password: newUserPassword,
                options: {
                    data: {
                        full_name: newUserName,
                        role: newUserRole
                    }
                }
            });

            if (authError) throw authError;

            // Update the profile with organization
            if (authData.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        organization_id: selectedOrg.id,
                        role: newUserRole,
                        full_name: newUserName
                    })
                    .eq('id', authData.user.id);

                if (profileError) {
                    console.error('Profile update error:', profileError);
                }
            }

            setNewUserEmail('');
            setNewUserPassword('');
            setNewUserName('');
            setNewUserRole('org_admin');
            setIsUserModalOpen(false);
            alert('User created! They may need to verify their email.');
            loadData();
        } catch (error) {
            console.error('Error creating user:', error);
            alert('Failed to create user: ' + error.message);
        }
    };

    const deleteOrganization = async (org) => {
        if (!confirm(`Delete "${org.name}"? This will remove all their data!`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('organizations')
                .delete()
                .eq('id', org.id);

            if (error) throw error;

            setOrganizations(organizations.filter(o => o.id !== org.id));
            alert('Organization deleted');
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Failed to delete: ' + error.message);
        }
    };

    // Check if user is super admin
    if (!isSuperAdmin()) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <Shield size={64} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
                <h2>Access Denied</h2>
                <p style={{ color: 'var(--text-muted)' }}>
                    This page is only accessible to Super Administrators.
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={28} style={{ color: 'var(--accent)' }} />
                    Super Admin Dashboard
                </h2>
                <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>
                    Manage all organizations and users
                </p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '10px',
                            background: 'var(--accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <Building2 size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Organizations</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.totalOrgs}</div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '10px',
                            background: 'var(--success)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <Users size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Users</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.totalUsers}</div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '10px',
                            background: 'var(--warning)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <Database size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Invoices</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.totalInvoices}</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Organizations List */}
            <Card title="Organizations">
                <div style={{ marginBottom: '1rem' }}>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus size={16} /> Create Organization
                    </Button>
                </div>

                {loading ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</p>
                ) : organizations.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        No organizations yet. Create your first one!
                    </p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Organization</th>
                                    <th>Status</th>
                                    <th>User Limit</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {organizations.map(org => (
                                    <tr key={org.id}>
                                        <td>
                                            <strong>{org.name}</strong>
                                        </td>
                                        <td>
                                            <span className={`badge ${org.subscription_status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                                {org.subscription_status}
                                            </span>
                                        </td>
                                        <td>{org.user_limit} users</td>
                                        <td>{new Date(org.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Button
                                                    variant="secondary"
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedOrg(org);
                                                        setIsUserModalOpen(true);
                                                    }}
                                                >
                                                    <Users size={14} /> Add User
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="small"
                                                    onClick={() => deleteOrganization(org)}
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Create Organization Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create Organization"
            >
                <div className="form-group">
                    <label className="form-label">Organization Name</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="Al Faisal Typing Center"
                        value={newOrgName}
                        onChange={(e) => setNewOrgName(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">User Limit</label>
                    <input
                        type="number"
                        className="input"
                        min="1"
                        max="50"
                        value={newOrgUserLimit}
                        onChange={(e) => setNewOrgUserLimit(parseInt(e.target.value))}
                    />
                </div>

                <div className="modal-footer">
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={createOrganization}>
                        Create Organization
                    </Button>
                </div>
            </Modal>

            {/* Add User Modal */}
            <Modal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                title={`Add User to ${selectedOrg?.name || ''}`}
            >
                <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="Ahmed Hassan"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="input"
                        placeholder="user@example.com"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        className="input"
                        placeholder="••••••••"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Role</label>
                    <select
                        className="input"
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value)}
                    >
                        <option value="org_admin">Organization Admin (Owner)</option>
                        <option value="staff">Staff Member</option>
                    </select>
                </div>

                <div className="modal-footer">
                    <Button variant="secondary" onClick={() => setIsUserModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={createUser}>
                        Create User
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default SuperAdmin;
