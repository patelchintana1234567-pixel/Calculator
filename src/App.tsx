import React, { useState } from 'react';
import {
  Shield,
  Download,
  Terminal,
  Cpu,
  BookOpen,
  Smartphone,
  Code2,
  ExternalLink,
  Lock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CodeViewer } from './components/CodeViewer';
import { PhoneSimulator } from './components/PhoneSimulator';
import { AdbTerminalSimulator } from './components/AdbTerminalSimulator';
import { ProvisioningGuideModal } from './components/ProvisioningGuideModal';
import { downloadAndroidProjectZip } from './utils/zipExport';

export default function App() {
  const [showAdbModal, setShowAdbModal] = useState<boolean>(false);
  const [activeWorkspaceView, setActiveWorkspaceView] = useState<'split' | 'code' | 'simulator'>('split');
  const [terminalOpen, setTerminalOpen] = useState<boolean>(false);

  const handleDownloadZip = async () => {
    try {
      await downloadAndroidProjectZip();
    } catch (err) {
      console.error('Failed to export zip:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 
        Top Bar Contract:
        [Zone 1: Brand wordmark] - [Zone 2: 4-5 single-line nav links] - [Zone 3: 1 primary action]
      */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            Android DPC Vault
          </span>
          <span className="hidden sm:inline text-xs text-slate-400 font-mono">
            v1.0 (API 35)
          </span>
        </div>

        {/* Zone 2: 4-5 concise single-line text links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={() => setActiveWorkspaceView('split')}
            className={`transition-colors whitespace-nowrap hover:text-white ${
              activeWorkspaceView === 'split' ? 'text-white font-semibold' : ''
            }`}
          >
            Workbench View
          </button>
          <button
            onClick={() => setActiveWorkspaceView('code')}
            className={`transition-colors whitespace-nowrap hover:text-white ${
              activeWorkspaceView === 'code' ? 'text-white font-semibold' : ''
            }`}
          >
            Kotlin Source
          </button>
          <button
            onClick={() => setActiveWorkspaceView('simulator')}
            className={`transition-colors whitespace-nowrap hover:text-white ${
              activeWorkspaceView === 'simulator' ? 'text-white font-semibold' : ''
            }`}
          >
            Device Emulator
          </button>
          <button
            onClick={() => setShowAdbModal(true)}
            className="transition-colors whitespace-nowrap hover:text-white"
          >
            Provisioning Specs
          </button>
          <button
            onClick={() => setTerminalOpen(!terminalOpen)}
            className="transition-colors whitespace-nowrap hover:text-white flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>ADB Terminal</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleDownloadZip}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all rounded-lg shadow-sm whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Project (.ZIP)</span>
          </button>
        </div>
      </header>

      {/* Subheader Context Strip */}
      <div className="bg-slate-900/40 border-b border-slate-800/80 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-slate-300 font-medium">Vault Master Code:</span>
          <span className="font-mono bg-slate-800 text-sky-300 px-2 py-0.5 rounded font-semibold border border-slate-700/60">
            25797 =
          </span>
          <span className="text-slate-600 hidden md:inline">·</span>
          <span className="hidden md:inline text-slate-400">
            Device Policy Manager: DISALLOW_FACTORY_RESET · DISALLOW_MODIFY_ACCOUNTS · DISALLOW_APPS_CONTROL
          </span>
        </div>

        {/* View Switcher for smaller screens */}
        <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60 text-[11px] font-medium">
          <button
            onClick={() => setActiveWorkspaceView('split')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeWorkspaceView === 'split' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Split View
          </button>
          <button
            onClick={() => setActiveWorkspaceView('code')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeWorkspaceView === 'code' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Source Code
          </button>
          <button
            onClick={() => setActiveWorkspaceView('simulator')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeWorkspaceView === 'simulator' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Phone Simulator
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
          {/* Left Column: Code View (MainActivity.kt, AdminDashboardActivity.kt, SecureDeviceAdmin.kt, AndroidManifest.xml) */}
          {(activeWorkspaceView === 'split' || activeWorkspaceView === 'code') && (
            <div
              className={`h-[780px] flex flex-col ${
                activeWorkspaceView === 'split' ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-12'
              }`}
            >
              <CodeViewer onDownloadZip={handleDownloadZip} />
            </div>
          )}

          {/* Right Column: Interactive Android Device Simulator */}
          {(activeWorkspaceView === 'split' || activeWorkspaceView === 'simulator') && (
            <div
              className={`flex flex-col items-center justify-start ${
                activeWorkspaceView === 'split' ? 'lg:col-span-5 xl:col-span-4' : 'lg:col-span-12'
              }`}
            >
              <div className="w-full flex flex-col items-center">
                <PhoneSimulator onOpenAdbGuide={() => setShowAdbModal(true)} />
              </div>
            </div>
          )}
        </div>

        {/* Collapsible ADB Terminal Drawer */}
        {terminalOpen && (
          <div className="h-64 mt-2 transition-all">
            <AdbTerminalSimulator />
          </div>
        )}

        {/* Enterprise Architecture Brief Card */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 mt-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">
                Implementation Specification & Security Guarantees
              </h2>
            </div>
            <button
              onClick={() => setShowAdbModal(true)}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium underline-offset-2 hover:underline"
            >
              View Full Provisioning Specs →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-1">
              <span className="font-semibold text-white block">1. Stealth Calculator Interception</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                <code className="text-sky-300 font-mono">MainActivity.kt</code> functions identically to standard Android calculators. When the buffer equals <code className="text-emerald-300 font-mono">25797</code> upon pressing <code className="text-emerald-300 font-mono">=</code>, the calculation pipeline is aborted, display wiped, and <code className="text-purple-300 font-mono">AdminDashboardActivity</code> launched.
              </p>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-1">
              <span className="font-semibold text-white block">2. Enterprise Lockdown Enforcement</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                <code className="text-sky-300 font-mono">AdminDashboardActivity.kt</code> exposes the master toggle. Invoking <code className="text-emerald-300 font-mono">SecureDeviceAdmin.enableEnterpriseLockdown()</code> verifies Device Owner status and calls <code className="text-amber-300 font-mono">dpm.addUserRestriction()</code>.
              </p>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-1">
              <span className="font-semibold text-white block">3. DPC Receiver Policy Restrictions</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                <code className="text-sky-300 font-mono">SecureDeviceAdmin.kt</code> inherits from <code className="text-purple-300 font-mono">DeviceAdminReceiver</code>, binding to <code className="text-sky-300 font-mono">BIND_DEVICE_ADMIN</code>. It applies <code className="text-emerald-300 font-mono">DISALLOW_FACTORY_RESET</code>, <code className="text-emerald-300 font-mono">DISALLOW_MODIFY_ACCOUNTS</code>, and <code className="text-emerald-300 font-mono">DISALLOW_APPS_CONTROL</code>.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 px-6 py-4 bg-slate-950 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span>Enterprise Android DPC Implementation</span>
          <span>·</span>
          <span>Target SDK 35 (Android 15)</span>
          <span>·</span>
          <span>Package: <code className="font-mono text-slate-400">com.company.calculatorvault</code></span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTerminalOpen(!terminalOpen)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            {terminalOpen ? 'Hide Terminal' : 'Open ADB Terminal'}
          </button>
          <span>·</span>
          <button
            onClick={() => setShowAdbModal(true)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            Provisioning Docs
          </button>
        </div>
      </footer>

      {/* Provisioning Guide Modal */}
      <ProvisioningGuideModal
        isOpen={showAdbModal}
        onClose={() => setShowAdbModal(false)}
      />
    </div>
  );
}
