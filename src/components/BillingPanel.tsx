import { useState } from 'react';
import { CreditCard, Coins, CheckCircle, ShieldCheck } from 'lucide-react';

interface BillingInvoice {
  id: string;
  date: string;
  amount: string;
  status: string;
}

interface BillingPanelProps {
  credits: number;
  setCredits: (update: number | ((prev: number) => number)) => void;
  userTier: string;
  setUserTier: (tier: string) => void;
  invoices: BillingInvoice[];
  setInvoices: (invoices: BillingInvoice[]) => void;
}

export function BillingPanel({
  credits,
  setCredits,
  userTier,
  setUserTier,
  invoices,
  setInvoices
}: BillingPanelProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<BillingInvoice | null>(null);

  const handleGrantFaucet = () => {
    setCredits(prev => prev + 100);
    const newInvoice: BillingInvoice = {
      id: `INV-2026-${Math.floor(Math.random() * 800 + 100)}`,
      date: new Date().toISOString().slice(0, 10),
      amount: '$0.00 (Faucet Refill)',
      status: 'Paid'
    };
    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);
    localStorage.setItem('lab_invoices', JSON.stringify(updatedInvoices));
  };

  const handleEnterpriseUpgrade = () => {
    setUserTier('Enterprise Autonomous');
    setCredits(prev => prev + 500);
    const newInvoice: BillingInvoice = {
      id: `INV-2026-${Math.floor(Math.random() * 800 + 100)}`,
      date: new Date().toISOString().slice(0, 10),
      amount: '$49.00 (Tier Upgrade)',
      status: 'Paid'
    };
    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);
    localStorage.setItem('lab_invoices', JSON.stringify(updatedInvoices));
    alert("Workspace successfully upgraded to Enterprise Autonomous with 500 bonus credits! Simulated payment invoice recorded in ledger.");
  };

  const handleDowngrade = () => {
    setUserTier('Free Tier');
    setCredits(15);
    alert("Downgraded to Free Tier. Reset credit balance with 15 standard tokens.");
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-1 select-none">
          <CreditCard className="w-4 h-4" />
          <span className="text-xs uppercase font-mono tracking-widest font-bold">Financial & Faucet Infrastructure</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Enterprise Billing, Tier Control & Faucets</h2>
        <p className="text-xs text-gray-550 dark:text-[#a1a1aa] mt-0.5 max-w-xl font-sans">
          No real payments integration required. Toggle subscription packages, use our instantaneous simulated coin faucet, or trigger ledger invoice runs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Subscription card & refiller */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Active Plan Card */}
          <div className="bg-gradient-to-b from-gray-50 to-white dark:from-[#101014] dark:to-[#0e0e11] border border-gray-200 dark:border-[#1f1f23] p-5 rounded-xl text-left shadow-sm dark:shadow-lg select-none">
            <span className="text-[9px] font-mono uppercase bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-150 dark:border-indigo-900/40 font-bold tracking-wide">
              Active Plan
            </span>
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mt-3 font-sans">{userTier}</h3>
            <p className="text-[11px] text-gray-500 dark:text-[#71717a] mt-1.5 leading-relaxed font-sans">
              Enjoy up to 25 parallel file generations per hour, full terminal integration, and early access previews.
            </p>

            <div className="mt-6 space-y-2.5 font-sans">
              <div className="flex items-center text-[11px] text-gray-600 dark:text-[#a1a1aa] space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Unlimited File Previews</span>
              </div>
              <div className="flex items-center text-[11px] text-gray-600 dark:text-[#a1a1aa] space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Diagnostics Audits Enabled</span>
              </div>
              <div className="flex items-center text-[11px] text-gray-600 dark:text-[#a1a1aa] space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Dedicated Agent Channels</span>
              </div>
            </div>
          </div>

          {/* Simulated Credits Faucet */}
          <div className="bg-white dark:bg-[#0e0e11] border border-gray-200 dark:border-[#1f1f23] p-5 rounded-xl text-left space-y-4 shadow-sm dark:shadow-none select-none">
            <div>
              <h4 className="text-xs font-bold uppercase font-mono text-gray-800 dark:text-white flex items-center">
                <Coins className="w-4 h-4 mr-1.5 text-amber-500" />
                Token Refill Faucet
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-[#71717a] mt-1 leading-relaxed font-sans">
                Need more testing credits? Run the faucet simulation loop to receive immediate tokens in your operator balance instantly.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleGrantFaucet}
                className="w-full h-9 flex items-center justify-center space-x-2 bg-gray-50 dark:bg-[#16161a] border border-gray-250 dark:border-[#27272a] hover:bg-gray-100 dark:hover:bg-[#1a1a1f] hover:border-gray-305 dark:hover:border-[#38383e] text-gray-800 dark:text-white text-xs font-mono uppercase tracking-wider font-bold rounded-lg transition-all cursor-pointer shadow-sm"
              >
                <span>Grant +100 Credits</span>
              </button>

              <button
                type="button"
                onClick={handleEnterpriseUpgrade}
                className="w-full h-9 flex items-center justify-center space-x-2 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-[#4f46e5] dark:hover:bg-[#4338ca] text-xs font-mono uppercase tracking-wider font-bold rounded-lg transition-all cursor-pointer shadow-[0_2px_10px_rgba(79,70,229,0.2)] dark:shadow-[0_0_10px_rgba(79,70,229,0.25)]"
              >
                <span>Simulate Enterprise Upgrade ($49)</span>
              </button>
              
              <button
                type="button"
                onClick={handleDowngrade}
                className="w-full py-1 text-center text-[9px] font-mono text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Reset to standard free tier
              </button>
            </div>
          </div>

        </div>

        {/* Right column: Invoice lists */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-[#0e0e11] border border-gray-200 dark:border-[#1f1f23] rounded-xl p-5 text-left shadow-sm dark:shadow-none">
            <h4 className="text-xs font-bold uppercase font-mono text-gray-800 dark:text-[#e4e4e7] mb-3 flex items-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-1.5" />
              Simulated Ledger Invoices
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-[#71717a] leading-relaxed mb-4 font-sans">
              Track mock card settlements, faucet grants, and subscription logs by clicking individual invoice items.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-[#1f1f23] text-[9.5px] uppercase font-mono text-gray-400 dark:text-[#71717a] font-bold">
                    <th className="pb-2.5">Invoice ID</th>
                    <th className="pb-2.5">Date</th>
                    <th className="pb-2.5">Amount Charged</th>
                    <th className="pb-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-gray-150 dark:divide-[#1f1f23]/40 font-mono text-gray-705 dark:text-gray-300">
                  {invoices.map(inv => (
                    <tr 
                      key={inv.id} 
                      onClick={() => setSelectedInvoice(inv)}
                      className="group hover:bg-gray-50 dark:hover:bg-[#16161a]/40 transition-all cursor-pointer"
                    >
                      <td className="py-3 text-indigo-600 dark:text-indigo-400 font-bold group-hover:underline">{inv.id}</td>
                      <td className="py-3 text-gray-400 dark:text-gray-500">{new Date(inv.date).toLocaleDateString()}</td>
                      <td className="py-3 text-gray-800 dark:text-white">{inv.amount}</td>
                      <td className="py-3 text-right">
                        <span className="inline-block text-[9px] uppercase tracking-wide px-2 py-0.5 rounded font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-150 dark:border-emerald-900/30">
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-4 leading-normal font-sans italic">
              Note: This laboratory does not process real money or make connections to third-party payment gateways. This ledger serves as an integration representation purposes.
            </p>
          </div>
        </div>

      </div>

      {/* Invoice receipt details modal overlay */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 dark:bg-black/85 p-4 backdrop-blur-md font-sans">
          <div className="bg-white dark:bg-[#0e0e11] border border-gray-200 dark:border-[#27272a] rounded-xl p-6 w-full max-w-md space-y-5 text-left shadow-2xl relative select-text">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-white text-xs cursor-pointer font-bold"
            >
              ✕
            </button>
            
            <div className="border-b border-gray-150 dark:border-[#1f1f23] pb-4">
              <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest block">Laboratory Ledger receipt</span>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white mt-1">Invoice Receipt</h3>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">ID: {selectedInvoice.id}</p>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-[#71717a]">Settlement Date:</span>
                <span className="text-gray-800 dark:text-white">{new Date(selectedInvoice.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-[#71717a]">Payment Processor:</span>
                <span className="text-gray-800 dark:text-white">Simulated Stripe Bank Gateway</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-[#71717a]">Settled Amount:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{selectedInvoice.amount}</span>
              </div>
              <div className="flex justify-between border-t border-gray-150 dark:border-[#1f1f23] pt-2.5">
                <span className="text-gray-500 dark:text-[#71717a]">Allocation Quota:</span>
                <span className="text-gray-800 dark:text-white">
                  {selectedInvoice.amount.includes('Upgrade') ? 'Enterprise Workspace Privileges +500 LAB' : 'Simulated Faucet +100 LAB tokens'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-[#16161a] border border-gray-200 dark:border-[#1f1f23] rounded text-[10px] leading-relaxed text-gray-500 dark:text-[#71717a]">
              This is a secure simulated digital receipt for the sandbox environment. Payment was successful, transaction fully authorized, standard credit rules applied.
            </div>

            <button
              onClick={() => setSelectedInvoice(null)}
              className="w-full py-2 bg-gray-105 border border-gray-250 text-gray-850 hover:bg-gray-150 dark:bg-[#121216] dark:border-[#27272a] dark:text-white dark:hover:bg-[#1a1a1f] text-xs font-mono uppercase font-bold rounded cursor-pointer"
            >
              Verify & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
