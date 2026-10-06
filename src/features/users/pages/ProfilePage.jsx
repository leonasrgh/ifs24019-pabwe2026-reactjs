import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  asyncPutProfile,
  asyncPostProfilePhoto,
  asyncPutProfilePassword,
  setIsChangeProfileActionCreator,
  setIsChangeProfilePhotoActionCreator,
  setIsChangeProfilePasswordActionCreator,
} from "../states/action";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import {
  IconUser,
  IconLock,
  IconCamera,
  IconCheck,
  IconLoader2,
  IconShieldLock,
} from "@tabler/icons-react";

function ProfilePage() {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.profile);

  const isChangeProfile = useSelector((state) => state.isChangeProfile);
  const isChangeProfilePhoto = useSelector((state) => state.isChangeProfilePhoto);
  const isChangeProfilePassword = useSelector(
    (state) => state.isChangeProfilePassword
  );

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
    }
  }, [profile]);

  useEffect(() => {
    if (isChangeProfile) {
      setLoadingProfile(false);
      dispatch(setIsChangeProfileActionCreator(false));
    }
  }, [isChangeProfile, dispatch]);

  useEffect(() => {
    if (isChangeProfilePhoto) {
      setLoadingPhoto(false);
      dispatch(setIsChangeProfilePhotoActionCreator(false));
    }
  }, [isChangeProfilePhoto, dispatch]);

  useEffect(() => {
    if (isChangeProfilePassword) {
      setLoadingPassword(false);
      dispatch(setIsChangeProfilePasswordActionCreator(false));
      setOldPassword("");
      setNewPassword("");
      setNewPasswordConfirmation("");
    }
  }, [isChangeProfilePassword, dispatch]);

  function handleUpdateProfile(e) {
    e.preventDefault();
    if (!name.trim()) {
      showErrorDialog("Nama tidak boleh kosong!");
      return;
    }
    if (!email.trim()) {
      showErrorDialog("Email tidak boleh kosong!");
      return;
    }
    setLoadingProfile(true);
    dispatch(asyncPutProfile(name.trim(), email.trim()));
  }

  function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showErrorDialog("Pilih file gambar yang valid!");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      showErrorDialog("Ukuran file foto maksimal 3MB!");
      return;
    }

    setLoadingPhoto(true);
    dispatch(asyncPostProfilePhoto(file));
  }

  function handleUpdatePassword(e) {
    e.preventDefault();
    if (!oldPassword) {
      showErrorDialog("Kata sandi lama wajib diisi!");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showErrorDialog("Kata sandi baru minimal 6 karakter!");
      return;
    }
    if (newPassword !== newPasswordConfirmation) {
      showErrorDialog("Konfirmasi kata sandi tidak cocok!");
      return;
    }

    setLoadingPassword(true);
    dispatch(
      asyncPutProfilePassword(
        oldPassword,
        newPassword,
        newPasswordConfirmation
      )
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <IconLoader2 size={36} className="text-indigo-600 animate-spin mb-2" />
        <p className="text-sm font-medium text-slate-600">Memuat data profil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Profil Akun
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola informasi identitas, foto profil, dan keamanan akun Anda.
        </p>
      </div>

      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          {profile.photo ? (
            <img
              src={profile.photo}
              alt={profile.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-indigo-100"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-3xl shadow-md">
              {profile.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}

          <label
            data-testid="upload-profile-photo-btn"
            className="absolute bottom-0 right-0 p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer transition-transform hover:scale-105"
            title="Ubah Foto Profil"
          >
            {loadingPhoto ? (
              <IconLoader2 size={16} className="animate-spin" />
            ) : (
              <IconCamera size={16} />
            )}
            <input
              type="file"
              data-testid="profile-photo-file-input"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-xl font-bold text-slate-800">{profile.name}</h2>
          <p className="text-sm text-slate-500">{profile.email}</p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              <IconCheck size={14} /> Terverifikasi
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Biodata */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <IconUser size={18} />
            </div>
            <h3 className="font-bold text-slate-800">Ubah Biodata</h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="profile-name-input" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <input id="profile-name-input"
                type="text"
                data-testid="profile-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                required
              />
            </div>

            <div>
              <label label htmlFor="profile-email-input" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Alamat Email
              </label>
              <input id="profile-email-input"
                type="email"
                data-testid="profile-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                data-testid="submit-profile-btn"
                disabled={loadingProfile}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
              >
                {loadingProfile ? (
                  <>
                    <IconLoader2 size={18} className="animate-spin" />
                    <span>Menyimpan Perubahan...</span>
                  </>
                ) : (
                  <span>Simpan Perubahan</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Form Ganti Password */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <IconShieldLock size={18} />
            </div>
            <h3 className="font-bold text-slate-800">Keamanan & Password</h3>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Kata Sandi Saat Ini
              </label>
              <input
                type="password"
                data-testid="current-password-input"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Kata Sandi Baru
              </label>
              <input
                type="password"
                data-testid="new-password-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Ulangi Kata Sandi Baru
              </label>
              <input
                type="password"
                data-testid="confirm-password-input"
                value={newPasswordConfirmation}
                onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                placeholder="Konfirmasi kata sandi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                data-testid="submit-password-btn"
                disabled={loadingPassword}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl shadow-md transition-all disabled:opacity-60"
              >
                {loadingPassword ? (
                  <>
                    <IconLoader2 size={18} className="animate-spin" />
                    <span>Memperbarui Password...</span>
                  </>
                ) : (
                  <span>Perbarui Password</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
