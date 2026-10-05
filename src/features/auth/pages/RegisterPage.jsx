import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useInput from "../../../hooks/useInput";
import {
  asyncSetIsAuthRegister,
  setIsAuthRegisterActionCreator,
} from "../states/action";
import { IconUser, IconMail, IconLock, IconLoader2, IconUserPlus } from "@tabler/icons-react";

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAuthRegister = useSelector((state) => state.isAuthRegister);

  const [loading, setLoading] = useState(false);
  const [name, onChangeName, setName] = useInput("");
  const [email, onChangeEmail, setEmail] = useInput("");
  const [password, onChangePassword, setPassword] = useInput("");

  // 1. Periksa apakah register telah selesai diproses
  useEffect(() => {
    if (isAuthRegister === true) {
      setLoading(false);
      dispatch(setIsAuthRegisterActionCreator(false));
      setName("");
      setEmail("");
      setPassword("");
      navigate("/auth/login");
    } else if (isAuthRegister === false) {
      setLoading(false);
    }
  }, [isAuthRegister, dispatch, setName, setEmail, setPassword, navigate]);

  async function onSubmitHandler(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await dispatch(asyncSetIsAuthRegister(name, email, password));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
          Nama Lengkap
        </label>
        <div className="relative">
          <IconUser
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            data-testid="register-name-input"
            value={name}
            onChange={onChangeName}
            placeholder="Nama Lengkap Anda"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            required
          />
        </div>
      </div>

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
            data-testid="register-email-input"
            value={email}
            onChange={onChangeEmail}
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
            data-testid="register-password-input"
            value={password}
            onChange={onChangePassword}
            placeholder="Minimal 6 karakter"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            required
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          data-testid="register-submit-button"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
        >
          {loading ? (
            <>
              <IconLoader2 size={18} className="animate-spin" />
              <span>Mendaftarkan Akun...</span>
            </>
          ) : (
            <>
              <IconUserPlus size={18} stroke={2.5} />
              <span>Daftar Akun</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default RegisterPage;
