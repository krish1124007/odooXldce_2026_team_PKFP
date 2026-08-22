import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { 
  User, 
  Mail, 
  Save, 
  Sparkles, 
  Globe, 
  Bookmark, 
  Shield, 
  Trash2, 
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TRAVEL_STYLES = ['Budget', 'Balanced', 'Luxury', 'Backpacker'];
const INTEREST_OPTIONS = [
  'Food & Dining',
  'Culture & Heritage',
  'Photography',
  'Nature & Hiking',
  'Adventure',
  'Shopping',
  'Nightlife',
  'Sightseeing'
];
const TRAVEL_PACES = ['Relaxed', 'Balanced', 'Fast-paced'];
const LANGUAGES = ['English', 'Hindi', 'Gujarati'];

export default function ProfileSettingsPage() {
  const { user, updateProfile, updatePreferences, deleteAccount } = useAuth();

  // Personal Info Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [language, setLanguage] = useState('English');
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoFeedback, setInfoFeedback] = useState(null);

  // Preferences Form State
  const [travelStyle, setTravelStyle] = useState('Balanced');
  const [interests, setInterests] = useState([]);
  const [travelPace, setTravelPace] = useState('Balanced');
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefFeedback, setPrefFeedback] = useState(null);

  // Delete Account Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setProfilePhoto(user.profilePhoto || '');
      setLanguage(user.language || 'English');
      setTravelStyle(user.travelStyle || 'Balanced');
      setInterests(user.interests || []);
      setTravelPace(user.travelPace || 'Balanced');
    }
  }, [user]);

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setInfoFeedback(null);
    setInfoSaving(true);

    const res = await updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      profilePhoto: profilePhoto.trim(),
      language
    });

    setInfoSaving(false);
    setInfoFeedback({
      type: res.success ? 'success' : 'error',
      text: res.message
    });
  };

  const handlePrefSubmit = async (e) => {
    e.preventDefault();
    setPrefFeedback(null);
    setPrefSaving(true);

    const res = await updatePreferences({
      travelStyle,
      interests,
      travelPace
    });

    setPrefSaving(false);
    setPrefFeedback({
      type: res.success ? 'success' : 'error',
      text: res.message
    });
  };

  const toggleInterest = (interest) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleDeleteAccount = async () => {
    if (confirmInput.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type "DELETE" to confirm.');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    const res = await deleteAccount();
    setIsDeleting(false);

    if (!res.success) {
      setDeleteError(res.message || 'Failed to delete account.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 py-4 px-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Profile & Settings</h1>
        <p className="text-xs text-slate-500">Manage your profile details, travel style preferences, and account controls</p>
      </div>

      {/* 1. PERSONAL INFORMATION */}
      <Card title="Personal Information" subtitle="Your core account profile details">
        {infoFeedback && (
          <div className={`mb-4 p-3 rounded-lg border text-xs flex items-center gap-2 ${
            infoFeedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {infoFeedback.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> : <AlertCircle size={16} className="text-red-500 shrink-0" />}
            <span>{infoFeedback.text}</span>
          </div>
        )}

        <form onSubmit={handleInfoSubmit} className="flex flex-col gap-4 mt-2">
          {/* Avatar Preview & URL */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md overflow-hidden shrink-0">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile Avatar" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <span>{(firstName?.[0] || 'U') + (lastName?.[0] || '')}</span>
              )}
            </div>
            <div className="flex-1">
              <Input 
                label="Profile Photo URL (Optional)" 
                placeholder="https://example.com/avatar.jpg" 
                icon={Camera} 
                value={profilePhoto} 
                onChange={(e) => setProfilePhoto(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="First Name" 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              icon={User} 
              required 
            />
            <Input 
              label="Last Name" 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
              icon={User} 
              required 
            />
          </div>

          <Input 
            label="Email Address" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            icon={Mail} 
            required 
          />

          <div className="flex justify-end mt-2">
            <Button variant="primary" icon={Save} disabled={infoSaving}>
              {infoSaving ? 'Saving Changes...' : 'Save Personal Details'}
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. AI CONTEXT & TRAVEL PREFERENCES */}
      <Card 
        title="✨ AI Context & Travel Preferences" 
        subtitle="GlobeTrotter AI agents use these preferences when curating and optimizing your travel itineraries"
      >
        {prefFeedback && (
          <div className={`mb-4 p-3 rounded-lg border text-xs flex items-center gap-2 ${
            prefFeedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {prefFeedback.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> : <AlertCircle size={16} className="text-red-500 shrink-0" />}
            <span>{prefFeedback.text}</span>
          </div>
        )}

        <form onSubmit={handlePrefSubmit} className="space-y-5 mt-2">
          {/* Travel Style */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">Travel Style</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TRAVEL_STYLES.map(style => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setTravelStyle(style)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    travelStyle === style 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">Travel Interests (Select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map(interest => {
                const isSelected = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-indigo-100 border-indigo-300 text-indigo-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{interest}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Travel Pace */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">Preferred Travel Pace</label>
            <div className="grid grid-cols-3 gap-2">
              {TRAVEL_PACES.map(pace => (
                <button
                  key={pace}
                  type="button"
                  onClick={() => setTravelPace(pace)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    travelPace === pace 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {pace}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" icon={Sparkles} disabled={prefSaving}>
              {prefSaving ? 'Saving Preferences...' : 'Save Travel Preferences'}
            </Button>
          </div>
        </form>
      </Card>

      {/* 3. LANGUAGE & REGIONAL */}
      <Card title="Language & Regional Settings" subtitle="Choose your preferred interface language">
        <div className="flex items-center gap-4 mt-2">
          <Globe size={20} className="text-slate-400 shrink-0" />
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-700 block mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* 4. SAVED DESTINATIONS (Structure Ready) */}
      <Card title="Saved Destinations" subtitle="Destinations you have bookmarked for future trips">
        <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-200 text-center mt-2">
          <Bookmark size={32} className="mx-auto text-slate-400 mb-2" />
          <p className="text-xs font-semibold text-slate-700">No saved destinations yet</p>
          <p className="text-xs text-slate-500 mt-1">Bookmarked cities and destinations from Phase 3 discovery will appear here.</p>
        </div>
      </Card>

      {/* 5. PRIVACY & DATA CONTROLS */}
      <Card title="Privacy & Data Controls" subtitle="Manage your profile and trip sharing default preferences">
        <div className="space-y-4 mt-2">
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-slate-500" />
              <div>
                <p className="text-xs font-semibold text-slate-800">Public Profile Visibility</p>
                <p className="text-[11px] text-slate-500">Allow other travelers to see your public travel profile</p>
              </div>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      {/* 6. DANGER ZONE */}
      <Card title="Danger Zone" subtitle="Irreversible account actions">
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <AlertTriangle size={22} className="text-red-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-red-900">Delete Account</p>
              <p className="text-[11px] text-red-700">Permanently remove your GlobeTrotter account and profile data.</p>
            </div>
          </div>
          <Button 
            variant="danger" 
            icon={Trash2}
            onClick={() => {
              setConfirmInput('');
              setDeleteError('');
              setIsDeleteModalOpen(true);
            }}
          >
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Delete Account Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Account Deletion"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
            <AlertTriangle size={18} className="shrink-0 text-red-600 mt-0.5" />
            <span>
              <strong>Warning:</strong> This action cannot be undone. All your profile information and saved settings will be deleted.
            </span>
          </div>

          <div>
            <label className="text-xs text-slate-700 block mb-1 font-semibold">
              Type <strong>DELETE</strong> to confirm account deletion:
            </label>
            <input 
              type="text" 
              value={confirmInput} 
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="DELETE" 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-500" 
            />
            {deleteError && (
              <p className="text-xs text-red-600 font-medium mt-1">{deleteError}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button 
              variant="secondary" 
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              icon={Trash2} 
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmInput.trim().toUpperCase() !== 'DELETE'}
            >
              {isDeleting ? 'Deleting...' : 'Permanently Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
