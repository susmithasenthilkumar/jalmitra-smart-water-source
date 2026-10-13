import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  Smartphone, 
  Lock, 
  Mail, 
  User, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  Send,
  Building,
  KeyRound
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { dataService } from '../services/dataService';
import { getTranslation } from '../i18n/translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  tamilEnabled: boolean;
  onToggleTamil: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  tamilEnabled,
  onToggleTamil
}) => {
  const lang = tamilEnabled ? 'ta' : 'en';
  const t = (k: any) => getTranslation(k, lang);

  // Tab: 'villager' vs 'admin' vs 'supervisor'
  const [activeTab, setActiveTab] = useState<'villager' | 'admin' | 'supervisor'>('villager');

  // Villager Auth State
  const [villagerMode, setVillagerMode] = useState<'login' | 'signup'>('signup');
  const [villagerName, setVillagerName] = useState('');
  const [villagerPhone, setVillagerPhone] = useState('9840212345');
  const [selectedVillageId, setSelectedVillageId] = useState('VIL-01');
  const [selectedWardId, setSelectedWardId] = useState('WRD-01-2');

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  // Admin Auth State
  const [adminMode, setAdminMode] = useState<'login' | 'signup'>('login');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('admin@panchayat.gov.in');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [adminDept, setAdminDept] = useState('Panchayat Administration');
  const [adminError, setAdminError] = useState<string | null>(null);

  // Supervisor Auth State
  const [supervisorMode, setSupervisorMode] = useState<'login' | 'signup'>('login');
  const [supervisorName, setSupervisorName] = useState('');
  const [supervisorEmail, setSupervisorEmail] = useState('supervisor@panchayat.gov.in');
  const [supervisorPassword, setSupervisorPassword] = useState('super123');
  const [supervisorDept, setSupervisorDept] = useState('Rural Water Supply & Engineering Division');
  const [supervisorError, setSupervisorError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentVillageWards = dataService.getWardsForVillage(selectedVillageId);

  // Villager OTP Request
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    const cleanPhone = villagerPhone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setOtpError(tamilEnabled ? 'சரியான 10-இலக்க செல்போன் எண்ணை உள்ளிடவும்' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (villagerMode === 'signup' && !villagerName.trim()) {
      setOtpError(tamilEnabled ? 'உங்கள் பெயரை உள்ளிடவும்' : 'Please enter your full name');
      return;
    }

    // Generate simulated 6-digit OTP
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    setOtpSent(true);
  };

  // Villager OTP Verify & Proceed
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setOtpError(tamilEnabled ? 'தவறான OTP எண். மீண்டும் முயற்சிக்கவும்.' : 'Invalid OTP. Please check the code.');
      return;
    }

    const chosenVillage = dataService.villages.find(v => v.id === selectedVillageId);
    const chosenWard = currentVillageWards.find(w => w.id === selectedWardId);

    let profile: UserProfile;
    if (villagerMode === 'signup') {
      profile = dataService.registerVillager({
        name: villagerName.trim() || 'Citizen',
        phone: villagerPhone,
        villageId: selectedVillageId,
        villageName: chosenVillage?.name || 'Gram Panchayat',
        wardId: selectedWardId,
        wardName: chosenWard?.name || 'Ward 1'
      });
    } else {
      // Login
      const existing = dataService.loginVillager(villagerPhone);
      if (existing) {
        profile = existing;
      } else {
        // First-time number logging in through login tab
        profile = dataService.registerVillager({
          name: 'Panchayat Resident',
          phone: villagerPhone,
          villageId: selectedVillageId,
          villageName: chosenVillage?.name || 'Gram Panchayat',
          wardId: selectedWardId,
          wardName: chosenWard?.name || 'Ward 1'
        });
      }
    }

    onAuthSuccess(profile);
    onClose();
  };

  // Admin Login / Signup
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    if (!adminEmail.includes('@')) {
      setAdminError(tamilEnabled ? 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்' : 'Please enter a valid email address');
      return;
    }

    if (adminMode === 'signup') {
      if (!adminName.trim() || !adminPassword.trim()) {
        setAdminError(tamilEnabled ? 'அனைத்து விவரங்களையும் பூர்த்தி செய்யவும்' : 'Please fill all required fields');
        return;
      }
      const official = dataService.registerOfficial({
        name: adminName,
        email: adminEmail,
        role: 'admin',
        designation: adminDept || 'Panchayat Executive Officer'
      });
      onAuthSuccess(official);
    } else {
      const official = dataService.loginOfficial(adminEmail);
      if (official) {
        official.role = 'admin';
        onAuthSuccess(official);
      }
    }
    onClose();
  };

  // Supervisor Login / Signup
  const handleSupervisorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSupervisorError(null);

    if (!supervisorEmail.includes('@')) {
      setSupervisorError(tamilEnabled ? 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்' : 'Please enter a valid email address');
      return;
    }

    if (supervisorMode === 'signup') {
      if (!supervisorName.trim() || !supervisorPassword.trim()) {
        setSupervisorError(tamilEnabled ? 'அனைத்து விவரங்களையும் பூர்த்தி செய்யவும்' : 'Please fill all required fields');
        return;
      }
      const official = dataService.registerOfficial({
        name: supervisorName,
        email: supervisorEmail,
        role: 'supervisor',
        designation: supervisorDept || 'Technical Water Supervisor'
      });
      onAuthSuccess(official);
    } else {
      const official = dataService.loginOfficial(supervisorEmail);
      if (official) {
        official.role = 'supervisor';
        onAuthSuccess(official);
      }
    }
    onClose();
  };

  // Quick Demo Access Helper
  const handleQuickDemo = (type: 'villager1' | 'villager2' | 'admin' | 'supervisor') => {
    if (type === 'villager1') {
      const v = dataService.registeredVillagers[0] || {
        id: 'USR-VIL-01',
        name: 'K. Muthulakshmi',
        role: 'villager',
        phone: '9840212345',
        villageId: 'VIL-01',
        villageName: 'Melur Gram Panchayat',
        wardId: 'WRD-01-2',
        wardName: 'Ward 2 - Temple Ward & Market',
        isRegistered: true
      };
      dataService.setCurrentUser(v);
      onAuthSuccess(v);
    } else if (type === 'villager2') {
      const v = dataService.registeredVillagers[1] || {
        id: 'USR-VIL-02',
        name: 'P. Murugan',
        role: 'villager',
        phone: '9842100112',
        villageId: 'VIL-02',
        villageName: 'Keelur Gram Panchayat',
        wardId: 'WRD-02-1',
        wardName: 'Ward 1 - Main Bazaar',
        isRegistered: true
      };
      dataService.setCurrentUser(v);
      onAuthSuccess(v);
    } else if (type === 'admin') {
      const a: UserProfile = {
        id: 'USR-ADM-01',
        name: 'K. Sundararajan (B.E., M.Tech)',
        role: 'admin',
        email: 'admin@panchayat.gov.in',
        designation: 'Panchayat Executive Officer',
        isRegistered: true
      };
      dataService.setCurrentUser(a);
      onAuthSuccess(a);
    } else if (type === 'supervisor') {
      const s: UserProfile = {
        id: 'USR-SUP-01',
        name: 'Er. R. Senthilkumar',
        role: 'supervisor',
        email: 'supervisor@panchayat.gov.in',
        designation: 'Assistant Executive Engineer',
        isRegistered: true
      };
      dataService.setCurrentUser(s);
      onAuthSuccess(s);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header with Title and Language Switcher */}
        <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-blue-950 p-6 text-white relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                {t('appName')}
              </span>
              <button
                type="button"
                onClick={onToggleTamil}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
              >
                {tamilEnabled ? t('switchLanguage') : 'தமிழில் மாற்றுக'}
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-black tracking-tight text-white">
            {t('authPortalTitle')}
          </h3>
          <p className="text-xs text-cyan-200/80 mt-1">
            {t('authPortalSubtitle')}
          </p>

          {/* Role Choice Tabs - 3 Dedicated Portals */}
          <div className="grid grid-cols-3 gap-1.5 mt-5 p-1 bg-black/25 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => { setActiveTab('villager'); setOtpSent(false); }}
              className={`py-2 px-1.5 rounded-xl text-[11px] font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-x-1 sm:space-x-1.5 ${
                activeTab === 'villager'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{tamilEnabled ? 'கிராம மக்கள்' : 'Villager'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`py-2 px-1.5 rounded-xl text-[11px] font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-x-1 sm:space-x-1.5 ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{t('roleAdminShort')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('supervisor')}
              className={`py-2 px-1.5 rounded-xl text-[11px] font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-x-1 sm:space-x-1.5 ${
                activeTab === 'supervisor'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{tamilEnabled ? 'மேற்பார்வையாளர்' : 'Supervisor'}</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          
          {/* TAB 1: VILLAGER AUTH (Phone + OTP, Sign-up vs Log-in, Village & Ward Selection) */}
          {activeTab === 'villager' && (
            <div>
              {/* Sign Up vs Log In Toggle */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <span className="text-xs font-bold text-slate-700">
                  {villagerMode === 'signup' ? t('signUpPrompt') : t('logInPrompt')}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setVillagerMode(villagerMode === 'signup' ? 'login' : 'signup');
                    setOtpSent(false);
                  }}
                  className="text-xs font-bold text-cyan-700 hover:text-cyan-800 underline underline-offset-2"
                >
                  {villagerMode === 'signup' ? t('logInPrompt') : t('signUpPrompt')}
                </button>
              </div>

              {!otpSent ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  {/* First Time User Fields: Full Name, Village, Ward */}
                  {villagerMode === 'signup' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {t('fullNameLabel')} <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={villagerName}
                            onChange={(e) => setVillagerName(e.target.value)}
                            placeholder={t('fullNamePlaceholder')}
                            required
                            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {t('selectVillageLabel')} <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={selectedVillageId}
                            onChange={(e) => {
                              setSelectedVillageId(e.target.value);
                              const wards = dataService.getWardsForVillage(e.target.value);
                              if (wards[0]) setSelectedWardId(wards[0].id);
                            }}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none bg-white font-medium"
                          >
                            {dataService.villages.map(v => (
                              <option key={v.id} value={v.id}>
                                {tamilEnabled ? (v.tamilName || v.name) : v.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {t('selectWardLabel')} <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={selectedWardId}
                            onChange={(e) => setSelectedWardId(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none bg-white font-medium"
                          >
                            {currentVillageWards.map(w => (
                              <option key={w.id} value={w.id}>
                                {tamilEnabled ? w.tamilName : w.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Phone Number Field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('phoneLabel')} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-2.5 flex items-center space-x-1 text-slate-500 font-bold text-xs">
                        <span>🇮🇳 +91</span>
                      </div>
                      <input
                        type="tel"
                        value={villagerPhone}
                        onChange={(e) => setVillagerPhone(e.target.value)}
                        placeholder={t('phonePlaceholder')}
                        required
                        className="w-full pl-20 pr-3 py-2 text-xs font-mono font-bold text-slate-800 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {otpError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-cyan-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('getOtpBtn')}</span>
                  </button>
                </form>
              ) : (
                /* Step 2: OTP Verification */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  {/* SMS Simulation Banner */}
                  <div className="p-3.5 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-950 text-xs">
                    <div className="flex items-center space-x-2 font-bold mb-1 text-cyan-800">
                      <Smartphone className="w-4 h-4 text-cyan-600" />
                      <span>{t('otpSentBanner')}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-cyan-200/60">
                      <span className="font-mono text-xl font-black tracking-widest text-cyan-900 bg-white px-3 py-1 rounded-lg border border-cyan-300 shadow-xs">
                        {generatedOtp}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEnteredOtp(generatedOtp)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs shadow-xs"
                      >
                        {t('autoFillOtpBtn')}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('otpInputLabel')}
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        maxLength={6}
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        placeholder="••••••"
                        required
                        className="w-full pl-9 pr-3 py-2 text-center text-lg font-mono font-extrabold tracking-widest border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {otpError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-100"
                    >
                      {tamilEnabled ? 'பின்செல்' : 'Back'}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('verifyAndProceed')}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: PANCHAYAT ADMIN AUTH */}
          {activeTab === 'admin' && (
            <div>
              {/* Role Header Badge */}
              <div className="p-3 mb-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-700" />
                  <div>
                    <h4 className="font-extrabold text-xs">
                      {t('administratorPortal')}
                    </h4>
                    <p className="text-[10px] text-blue-700/80">
                      {t('adminPortalDescription')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin')}
                  className="px-2.5 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-[10px] transition-colors shrink-0"
                >
                  ⚡ {t('quickDemo')}
                </button>
              </div>

              {/* Sign Up vs Log In Toggle */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <span className="text-xs font-bold text-slate-700">
                  {adminMode === 'login' ? t('adminLogin') : t('adminSignup')}
                </span>
                <button
                  type="button"
                  onClick={() => setAdminMode(adminMode === 'login' ? 'signup' : 'login')}
                  className="text-xs font-bold text-blue-700 hover:text-blue-800 underline underline-offset-2"
                >
                  {adminMode === 'login' ? t('registerNewAdmin') : t('existingAdminLogin')}
                </button>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                {adminMode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t('fullNameLabel')} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          placeholder={t('adminNamePlaceholder')}
                          required
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t('panchayatDesignation')}
                      </label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={adminDept}
                          onChange={(e) => setAdminDept(e.target.value)}
                          placeholder={t('panchayatDesignationPlaceholder')}
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('officialAdminEmail')} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@panchayat.gov.in"
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {tamilEnabled ? 'கடவுச்சொல்' : 'Password'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="admin123"
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {adminError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{adminError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs shadow-md shadow-blue-700/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>{adminMode === 'signup' ? (tamilEnabled ? 'நிர்வாகியாகப் பதிவு செய்க' : 'Register as Admin') : (tamilEnabled ? 'நிர்வாகியாக உள்நுழைக' : 'Log In as Panchayat Admin')}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: TECHNICAL SUPERVISOR AUTH */}
          {activeTab === 'supervisor' && (
            <div>
              {/* Role Header Badge */}
              <div className="p-3 mb-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <KeyRound className="w-4 h-4 text-teal-700" />
                  <div>
                    <h4 className="font-extrabold text-xs">
                      {t('supervisorPortal')}
                    </h4>
                    <p className="text-[10px] text-teal-700/80">
                      {t('supervisorPortalDescription')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('supervisor')}
                  className="px-2.5 py-1 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-[10px] transition-colors shrink-0"
                >
                  ⚡ {t('quickDemo')}
                </button>
              </div>

              {/* Sign Up vs Log In Toggle */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <span className="text-xs font-bold text-slate-700">
                  {supervisorMode === 'login' ? t('supervisorLogin') : t('supervisorSignup')}
                </span>
                <button
                  type="button"
                  onClick={() => setSupervisorMode(supervisorMode === 'login' ? 'signup' : 'login')}
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 underline underline-offset-2"
                >
                  {supervisorMode === 'login' ? t('registerNewSupervisor') : t('existingSupervisorLogin')}
                </button>
              </div>

              <form onSubmit={handleSupervisorSubmit} className="space-y-4">
                {supervisorMode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t('fullNameLabel')} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={supervisorName}
                          onChange={(e) => setSupervisorName(e.target.value)}
                          placeholder={t('supervisorNamePlaceholder')}
                          required
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t('engineeringDivision')}
                      </label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={supervisorDept}
                          onChange={(e) => setSupervisorDept(e.target.value)}
                          placeholder={t('engineeringDivisionPlaceholder')}
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('officialSupervisorEmail')} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={supervisorEmail}
                      onChange={(e) => setSupervisorEmail(e.target.value)}
                      placeholder="supervisor@panchayat.gov.in"
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {tamilEnabled ? 'கடவுச்சொல்' : 'Password'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={supervisorPassword}
                      onChange={(e) => setSupervisorPassword(e.target.value)}
                      placeholder="super123"
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                {supervisorError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{supervisorError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-bold text-xs shadow-md shadow-teal-700/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{supervisorMode === 'signup' ? (tamilEnabled ? 'மேற்பார்வையாளராகப் பதிவு செய்க' : 'Register as Supervisor') : (tamilEnabled ? 'மேற்பார்வையாளராக உள்நுழைக' : 'Log In as Technical Supervisor')}</span>
                </button>
              </form>
            </div>
          )}

          {/* Quick Demo Access Buttons for Evaluators */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              <span>{t('quickDemoTitle')}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('villager1')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-left transition-all"
              >
                <span className="font-bold text-cyan-900 block truncate">{t('quickVillager1')}</span>
                <span className="text-[10px] text-slate-500 block truncate">{t('demoWardDescription')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('villager2')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-left transition-all"
              >
                <span className="font-bold text-cyan-900 block truncate">{t('quickVillager2')}</span>
                <span className="text-[10px] text-slate-500 block truncate">{tamilEnabled ? 'வார்டு 1 குடிநீர் அட்டவணை மற்றும் தரம்' : 'Ward 1 Water Schedule & Quality'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-all"
              >
                <span className="font-bold text-blue-900 block truncate">{t('quickAdmin')}</span>
                <span className="text-[10px] text-slate-500 block truncate">{t('demoAdminDescription')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('supervisor')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-left transition-all"
              >
                <span className="font-bold text-teal-900 block truncate">{t('quickSupervisor')}</span>
                <span className="text-[10px] text-slate-500 block truncate">{t('demoSupervisorDescription')}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
