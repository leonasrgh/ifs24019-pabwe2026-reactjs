import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import useInput from "../../../hooks/useInput";
import {
  asyncSetIsAuthLogin,
  setIsAuthLoginActionCreator,
} from "../states/action";
import { asyncSetProfile, setIsProfile } from "../../users/states/action";
import apiHelper from "../../../helpers/apiHelper";
import { IconMail, IconLock, IconLoader2, IconLogin } from "@tabler/icons-react";

function LoginPage() {
  const dispatch = useDispatch();

  const isAuthLogin = useSelector((state) => state.isAuthLogin);
  const isProfile = useSelector((state) => state.isProfile);

  const [loading, setLoading] = useState(false);
  const [email, onEmailChange] = useInput("");
  const [password, onPasswordChange] = useInput("");

  // 1. Periksa apakah login berhasil
  useEffect(() => {
    if (isAuthLogin === true) {
      const authToken = apiHelper.getAccessToken();
      if (authToken) {
        dispatch(asyncSetProfile());
      } else {
        setLoading(false);
        dispatch(setIsAuthLoginActionCreator(false));
      }
    }
  }, [isAuthLogin, dispatch]);

  // 2. Jika profile selesai di-fetch atau gagal
  useEffect(() => {
    if (isProfile) {
      setLoading(false);
      dispatch(setIsAuthLoginActionCreator(false));
      dispatch(setIsProfile(false));
    }
  }, [isProfile, dispatch]);

  async function onSubmitHandler(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await dispatch(asyncSetIsAuthLogin(email, password));
      if (!apiHelper.getAccessToken()) {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
          Alamat Email
        </label>
        <div className="relative">
          <IconMail
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="email"
            id="login-email-input"
            data-testid="login-email-input"
            value={email}
            onChange={onEmailChange}
            placeholder="nama@email.com"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
          Kata Sandi
        </label>
        <div className="relative">
          <IconLock
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="password"
            id="login-password-input"
            data-testid="login-password-input"
            value={password}
            onChange={onPasswordChange}
            placeholder="••••••••"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            required
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          id="login-submit-button"
          data-testid="login-submit-button"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
        >
          {loading ? (
            <>
              <IconLoader2 size={18} className="animate-spin" />
              <span>Sedang Masuk...</span>
            </>
          ) : (
            <>
              <IconLogin size={18} stroke={2.5} />
              <span>Masuk Sekarang</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default LoginPage;
