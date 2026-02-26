// app/faq/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown, ChevronUp, Search, Phone, Mail, MessageCircle } from 'lucide-react';

const faqCategories = [
    {
        title: 'Importi i makinave',
        icon: '🚗',
        questions: [
            {
                q: 'Sa kushton importi i një makine nga Korea?',
                a: 'Kostot e importit përfshijnë: çmimin e makinës në Kore, transportin detar (800-1200€), doganën (10% e vlerës), TVSH (18%) dhe shërbimet tona (300-500€). Për një llogaritje të saktë, përdorni llogaritësin tonë në çdo faqe të makinës.'
            },
            {
                q: 'Sa zgjat transporti nga Korea në Kosovë?',
                a: 'Transporti detar nga Korea në portin e Durrësit zgjat rreth 15-20 ditë. Më pas, transporti nga Durrësi në qytetin tuaj në Kosovë zgjat 1-2 ditë. Gjithsej, mund të prisni makinën tuaj brenda 3-4 javësh.'
            },
            {
                q: 'A mund të zgjedh unë kompaninë e transportit?',
                a: 'Po, ne punojmë me disa kompani transporti dhe mund të zgjedhim opsionin më të mirë për nevojat tuaja. Ne gjithashtu ofrojmë transport të siguruar për makinën tuaj.'
            },
            {
                q: 'Çfarë dokumentash më nevojiten për import?',
                a: 'Për të importuar një makinë, ju nevojiten: letërnjoftim, numër fiskal, dhe konfirmim i pagesës. Ne kujdesemi për të gjitha dokumentet e tjera, përfshirë: certifikatën e origjinës, faturën e blerjes, dhe dokumentet doganore.'
            }
        ]
    },
    {
        title: 'Pagesa dhe garancia',
        icon: '💰',
        questions: [
            {
                q: 'Si bëhet pagesa për makinën?',
                a: 'Pagesa bëhet direkt me shitësin në Kore. Ne rekomandojmë përdorimin e një letre krediti (Letter of Credit) për siguri maksimale. Gjithashtu, ne mund të organizojmë pagesa përmes transfertës bankare.'
            },
            {
                q: 'A kanë garanci makinat?',
                a: 'Po, shumica e makinave vijnë me garanci nga shitësit në Kore. Garanci zakonisht përfshin motorin dhe transmisionin për 3-6 muaj. Detajet e garancisë janë të shënuara në çdo faqe të makinës.'
            },
            {
                q: 'Çfarë ndodh nëse makina ka probleme pasi vjen?',
                a: 'Nëse makina ka probleme gjatë periudhës së garancisë, ne ju ndihmojmë të komunikoni me shitësin në Kore për zgjidhjen e problemit. Për problemet jashtë garancisë, mund të gjeni servise në Kosovë që specializohen në makina të importuara.'
            }
        ]
    },
    {
        title: 'Makina dhe zgjedhja',
        icon: '🔍',
        questions: [
            {
                q: 'A mund ta inspektoj makinën para se ta blej?',
                a: 'Po, shumica e shitësve ofrojnë inspektim të detajuar dhe raporte nga kompani të pavarura. Gjithashtu, mund të kërkoni foto dhe video shtesë para se të vendosni të blini.'
            },
            {
                q: 'Cilat marka të makinave janë më të kërkuara në Kosovë?',
                a: 'Në Kosovë, makinat gjermane si Volkswagen, Audi, BMW dhe Mercedes-Benz janë më të kërkuarat. Gjithashtu, makinat franceze si Renault dhe Peugeot janë shumë të njohura për shkak të pjesëve të këmbimit të lira.'
            },
            {
                q: 'A mund të porosis një makinë që nuk është në listë?',
                a: 'Po, ne mund të gjejmë pothuajse çdo makinë që kërkoni. Na kontaktoni me detajet e makinës që dëshironi dhe ne do të gjejmë opsionet më të mira në Kore.'
            }
        ]
    },
    {
        title: 'Pas importit',
        icon: '📋',
        questions: [
            {
                q: 'Si i marr targat e Kosovës?',
                a: 'Pasi makina kalon doganën, ju duhet të regjistroni makinën në QKMT (Qendra për Regjistrimin e Automjeteve). Aty do të merrni targat e përkohshme fillimisht, dhe më pas targat përfundimtare. Ne ju udhëzojmë për të gjithë procesin.'
            },
            {
                q: 'Sa kushton regjistrimi në Kosovë?',
                a: 'Kostot e regjistrimit përfshijnë: taksën vjetore (rreth 100-300€ në varësi të motorit), sigurimin (rreth 150-250€) dhe targat (rreth 30€).'
            },
            {
                q: 'A mund ta shes makinën menjëherë pas importit?',
                a: 'Po, pasi makina regjistrohet në emrin tuaj, ju mund ta shesni lirisht. Megjithatë, rekomandojmë të prisni të paktën 6 muaj për të shmangur komplikime tatimore.'
            }
        ]
    }
];

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [openCategories, setOpenCategories] = useState<number[]>([]);
    const [openQuestions, setOpenQuestions] = useState<{ [key: string]: boolean }>({});

    const toggleCategory = (index: number) => {
        setOpenCategories(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const toggleQuestion = (qIndex: number, catIndex: number) => {
        const key = `${catIndex}-${qIndex}`;
        setOpenQuestions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Filter questions based on search
    const filteredCategories = searchQuery
        ? faqCategories.map(cat => ({
            ...cat,
            questions: cat.questions.filter(q =>
                q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.a.toLowerCase().includes(searchQuery.toLowerCase())
            )
        })).filter(cat => cat.questions.length > 0)
        : faqCategories;

    return (
        <div className="min-h-screen bg-gradient-to-b from-secondary to-surface">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-ferrari-red to-ferrari-dark text-white">
                <div className="container-custom py-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Pyetje të shpeshta
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl">
                        Gjeni përgjigje për pyetjet më të zakonshme rreth importit të makinave nga Korea.
                    </p>
                </div>
            </div>

            <div className="container-custom py-12">
                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-12">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Kërko në FAQ..."
                            className="w-full pl-12 pr-4 py-4 bg-surface border border-theme rounded-xl focus:outline-none focus:border-ferrari-red focus:ring-2 focus:ring-ferrari-red/20 shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* FAQ Categories */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main FAQ Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {filteredCategories.map((category, catIndex) => (
                            <div key={catIndex} className="bg-surface rounded-2xl shadow-sm border border-theme overflow-hidden">
                                {/* Category Header */}
                                <button
                                    onClick={() => toggleCategory(catIndex)}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{category.icon}</span>
                                        <h2 className="text-xl font-semibold">{category.title}</h2>
                                    </div>
                                    {openCategories.includes(catIndex) ? (
                                        <ChevronUp size={20} className="text-gray-500" />
                                    ) : (
                                        <ChevronDown size={20} className="text-gray-500" />
                                    )}
                                </button>

                                {/* Questions */}
                                {openCategories.includes(catIndex) && (
                                    <div className="border-t border-theme divide-y">
                                        {category.questions.map((q, qIndex) => (
                                            <div key={qIndex} className="p-6">
                                                <button
                                                    onClick={() => toggleQuestion(qIndex, catIndex)}
                                                    className="w-full flex items-start justify-between gap-4 text-left"
                                                >
                                                    <h3 className="font-medium text-gray-900 flex-1">
                                                        {q.q}
                                                    </h3>
                                                    {openQuestions[`${catIndex}-${qIndex}`] ? (
                                                        <ChevronUp size={18} className="text-gray-500 flex-shrink-0 mt-1" />
                                                    ) : (
                                                        <ChevronDown size={18} className="text-gray-500 flex-shrink-0 mt-1" />
                                                    )}
                                                </button>
                                                {openQuestions[`${catIndex}-${qIndex}`] && (
                                                    <p className="mt-4 text-gray-600 leading-relaxed">
                                                        {q.a}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {filteredCategories.length === 0 && (
                            <div className="bg-surface rounded-2xl p-12 text-center border border-theme">
                                <p className="text-gray-500 mb-4">Nuk u gjet asnjë pyetje për "{searchQuery}"</p>
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="text-ferrari-red hover:underline"
                                >
                                    Pastro kërkimin
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Contact Card */}
                        <div className="bg-surface rounded-2xl p-6 border border-theme shadow-sm">
                            <h3 className="font-semibold mb-4">Nuk e gjetët atë që kërkoni?</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Na kontaktoni direkt dhe do t'ju përgjigjemi brenda 24 orëve.
                            </p>
                            <div className="space-y-3">
                                <a
                                    href="tel:+38345255388"
                                    className="flex items-center gap-3 p-3 bg-secondary hover:bg-ferrari-red/5 rounded-xl transition"
                                >
                                    <Phone size={18} className="text-ferrari-red" />
                                    <div>
                                        <p className="text-xs text-gray-500">Telefon</p>
                                        <p className="font-medium">+383 45 528 033</p>
                                    </div>
                                </a>
                                <a
                                    href="mailto:info@formulaexport.com"
                                    className="flex items-center gap-3 p-3 bg-secondary hover:bg-ferrari-red/5 rounded-xl transition"
                                >
                                    <Mail size={18} className="text-ferrari-red" />
                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="font-medium">info@formulaexport.com</p>
                                    </div>
                                </a>
                                <a
                                    href="https://wa.me/38345255388"
                                    target="_blank"
                                    className="flex items-center gap-3 p-3 bg-secondary hover:bg-ferrari-red/5 rounded-xl transition"
                                >
                                    <MessageCircle size={18} className="text-ferrari-red" />
                                    <div>
                                        <p className="text-xs text-gray-500">WhatsApp</p>
                                        <p className="font-medium">+383 45 528 033</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="bg-gradient-to-br from-ferrari-red/5 to-transparent rounded-2xl p-6 border border-ferrari-red/10">
                            <h3 className="font-semibold mb-3">Linke të shpejta</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link href="/how-it-works" className="text-sm text-gray-600 hover:text-ferrari-red transition flex items-center gap-2">
                                        <ChevronRight size={14} className="text-ferrari-red" />
                                        Si funksionon importi?
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/cars" className="text-sm text-gray-600 hover:text-ferrari-red transition flex items-center gap-2">
                                        <ChevronRight size={14} className="text-ferrari-red" />
                                        Shfleto makinat
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/offers" className="text-sm text-gray-600 hover:text-ferrari-red transition flex items-center gap-2">
                                        <ChevronRight size={14} className="text-ferrari-red" />
                                        Ofertat e javës
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}