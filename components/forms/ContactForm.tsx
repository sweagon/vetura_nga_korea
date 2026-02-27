'use client';

import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    message: string;
}

interface ContactFormProps {
    carId?: string | number;
    carName?: string;
}

export default function ContactForm({ carId, carName }: ContactFormProps) {
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        email: '',
        phone: '',
        message: carName ? `Interesuar për: ${carName}` : ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    carId,
                    carName
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitted(true);
            } else {
                setError(data.error || 'Gabim gjatë dërgimit. Ju lutemi provoni përsëri.');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setError('Gabim gjatë dërgimit. Ju lutemi provoni përsëri.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-success-bg p-6 rounded-lg text-center">
                <CheckCircle className="text-success-text mx-auto mb-3" size={48} />
                <h3 className="text-xl font-semibold mb-2">Mesazhi u dërgua!</h3>
                <p className="text-secondary mb-4">
                    Faleminderit për mesazhin. Do të kontaktojmë sa më shpejt.
                </p>
                <p className="text-sm text-secondary">
                    Një kopje e mesazhit u dërgua në email-in tuaj.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-error-bg p-3 rounded-lg">
                    <p className="text-sm text-error-text">{error}</p>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-1">Emri dhe Mbiemri</label>
                <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-theme rounded-lg focus:outline-none focus:border-ferrari-red"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                    type="email"
                    required
                    className="w-full px-4 py-2 border border-theme rounded-lg focus:outline-none focus:border-ferrari-red"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Telefoni</label>
                <input
                    type="tel"
                    required
                    className="w-full px-4 py-2 border border-theme rounded-lg focus:outline-none focus:border-ferrari-red"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Mesazhi</label>
                <textarea
                    rows={4}
                    required
                    className="w-full px-4 py-2 border border-theme rounded-lg focus:outline-none focus:border-ferrari-red"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center disabled:opacity-50"
            >
                <Send size={18} className="mr-2" />
                {loading ? 'Duke dërguar...' : 'Dërgo mesazhin'}
            </button>
        </form>
    );
}
