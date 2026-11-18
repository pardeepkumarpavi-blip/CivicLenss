import React, { useState, useEffect } from 'react';
import { adminAPI, departmentAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  ShieldCheck,
  UserPlus,
  Users,
  Building2,
  FileSpreadsheet,
  Activity,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Lock,
  RefreshCw,
  Loader2,
  Trash2,
  Server
} from 'lucide-react';

export default function AdminPanelPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('invitations');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Invitations State
  const [invitations, setInvitations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [inviteForm, setInviteForm] = useState({
    officialName: '',
    officialEmail: '',
    organization: 'Karachi Metropolitan Corporation',
    departmentId: '',
    designation: '',
    employeeId: '',
    role: 'department_officer'
  });
  const [createdInvite, setCreatedInvite] = useState(null);
  const [copied, setCopied] = useState(false);

  // Authorities State
  const [authorities, setAuthorities] = useState([]);

  // Departments State
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    jurisdiction: 'Karachi Metropolitan Area',
    description: '',
    contactEmail: ''
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);

  // Health State
  const [health, setHealth] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'invitations') {
        const [invRes, deptRes] = await Promise.all([
          adminAPI.getInvitations(),
          departmentAPI.getAll({ includeInactive: true })
        ]);
        if (invRes.data.success) setInvitations(invRes.data.invitations || []);
        if (deptRes.data.success) setDepartments(deptRes.data.departments || []);
      } else if (activeTab === 'authorities') {
        const res = await adminAPI.getAuthorities();
        if (res.data.success) setAuthorities(res.data.authorities || []);
      } else if (activeTab === 'departments') {
        const res = await departmentAPI.getAll({ includeInactive: true });
        if (res.data.success) setDepartments(res.data.departments || []);
      } else if (activeTab === 'audit') {
        const res = await adminAPI.getAuditLogs({ limit: 40 });
        if (res.data.success) setAuditLogs(res.data.logs || []);
      } else if (activeTab === 'health') {
        const res = await adminAPI.getSystemHealth();
        if (res.data.success) setHealth(res.data.health);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load administrative data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Handle Create Invitation
  const handleCreateInvitation = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setCreatedInvite(null);

    try {
      const res = await adminAPI.createInvitation(inviteForm);
      if (res.data.success) {
        setCreatedInvite(res.data);
        setMessage('Official invitation created successfully.');
        setInviteForm({
          officialName: '',
          officialEmail: '',
          organization: 'Karachi Metropolitan Corporation',
          departmentId: departments[0]?._id || '',
          designation: '',
          employeeId: '',
          role: 'department_officer'
        });
        loadData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue authority invitation.');
    }
  };

  // Handle Revoke Invitation
  const handleRevokeInvitation = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this authority invitation?')) return;
    try {
      const res = await adminAPI.revokeInvitation(id);
      if (res.data.success) {
        setMessage('Invitation revoked.');
        loadData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to revoke invitation.');
    }
  };

  // Handle Suspend/Activate Authority
  const handleToggleAuthorityStatus = async (authId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await adminAPI.updateAuthority(authId, { accountStatus: nextStatus });
      if (res.data.success) {
        setMessage(`Authority account status changed to "${nextStatus}".`);
        loadData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update authority account.');
    }
  };

  // Handle Create Department
  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await departmentAPI.create(deptForm);
      if (res.data.success) {
        setMessage(`Department "${deptForm.name}" created.`);
        setDeptForm({
          name: '',
          code: '',
          jurisdiction: 'Karachi Metropolitan Area',
          description: '',
          contactEmail: ''
        });
        loadData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create department.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-purple-950 text-white p-6 sm:p-8 rounded-2xl border border-purple-900 shadow-md space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-900 px-2 py-0.5 rounded border border-purple-800">
            Administrative Clearance Level
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Super Admin Control Panel
        </h1>
        <p className="text-xs text-purple-300">
          Governance oversight, authority invitation lifecycle, department routing configuration, and immutable audit logs
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm text-emerald-800 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {message}
          </span>
          <button onClick={() => setMessage(null)} className="text-emerald-600">Dismiss</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm text-rose-800 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            {error}
          </span>
          <button onClick={() => setError(null)} className="text-rose-600">Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('invitations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'invitations'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Authority Onboarding
        </button>

        <button
          onClick={() => setActiveTab('authorities')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'authorities'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Authority Directory
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'departments'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Municipal Departments
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'audit'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Audit Logs
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'health'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Platform Health
        </button>
      </div>

      {/* 1. Tab: Authority Invitations */}
      {activeTab === 'invitations' && (
        <div className="space-y-8">
          {/* Issue Invitation Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-teal-600" />
              Issue Secure Municipal Authority Invitation
            </h2>
            <p className="text-xs text-slate-500">
              Authorities cannot self-register publicly. Generate a single-use cryptographically signed invitation for verified municipal staff.
            </p>

            <form onSubmit={handleCreateInvitation} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteForm.officialName}
                  onChange={(e) => setInviteForm({ ...inviteForm, officialName: e.target.value })}
                  placeholder="e.g. Engr. Farhan Siddiqui"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteForm.officialEmail}
                  onChange={(e) => setInviteForm({ ...inviteForm, officialEmail: e.target.value })}
                  placeholder="officer@kmc.gov.pk"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Organization</label>
                <input
                  type="text"
                  required
                  value={inviteForm.organization}
                  onChange={(e) => setInviteForm({ ...inviteForm, organization: e.target.value })}
                  placeholder="Karachi Metropolitan Corporation"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Department</label>
                <select
                  required
                  value={inviteForm.departmentId}
                  onChange={(e) => setInviteForm({ ...inviteForm, departmentId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Designation</label>
                <input
                  type="text"
                  required
                  value={inviteForm.designation}
                  onChange={(e) => setInviteForm({ ...inviteForm, designation: e.target.value })}
                  placeholder="e.g. Executive Engineer Sanitation"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Authority Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="department_head">Department Head</option>
                  <option value="department_officer">Department Officer</option>
                  <option value="field_officer">Field Officer</option>
                  <option value="municipal_admin">Municipal Administrator</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-xl shadow transition"
                >
                  Generate Invitation Token
                </button>
              </div>
            </form>

            {/* Generated Invitation Link Card */}
            {createdInvite && (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-teal-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    Invitation Dispatched
                  </span>
                  <span className="text-[10px] text-teal-700 font-mono">Expires in 7 days</span>
                </div>
                <p className="text-xs text-teal-950 font-medium">
                  Deliver this secure onboarding link to {createdInvite.invitation?.officialName} ({createdInvite.invitation?.officialEmail}):
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdInvite.inviteLink}
                    className="flex-1 p-2 bg-white border border-teal-200 rounded-lg text-xs font-mono select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(createdInvite.inviteLink)}
                    className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pending Invitations Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-navy-900 text-sm">Issued Authority Invitations</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b">
                  <tr>
                    <th className="p-3">Official</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Expires</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invitations.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{inv.officialName}</span>
                        <span className="text-slate-500 text-[11px]">{inv.officialEmail}</span>
                      </td>
                      <td className="p-3 text-slate-700">{inv.departmentId?.name}</td>
                      <td className="p-3 capitalize font-medium">{inv.role?.replace('_', ' ')}</td>
                      <td className="p-3 text-slate-500">{new Date(inv.expiresAt).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          inv.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                          inv.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {inv.status === 'pending' && (
                          <button
                            onClick={() => handleRevokeInvitation(inv._id)}
                            className="text-rose-600 hover:text-rose-800 text-xs font-semibold"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Tab: Authority Accounts Directory */}
      {activeTab === 'authorities' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-navy-900 text-sm">Municipal Authority Directory</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b">
                <tr>
                  <th className="p-3">Official</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Designation</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {authorities.map((auth) => (
                  <tr key={auth._id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{auth.name}</span>
                      <span className="text-slate-500 text-[11px]">{auth.email}</span>
                    </td>
                    <td className="p-3 text-slate-700">{auth.departmentId?.name || 'Central Administration'}</td>
                    <td className="p-3 text-slate-600">{auth.designation || 'Officer'}</td>
                    <td className="p-3 capitalize font-semibold text-teal-800">{auth.role?.replace('_', ' ')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        auth.accountStatus === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {auth.accountStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {auth.role !== 'super_admin' && (
                        <button
                          onClick={() => handleToggleAuthorityStatus(auth._id, auth.accountStatus)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded ${
                            auth.accountStatus === 'active'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {auth.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Tab: Department Configuration */}
      {activeTab === 'departments' && (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-navy-900 text-sm">Add New Municipal Department</h3>
            <form onSubmit={handleCreateDepartment} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Municipal Parks and Horticulture"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Unique Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. MPH"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl uppercase"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Contact Email</label>
                <input
                  type="email"
                  value={deptForm.contactEmail}
                  onChange={(e) => setDeptForm({ ...deptForm, contactEmail: e.target.value })}
                  placeholder="parks@karachi.gov.pk"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-navy-900 text-white font-bold rounded-xl"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-navy-900 text-sm">Configured Municipal Departments</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((dept) => (
                <div key={dept._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs bg-navy-900 text-teal-400 px-2 py-0.5 rounded">
                      {dept.code}
                    </span>
                    <span className={`text-[10px] font-bold uppercase ${dept.isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {dept.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{dept.name}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{dept.description || 'General municipal services.'}</p>
                  <p className="text-[11px] text-slate-400">{dept.jurisdiction}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Tab: Immutable Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-navy-900 text-sm">Append-Only Audit Trail</h3>
            <span className="text-xs text-slate-400">Strictly immutable application log</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-800">{log.actorName}</span>
                      <span className="text-[10px] text-slate-400 block capitalize">{log.actorRole}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-teal-700">{log.action}</td>
                    <td className="p-3 text-slate-600">
                      {log.targetType} ({log.targetId})
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">
                      {log.ipAddress || 'Internal'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Tab: Platform Health */}
      {activeTab === 'health' && health && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500">Database Engine</span>
              <p className="text-lg font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                MongoDB {health.database.status}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">{health.database.databaseName}</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500">Gemini AI Service</span>
              <p className="text-sm font-bold text-slate-800">{health.services.geminiAI}</p>
              <p className="text-[11px] text-slate-400">Model: gemini-2.5-flash</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500">Evidence Storage</span>
              <p className="text-sm font-bold text-slate-800">{health.services.storage}</p>
              <p className="text-[11px] text-slate-400">Restricted MIME validation</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500">System Uptime</span>
              <p className="text-lg font-bold text-navy-900">{Math.floor(health.uptimeSeconds / 60)} minutes</p>
              <p className="text-[11px] text-slate-400">{health.systemTime}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-navy-900 text-sm">Database Record Counts</h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 text-center">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-xs text-slate-400 block font-bold">Total Users</span>
                <span className="text-xl font-black text-navy-900">{health.counts.totalUsers}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-xs text-slate-400 block font-bold">Citizens</span>
                <span className="text-xl font-black text-teal-600">{health.counts.citizens}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-xs text-slate-400 block font-bold">Authorities</span>
                <span className="text-xl font-black text-indigo-600">{health.counts.authorities}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-xs text-slate-400 block font-bold">Departments</span>
                <span className="text-xl font-black text-purple-600">{health.counts.departments}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-xs text-slate-400 block font-bold">Total Complaints</span>
                <span className="text-xl font-black text-blue-600">{health.counts.reports}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-xs text-slate-400 block font-bold">Pending Invites</span>
                <span className="text-xl font-black text-amber-600">{health.counts.pendingInvitations}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
