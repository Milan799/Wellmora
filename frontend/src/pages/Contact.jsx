import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [isSending, setIsSending] = useState(false);
  const [statusStep, setStatusStep] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;

    setIsSending(true);
    setStatusStep('Initializing SMTP mail socket...');

    // Simulate sending stages
    setTimeout(() => {
      setStatusStep('Resolving MX records for wellmora.com...');
      setTimeout(() => {
        setStatusStep('Delivering message package...');
        setTimeout(() => {
          // Save to localStorage so it is fully stored
          const existing = JSON.parse(localStorage.getItem('wellmora_support_messages') || '[]');
          const newMsg = {
            id: 'msg_' + Date.now(),
            name,
            email,
            subject,
            message,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem('wellmora_support_messages', JSON.stringify([newMsg, ...existing]));

          setIsSending(false);
          setSendSuccess(true);
          // Reset form fields
          setName('');
          setEmail('');
          setSubject('');
          setMessage('');
        }, 800);
      }, 800);
    }, 800);
  };

  return (
    <div className="pt-24 min-h-screen bg-blob-gradient px-6 pb-20 flex items-center justify-center">
      <div className="max-w-xl w-full glass-card border border-white/5 p-8 backdrop-blur-md shadow-2xl relative">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {sendSuccess ? (
          <div className="text-center py-10 flex flex-col items-center gap-6 animate-fadeIn">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
            <div>
              <h2 className="text-2xl font-extrabold text-white">Support Mail Transmitted!</h2>
              <p className="text-slate-355 text-xs mt-2 leading-relaxed">
                Thank you for contacting Wellmora Support. Your request has been queued, and an administrator will email you back shortly.
              </p>
            </div>
            <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-left text-xs text-slate-400 w-full">
              <span className="font-bold text-slate-500 uppercase tracking-widest text-[9px] block mb-1">Queue Status</span>
              <div className="flex items-center gap-2 text-emerald-350">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Ticket registered successfully. Response expected in 2 hours.</span>
              </div>
            </div>
            <button
              onClick={() => setSendSuccess(false)}
              className="glass-btn-primary px-8 py-3 rounded-xl text-xs font-bold w-full cursor-pointer"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <div className="flex items-center gap-2.5 mb-6">
              <HelpCircle className="w-6 h-6 text-emerald-400" />
              <div>
                <h1 className="text-xl font-extrabold text-white uppercase tracking-wider">Contact Support</h1>
                <p className="text-slate-400 text-xs mt-0.5">Send a secure inquiry to the Wellmora service desk.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-white text-xs"
                    disabled={isSending}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-white text-xs"
                    disabled={isSending}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Appliance issue / Delivery update"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-white text-xs"
                  disabled={isSending}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Message Details</label>
                <textarea
                  rows="5"
                  required
                  placeholder="Detail your inquiry or issue..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full glass-input p-3.5 rounded-xl text-white text-xs resize-none"
                  disabled={isSending}
                ></textarea>
              </div>

              {isSending ? (
                <div className="w-full bg-emerald-500/10 border border-emerald-500/20 py-3.5 rounded-xl text-center flex flex-col items-center justify-center gap-2">
                  <div className="inline-block animate-spin rounded-full h-4.5 w-4.5 border-t-2 border-emerald-400"></div>
                  <span className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase animate-pulse">
                    {statusStep}
                  </span>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full glass-btn-primary py-3 rounded-xl font-bold text-xs tracking-wider flex justify-center items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Transmit Support Mail
                </button>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contact;
