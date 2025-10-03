'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, MapPin, Clock, Facebook, Twitter, Linkedin } from 'lucide-react';

// Contact Page - TurfBook
// Single-file React component (Next.js app router compatible)
// Uses your UI primitives and Tailwind. Replace dummy contact details with real ones as needed.

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'General', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const departments = ['General', 'Sales', 'Support', 'Partnerships', 'Media'];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // basic client validation
    if (!form.name || !form.email || !form.message) {
      setError('Please fill name, email and message');
      return;
    }

    setSubmitting(true);
    setSubmitted(false);

    try {
      // TODO: replace with actual POST /api/contact or serverless function
      await new Promise((r) => setTimeout(r, 900));
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: 'General', message: '' });
    } catch (err: any) {
      console.error(err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  }

  const company = {
    name: 'TurfBook',
    email: 'support@turfbook.example',
    phone: '+91 98765 43210',
    address: 'Walchand College of Engineering, Sangli, Maharashtra, India',
  };

  const team = [
    { id: 1, name: 'Support — Sneha Kulkarni', email: 'sneha@turfbook.example', phone: '+91 91234 56789', hours: '9:00 – 18:00' },
    { id: 2, name: 'Sales — Rohit Desai', email: 'sales@turfbook.example', phone: '+91 92345 67890', hours: '10:00 – 18:00' },
    { id: 3, name: 'Partnerships — Meera Joshi', email: 'partners@turfbook.example', phone: '+91 93456 78901', hours: 'Mon–Fri 10:00 – 17:00' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Contact TurfBook</h1>
            <p className="text-sm text-gray-600 mt-1">We’re here to help — choose a department or send us a message.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-indigo-600">Home</Link>
            <Link href="/about" className="text-sm text-gray-700">About</Link>
            <Link href="/browse" className="text-sm text-gray-700">Browse</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full name</Label>
                      <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone (optional)</Label>
                      <Input id="phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 9XXXXXXXXX" />
                    </div>
                    <div>
                      <Label htmlFor="subject">Department</Label>
                      <select id="subject" className="w-full mt-1 p-2 border rounded" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Tell us what's up" />
                  </div>

                  {error && <div className="text-sm text-red-600">{error}</div>}
                  {submitted && <div className="text-sm text-green-600">Thanks — your message was sent. We’ll reply within 24 hours.</div>}

                  <div className="flex items-center gap-3">
                    <Button type="submit" disabled={submitting}>{submitting ? 'Sending...' : 'Send message'}</Button>
                    <Button variant="outline" onClick={() => { setForm({ name: '', email: '', phone: '', subject: 'General', message: '' }); setError(null); setSubmitted(false); }}>Reset</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 rounded"><Mail className="h-5 w-5 text-indigo-600"/></div>
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-sm text-gray-600">{company.email}</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 rounded"><Phone className="h-5 w-5 text-indigo-600"/></div>
                  <div>
                    <div className="font-medium">Phone</div>
                    <div className="text-sm text-gray-600">{company.phone}</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 rounded"><MapPin className="h-5 w-5 text-indigo-600"/></div>
                  <div>
                    <div className="font-medium">Address</div>
                    <div className="text-sm text-gray-600">{company.address}</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 rounded"><Clock className="h-5 w-5 text-indigo-600"/></div>
                  <div>
                    <div className="font-medium">Business hours</div>
                    <div className="text-sm text-gray-600">Mon – Fri: 09:00 – 18:00<br/>Sat: 10:00 – 14:00<br/>Sun: Closed</div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Support team</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {team.map(member => (
                  <Card key={member.id} className="p-4">
                    <div className="font-medium">{member.name}</div>
                    <div className="text-xs text-gray-500">{member.hours}</div>
                    <div className="text-sm text-gray-600 mt-2">{member.email}</div>
                    <div className="text-sm text-gray-600">{member.phone}</div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <Card className="p-4">
              <CardHeader>
                <CardTitle>Quick contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-700">Need urgent help? Call our helpline or email us. We aim to reply within 24 hours for general inquiries and 2 hours for urgent support.</div>
                <Separator className="my-3"/>
                <div className="text-sm"><strong>Hotline:</strong> {company.phone}</div>
                <div className="text-sm mt-1"><strong>Email:</strong> {company.email}</div>
                <div className="mt-3 flex gap-2">
                  <a href="#" aria-label="Follow on Twitter" className="p-2 rounded bg-blue-50"><Twitter className="h-4 w-4 text-blue-500"/></a>
                  <a href="#" aria-label="Follow on Facebook" className="p-2 rounded bg-blue-50"><Facebook className="h-4 w-4 text-blue-600"/></a>
                  <a href="#" aria-label="Follow on LinkedIn" className="p-2 rounded bg-blue-50"><Linkedin className="h-4 w-4 text-blue-700"/></a>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardHeader>
                <CardTitle>Office location</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Placeholder map - replace with real embed (Google Maps) in production */}
                <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400">Map placeholder (replace with Google Maps iframe)</div>
                <div className="text-xs text-gray-500 mt-2">Walchand College of Engineering, Sangli</div>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardHeader>
                <CardTitle>Press & Media</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-700">For press enquiries, reach out to media@turfbook.example</div>
                <div className="text-sm text-gray-500 mt-2">Press kit and logos available on request.</div>
              </CardContent>
            </Card>
          </aside>
        </section>

        <div className="bg-white p-6 rounded shadow-sm">
          <h3 className="font-semibold">Need help integrating TurfBook?</h3>
          <p className="text-sm text-gray-600">If you run multiple turfs or a sports complex, our partnerships team can walk you through bulk onboarding and API integration.</p>
          <div className="mt-4 flex gap-3">
            <Link href="/owner/register"><Button>Become a partner</Button></Link>
            <Link href="/contact"><Button variant="outline">Contact Partnerships</Button></Link>
          </div>
        </div>

        <div className="text-xs text-gray-400 mt-6">Surprising fact: The first widely used artificial turf, AstroTurf, cost around $20,000 to install in 1966 — about $180k in today’s dollars. 🏟️</div>
      </main>
    </div>
  );
}
