import React, { useState } from 'react';
import { X, ShieldAlert, Terminal, QrCode, Cpu, Copy, Check, ExternalLink, KeyRound } from 'lucide-react';
import { PROVISIONING_COMMANDS } from '../data/androidFiles';

interface ProvisioningGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProvisioningGuideModal: React.FC<ProvisioningGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'adb' | 'qr' | 'architecture'>('adb');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const qrPayload = JSON.stringify(
    {
      'android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME':
        'com.company.calculatorvault/com.company.calculatorvault.SecureDeviceAdmin',
      'android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION':
        'https://enterprise.internal.company.com/apk/calculator-vault-dpc.apk',
      'android.app.extra.PROVISIONING_DEVICE_ADMIN_SIGNATURE_CHECKSUM':
        'q83nf894nfkjhsd87y34kjhsdf87y345kjhsd8f7y345kjhsdf87',
      'android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE': {
        master_code: '25797',
        auto_lockdown: true
      }
    },
    null,
    2
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Enterprise DPC Provisioning & Architecture Guide
              </h2>
              <p className="text-xs text-slate-400">
                How to set Device Owner privileges and enforce hard hardware policies
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('adb')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'adb'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>ADB CLI Method (Developer / Test)</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'qr'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Code Enrollment (Production Rollout)</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'architecture'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Policy Security Specs</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs leading-relaxed space-y-5">
          {activeTab === 'adb' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200">
                <span className="font-semibold block mb-1">Prerequisite: Zero Accounts on Device</span>
                Android OS strictly forbids designating a Device Owner if any Google Account, Microsoft Exchange, or personal account has already been added to the target device. Run on a freshly wiped device or factory-reset state during developer testing.
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2 text-sm">Step 1: Install the Calculator Vault APK</h3>
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl font-mono text-slate-300 border border-slate-800">
                  <span>adb install -r -t app-debug.apk</span>
                  <button
                    onClick={() => handleCopy('adb install -r -t app-debug.apk', 'step1')}
                    className="p-1 hover:text-white"
                  >
                    {copiedKey === 'step1' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2 text-sm">Step 2: Assign Device Owner Privileges</h3>
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl font-mono text-slate-300 border border-slate-800">
                  <span className="break-all">{PROVISIONING_COMMANDS.adbSetOwner}</span>
                  <button
                    onClick={() => handleCopy(PROVISIONING_COMMANDS.adbSetOwner, 'step2')}
                    className="p-1 hover:text-white ml-2 shrink-0"
                  >
                    {copiedKey === 'step2' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-1 text-slate-400 text-[11px]">
                  Output should read: <span className="text-emerald-400 font-mono">Success: Device owner set to package...</span>
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2 text-sm">Step 3: Verification</h3>
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl font-mono text-slate-300 border border-slate-800">
                  <span>{PROVISIONING_COMMANDS.adbVerify}</span>
                  <button
                    onClick={() => handleCopy(PROVISIONING_COMMANDS.adbVerify, 'step3')}
                    className="p-1 hover:text-white"
                  >
                    {copiedKey === 'step3' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="font-semibold text-slate-300 block mb-1">To Remove Device Owner during teardown:</span>
                <span className="font-mono text-slate-400 text-[11px] block">{PROVISIONING_COMMANDS.adbRemoveOwner}</span>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="space-y-4">
              <p className="text-slate-300">
                In corporate enterprise rollouts (COBO / COPE devices), the device is powered on from factory seal, the welcome screen is tapped 6 times, and the camera scans a provisioning QR code containing this JSON payload:
              </p>

              <div className="relative p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300">
                <button
                  onClick={() => handleCopy(qrPayload, 'qrJson')}
                  className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                >
                  {copiedKey === 'qrJson' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <pre className="overflow-x-auto">{qrPayload}</pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block mb-1">Zero-Touch Enrollment (ZTE)</span>
                  Devices purchased from Google-authorized enterprise resellers are automatically enrolled into this DPC upon first boot and WiFi connection.
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block mb-1">Samsung Knox Mobile Enrollment (KME)</span>
                  Knox hardware fuses verify the DPC integrity and enforce re-installation even if firmware is reflashed via Odin.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <h4 className="font-bold text-white mb-1">Why Ordinary Apps Cannot Enforce These Restrictions</h4>
                <p className="text-slate-400 leading-relaxed">
                  In Android, user restrictions like <code className="text-sky-300 font-mono">DISALLOW_FACTORY_RESET</code> are guarded by system-level checks inside <code className="text-sky-300 font-mono">UserManagerService</code>. Only a component verified as <code className="text-emerald-400 font-mono">isDeviceOwnerApp()</code> or holding signature-level <code className="text-purple-300 font-mono">MANAGE_DEVICE_ADMINS</code> can invoke <code className="text-amber-300 font-mono">DevicePolicyManager.addUserRestriction()</code> without crashing with a <code className="text-rose-400 font-mono">SecurityException</code>.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="font-bold text-emerald-400 font-mono">1. UserManager.DISALLOW_FACTORY_RESET</span>
                  <p className="text-slate-300 mt-1">
                    Disables "Reset options" in Settings and sets the hardware recovery flag to ignore manual button-combination wipe requests.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="font-bold text-emerald-400 font-mono">2. UserManager.DISALLOW_MODIFY_ACCOUNTS</span>
                  <p className="text-slate-300 mt-1">
                    Blocks both account removal (stopping users from detaching MDM work accounts) and adding unapproved personal Google accounts to download unauthorized APKs.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="font-bold text-emerald-400 font-mono">3. UserManager.DISALLOW_APPS_CONTROL</span>
                  <p className="text-slate-300 mt-1">
                    Gray-outs "Force Stop", "Uninstall", and "Clear Storage" inside App Info for all managed company applications, ensuring background DPC services cannot be terminated.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Master Vault Code: <strong className="text-white font-mono">25797=</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
