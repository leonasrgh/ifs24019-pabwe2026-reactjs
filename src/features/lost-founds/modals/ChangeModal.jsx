import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import {
  asyncSetIsLostFoundChange,
  setIsLostFoundChangeActionCreator,
  setIsLostFoundChangedActionCreator,
} from "../states/action";
import { IconX, IconEdit, IconLoader2, IconDeviceFloppy } from "@tabler/icons-react";

function ChangeModal({ show, onClose, lostFound, onSuccess }) {
  const dispatch = useDispatch();

  const isLostFoundChange = useSelector((state) => state.isLostFoundChange);
  const isLostFoundChanged = useSelector((state) => state.isLostFoundChanged);

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("lost");
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (lostFound && show) {
      setTitle(lostFound.title || "");
      setDescription(lostFound.description || "");
      setStatus(lostFound.status === "found" ? "found" : "lost");
      setIsCompleted(Boolean(lostFound.is_completed));
    }
  }, [lostFound, show]);

  useEffect(() => {
    if (isLostFoundChange) {
      setLoading(false);
      dispatch(setIsLostFoundChangeActionCreator(false));
      if (isLostFoundChanged) {
        dispatch(setIsLostFoundChangedActionCreator(false));
        if (onSuccess) onSuccess();
        onClose();
      }
    }
  }, [isLostFoundChange, isLostFoundChanged, dispatch, onClose, onSuccess]);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [show]);

  function handleSave(e) {
    e.preventDefault();
    if (!title.trim()) {
      showErrorDialog("Judul tidak boleh kosong");
      return;
    }

    if (!description.trim()) {
      showErrorDialog("Deskripsi tidak boleh kosong");
      return;
    }

    setLoading(true);
    dispatch(
      asyncSetIsLostFoundChange(lostFound.id, title.trim(), description.trim(), status, isCompleted)
    );
  }

  if (!show || !lostFound) return null;

  return (
    <div
      data-testid="edit-lost-found-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <IconEdit size={18} stroke={2.5} />
            </div>
            <h3 className="text-base font-bold text-slate-800">Ubah Data Laporan</h3>
          </div>
          <button
            type="button"
            data-testid="close-edit-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Jenis Laporan
              </label>
              <select
                data-testid="edit-lost-found-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm"
              >
                <option value="lost">Barang Hilang</option>
                <option value="found">Barang Ditemukan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Status Penyelesaian
              </label>
              <select
                data-testid="edit-lost-found-completed-select"
                value={isCompleted ? "1" : "0"}
                onChange={(e) => setIsCompleted(e.target.value === "1")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm"
              >
                <option value="0">Belum Selesai</option>
                <option value="1">Sudah Selesai</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              data-testid="edit-lost-found-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea
              data-testid="edit-lost-found-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              data-testid="cancel-edit-modal-btn"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              data-testid="submit-edit-modal-btn"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 rounded-xl shadow-md shadow-amber-500/25 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <IconLoader2 size={18} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <IconDeviceFloppy size={18} stroke={2.5} />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangeModal;
