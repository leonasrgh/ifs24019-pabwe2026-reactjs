import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  IconMapSearch,
  IconUser,
  IconLogout,
  IconChevronDown,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";

function NavbarComponent({ profile, handleLogout, onToggleSidebar, isSidebarOpen }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-testid="toggle-sidebar-btn"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="Toggle Navigation"
          >
            {isSidebarOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
          </button>

          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <IconMapSearch size={22} stroke={2.5} />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent">
                Delcom Lost & Found
              </span>
            </div>
          </Link>
        </div>

        {/* Profile User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            data-testid="profile-dropdown-button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {profile?.photo ? (
              <img
                src={profile.photo}
                alt={profile.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs">
                {profile?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-800 leading-tight">
                {profile?.name || "Pengguna"}
              </span>
              <span className="text-xs text-slate-500 leading-tight">
                {profile?.email || ""}
              </span>
            </div>
            <IconChevronDown
              size={16}
              className={`text-slate-400 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div
              data-testid="profile-dropdown-menu"
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-900/5 divide-y divide-slate-100 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-3 py-2 sm:hidden">
                <p className="text-sm font-semibold text-slate-800">{profile?.name}</p>
                <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  data-testid="dropdown-profile-link"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 rounded-xl hover:bg-slate-100 transition-colors text-left"
                >
                  <IconUser size={18} className="text-slate-500" />
                  Profil Saya
                </button>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  data-testid="dropdown-logout-button"
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 rounded-xl hover:bg-red-50 transition-colors text-left"
                >
                  <IconLogout size={18} className="text-red-500" />
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default NavbarComponent;
