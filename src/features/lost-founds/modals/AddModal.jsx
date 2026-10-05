import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useInput from "../../../hooks/useInput";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import {
  asyncSetIsLostFoundAdd,
  setIsLostFoundAddActionCreator,
  setIsLostFoundAddedActionCreator,
} from "../states/action";
import { IconX, IconPlus, IconLoader2 } from "@tabler/icons-react";

function AddModal({ show, onClose, onSuccess }) {
  const dispatch = useDispatch();

  const isLostFoundAdd = useSelector((state) => state.isLostFoundAdd);
  const isLostFoundAdded = useSelector((state) => state.isLostFoundAdded);

  const [loading, setLoading] = useState(false);
  const [title, changeTitle, setTitle] = useInput("");
  const [description, changeDescription, setDescription] = useInput("");
  const [status, setStatus] = useState("lost");

  useEffect(() => {
    if (isLostFoundAdd) {
      setLoading(false);
      dispatch(setIsLostFoundAddActionCreator(false));
      if (isLostFoundAdded) {
        dispatch(setIsLostFoundAddedActionCreator(false));
        setTitle("");
        setDescription("");
        setStatus("lost");
        if (onSuccess) onSuccess();
        onClose();
      }
    }
  }, [isLostFoundAdd, isLostFoundAdded, dispatch, onClose, onSuccess, setTitle, setDescription]);

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
    dispatch(asyncSetIsLostFoundAdd(title.trim(), description.trim(), status));
  }

  if (!show) return null;

  return (
    <div
      data-testid="add-lost-found-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <IconPlus size={18} stroke={2.5} />
            </div>
            <h3 className="text-base font-bold text-slate-800">Tambah Laporan Baru</h3>
          </div>
          <button
            type="button"
            data-testid="close-add-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Jenis Laporan <span className="text-red-500">*</span>
            </label>
            <select
              data-testid="add-lost-found-status-select"
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
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              data-testid="add-lost-found-title-input"
              value={title}
              onChange={changeTitle}
              placeholder="Contoh: Dompet warna hitam"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea
              data-testid="add-lost-found-description-input"
              value={description}
              onChange={changeDescription}
              rows={4}
              placeholder="Tuliskan ciri-ciri barang, lokasi, dan waktu kejadian..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              data-testid="cancel-add-modal-btn"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              data-testid="submit-add-modal-btn"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <IconLoader2 size={18} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <IconPlus size={18} stroke={2.5} />
                  <span>Tambah Laporan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddModal;
