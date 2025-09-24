// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance.js';
import { initSocket } from '../socket';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Utilise axiosInstance pour pointer sur le backend Railway
      const res = await axiosInstance.post('/auth/login', { email, password });
      const { user, token } = res.data;

      // Stocke l'utilisateur et le token dans le contexte Auth
      login(user, token);

      // Initialise la connexion socket globale après login
      const socket = initSocket();
      socket.emit('register_user', { userId: user.id, role: user.role });

      // Redirection selon le rôle
      switch (user.role) {
        case 'Admin':
          navigate('/admin');
          break;
        case 'Autorite':
          navigate('/autorite');
          break;
        case 'user':
          navigate('/user');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur de connexion');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-200 to-green-500">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-green-600">Connexion à RecyTech</h1>
        {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div className="text-right text-sm">
            <button
              type="button"
              className="text-green-600 hover:underline"
              onClick={() => navigate('/reset-password')}
            >
              Mot de passe oublié ?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
