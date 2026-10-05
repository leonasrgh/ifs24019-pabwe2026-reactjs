import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import {
  asyncSetIsLostFoundChangeCover,
  setIsLostFoundChangeCoverActionCreator,
  setIsLostFoundChangedCoverActionCreator,
} from "../states/action";
import { IconX, IconPhotoUp, IconLoader2, IconUpload } from "@tabler/icons-react";

function ChangeCoverModal({ show, onClose, lostFound, onSuccess }) {
  const dispatch = useDispatch();

  const isLostFoundChangeCover = useSelector((state) => state.isLostFoundChangeCover);
  const isLostFoundChangedCover = useSelector((state) => state.isLostFoundChangedCover);

  const [loading, setLoading] = useState(false);
  const [fileCover, setFileCover] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
      setFileCover(null);
      setPreviewUrl(null);
    } else {
      document.body.style.overflow = "auto";
    }
  }, [show]);

  useEffect(() => {
    if (isLostFoundChangeCover) {
      dispatch(setIsLostFoundChangeCoverActionCreator(false));
      setLoading(false);
      if (isLostFoundChangedCover) {
        dispatch(setIsLostFoundChangedCoverActionCreator(false));
        if (onSuccess) onSuccess();
        onClose();
      }
    }
  }, [isLostFoundChangeCover, isLostFoundChangedCover, dispatch, onClose, onSuccess]);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        showErrorDialog("Hanya file JPEG, JPG, atau PNG yang diperbolehkan!");
        return;
      }
      const MAX_FILE_SIZE = 1024 * 1024; // 1MB sesuai batas server
      if (file.size > MAX_FILE_SIZE) {
        showErrorDialog("Ukuran file terlalu besar. Maksimal 1MB!");
        return;
      }
      setFileCover(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  function handleSave(e) {
    e.preventDefault();
    if (!fileCover) {
      showErrorDialog("Pilih file cover terlebih dahulu!");
      return;
    }

    setLoading(true);
    dispatch(asyncSetIsLostFoundChangeCover(lostFound.id, fileCover));
  }

  if (!show || !lostFound) return null;

  return (
    <div
      data-testid="change-cover-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <IconPhotoUp size={18} stroke={2.5} />
            </div>
            <h3 className="text-base font-bold text-slate-800">Ubah Cover Laporan</h3>
          </div>
          <button
            type="button"
            data-testid="close-cover-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Pilih Gambar Cover
            </label>
            <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition-all overflow-hidden relative">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <div className="w-10 h-10 mb-2 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <IconUpload size={20} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    Klik untuk memilih foto
                  </p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG, JPEG (Max. 1MB)</p>
                </div>
              )}
              <input
                type="file"
                data-testid="cover-file-input"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              data-testid="cancel-cover-modal-btn"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              data-testid="submit-cover-modal-btn"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-xl shadow-md shadow-sky-600/25 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <IconLoader2 size={18} className="animate-spin" />
                  <span>Mengunggah...</span>
                </>
              ) : (
                <>
                  <IconUpload size={18} stroke={2.5} />
                  <span>Unggah Cover</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangeCoverModal;
