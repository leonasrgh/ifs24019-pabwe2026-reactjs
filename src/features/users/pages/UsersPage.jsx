import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { asyncSetUsers } from "../states/action";
import { formatDate } from "../../../helpers/toolsHelper";
import {
  IconUsers,
  IconSearch,
  IconMail,
  IconCalendar,
  IconLoader2,
} from "@tabler/icons-react";

const EMPTY_USERS = [];

function UsersPage() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users ?? EMPTY_USERS);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoadingUsers(true);
    Promise.resolve(dispatch(asyncSetUsers())).finally(() => {
      if (isMounted) setLoadingUsers(false);
    });
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Semua Pengguna
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Daftar seluruh akun pengguna yang terdaftar di dalam sistem.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header Search */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <IconSearch
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              data-testid="search-user-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pengguna berdasarkan nama atau email..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>
          <span className="text-xs font-semibold text-slate-700 px-3 py-1 bg-slate-100 rounded-lg">
            Total: {filteredUsers.length} Pengguna
          </span>
        </div>

        {/* User Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingUsers && filteredUsers.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-600">
              <IconLoader2 size={36} className="mx-auto text-indigo-600 animate-spin mb-2" />
              <p className="font-medium text-slate-600">Memuat daftar pengguna...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-600">
              <IconUsers size={40} className="mx-auto text-slate-300 mb-2" />
              <p className="font-medium">Tidak ada data pengguna ditemukan.</p>
            </div>
          ) : (
            filteredUsers.map((u) => (
              <div
                key={`user-${u.id}`}
                data-testid={`user-card-${u.id}`}
                className="p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all bg-white flex flex-col justify-between"
              >
                <div className="flex items-start gap-3.5">
                  {u.photo ? (
                    <img
                      src={u.photo}
                      alt={u.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-base shrink-0">
                      {u.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold text-slate-900 truncate">{u.name}</h2>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                      <IconMail size={14} className="shrink-0 text-slate-400" />
                      <span className="truncate">{u.email}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="font-mono font-semibold">ID: #{u.id}</span>
                  <span className="flex items-center gap-1">
                    <IconCalendar size={13} />
                    {formatDate(u.created_at)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default UsersPage;
