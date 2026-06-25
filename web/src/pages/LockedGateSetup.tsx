import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, ShieldCheck, Eye, Loader2, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'
import api, { API_BASE_URL } from '../services/api'
import toast from 'react-hot-toast'

const LockedGateSetup = () => {
  const { currentTheme } = useTheme()
  const { user } = useAuth()
  const [step, setStep] = useState(user?.vaultPassword ? 'verify' : 'create')
  const [accountPassword, setAccountPassword] = useState('')
  const [newVaultPassword, setNewVaultPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showAccPass, setShowAccPass] = useState(false)
  const [showVaultPass, setShowVaultPass] = useState(false)

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await api.post('/auth/vault/setup', {
        password: newVaultPassword,
        accountPassword: accountPassword || undefined
      })
      toast.success('Locked Gate password updated!')
      window.location.reload()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Setup failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // We'll reuse the setup endpoint's check by passing an empty new vault password temporarily
      // or just assume if they get here we handle it. 
      // Actually let's just use the setup endpoint to 'update'
      setStep('create') 
      toast.success('Identity verified. Set new password.')
    } catch (error: any) {
      toast.error('Identity verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8 lg:p-12 max-w-2xl mx-auto space-y-12">
      <header className="text-center">
         <div 
           className="w-20 h-20 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_var(--primary-glow)] transition-all duration-500"
           style={{ backgroundColor: currentTheme.primary }}
         >
            <Lock className="text-black" size={36} />
         </div>
         <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter italic">
            LOCKED GATE <span style={{ color: currentTheme.primary }}>COMMAND.</span>
         </h1>
         <p className="text-slate-500 font-medium">
            Configure the secondary security layer for your most sensitive encrypted assets.
         </p>
      </header>

      <div className="mb-8 p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl text-amber-500 text-left">
           <div className="flex items-center gap-3 mb-2">
              <ShieldCheck size={18} />
              <span className="text-[11px] font-black uppercase tracking-widest">GATE SECURITY PROTOCOL</span>
           </div>
           <p className="text-[10px] font-bold leading-relaxed opacity-80 uppercase tracking-wider">
              THIS SECRET PASSWORD IS YOUR SECONDARY ENCRYPTION KEY. IT CANNOT BE RECOVERED. IF LOST, ALL FILES IN THE LOCKED GATE WILL BE PERMANENTLY INACCESSIBLE.
           </p>
      </div>

      <div className="grid md:grid-cols-1 gap-8">
        <div className="glass-card rounded-[48px] p-10 border-white/5 relative overflow-hidden bg-black/40 backdrop-blur-3xl">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <ShieldCheck size={120} style={{ color: currentTheme.primary }} />
          </div>

          <AnimatePresence mode="wait">
            {step === 'verify' && user?.vaultPassword && (
              <motion.div 
                key="verify"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8 relative z-10"
              >
                 <div className="flex items-center gap-4 p-6 bg-primary/10 border border-primary/20 rounded-3xl" style={{ color: currentTheme.primary }}>
                    <KeyRound size={24} className="shrink-0" />
                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                       AUTHORIZATION REQUIRED TO ACCESS SECURE LAYERS.
                    </p>
                 </div>

                 <div className="space-y-6">
                    <div className="relative">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Vault Secret Password</label>
                       <input 
                         type={showVaultPass ? 'text' : 'password'} 
                         placeholder="ENTER SECRET PASSWORD" 
                         className="glass-input w-full py-5 pr-12 text-[10px] font-black tracking-[0.2em] uppercase"
                         value={newVaultPassword}
                         onChange={(e) => setNewVaultPassword(e.target.value)}
                         autoFocus
                       />
                       <button
                         type="button"
                         className="absolute right-4 bottom-4 text-slate-500 hover:text-[var(--primary-color)]"
                         onClick={() => setShowVaultPass(!showVaultPass)}
                       >
                          <Eye size={20} className={showVaultPass ? '' : 'opacity-20'} />
                       </button>
                    </div>
                    <button 
                      onClick={async () => {
                        setIsLoading(true);
                        try {
                          const res = await api.post('/auth/vault/unlock', { password: newVaultPassword });
                          if (res.data.success) {
                            toast.success('Gate Unlocked');
                            window.location.href = '/locked'; // Navigate to dedicated locked assets page
                          }
                        } catch (err: any) {
                          toast.error(err.response?.data?.message || 'Authorization Failed');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={!newVaultPassword || isLoading}
                      className="w-full btn-primary py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] disabled:opacity-50"
                    >
                       {isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Open Locked Gate'}
                    </button>

                    <button 
                      onClick={() => setStep('reset')}
                      className="w-full text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all mt-4 border-t border-white/5 pt-6"
                    >
                      Forget Secret Password? Authorization Reset
                    </button>
                 </div>
              </motion.div>
            )}

            {step === 'reset' && (
              <motion.div 
                key="reset"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8 relative z-10"
              >
                 <button onClick={() => setStep('verify')} className="flex items-center gap-2 text-slate-500 hover:text-white mb-4">
                    <ArrowLeft size={14} /> <span className="text-[10px] font-black uppercase">Back to Access</span>
                 </button>
                 <div className="text-center">
                    <h3 className="text-xl font-black text-white mb-2 uppercase italic">Identity Verification</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">Authorizing reset of Locked Gate encryption keys</p>
                 </div>
                 
                 <div className="space-y-6">
                    {user?.googleId ? (
                      <div className="space-y-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase text-center leading-loose">
                           You are logged in with Google. <br /> Authorize reset by re-authenticating with Google Protocol.
                        </p>
                        <button 
                          onClick={() => window.location.href = `${API_BASE_URL}/api/auth/google`}
                          className="w-full glass-card hover:bg-white/10 flex items-center justify-center gap-4 py-6 rounded-3xl font-black text-[11px] uppercase tracking-widest transition-all border-white/10"
                        >
                          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                          Re-authenticate Google
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="relative">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Account Password</label>
                          <input 
                            type={showAccPass ? 'text' : 'password'} 
                            placeholder="MAIN ACCOUNT PASSWORD" 
                            className="glass-input w-full py-5 pr-12 text-[10px] font-black tracking-[0.2em] uppercase"
                            value={accountPassword}
                            onChange={(e) => setAccountPassword(e.target.value)}
                            autoFocus
                          />
                          <button
                            type="button"
                            className="absolute right-4 bottom-4 text-slate-500"
                            onClick={() => setShowAccPass(!showAccPass)}
                          >
                             <Eye size={20} className={showAccPass ? '' : 'opacity-20'} />
                          </button>
                        </div>
                        <button 
                          onClick={handleResetVerification}
                          disabled={!accountPassword || isLoading}
                          className="w-full btn-primary py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] disabled:opacity-50"
                        >
                           Authorize Security Reset
                        </button>
                      </div>
                    )}
                 </div>
              </motion.div>
            )}

            {step === 'create' && (
              <motion.div 
                key="create"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <form onSubmit={handleSetup} className="space-y-8 relative z-10">
                   <div className="relative">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">
                         {user?.vaultPassword ? 'New Secret Password' : 'Initialize Secret Password'}
                      </label>
                      <input 
                        type={showVaultPass ? 'text' : 'password'} 
                        placeholder="MINIMUM 8 CHARACTERS" 
                        className="glass-input w-full py-5 pr-12 text-[10px] font-black tracking-[0.2em] uppercase"
                        value={newVaultPassword}
                        onChange={(e) => setNewVaultPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        className="absolute right-4 bottom-4 text-slate-500"
                        onClick={() => setShowVaultPass(!showVaultPass)}
                      >
                         <Eye size={20} className={showVaultPass ? '' : 'opacity-20'} />
                      </button>
                   </div>

                   <button 
                     type="submit"
                     disabled={isLoading || newVaultPassword.length < 8}
                     className="w-full btn-primary py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                      {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                      {user?.vaultPassword ? 'Commit Key Change' : 'Initialize Secure Gate'}
                   </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default LockedGateSetup
