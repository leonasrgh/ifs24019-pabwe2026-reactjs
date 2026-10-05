import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  asyncSetLostFound,
  asyncSetIsLostFoundDelete,
  setIsLostFoundActionCreator,
  setIsLostFoundDeleteActionCreator,
  setIsLostFoundDeletedActionCreator,
} from "../states/action";
import { formatDate, getImageUrl, showConfirmDialog } from "../../../helpers/toolsHelper";
import ChangeCoverModal from "../modals/ChangeCoverModal";
import ChangeModal from "../modals/ChangeModal";
import {
  IconArrowLeft,
  IconPhotoUp,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconCircleCheck,
  IconClock,
  IconUser,
  IconPhotoOff,
} from "@tabler/icons-react";

function DetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const profile = useSelector((state) => state.profile);
  const lostFound = useSelector((state) => state.lostFound);
  const isLostFound = useSelector((state) => state.isLostFound);
  const isLostFoundDelete = useSelector((state) => state.isLostFoundDelete);
  const isLostFoundDeleted = useSelector((state) => state.isLostFoundDeleted);

  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    dispatch(asyncSetLostFound(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (isLostFound) {
      dispatch(setIsLostFoundActionCreator(false));
      if (!lostFound) {
        navigate("/");
      }
    }
  }, [isLostFound, lostFound, navigate, dispatch]);

  useEffect(() => {
    if (isLostFoundDelete) {
      dispatch(setIsLostFoundDeleteActionCreator(false));
      if (isLostFoundDeleted) {
        dispatch(setIsLostFoundDeletedActionCreator(false));
        navigate("/");
      }
    }
  }, [isLostFoundDelete, isLostFoundDeleted, navigate, dispatch]);

  if (!profile || !lostFound) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isOwner = lostFound.user_id === profile.id;
  const coverUrl = getImageUrl(lostFound.cover);

  function refresh() {
    dispatch(asyncSetLostFound(id));
  }

  async function handleDelete() {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus laporan ini?");
    if (result.isConfirmed) {
      dispatch(asyncSetIsLostFoundDelete(lostFound.id));
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/"
          data-testid="back-to-lost-founds-link"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <IconArrowLeft size={18} />
          Kembali ke Laporan
        </Link>

        {isOwner && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="edit-cover-btn"
              onClick={() => setShowCoverModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 transition-colors"
            >
              <IconPhotoUp size={16} />
              Ubah Cover
            </button>
            <button
              type="button"
              data-testid="edit-detail-btn"
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-colors"
            >
              <IconEdit size={16} />
              Ubah Data
            </button>
            <button
              type="button"
              data-testid="delete-detail-btn"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors"
            >
              <IconTrash size={16} />
              Hapus
            </button>
          </div>
        )}
      </div>

      <article className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={lostFound.title}
            data-testid="lost-found-cover-image"
            className="w-full max-h-[28rem] object-contain bg-slate-100"
          />
        ) : (
          <div
            data-testid="lost-found-cover-placeholder"
            className="w-full h-56 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-300"
          >
            <IconPhotoOff size={48} />
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {lostFound.status === "found" ? (
              <span
                data-testid="detail-status-badge"
                className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200/60"
              >
                Barang Ditemukan
              </span>
            ) : (
              <span
                data-testid="detail-status-badge"
                className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60"
              >
                Barang Hilang
              </span>
            )}

            {lostFound.is_completed ? (
              <span
                data-testid="detail-completed-badge"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60"
              >
                <IconCircleCheck size={14} />
                Selesai
              </span>
            ) : (
              <span
                data-testid="detail-completed-badge"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60"
              >
                <IconClock size={14} />
                Dalam Proses
              </span>
            )}
          </div>

          <h1 data-testid="detail-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {lostFound.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2">
              <IconUser size={16} />
              <span data-testid="detail-author">{lostFound.author?.name || "Pengguna"}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <IconCalendar size={16} />
              <span data-testid="detail-date">{formatDate(lostFound.created_at)}</span>
            </span>
          </div>

          <p data-testid="detail-description" className="text-base text-slate-700 leading-relaxed whitespace-pre-line">
            {lostFound.description}
          </p>
        </div>
      </article>

      <ChangeCoverModal
        show={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        lostFound={lostFound}
        onSuccess={refresh}
      />
      <ChangeModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        lostFound={lostFound}
        onSuccess={refresh}
      />
    </div>
  );
}

export default DetailPage;
