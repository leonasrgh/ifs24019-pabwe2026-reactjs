import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import AddModal from "../modals/AddModal";
import ChangeModal from "../modals/ChangeModal";
import {
  asyncSetLostFounds,
  asyncSetLostFoundStats,
  asyncSetIsLostFoundDelete,
  setIsLostFoundDeleteActionCreator,
  setIsLostFoundDeletedActionCreator,
} from "../states/action";
import { formatDate, getImageUrl, showConfirmDialog } from "../../../helpers/toolsHelper";
import {
  IconPlus,
  IconPackage,
  IconSearch,
  IconEye,
  IconPencil,
  IconTrash,
  IconLoader2,
  IconCircleCheck,
  IconMapPinQuestion,
  IconBoxSeam,
  IconFilter,
} from "@tabler/icons-react";

export function buildStatsRows(stats) {
  const losts = stats?.stats_losts || {};
  const founds = stats?.stats_founds || {};
  return Object.keys(losts).map((label) => ({
    label,
    lost: losts[label] || 0,
    found: founds[label] || 0,
  }));
}

function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const statsRef = useRef(null);

  const profile = useSelector((state) => state.profile);
  const lostFounds = useSelector((state) => state.lostFounds);
  const lostFoundStats = useSelector((state) => state.lostFoundStats);
  const isLostFoundDelete = useSelector((state) => state.isLostFoundDelete);
  const isLostFoundDeleted = useSelector((state) => state.isLostFoundDeleted);

  const [loading, setLoading] = useState(false);
  const [isMe, setIsMe] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [completedFilter, setCompletedFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [period, setPeriod] = useState("daily");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLostFound, setSelectedLostFound] = useState(null);

  function loadLostFounds() {
    setLoading(true);
    return Promise.resolve(dispatch(asyncSetLostFounds({ isMe }))).finally(() =>
      setLoading(false)
    );
  }

  function loadStats() {
    return dispatch(asyncSetLostFoundStats(period));
  }

  function reloadAll() {
    loadLostFounds();
    loadStats();
  }

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.resolve(dispatch(asyncSetLostFounds({ isMe }))).finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [isMe, dispatch]);

  useEffect(() => {
    dispatch(asyncSetLostFoundStats(period));
  }, [period, dispatch]);

  useEffect(() => {
    if (isLostFoundDelete) {
      dispatch(setIsLostFoundDeleteActionCreator(false));
      if (isLostFoundDeleted) {
        dispatch(setIsLostFoundDeletedActionCreator(false));
        dispatch(asyncSetLostFounds({ isMe }));
        dispatch(asyncSetLostFoundStats(period));
      }
    }
  }, [isLostFoundDelete, isLostFoundDeleted, isMe, period, dispatch]);

  useEffect(() => {
    const element = document.getElementById("statistik");
    if (hash === "#statistik" && element && element.scrollIntoView) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, [hash, profile]);

  if (!profile) return null;

  async function handleDelete(lostFoundId) {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus laporan ini?");
    if (result.isConfirmed) {
      dispatch(asyncSetIsLostFoundDelete(lostFoundId));
    }
  }

  const filtered = lostFounds.filter((item) => {
    if (statusFilter && item.status !== statusFilter) return false;
    if (completedFilter !== "" && String(item.is_completed ? 1 : 0) !== completedFilter) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const title = item.title ? item.title.toLowerCase() : "";
    const description = item.description ? item.description.toLowerCase() : "";
    return title.includes(q) || description.includes(q);
  });

  const totalCount = lostFounds.length;
  const lostCount = lostFounds.filter((i) => i.status === "lost").length;
  const foundCount = lostFounds.filter((i) => i.status === "found").length;
  const completedCount = lostFounds.filter((i) => i.is_completed).length;

  const statsRows = buildStatsRows(lostFoundStats);
  const maxStat = Math.max(1, ...statsRows.map((r) => Math.max(r.lost, r.found)));

  const stats = [
    { id: "total", label: "Total Laporan", value: totalCount, color: "text-slate-800", bg: "bg-indigo-50 text-indigo-600", icon: IconPackage },
    { id: "lost", label: "Barang Hilang", value: lostCount, color: "text-rose-600", bg: "bg-rose-50 text-rose-600", icon: IconMapPinQuestion },
    { id: "found", label: "Barang Ditemukan", value: foundCount, color: "text-sky-600", bg: "bg-sky-50 text-sky-600", icon: IconBoxSeam },
    { id: "completed", label: "Selesai", value: completedCount, color: "text-emerald-600", bg: "bg-emerald-50 text-emerald-600", icon: IconCircleCheck },
  ];

  const tabClass = (active) =>
    `px-3 py-1.5 rounded-lg transition-all ${
      active ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"
    }`;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Laporan Lost &amp; Found
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau laporan barang hilang dan barang temuan di lingkungan kampus.
          </p>
        </div>
        <button
          type="button"
          data-testid="add-lost-found-btn"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-600/25 transition-all self-start sm:self-auto"
        >
          <IconPlus size={18} stroke={2.5} />
          <span>Tambah Laporan</span>
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {card.label}
                </p>
                <h3
                  data-testid={`stat-${card.id}`}
                  className={`text-3xl font-black mt-1 ${card.color}`}
                >
                  {card.value}
                </h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.bg}`}>
                <Icon size={26} stroke={2} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Table & controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <IconSearch
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                data-testid="search-lost-found-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul atau deskripsi laporan..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600 self-start">
              <button type="button" data-testid="scope-all-btn" onClick={() => setIsMe(false)} className={tabClass(!isMe)}>
                Semua Laporan
              </button>
              <button type="button" data-testid="scope-me-btn" onClick={() => setIsMe(true)} className={tabClass(isMe)}>
                Laporan Saya
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <IconFilter size={16} /> Filter:
            </span>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
              <button type="button" data-testid="filter-status-all-btn" onClick={() => setStatusFilter("")} className={tabClass(statusFilter === "")}>
                Semua
              </button>
              <button type="button" data-testid="filter-status-lost-btn" onClick={() => setStatusFilter("lost")} className={tabClass(statusFilter === "lost")}>
                Hilang
              </button>
              <button type="button" data-testid="filter-status-found-btn" onClick={() => setStatusFilter("found")} className={tabClass(statusFilter === "found")}>
                Ditemukan
              </button>
            </div>
            <select
              data-testid="filter-completed-select"
              value={completedFilter}
              onChange={(e) => setCompletedFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">Semua Penyelesaian</option>
              <option value="1">Sudah Selesai</option>
              <option value="0">Belum Selesai</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Laporan</th>
                <th className="px-5 py-3.5">Jenis</th>
                <th className="px-5 py-3.5 hidden md:table-cell">Pelapor</th>
                <th className="px-5 py-3.5 hidden lg:table-cell">Tanggal</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <IconLoader2 size={36} className="mx-auto text-indigo-600 animate-spin mb-2" />
                    <p className="font-medium text-slate-600">Memuat laporan...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <IconPackage size={40} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-medium">Belum ada laporan yang cocok.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={`lost-found-${item.id}`}
                    data-testid={`lost-found-row-${item.id}`}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {item.cover && (
                          <img
                            src={getImageUrl(item.cover)}
                            alt={item.title}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-slate-800 leading-snug">{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {item.status === "found" ? (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/60">
                          Ditemukan
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
                          Hilang
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-xs text-slate-600">
                      {item.author?.name || "-"}
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-xs text-slate-500">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      {item.is_completed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Selesai
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Proses
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          data-testid={`view-lost-found-${item.id}`}
                          onClick={() => navigate(`/lost-founds/${item.id}`)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <IconEye size={18} />
                        </button>
                        <button
                          type="button"
                          data-testid={`edit-lost-found-${item.id}`}
                          onClick={() => setSelectedLostFound(item)}
                          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Ubah Laporan"
                        >
                          <IconPencil size={18} />
                        </button>
                        <button
                          type="button"
                          data-testid={`delete-lost-found-${item.id}`}
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Laporan"
                        >
                          <IconTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      <section
        id="statistik"
        ref={statsRef}
        className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5 scroll-mt-24"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-800">Statistik Laporan</h2>
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600 self-start">
            <button type="button" data-testid="stats-daily-btn" onClick={() => setPeriod("daily")} className={tabClass(period === "daily")}>
              Harian
            </button>
            <button type="button" data-testid="stats-monthly-btn" onClick={() => setPeriod("monthly")} className={tabClass(period === "monthly")}>
              Bulanan
            </button>
          </div>
        </div>

        {statsRows.length === 0 ? (
          <p data-testid="stats-empty" className="text-sm text-slate-400 text-center py-6">
            Belum ada data statistik.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-500" /> Hilang
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-sky-500" /> Ditemukan
              </span>
            </div>
            {statsRows.map((row) => (
              <div key={row.label} data-testid={`stats-row-${row.label}`} className="grid grid-cols-[5.5rem_1fr] items-center gap-3">
                <span className="text-xs font-mono text-slate-500">{row.label}</span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 rounded-full bg-rose-500" style={{ width: `${(row.lost / maxStat) * 100}%` }} />
                    <span className="text-xs font-semibold text-slate-600">{row.lost}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 rounded-full bg-sky-500" style={{ width: `${(row.found / maxStat) * 100}%` }} />
                    <span className="text-xs font-semibold text-slate-600">{row.found}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <AddModal show={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={reloadAll} />
      <ChangeModal
        show={Boolean(selectedLostFound)}
        onClose={() => setSelectedLostFound(null)}
        lostFound={selectedLostFound}
        onSuccess={reloadAll}
      />
    </div>
  );
}

export default HomePage;
