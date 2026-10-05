import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import apiHelper from "../../../helpers/apiHelper";
import { asyncSetProfile, setIsProfile } from "../../users/states/action";
import { asyncSetIsAuthLogout, setIsAuthLogoutActionCreator } from "../../auth/states/action";
import NavbarComponent from "../components/NavbarComponent";
import SidebarComponent from "../components/SidebarComponent";

function LostFoundLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const profile = useSelector((state) => state.profile);
  const isProfile = useSelector((state) => state.isProfile);
  const isAuthLogout = useSelector((state) => state.isAuthLogout);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 1. Jalankan sekali untuk mengecek apakah pengguna sudah login
  useEffect(() => {
    const authToken = apiHelper.getAccessToken();
    if (authToken) {
      dispatch(asyncSetProfile());
    } else {
      navigate("/auth/login");
    }
  }, [dispatch, navigate]);

  // 2. Jika proses pengambilan profil selesai dan tidak ada profile, arahkan ke login
  useEffect(() => {
    if (isProfile) {
      dispatch(setIsProfile(false));
      if (!profile) {
        apiHelper.putAccessToken("");
        navigate("/auth/login");
      }
    }
  }, [isProfile, profile, dispatch, navigate]);

  // 3. Efek setelah logout
  useEffect(() => {
    if (isAuthLogout) {
      dispatch(setIsAuthLogoutActionCreator(false));
      navigate("/auth/login");
    }
  }, [isAuthLogout, dispatch, navigate]);

  function handleLogout() {
    dispatch(asyncSetIsAuthLogout());
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Memuat sesi pengguna...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <NavbarComponent
        profile={profile}
        handleLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      <SidebarComponent
        isSidebarOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      <main className="pt-16 md:pl-64 transition-all">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default LostFoundLayout;
