'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Send,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    MessageSquare,
    HelpCircle,
    Shield,
    Truck
} from 'lucide-react';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Simulate API call - replace with actual API endpoint
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Here you would send to your API
            // const response = await fetch('/api/contact', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(formData)
            // });

            setSubmitted(true);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="container-custom py-12 max-w-2xl">
                {/* Breadcrumbs */}
                <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-ferrari-red">Formula Export</Link>
                    <ChevronRight size={14} className="mx-2" />
                    <Link href="/contact" className="hover:text-ferrari-red">Kontakt</Link>
                    <ChevronRight size={14} className="mx-2" />
                    <span className="text-ferrari-red">Faleminderit</span>
                </div>

                <div className="bg-surface rounded-lg shadow-md p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Mesazhi u dërgua!</h1>
                    <p className="text-gray-600 mb-6">
                        Faleminderit për mesazhin. Do të kontaktojmë sa më shpejt të jetë e mundur.
                    </p>
                    <div className="bg-secondary p-4 rounded-lg mb-6 text-left">
                        <p className="text-sm text-gray-600 mb-2"><strong>Në pritje të përgjigjes, mund të:</strong></p>
                        <ul className="text-sm space-y-2">
                            <li className="flex items-start">
                                <CheckCircle size={16} className="text-ferrari-red mr-2 mt-0.5 flex-shrink-0" />
                                <span>Shfleto makinat në <Link href="/cars" className="text-ferrari-red hover:underline">katalogun tonë</Link></span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle size={16} className="text-ferrari-red mr-2 mt-0.5 flex-shrink-0" />
                                <span>Lexo <Link href="/how-it-works" className="text-ferrari-red hover:underline">si funksionon importi</Link></span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle size={16} className="text-ferrari-red mr-2 mt-0.5 flex-shrink-0" />
                                <span>Shiko <Link href="/faq" className="text-ferrari-red hover:underline">pyetjet e shpeshta</Link></span>
                            </li>
                        </ul>
                    </div>
                    <Link href="/" className="btn-primary inline-block">
                        Kthehu në faqen kryesore
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container-custom py-12">
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-ferrari-red">Formula Export</Link>
                <ChevronRight size={14} className="mx-2" />
                <span className="text-ferrari-red">Kontakt</span>
            </div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Na kontaktoni</h1>
                <p className="text-gray-600 max-w-2xl">
                    Keni pyetje rreth importit të makinave? Dëshironi një ofertë të personalizuar?
                    Jemi këtu për t'ju ndihmuar.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contact Info Cards */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Phone */}
                    <div className="bg-surface rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <div className="w-12 h-12 bg-ferrari-red/10 rounded-full flex items-center justify-center mb-4">
                            <Phone className="text-ferrari-red" size={24} />
                        </div>
                        <h3 className="font-semibold mb-2">Telefon</h3>
                        <p className="text-gray-600 mb-3">Na telefononi për ndihmë të shpejtë</p>
                        <a href="tel:+38345255388" className="text-ferrari-red hover:underline font-medium block">
                            +383 45 528 033
                        </a>
                        <a href="tel:+38348656656" className="text-ferrari-red hover:underline font-medium block">
                            +383 48 656 656
                        </a>
                        <p className="text-xs text-gray-500 mt-2">Hënë - Premte: 09:00 - 18:00</p>
                    </div>

                    {/* Email */}
                    <div className="bg-surface rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <div className="w-12 h-12 bg-ferrari-red/10 rounded-full flex items-center justify-center mb-4">
                            <Mail className="text-ferrari-red" size={24} />
                        </div>
                        <h3 className="font-semibold mb-2">Email</h3>
                        <p className="text-gray-600 mb-3">Na shkruani për pyetje të detajuara</p>
                        <a href="mailto:info@formula-export.com" className="text-ferrari-red hover:underline font-medium block">
                            info@formula-export.com
                        </a>
                        <a href="mailto:support@formula-export.com" className="text-ferrari-red hover:underline font-medium block">
                            support@formula-export.com
                        </a>
                        <p className="text-xs text-gray-500 mt-2">Përgjigjem brenda 24 orëve</p>
                    </div>

                    {/* Address */}
                    <div className="bg-surface rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <div className="w-12 h-12 bg-ferrari-red/10 rounded-full flex items-center justify-center mb-4">
                            <MapPin className="text-ferrari-red" size={24} />
                        </div>
                        <h3 className="font-semibold mb-2">Adresa</h3>
                        <p className="text-gray-600 mb-3">Na vizitoni në zyrën tonë</p>
                        <p className="text-gray-800 font-medium">
                            Rr. B, Prishtinë<br />
                            10000, Kosovë
                        </p>
                    </div>

                    {/* Office Hours */}
                    <div className="bg-surface rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <div className="w-12 h-12 bg-ferrari-red/10 rounded-full flex items-center justify-center mb-4">
                            <Clock className="text-ferrari-red" size={24} />
                        </div>
                        <h3 className="font-semibold mb-2">Orari i punës</h3>
                        <div className="space-y-2 text-gray-600">
                            <div className="flex justify-between">
                                <span>Hënë - Premte:</span>
                                <span className="font-medium">09:00 - 18:00</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shtunë:</span>
                                <span className="font-medium">10:00 - 14:00</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Diel:</span>
                                <span className="font-medium">Mbyllyr</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-gradient-to-br from-ferrari-red to-ferrari-dark text-white rounded-lg shadow-md p-6">
                        <h3 className="font-semibold mb-3">Ndihmë e shpejtë</h3>
                        <div className="space-y-2">
                            <Link href="/how-it-works" className="flex items-center text-white/90 hover:text-white">
                                <Truck size={16} className="mr-2" />
                                <span>Si funksionon importi?</span>
                            </Link>
                            <Link href="/faq" className="flex items-center text-white/90 hover:text-white">
                                <HelpCircle size={16} className="mr-2" />
                                <span>Pyetje të shpeshta</span>
                            </Link>
                            <Link href="/privacy" className="flex items-center text-white/90 hover:text-white">
                                <Shield size={16} className="mr-2" />
                                <span>Politika e privatësisë</span>
                            </Link>
                            <Link href="/terms" className="flex items-center text-white/90 hover:text-white">
                                <MessageSquare size={16} className="mr-2" />
                                <span>Termat e përdorimit</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                    <div className="bg-surface rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-6">Dërgo një mesazh</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Emri dhe Mbiemri <span className="text-ferrari-red">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-theme rounded-lg focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red"
                                        placeholder="Shkruani emrin tuaj"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Email <span className="text-ferrari-red">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 border border-theme rounded-lg focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red"
                                        placeholder="sh@formula-export.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Telefoni
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 border border-theme rounded-lg focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red"
                                        placeholder="+383 45 528 033"
                                    />
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Subjekti <span className="text-ferrari-red">*</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-3 border border-theme rounded-lg focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red"
                                    >
                                        <option value="">Zgjedh subjektin</option>
                                        <option value="info">Informacion rreth importit</option>
                                        <option value="quote">Kërkoj ofertë</option>
                                        <option value="support">Mbështetje teknike</option>
                                        <option value="partnership">Bashkëpunim</option>
                                        <option value="other">Tjetër</option>
                                    </select>
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Mesazhi <span className="text-ferrari-red">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={6}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 border border-theme rounded-lg focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red"
                                    placeholder="Shkruani mesazhin tuaj këtu..."
                                />
                            </div>

                            {/* Privacy Notice */}
                            <div className="bg-secondary p-4 rounded-lg">
                                <p className="text-sm text-gray-600 flex items-start">
                                    <AlertCircle size={16} className="text-ferrari-red mr-2 mt-0.5 flex-shrink-0" />
                                    <span>
                                        Duke dërguar këtë formular, ju pranoni{' '}
                                        <Link href="/privacy" className="text-ferrari-red hover:underline">
                                            Politikën e Privatësisë
                                        </Link>{' '}
                                        dhe{' '}
                                        <Link href="/terms" className="text-ferrari-red hover:underline">
                                            Termat e Përdorimit
                                        </Link>.
                                    </span>
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary flex items-center justify-center disabled:opacity-50"
                            >
                                {loading ? (
                                    <>Duke dërguar...</>
                                ) : (
                                    <>
                                        <Send size={18} className="mr-2" />
                                        Dërgo mesazhin
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}