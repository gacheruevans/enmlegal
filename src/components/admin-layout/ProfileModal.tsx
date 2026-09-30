import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  UserCircleIcon,
  PhoneIcon,
  LockClosedIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PhotoIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import api from '../../lib/api';
import { UserAvatar, normalizeAvatarUrl } from '../common/UserAvatar';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string | null;
    role?: string;
    imageUrl?: string | null;
  } | null;
  onProfileUpdated?: (updatedUser: any) => void;
}

const PRESET_AVATARS = [
  { label: 'Advocate Eva Nduta', url: '/profile.png' },
  { label: 'Executive Portrait', url: '/profile2.png' },
  { label: 'Firm Seal / Icon', url: '/avatar.png' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [customUrlInput, setCustomUrlInput] = useState('');

  // Password fields
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      const normImg = normalizeAvatarUrl(currentUser.imageUrl);
      setImageUrl(normImg || '');
      setCustomUrlInput(normImg || '');
      setShowPasswordSection(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (.jpg, .png, .webp).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image file size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageUrl(result);
      setCustomUrlInput(result);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to process image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Full Name is required.');
      return;
    }

    if (showPasswordSection) {
      if (!currentPassword) {
        setError('Please enter your current password to authorize password change.');
        return;
      }
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match. Please recheck.');
        return;
      }
    }

    setLoading(true);

    try {
      const payload: Record<string, any> = {
        name: trimmedName,
        phone: phone.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
      };

      if (showPasswordSection && newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const response = await api.patch('/auth/profile', payload);
      const updatedUser = response.data?.user;

      if (updatedUser) {
        // Sync with localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Notify entire app of user identity update
        window.dispatchEvent(
          new CustomEvent('auth:user-updated', { detail: updatedUser })
        );

        if (onProfileUpdated) {
          onProfileUpdated(updatedUser);
        }

        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to update profile. Please try again.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserCircleIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">User Profile Settings</h2>
              <p className="text-xs text-slate-300">Manage your administrative credentials & preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          {/* Status Alerts */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 flex items-start gap-3 text-red-700 dark:text-red-300 text-xs animate-in fade-in">
              <ExclamationCircleIcon className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-xs animate-in fade-in">
              <CheckCircleIcon className="w-5 h-5 shrink-0 text-emerald-500" />
              <div className="flex-1 font-medium">{success}</div>
            </div>
          )}

          {/* Avatar Section */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <PhotoIcon className="w-4 h-4 text-amber-500" />
                Profile Avatar
              </span>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl('');
                    setCustomUrlInput('');
                  }}
                  className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium cursor-pointer"
                >
                  Reset to Monogram
                </button>
              )}
            </div>

            <div className="flex items-center gap-5">
              <div className="relative group">
                <UserAvatar
                  src={imageUrl}
                  name={name || currentUser?.name || 'User'}
                  size="2xl"
                  className="ring-4 ring-amber-500/20 shadow-md"
                />
              </div>

              <div className="flex-1 space-y-2.5">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Select a recommended law firm avatar, upload a file, or enter an image URL:
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-2">
                  {PRESET_AVATARS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => {
                        setImageUrl(preset.url);
                        setCustomUrlInput(preset.url);
                      }}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition cursor-pointer flex items-center gap-1.5 ${
                        imageUrl === preset.url
                          ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-semibold'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <SparklesIcon className="w-3.5 h-3.5 text-amber-500" />
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Upload or Custom Input */}
                <div className="flex items-center gap-2 pt-1">
                  <label className="text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg font-medium cursor-pointer transition flex items-center gap-1.5 shrink-0">
                    <PhotoIcon className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    value={customUrlInput}
                    onChange={(e) => {
                      setCustomUrlInput(e.target.value);
                      setImageUrl(e.target.value);
                    }}
                    placeholder="or paste image URL (/profile.png or https://...)"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Primary Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Advocate Eva Nduta Munene"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <PhoneIcon className="w-3.5 h-3.5 text-slate-400" />
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254 701 857 030"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>
          </div>

          {/* Email Address - Strictly Locked / Non-editable */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <LockClosedIcon className="w-3.5 h-3.5 text-amber-500" />
                Email Address
              </label>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                <LockClosedIcon className="w-3 h-3 text-slate-400" />
                Immutable / Read Only
              </span>
            </div>
            <input
              type="email"
              disabled
              readOnly
              value={currentUser?.email || ''}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 cursor-not-allowed select-none"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
              Email addresses cannot be modified directly to preserve audit logging and compliance integrity. Please contact the Super Administrator if an email reassignment is needed.
            </p>
          </div>

          {/* Role Pill */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Assigned System Role</span>
            <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {currentUser?.role || 'ADMIN'}
            </span>
          </div>

          {/* Change Password Collapsible Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="flex items-center justify-between w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <KeyIcon className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {showPasswordSection ? 'Hide Password Change Section' : 'Change Account Password'}
                </span>
              </div>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                {showPasswordSection ? 'Cancel' : 'Change Password'}
              </span>
            </button>

            {showPasswordSection && (
              <div className="mt-4 p-4 rounded-xl border border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/10 space-y-3.5 animate-in slide-in-from-top-2 duration-200">
                {/* Current Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter existing password"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showCurrentPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showNewPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md shadow-amber-500/20 transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-slate-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving Changes...</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
