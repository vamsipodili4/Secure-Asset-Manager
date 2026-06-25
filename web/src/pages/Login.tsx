import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, Loader2, UserPlus, ShieldCheck, ChevronRight, Eye } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import api, { API_BASE_URL } from '../services/api'

const Login = () => {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validatePassword = (pass: string) => {
    const hasUpper = /[A-Z]/.test(pass)
    const hasLower = /[a-z]/.test(pass)
    const hasNumber = /[0-9]/.test(pass)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass)
    return pass.length >= 8 && hasUpper && hasLower && hasNumber && hasSpecial
  }

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isRegister) {
      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        return toast.error('Please fill in all fields')
      }
      if (!validatePassword(password)) {
        return toast.error('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.')
      }
      if (password !== confirmPassword) {
        return toast.error('Passwords do not match')
      }
    } else {
      if (!email || !password) return toast.error('Please fill in all fields')
    }
    
    setIsLoading(true)
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login'
      const payload = isRegister 
        ? { firstName, lastName, email, password }
        : { email, password }
        
      await api.post(endpoint, payload)
      toast.success(isRegister ? 'Account created successfully!' : 'Welcome back!')
      window.location.href = '/dashboard'
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0B2418] overflow-hidden relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(#FFB800_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.03]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FFB800]/5 rounded-full blur-[120px] animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card p-10 md:p-12 rounded-[48px] w-full max-w-lg text-center border-[#FFB800]/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative overflow-hidden bg-black/60 backdrop-blur-3xl"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFB800]/40 to-transparent" />
        
        <div className="mb-10">
          <motion.div 
            whileHover={{ rotate: 180 }}
            className="w-20 h-20 bg-[#FFB800] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(255,184,0,0.3)]"
          >
            <ShieldCheck className="text-black" size={40} />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2">
            {isRegister ? 'CREATE ACCOUNT' : 'SYSTEM ACCESS'}
          </h1>
          <p className="text-[#FFB800] font-bold text-[10px] uppercase tracking-[0.3em] font-sans">Secure Asset Manager v2.0</p>
        </div>

        <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 text-left">
           <div className="flex items-center gap-3 mb-2">
              <ShieldCheck size={18} />
              <span className="text-[11px] font-black uppercase tracking-widest">CRITICAL SECURITY WARNING</span>
           </div>
           <p className="text-[10px] font-bold leading-relaxed opacity-80 uppercase tracking-wider">
              YOUR PASSWORD IS NON-RECOVERABLE VIA EMAILS. PLEASE ENSURE YOU REMEMBER IT ABSOLUTELY. LOSS OF PASSWORD MEANS LOSS OF ACCESS TO ALL ENCRYPTED ASSETS.
           </p>
        </div>

        <div className="flex gap-4 mb-8 p-1.5 bg-white/5 rounded-2xl border border-white/5">
          <button 
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isRegister ? 'bg-[#FFB800] text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isRegister ? 'bg-[#FFB800] text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            Register
          </button>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full glass-card hover:bg-white/10 flex items-center justify-center gap-4 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all group border-white/5 hover:border-[#FFB800]/40"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Continue with Google Protocol
        </button>

        <div className="my-10 flex items-center gap-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/5"></div>
          <span className="text-[10px] font-black text-slate-700 tracking-[0.3em]">OR SECURE ID</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/5"></div>
        </div>

        <form onSubmit={handleAuth} className="space-y-5 text-left">
          <AnimatePresence mode="wait">
            {isRegister ? (
              <motion.div 
                key="register-fields"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">First Name</label>
                  <input 
                    type="text" 
                    placeholder="John" 
                    className="glass-input w-full py-4 text-sm"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Last Name</label>
                  <input 
                    type="text" 
                    placeholder="Doe" 
                    className="glass-input w-full py-4 text-sm"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Email Address</label>
            <input 
              type="email" 
              placeholder="agent@sam.com" 
              className="glass-input w-full py-4 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">{isRegister ? 'Create Password' : 'Vault Password'}</label>
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••" 
              className="glass-input w-full py-4 text-sm pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-4 bottom-3.5 text-slate-500 hover:text-[#FFB800] transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              <Eye size={20} className={showPassword ? 'text-[#FFB800]' : 'opacity-20'} />
            </button>
          </div>

          {isRegister && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="relative"
            >
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Confirm Password</label>
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                className="glass-input w-full py-4 text-sm pr-12"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-4 bottom-3.5 text-slate-500 hover:text-[#FFB800] transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Eye size={20} className={showConfirmPassword ? 'text-[#FFB800]' : 'opacity-20'} />
              </button>
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,184,0,0.2)] hover:scale-[1.02] active:scale-95 transition-all mt-4"
            style={{ backgroundColor: '#FFB800' }}
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (isRegister ? <UserPlus size={20} /> : <LogIn size={20} />)}
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">
              {isRegister ? 'Initialize Account' : 'Authenticate User'}
            </span>
          </button>
        </form>

        <p className="mt-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 leading-relaxed">
          By continuing, you agree to S.A.M's <br className="md:hidden" />
          <Link to="/terms" className="text-[#FFB800] hover:underline underline-offset-4 mx-1">Terms of Service</Link> 
          and 
          <Link to="/privacy" className="text-[#FFB800] hover:underline underline-offset-4 ml-1">Privacy Policy</Link>.
        </p>

        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#FFB800]/5 rounded-full blur-3xl pointer-events-none" />
      </motion.div>
    </div>
  )
}

export default Login
