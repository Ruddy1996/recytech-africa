import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

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
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      login(res.data.user, res.data.token);

      console.log("Rôle détecté:", res.data.user.role);
      // Redirection selon le rôle
      const role = res.data.user.role;

      if (role === 'Admin') {
        navigate('/admin');
      } else if (role === 'Autorite') {
        navigate('/autorite');
      } else if (role === 'user') {
        navigate('/user');
      } else {
        navigate('/'); // fallback
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
