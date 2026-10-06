import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import apiHelper from "../../../helpers/apiHelper";
import { asyncSetProfile, setIsProfile } from "../../users/states/action";
import { IconChecklist } from "@tabler/icons-react";

function AuthLayout() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const profile = useSelector((state) => state.profile);
  const isProfile = useSelector((state) => state.isProfile);

  useEffect(() => {
    const authToken = apiHelper.getAccessToken();
    if (authToken) {
      dispatch(asyncSetProfile());
    }
  }, [dispatch]);

  useEffect(() => {
    if (isProfile) {
      dispatch(setIsProfile(false));
      if (profile) {
        navigate("/");
      }
    }
  }, [isProfile, profile, dispatch, navigate]);

  const isLoginActive = location.pathname === "/auth/login";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 items-center justify-center text-white shadow-xl shadow-indigo-500/25 mb-3">
          <IconChecklist size={32} stroke={2.5} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Delcom Lost & Found
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Aplikasi Pengelola Tugas & Autentikasi Modern
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100">
          {/* Tabs */}
          <div className="flex rounded-2xl bg-slate-100 p-1 mb-6">
            <NavLink
              to="/auth/login"
              className={`flex-1 py-2 text-center text-sm font-semibold rounded-xl transition-all ${
                isLoginActive
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Masuk Akun
            </NavLink>
            <NavLink
              to="/auth/register"
              className={`flex-1 py-2 text-center text-sm font-semibold rounded-xl transition-all ${
                !isLoginActive
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Daftar Baru
            </NavLink>
          </div>

          <Outlet />
        </div>
      </div>
    </main>
  );
}

export default AuthLayout;
