"use client";
import { signIn, signOut, useSession, SessionProvider } from 'next-auth/react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

function AccountInner() {
  const { data: session } = useSession();
  const ta = useTranslations('auth');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      {!session ? (
        <div className="card p-4 space-y-3">
          <h2 className="text-xl font-semibold">{ta('login')}</h2>
          <input placeholder={ta('email')} className="bg-transparent border rounded px-2 py-1 w-full" value={email} onChange={e=>setEmail(e.target.value)} />
          <input placeholder={ta('password')} type="password" className="bg-transparent border rounded px-2 py-1 w-full" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="btn-primary px-3 py-1 rounded" onClick={()=>signIn('credentials', { email, password, redirect: false })}>{ta('login')}</button>
          <button className="border px-3 py-1 rounded" onClick={()=>{
            fetch('/api/register', { method:'POST', body: JSON.stringify({email, password})}).then(()=>signIn('credentials', { email, password, redirect: false }));
          }}>{ta('register')}</button>
        </div>
      ) : (
        <div className="card p-4 space-y-3">
          <div>Signed in as {session.user?.email}</div>
          <button className="border px-3 py-1 rounded" onClick={()=>signOut()}>{ta('logout')}</button>
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <SessionProvider>
      <AccountInner />
    </SessionProvider>
  );
}
