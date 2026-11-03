import React, { useState } from 'react';
import { Terminal, Play, RotateCcw, Copy, Check } from 'lucide-react';
import { PROVISIONING_COMMANDS } from '../data/androidFiles';

interface AdbTerminalSimulatorProps {
  onOwnerProvisioned?: () => void;
}

export const AdbTerminalSimulator: React.FC<AdbTerminalSimulatorProps> = ({ onOwnerProvisioned }) => {
  const [commandInput, setCommandInput] = useState<string>('');
  const [history, setHistory] = useState<Array<{ type: 'input' | 'output'; text: string }>>([
    {
      type: 'output',
      text: 'Android Debug Bridge (ADB) Terminal v34.0.5\nConnected device: Pixel_8_Enterprise (device serial: 9A241FFA001)\nType "help" for a list of available DPC provisioning commands.'
    }
  ]);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const executeCommand = (cmdToRun: string) => {
    const trimmed = cmdToRun.trim();
    if (!trimmed) return;

    const newHistory = [...history, { type: 'input' as const, text: `$ ${trimmed}` }];

    if (trimmed === 'clear') {
      setHistory([]);
      setCommandInput('');
      return;
    }

    if (trimmed === 'help') {
      newHistory.push({
        type: 'output',
        text: `Available ADB DPC commands:\n  1. ${PROVISIONING_COMMANDS.adbSetOwner}\n  2. ${PROVISIONING_COMMANDS.adbVerify}\n  3. ${PROVISIONING_COMMANDS.adbListUsers}\n  4. ${PROVISIONING_COMMANDS.adbRemoveOwner}\n  5. clear`
      });
    } else if (trimmed.includes('set-device-owner')) {
      newHistory.push({
        type: 'output',
        text: `Success: Device owner set to package ComponentInfo{com.company.calculatorvault/com.company.calculatorvault.SecureDeviceAdmin}\nActive admin set to component {com.company.calculatorvault/com.company.calculatorvault.SecureDeviceAdmin}`
      });
      if (onOwnerProvisioned) onOwnerProvisioned();
    } else if (trimmed.includes('dumpsys device_policy')) {
      newHistory.push({
        type: 'output',
        text: `Device Policy Manager State:\n  Device Owner:\n    admin=ComponentInfo{com.company.calculatorvault/com.company.calculatorvault.SecureDeviceAdmin}\n    name=Calculator Vault DPC\n    package=com.company.calculatorvault\n    User Restrictions (applied):\n      [DISALLOW_FACTORY_RESET, DISALLOW_MODIFY_ACCOUNTS, DISALLOW_APPS_CONTROL]\n  Password Quality: PASSWORD_QUALITY_UNSPECIFIED\n  Encryption status: ENCRYPTED`
      });
    } else if (trimmed.includes('pm list users')) {
      newHistory.push({
        type: 'output',
        text: `Users:\n\tUserInfo{0:Owner:13} running`
      });
    } else if (trimmed.includes('remove-active-admin')) {
      newHistory.push({
        type: 'output',
        text: `Active admin removed from component {com.company.calculatorvault/com.company.calculatorvault.SecureDeviceAdmin}`
      });
    } else {
      newHistory.push({
        type: 'output',
        text: `bash: ${trimmed}: command not recognized. Type "help" for valid DPC provisioning commands.`
      });
    }

    setHistory(newHistory);
    setCommandInput('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 1800);
  };

  return (
    <div className="flex flex-col h-full bg-[#090D16] border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900 border-b border-slate-800 text-slate-300">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white">ADB Provisioning Terminal</span>
        </div>
        <button
          onClick={() => setHistory([])}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
          title="Clear Terminal"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Suggested Quick Commands */}
      <div className="p-2.5 bg-slate-900/40 border-b border-slate-800 flex flex-wrap gap-2 text-[11px]">
        <button
          onClick={() => executeCommand(PROVISIONING_COMMANDS.adbSetOwner)}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded border border-slate-700/80 transition-colors"
        >
          <Play className="w-3 h-3 text-sky-400" />
          <span>Run dpm set-device-owner</span>
        </button>

        <button
          onClick={() => executeCommand(PROVISIONING_COMMANDS.adbVerify)}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded border border-slate-700/80 transition-colors"
        >
          <Play className="w-3 h-3 text-emerald-400" />
          <span>Verify Policy Dumpsys</span>
        </button>

        <button
          onClick={() => handleCopy(PROVISIONING_COMMANDS.adbSetOwner)}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/60 hover:bg-slate-700 text-slate-400 rounded transition-colors ml-auto"
        >
          {copiedCmd === PROVISIONING_COMMANDS.adbSetOwner ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy Command</span>
            </>
          )}
        </button>
      </div>

      {/* Terminal Output */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 text-slate-300 font-mono leading-relaxed bg-[#060911]">
        {history.map((item, idx) => (
          <div key={idx} className={item.type === 'input' ? 'text-sky-300 font-semibold' : 'text-slate-400 whitespace-pre-wrap'}>
            {item.text}
          </div>
        ))}
      </div>

      {/* Terminal Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          executeCommand(commandInput);
        }}
        className="flex items-center gap-2 p-2.5 bg-slate-900 border-t border-slate-800"
      >
        <span className="text-emerald-400 font-bold">$</span>
        <input
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder='Type "help" or run "adb shell dpm set-device-owner ..."'
          className="flex-1 bg-transparent border-0 outline-hidden text-slate-200 placeholder:text-slate-600 font-mono text-xs"
        />
        <button
          type="submit"
          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors"
        >
          Run
        </button>
      </form>
    </div>
  );
};
