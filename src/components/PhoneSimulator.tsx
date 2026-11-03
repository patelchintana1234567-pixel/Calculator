import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  RotateCcw,
  Wifi,
  Battery,
  Signal,
  ArrowLeft,
  Settings,
  UserX,
  Ban,
  FileText,
  KeyRound,
  CheckCircle2,
  Terminal,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export interface AuditLogItem {
  id: string;
  timestamp: string;
  action: string;
  status: 'success' | 'warning' | 'error';
  details: string;
}

interface PhoneSimulatorProps {
  onOpenAdbGuide: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({ onOpenAdbGuide }) => {
  // Screen views: 'calculator' | 'admin_dashboard' | 'lockscreen' | 'system_dialog'
  const [currentScreen, setCurrentScreen] = useState<'calculator' | 'admin_dashboard' | 'lockscreen'>('calculator');

  // Calculator State
  const [calcInput, setCalcInput] = useState<string>('0');
  const [calcExpression, setCalcExpression] = useState<string>('');
  const [pendingOp, setPendingOp] = useState<string | null>(null);
  const [firstVal, setFirstVal] = useState<number | null>(null);
  const [isNewNumber, setIsNewNumber] = useState<boolean>(true);
  const [vaultUnlockAnim, setVaultUnlockAnim] = useState<boolean>(false);

  // Enterprise DPC State
  const [isDeviceOwner, setIsDeviceOwner] = useState<boolean>(true);
  const [enterpriseLockdown, setEnterpriseLockdown] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'testbench' | 'logs'>('overview');

  // Interactive Test Dialog State
  const [activeModal, setActiveModal] = useState<{
    title: string;
    description: string;
    icon: 'reset' | 'account' | 'appinfo' | 'warning';
    blocked: boolean;
  } | null>(null);

  // Live Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([
    {
      id: '1',
      timestamp: '08:00:12.430',
      action: 'onProfileProvisioningComplete',
      status: 'success',
      details: 'Device Owner verified: com.company.calculatorvault/.SecureDeviceAdmin'
    },
    {
      id: '2',
      timestamp: '08:00:12.890',
      action: 'enableEnterpriseLockdown',
      status: 'success',
      details: 'Enforced DISALLOW_FACTORY_RESET, DISALLOW_MODIFY_ACCOUNTS, DISALLOW_APPS_CONTROL'
    }
  ]);

  // Current live time for Android status bar
  const [timeString, setTimeString] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (action: string, status: 'success' | 'warning' | 'error', details: string) => {
    const now = new Date();
    const timeFormatted = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    setAuditLogs((prev) => [
      {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: timeFormatted,
        action,
        status,
        details
      },
      ...prev.slice(0, 20)
    ]);
  };

  // --- Calculator Logic ---
  const handleDigit = (digit: string) => {
    if (isNewNumber) {
      setCalcInput(digit);
      setIsNewNumber(false);
    } else {
      if (calcInput === '0' && digit !== '.') {
        setCalcInput(digit);
      } else if (calcInput.length < 12) {
        setCalcInput(calcInput + digit);
      }
    }
  };

  const handleDot = () => {
    if (isNewNumber) {
      setCalcInput('0.');
      setIsNewNumber(false);
    } else if (!calcInput.includes('.')) {
      setCalcInput(calcInput + '.');
    }
  };

  const handleOperator = (op: string) => {
    const currentNum = parseFloat(calcInput) || 0;
    if (firstVal === null) {
      setFirstVal(currentNum);
      setCalcExpression(`${currentNum} ${op}`);
    } else if (pendingOp && !isNewNumber) {
      const res = calculate(firstVal, currentNum, pendingOp);
      setFirstVal(res);
      setCalcInput(String(res));
      setCalcExpression(`${res} ${op}`);
    } else {
      setCalcExpression(`${firstVal} ${op}`);
    }
    setPendingOp(op);
    setIsNewNumber(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return b !== 0 ? a / b : 0;
      default:
        return b;
    }
  };

  const handlePercent = () => {
    const val = parseFloat(calcInput) || 0;
    const res = val / 100;
    setCalcInput(String(res));
  };

  const handleClear = () => {
    setCalcInput('0');
    setCalcExpression('');
    setPendingOp(null);
    setFirstVal(null);
    setIsNewNumber(true);
  };

  const handleBackspace = () => {
    if (isNewNumber) return;
    if (calcInput.length > 1) {
      setCalcInput(calcInput.slice(0, -1));
    } else {
      setCalcInput('0');
      setIsNewNumber(true);
    }
  };

  // Master Passcode Interception: 25797 + '='
  const handleEquals = () => {
    const raw = calcInput.trim();

    // Check master code
    if (raw === '25797') {
      // Trigger stealth opening animation
      setVaultUnlockAnim(true);
      addLog('Passcode Intercepted', 'success', 'Master passcode 25797 verified. Launching AdminDashboardActivity.');
      
      setTimeout(() => {
        setVaultUnlockAnim(false);
        handleClear();
        setCurrentScreen('admin_dashboard');
      }, 450);
      return;
    }

    // Normal calculation
    if (firstVal !== null && pendingOp) {
      const secondNum = parseFloat(calcInput) || 0;
      const res = calculate(firstVal, secondNum, pendingOp);
      setCalcExpression(`${firstVal} ${pendingOp} ${secondNum} =`);
      setCalcInput(String(res));
      setFirstVal(null);
      setPendingOp(null);
      setIsNewNumber(true);
    }
  };

  const handleQuickFillCode = () => {
    setCalcInput('25797');
    setIsNewNumber(false);
  };

  // --- Enterprise DPC Toggle ---
  const handleToggleLockdown = () => {
    if (!isDeviceOwner) {
      setActiveModal({
        title: 'Device Owner Required',
        description:
          'SecurityException: Neither user 0 nor current process has android.permission.MANAGE_DEVICE_ADMINS. App must be provisioned as Device Owner via ADB before applying DISALLOW_FACTORY_RESET, DISALLOW_MODIFY_ACCOUNTS, or DISALLOW_APPS_CONTROL.',
        icon: 'warning',
        blocked: true
      });
      addLog('Lockdown Failed', 'error', 'Attempted lockdown without Device Owner status.');
      return;
    }

    const nextState = !enterpriseLockdown;
    setEnterpriseLockdown(nextState);

    if (nextState) {
      addLog('enableEnterpriseLockdown', 'success', 'DISALLOW_FACTORY_RESET, DISALLOW_MODIFY_ACCOUNTS, DISALLOW_APPS_CONTROL enforced.');
    } else {
      addLog('disableEnterpriseLockdown', 'warning', 'Enterprise restrictions cleared. Device in normal unmanaged mode.');
    }
  };

  // --- Policy Test Bench Handlers ---
  const handleTestFactoryReset = () => {
    if (enterpriseLockdown && isDeviceOwner) {
      setActiveModal({
        title: 'Action Blocked by IT Admin',
        description:
          'DISALLOW_FACTORY_RESET is currently enforced. Android Settings has disabled "Erase all data (factory reset)". The recovery menu hard-reset partition is blocked by company policy.',
        icon: 'reset',
        blocked: true
      });
      addLog('Policy Intercepted', 'warning', 'Blocked user factory reset attempt (DISALLOW_FACTORY_RESET).');
    } else {
      setActiveModal({
        title: 'Factory Reset Permitted',
        description:
          'Lockdown is currently inactive. The device would be wiped and returned to factory unmanaged state.',
        icon: 'reset',
        blocked: false
      });
    }
  };

  const handleTestModifyAccounts = () => {
    if (enterpriseLockdown && isDeviceOwner) {
      setActiveModal({
        title: 'Account Modification Disallowed',
        description:
          'DISALLOW_MODIFY_ACCOUNTS is enforced. Android AccountManager will reject adding personal Google, email, or third-party accounts, and corporate credentials cannot be removed.',
        icon: 'account',
        blocked: true
      });
      addLog('Policy Intercepted', 'warning', 'Blocked account modification attempt (DISALLOW_MODIFY_ACCOUNTS).');
    } else {
      setActiveModal({
        title: 'Account Modifications Allowed',
        description: 'Lockdown is off. Users can add personal accounts or remove enterprise accounts freely.',
        icon: 'account',
        blocked: false
      });
    }
  };

  const handleTestAppsControl = () => {
    if (enterpriseLockdown && isDeviceOwner) {
      setActiveModal({
        title: 'App Control Restricted',
        description:
          'DISALLOW_APPS_CONTROL is active. In Android Settings -> App Info, the "Force stop", "Uninstall", and "Clear data" buttons are grayed out. The DPC app cannot be terminated.',
        icon: 'appinfo',
        blocked: true
      });
      addLog('Policy Intercepted', 'warning', 'Prevented app force-stop or removal (DISALLOW_APPS_CONTROL).');
    } else {
      setActiveModal({
        title: 'App Control Unrestricted',
        description: 'Lockdown is off. Users can force stop, clear app cache, or uninstall this application.',
        icon: 'appinfo',
        blocked: false
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-2">
      {/* Interactive Controls Bar above phone */}
      <div className="flex flex-wrap items-center justify-between gap-2 w-full max-w-[390px] mb-3 px-1 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium">Device Owner:</span>
          <button
            onClick={() => {
              const next = !isDeviceOwner;
              setIsDeviceOwner(next);
              addLog('Simulated State', next ? 'success' : 'warning', `Toggled simulated Device Owner: ${next ? 'YES' : 'NO'}`);
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
              isDeviceOwner
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
            }`}
          >
            {isDeviceOwner ? 'Active (Owner)' : 'Disabled (Unmanaged)'}
          </button>
        </div>

        <button
          onClick={onOpenAdbGuide}
          className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium underline-offset-2 hover:underline"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>ADB Commands</span>
        </button>
      </div>

      {/* Realistic Android Phone Device Shell */}
      <div className="relative w-[360px] h-[720px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700/80 ring-1 ring-slate-800/80 select-none flex flex-col justify-between overflow-hidden">
        {/* Top Speaker & Camera Punch Hole */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
          <div className="w-10 h-1 bg-slate-800 rounded-full" />
          <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700/60 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
          </div>
        </div>

        {/* Inner Screen Container */}
        <div className="relative w-full h-full bg-[#121316] rounded-[34px] overflow-hidden flex flex-col pt-7 pb-3">
          {/* Android Status Bar */}
          <div className="flex items-center justify-between px-6 py-1 text-slate-400 text-xs font-mono shrink-0 z-20">
            <span className="font-semibold text-slate-300 tracking-tight">{timeString}</span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px]">98%</span>
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* SCREEN 1: DISGUISED CALCULATOR */}
          {currentScreen === 'calculator' && (
            <div
              className={`flex-1 flex flex-col justify-between p-4 transition-all duration-300 ${
                vaultUnlockAnim ? 'scale-95 opacity-20 filter blur-sm' : 'opacity-100'
              }`}
            >
              {/* Top Hint Bar */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Stealth Calculator v1.0</span>
                <button
                  onClick={handleQuickFillCode}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-sky-400 font-mono transition-colors"
                  title="Click to insert master code 25797"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Insert 25797</span>
                </button>
              </div>

              {/* Calculator LCD Display */}
              <div className="flex flex-col items-end justify-end flex-1 pb-4 px-2">
                <span className="text-slate-400 text-sm font-mono h-6 overflow-hidden text-right">
                  {calcExpression}
                </span>
                <span className="text-white text-4xl sm:text-5xl font-light tracking-tight font-mono overflow-x-auto w-full text-right no-scrollbar">
                  {calcInput}
                </span>
              </div>

              {/* Keypad Grid */}
              <div className="grid grid-cols-4 gap-2.5 pt-2">
                {/* Row 1 */}
                <button
                  onClick={handleClear}
                  className="h-14 rounded-2xl bg-slate-800/90 text-rose-400 text-lg font-semibold hover:bg-slate-700 active:scale-95 transition-all shadow-sm"
                >
                  C
                </button>
                <button
                  onClick={handleBackspace}
                  className="h-14 rounded-2xl bg-slate-800/90 text-slate-300 text-lg font-semibold hover:bg-slate-700 active:scale-95 transition-all shadow-sm"
                >
                  ⌫
                </button>
                <button
                  onClick={handlePercent}
                  className="h-14 rounded-2xl bg-slate-800/90 text-slate-300 text-lg font-semibold hover:bg-slate-700 active:scale-95 transition-all shadow-sm"
                >
                  %
                </button>
                <button
                  onClick={() => handleOperator('÷')}
                  className="h-14 rounded-2xl bg-blue-600 text-white text-xl font-bold hover:bg-blue-500 active:scale-95 transition-all shadow-sm"
                >
                  ÷
                </button>

                {/* Row 2 */}
                <button
                  onClick={() => handleDigit('7')}
                  className="h-14 rounded-2xl bg-[#23262F] text-white text-xl font-medium hover:bg-[#2C303B] active:scale-95 transition-all shadow-sm"
                >
                  7
                </button>
                <button
                  onClick={() => handleDigit('8')}
                  className="h-14 rounded-2xl bg-[#23262F] text-white text-xl font-medium hover:bg-[#2C303B] active:scale-95 transition-all shadow-sm"
                >
                  8
                </button>
                <button
                  onClick={() => handleDigit('9')}
                  className="h-14 rounded-2xl bg-[#23262F] text-white text-xl font-medium hover:bg-[#2C303B] active:scale-95 transition-all shadow-sm"
                >
                  9
                </button>
                <button
                  onClick={() => handleOperator('×')}
                  className="h-14 rounded-2xl bg-blue-600 text-white text-xl font-bold hover:bg-blue-500 active:scale-95 transition-all shadow-sm"
                >
                  ×
                </button>

                {/* Row 3 */}
                <button
                  onClick={() => handleDigit('4')}
                  className="h-14 rounded-2xl bg-[#23262F] text-white text-xl font-medium hover:bg-[#2C303B] active:scale-95 transition-all shadow-sm"
                >
                  4
                </button>
                <button
                  onClick={() => handleDigit('5')}
                  className="h-14 rounded-2xl bg-[#23262F] text-white text-xl font-medium hover:bg-[#2C303B] active:scale-95 transition-all shadow-sm"
                >
                  5
                </button>
                <button
                  onClick={() => handleDigit('6')}
                  className="h-14 rounded-2xl bg-[#23262F] text-white text-xl font-medium hover:bg-[#2C303B] active:scale-95 transition-all shadow-sm"
                >
                  6
                </button>
                <button
                  onClick={() => handleOperator('-')}
                  className="h-14 rounded-2xl bg-blue-600 text-white text-xl font-bold hover:bg-blue-500 active:scale-95 transition-all shadow-sm"
                >
                  -
                </button>

                {/* Row 4 */}
                <button
                  onClick={() => handleDigit('1')}
                  className="h-14 rounded-2xl bg-[#23262F] text-white text-xl font-medium hover:bg-[#2C303B] active:scale-95 transition-all shadow-sm"
                >
                  1
                </button>
                <button
                  onClick={() => handleDigit('2')}
                  className="h-14 rounded-2xl bg-[#23262F] text-white text-xl font-medium hover:bg-[#2C303B] active:scale-95 transition-all shadow-sm"
                >
                  2
                </button>
                <button
                  onClick={() => handleDigit('3')}
                  className="h-14 rounded-2xl bg-[#23262F] text-white text-xl font-medium hover:bg-[#2C303B] active:scale-95 transition-all shadow-sm"
                >
                  3
                </button>
                <button
                  onClick={() => handleOperator('+')}
                  className="h-14 rounded-2xl bg-blue-600 text-white text-xl font-bold hover:bg-blue-500 active:scale-95 transition-all shadow-sm"
                >
                  +
                </button>

                {/* Row 5: 0, ., = (Secret trigger) */}
                <button
                  onClick={() => handleDigit('0')}
                  className="col-span-2 h-14 rounded-2xl bg-[#23262F] text-white text-xl font-medium hover:bg-[#2C303B] active:scale-95 transition-all shadow-sm text-left pl-6"
                >
                  0
                </button>
                <button
                  onClick={handleDot}
                  className="h-14 rounded-2xl bg-[#23262F] text-white text-xl font-medium hover:bg-[#2C303B] active:scale-95 transition-all shadow-sm"
                >
                  .
                </button>
                <button
                  onClick={handleEquals}
                  className="h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-2xl font-bold active:scale-95 transition-all shadow-sm flex items-center justify-center relative group"
                  title="Calculate or unlock if 25797"
                >
                  <span>=</span>
                  {calcInput === '25797' && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                  )}
                </button>
              </div>

              {/* Instructions Pill */}
              <div className="mt-3 text-center">
                <span className="text-[11px] text-slate-500 font-mono">
                  Master Code: <span className="text-slate-300 font-semibold">25797</span> + <span className="text-emerald-400 font-semibold">=</span>
                </span>
              </div>
            </div>
          )}

          {/* SCREEN 2: ENTERPRISE ADMIN DASHBOARD */}
          {currentScreen === 'admin_dashboard' && (
            <div className="flex-1 flex flex-col bg-[#0F172A] overflow-hidden">
              {/* Android Top App Bar */}
              <div className="flex items-center justify-between px-3 py-2.5 bg-slate-900 border-b border-slate-800 text-white">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentScreen('calculator')}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-300"
                    title="Exit to stealth calculator"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="text-xs font-bold text-white tracking-wide leading-tight">
                      Enterprise DPC Console
                    </h2>
                    <span className="text-[10px] text-slate-400 font-mono">
                      com.company.calculatorvault
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentScreen('lockscreen')}
                  className="p-1 text-slate-400 hover:text-white rounded"
                  title="Simulate dpm.lockNow()"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center border-b border-slate-800 bg-slate-900/60 px-2 py-1 gap-1 text-[11px]">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-1 rounded text-center font-medium transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-slate-800 text-sky-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('testbench')}
                  className={`flex-1 py-1 rounded text-center font-medium transition-colors ${
                    activeTab === 'testbench'
                      ? 'bg-slate-800 text-sky-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Test Bench
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`flex-1 py-1 rounded text-center font-medium transition-colors ${
                    activeTab === 'logs'
                      ? 'bg-slate-800 text-sky-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Audit ({auditLogs.length})
                </button>
              </div>

              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {/* Device Owner Status Card */}
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      isDeviceOwner
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold">
                        {isDeviceOwner ? (
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                        )}
                        <span>{isDeviceOwner ? 'DEVICE OWNER ACTIVE' : 'NO DEVICE OWNER PRIVILEGES'}</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/30">
                        {isDeviceOwner ? 'Full DPC' : 'Unprivileged'}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {isDeviceOwner
                        ? 'Device Policy Manager (DPM) holds highest hardware & account governance.'
                        : 'Hard restrictions require Device Owner setup via ADB prior to adding accounts.'}
                    </p>
                  </div>

                  {/* Main Enterprise Lockdown Card */}
                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-white">Enterprise Lockdown</h3>
                        <p className="text-[10px] text-slate-400">
                          Calls SecureDeviceAdmin.enableEnterpriseLockdown()
                        </p>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        onClick={handleToggleLockdown}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                          enterpriseLockdown ? 'bg-blue-600' : 'bg-slate-700'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            enterpriseLockdown ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="border-t border-slate-800 pt-2 space-y-2 text-[11px]">
                      {/* Policy 1 */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-mono text-[10px]">
                          DISALLOW_FACTORY_RESET
                        </span>
                        <span
                          className={`font-semibold text-[10px] px-1.5 py-0.5 rounded ${
                            enterpriseLockdown && isDeviceOwner
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {enterpriseLockdown && isDeviceOwner ? 'ENFORCED' : 'OFF'}
                        </span>
                      </div>

                      {/* Policy 2 */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-mono text-[10px]">
                          DISALLOW_MODIFY_ACCOUNTS
                        </span>
                        <span
                          className={`font-semibold text-[10px] px-1.5 py-0.5 rounded ${
                            enterpriseLockdown && isDeviceOwner
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {enterpriseLockdown && isDeviceOwner ? 'ENFORCED' : 'OFF'}
                        </span>
                      </div>

                      {/* Policy 3 */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-mono text-[10px]">
                          DISALLOW_APPS_CONTROL
                        </span>
                        <span
                          className={`font-semibold text-[10px] px-1.5 py-0.5 rounded ${
                            enterpriseLockdown && isDeviceOwner
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {enterpriseLockdown && isDeviceOwner ? 'ENFORCED' : 'OFF'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick System Actions */}
                  <div className="space-y-1.5">
                    <button
                      onClick={() => {
                        addLog('dpm.lockNow()', 'warning', 'Device screen immediately locked by DPC.');
                        setCurrentScreen('lockscreen');
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Lock Device (dpm.lockNow)</span>
                    </button>

                    <button
                      onClick={() => setCurrentScreen('calculator')}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                    >
                      Return to Stealth Calculator
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Test Bench */}
              {activeTab === 'testbench' && (
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider">
                      Interactive Policy Simulator
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Test simulated user attempts to circumvent security policies on this device:
                    </p>
                  </div>

                  {/* Test 1: Factory Reset */}
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">1. Attempt Factory Reset</span>
                      <Settings className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Simulates going to Settings &gt; System &gt; Reset Options &gt; Erase All Data.
                    </p>
                    <button
                      onClick={handleTestFactoryReset}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded text-xs transition-colors"
                    >
                      Trigger Reset Attempt
                    </button>
                  </div>

                  {/* Test 2: Modify Accounts */}
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">2. Attempt Account Removal</span>
                      <UserX className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Simulates adding personal Gmail or removing corporate MDM account.
                    </p>
                    <button
                      onClick={handleTestModifyAccounts}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded text-xs transition-colors"
                    >
                      Trigger Account Edit Attempt
                    </button>
                  </div>

                  {/* Test 3: Force Stop / Uninstall */}
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">3. Attempt Force Stop</span>
                      <Ban className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Simulates going to Settings &gt; Apps &gt; Calculator Vault &gt; Force Stop.
                    </p>
                    <button
                      onClick={handleTestAppsControl}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded text-xs transition-colors"
                    >
                      Trigger Force Stop Attempt
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Logs */}
              {activeTab === 'logs' && (
                <div className="flex-1 overflow-y-auto p-2.5 font-mono text-[10px] space-y-2 bg-slate-950/70">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-slate-400">
                    <span>DPC EVENT TIMELINE</span>
                    <button
                      onClick={() => setAuditLogs([])}
                      className="text-slate-500 hover:text-slate-300 text-[10px]"
                    >
                      Clear
                    </button>
                  </div>

                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-2 rounded bg-slate-900 border border-slate-800/80">
                      <div className="flex items-center justify-between text-slate-400">
                        <span
                          className={`font-semibold ${
                            log.status === 'success'
                              ? 'text-emerald-400'
                              : log.status === 'error'
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {log.action}
                        </span>
                        <span className="text-slate-500">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-300 mt-1 text-[10px] leading-relaxed">{log.details}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SCREEN 3: SIMULATED ANDROID LOCK SCREEN */}
          {currentScreen === 'lockscreen' && (
            <div className="flex-1 flex flex-col justify-between items-center p-6 bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white">
              <div className="flex flex-col items-center mt-6">
                <Lock className="w-8 h-8 text-blue-400 mb-2 animate-bounce" />
                <span className="text-4xl font-light font-mono tracking-tight">{timeString}</span>
                <span className="text-xs text-slate-400 mt-1">Enterprise Work Managed Device</span>
              </div>

              <div className="flex flex-col items-center gap-2 w-full max-w-[240px]">
                <div className="w-full p-2 bg-slate-800/70 border border-slate-700/60 rounded-xl text-center text-xs text-slate-300">
                  <span className="text-[11px] text-amber-300 font-medium">Device Locked by DPC</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">dpm.lockNow() executed</p>
                </div>

                <button
                  onClick={() => {
                    addLog('Lockscreen Unlocked', 'success', 'User entered valid biometric/PIN.');
                    setCurrentScreen('admin_dashboard');
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-xs tracking-wide shadow-lg transition-all"
                >
                  Swipe / Tap to Unlock
                </button>
              </div>
            </div>
          )}

          {/* Simulated Android System Modal */}
          {activeModal && (
            <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="w-full max-w-[280px] bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl text-white">
                <div className="flex items-center gap-2 text-rose-400 mb-2">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <h4 className="text-xs font-bold leading-tight">{activeModal.title}</h4>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
                  {activeModal.description}
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg text-slate-200 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Android Bottom Navigation Bar (Back, Home, Recents) */}
          <div className="h-4 flex items-center justify-center gap-12 px-10 shrink-0 text-slate-600 pt-1">
            <button
              onClick={() => {
                if (currentScreen === 'admin_dashboard') setCurrentScreen('calculator');
                else if (currentScreen === 'lockscreen') setCurrentScreen('calculator');
              }}
              className="p-1 hover:text-slate-400"
              title="Android Back"
            >
              <div className="w-2.5 h-2.5 border-l-2 border-b-2 border-current rotate-45" />
            </button>
            <button
              onClick={() => setCurrentScreen('calculator')}
              className="p-1 hover:text-slate-400"
              title="Android Home"
            >
              <div className="w-3 h-3 rounded-full border-2 border-current" />
            </button>
            <button className="p-1 hover:text-slate-400" title="Android Recents">
              <div className="w-2.5 h-2.5 border-2 border-current rounded-xs" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
