import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaBell, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [notificationsNonLues, setNotificationsNonLues] = useState(0);
  const menuRef = useRef(null);

  // ▶️ Ferme le menu si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ▶️ Récupérer les notifications non lues
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/notifications/me?non_lues=true', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setNotificationsNonLues(res.data.length || 0);
      } catch (err) {
        console.error('Erreur récupération notifications :', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 🔁 Actualise toutes les 10 sec
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-green-700">RecyTech Admin</h1>
      <div className="flex items-center gap-4 relative">
        {/* 🔔 Notifications */}
        <div className="relative cursor-pointer" onClick={() => navigate('/admin/notifications')}>
          <FaBell className="text-gray-600 text-xl" />
          {notificationsNonLues > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notificationsNonLues}
            </span>
          )}
        </div>

        {/* 👤 Menu utilisateur */}
        <button onClick={() => setShowMenu(!showMenu)} className="text-gray-600 text-xl">
          <FaUser />
        </button>

        {showMenu && (
          <div
            ref={menuRef}
            className="absolute right-0 top-12 bg-white shadow-md rounded w-44 py-2 z-50"
          >
            <div className="px-4 py-2 text-sm text-gray-500 border-b">
              {user?.full_name}
            </div>
            <button
              onClick={() => {
                setShowMenu(false);
                navigate('/admin/profil');
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              Mon profil
            </button>
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
            >
              <FaSignOutAlt /> Se déconnecter
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
