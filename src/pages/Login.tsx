import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);
    setLoading(false);

    if (success) {
      navigate('/dashboard');
    } else {
      setError('Email ou mot de passe incorrect.');
    }
  };

  // Quick login hints
  const quickLogins = [
    { label: 'Admin', email: 'admin@futur.bj', pass: 'Admin@123456', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    { label: 'Direction', email: 'direction@futur.bj', pass: 'Dir@123456789', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { label: 'Responsable', email: 'resp-godomey@futur.bj', pass: 'Resp@123456', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
    { label: 'Formateur IA', email: 'formateur-ia@futur.bj', pass: 'Form@123456', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#40A0F0] via-[#60B8F0] to-[#20D8D8] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAgMi4yLTEuOCA0LTQgNHMtNC0xLjgtNC00IDEuOC00IDQtNCA0IDEuOCA0IDR6TTQ4IDE4YzAgMi4yLTEuOCA0LTQgNHMtNC0xLjgtNC00IDEuOC00IDQtNCA0IDEuOCA0IDR6TTI0IDE4YzAgMi4yLTEuOCA0LTQgNHMtNC0xLjgtNC00IDEuOC00IDQtNCA0IDEuOCA0IDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
        <div className="relative z-10 text-center px-12">
          <div className="mb-6">
            <img src="/images/logo-futur.png" alt="FUTUR NOTES Logo" className="h-28 w-28 mx-auto object-contain drop-shadow-2xl" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">FUTUR NOTES</h1>
          <p className="text-xl text-white/80 mb-6">
            Programme FUTUR — République du Bénin
          </p>
          <div className="max-w-md mx-auto">
            <p className="text-white/70 leading-relaxed">
              Plateforme centralisée de gestion des notes et résultats 
              des apprenants du Programme FUTUR. Suivi rigoureux, 
              calculs automatisés, rapports statistiques fiables.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-white/70 text-sm">
            <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-[#20D8D8]" />Natitingou</div>
            <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-[#20D8D8]" />Parakou</div>
            <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-[#20D8D8]" />Dassa</div>
            <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-[#20D8D8]" />Bohicon</div>
            <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-[#20D8D8]" />Godomey</div>
            <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-[#20D8D8]" />Minontin</div>
            <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-[#20D8D8]" />Haie Vive</div>
            <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-[#20D8D8]" />Akpakpa</div>
            <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-[#20D8D8]" />Porto-Novo</div>
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img src="/images/logo-futur.png" alt="FUTUR NOTES" className="h-14 w-14 mx-auto mb-3 object-contain" />
            <h2 className="text-2xl font-bold text-gray-900">FUTUR NOTES</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
            <p className="text-gray-500 mt-1">Accédez à votre espace de travail</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="vous@futur.bj"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#40A0F0] focus:border-[#40A0F0] outline-none transition-shadow text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#40A0F0] focus:border-[#40A0F0] outline-none transition-shadow text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#40A0F0] to-[#20D8D8] text-white rounded-lg font-medium hover:from-[#3080C0] hover:to-[#18B8B8] focus:ring-4 focus:ring-[#40A0F0]/20 transition-all disabled:opacity-60 shadow-lg shadow-[#40A0F0]/20 text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connexion en cours...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Quick Login */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Connexion rapide (démo)</p>
            <div className="grid grid-cols-2 gap-2">
              {quickLogins.map(ql => (
                <button
                  key={ql.email}
                  onClick={() => { setEmail(ql.email); setPassword(ql.pass); }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${ql.color}`}
                >
                  {ql.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
