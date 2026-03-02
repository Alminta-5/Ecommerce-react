import React, { useEffect, useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { supabase } from '../lib/supabaseClient';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [showRegModal, setShowRegModal] = useState(false);
  const [adminData, setAdminData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");

  const loadInitialData = async () => {
    setLoading(true);
    const { data: authRes } = await supabase.auth.getUser();
    if (!authRes.user) { navigate('/'); return; }

    const { data: userData, error } = await supabase
      .from('Users')
      .select('roles:role_id(role)')
      .eq('id', authRes.user.id)
      .single();

    if (error || userData?.roles?.role !== 'admin') { navigate('/'); return; }

    const { data: usersRes } = await supabase
      .from('Users')
      .select('id, full_name, email, roles:role_id(role)');

    setCurrentAdminId(authRes.user.id);
    setUsers(usersRes || []);

    const { data: contactsRes } = await supabase
      .from('Contact')
      .select('*')
      .order('created_at', { ascending: false });

    setContacts(contactsRes || []);
    setContactsLoading(false);
    setLoading(false);
  };

  const handleAdminRegister = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError("");

    const { data: sessionData } = await supabase.auth.getSession();
    const oldSession = sessionData.session;

    const { data: roleData, error: roleError } = await supabase
      .from('roles').select('id').eq('role', 'admin').single();

    if (roleError) { setRegError(roleError.message); setRegLoading(false); return; }

    const { error } = await supabase.auth.signUp({
      email: adminData.email,
      password: adminData.password,
      options: { data: { full_name: adminData.name, role_id: roleData.id } },
    });

    if (error) {
      setRegError(error.message);
    } else {
      if (oldSession) await supabase.auth.setSession(oldSession);
      alert("New Admin Registered Successfully!");
      setShowRegModal(false);
      setAdminData({ name: "", email: "", password: "" });
      loadInitialData();
    }
    setRegLoading(false);
  };

  const deleteUser = async (userId) => {
    if (userId === currentAdminId) return alert("Forbidden: You cannot delete your own account.");
    if (!window.confirm("This will permanently delete the user. Proceed?")) return;
    const { error } = await supabase.rpc('deleteuserbyid', { targetuserid: userId });
    if (error) { alert(`Deletion Failed: ${error.message}`); }
    else { setUsers(users.filter(u => u.id !== userId)); }
  };

  useEffect(() => { loadInitialData(); }, []);

  return (
    <div className="animate-fadeIn">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">User Management</h2>
        <button
          onClick={() => { setShowRegModal(true); setRegError(""); }}
          className="bg-primary text-white px-5 py-2 rounded-lg font-bold shadow-md hover:scale-105 transition-all w-full sm:w-auto"
        >
          + Register Admin
        </button>
      </div>

      {loading && <div className="p-20 text-center text-gray-500">Loading users...</div>}

      {!loading && fetchError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <p className="font-bold mb-1">Could not load users</p>
          <p className="font-mono break-all">{fetchError}</p>
        </div>
      )}

      {!loading && !fetchError && users.length === 0 && (
        <div className="p-20 text-center text-gray-400">No users found.</div>
      )}

      {/* ── Users Table — desktop ── */}
      {!loading && users.length > 0 && (
        <>
          {/* Desktop Table */}
          <div className="hidden sm:block bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                  <th className="p-4">Identity</th>
                  <th className="p-4">Access Level</th>
                  <th className="p-4 text-right">Operations</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="p-4">
                      <p className="font-bold">{u.full_name || '—'}</p>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        u.roles?.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {u.roles?.role || 'user'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {u.id === currentAdminId ? (
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          Active Session
                        </span>
                      ) : (
                        <button onClick={() => deleteUser(u.id)} className="text-red-600 font-bold hover:underline">
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden flex flex-col gap-3">
            {users.map((u) => (
              <div key={u.id} className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-800">{u.full_name || '—'}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{u.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ml-2 flex-shrink-0 ${
                    u.roles?.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {u.roles?.role || 'user'}
                  </span>
                </div>
                <div className="mt-3 flex justify-end">
                  {u.id === currentAdminId ? (
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      Active Session
                    </span>
                  ) : (
                    <button onClick={() => deleteUser(u.id)} className="text-sm text-red-600 font-bold border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50 transition-all">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Contacts Section ── */}
      <div className="mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Contact Messages</h2>

        {contactsLoading ? (
          <div className="p-10 text-center text-gray-500">Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No contact messages yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact) => (
              <div key={contact.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{contact.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(contact.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📧</span>
                    <a href={`mailto:${contact.email}`} className="text-blue-500 hover:underline truncate">
                      {contact.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📱</span>
                    <a href={`https://wa.me/${contact.number}`} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">
                      {contact.number}
                    </a>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Message</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{contact.message}</p>
                </div>
                <a
                  href={`https://wa.me/${contact.number}?text=${encodeURIComponent(
                    `Hello ${contact.name}, thank you for contacting Shopsy! Regarding your message: "${contact.message}" - our team is here to help!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg font-bold text-sm text-center flex items-center justify-center gap-2 hover:bg-green-600 transition-all"
                >
                  <span>💬</span> Reply on WhatsApp
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Register Admin Modal ── */}
      {showRegModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-white p-6 sm:p-8 rounded-xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Add New Administrator</h2>

            {regError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-mono break-all">
                {regError}
              </div>
            )}

            <form onSubmit={handleAdminRegister} className="space-y-4">
              <input
                type="text" placeholder="Full Name" required
                value={adminData.name}
                className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-green-500"
                onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
              />
              <input
                type="email" placeholder="Email" required
                value={adminData.email}
                className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-green-500"
                onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password (min 6 chars)" required
                  value={adminData.password}
                  className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-green-500 pr-10"
                  onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
                  {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                </button>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button"
                  onClick={() => { setShowRegModal(false); setRegError(""); }}
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                  disabled={regLoading}>
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded font-bold disabled:opacity-60"
                  disabled={regLoading}>
                  {regLoading ? "Registering..." : "Register Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
