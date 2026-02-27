import Link from 'next/link';
import { Metadata } from 'next';
import {
    Shield,
    Mail,
    FileText,
    Lock,
    Eye,
    Database,
    Cookie,
    ChevronRight,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'Politika e Privatësisë | Formula Export',
    description: 'Politika e privatësisë së Formula Export. Mësoni si mbrojmë të dhënat tuaja personale.',
    robots: {
        index: true,
        follow: true,
    },
};

export default function PrivacyPage() {
    const lastUpdated = "25 Shkurt 2026";

    return (
        <div className="container-custom py-12 max-w-4xl">
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm text-secondary mb-6">
                <Link href="/" className="hover:text-ferrari-red">Formula Export</Link>
                <ChevronRight size={14} className="mx-2" />
                <span className="text-ferrari-red">Politika e Privatësisë</span>
            </div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Politika e Privatësisë</h1>
                <div className="flex items-center gap-3 text-secondary">
                    <Shield size={18} className="text-ferrari-red" />
                    <p>Përditësuar më: {lastUpdated}</p>
                </div>
            </div>

            {/* Quick Summary Card */}
            <div className="bg-gradient-to-r from-ferrari-red/5 to-transparent p-6 rounded-lg border border-ferrari-red/20 mb-8">
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                    <CheckCircle size={20} className="text-ferrari-red mr-2" />
                    Përmbledhje e shkurtër
                </h2>
                <p className="text-primary mb-3">
                    Në Formula Export, privatësia juaj është prioritet. Ne mbledhim vetëm të dhënat e nevojshme për të:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <li className="flex items-center text-secondary">
                        <CheckCircle size={14} className="text-success-text mr-2" />
                        Personalizuar kërkimin tuaj
                    </li>
                    <li className="flex items-center text-secondary">
                        <CheckCircle size={14} className="text-success-text mr-2" />
                        Ruajtur makinat e preferuara
                    </li>
                    <li className="flex items-center text-secondary">
                        <CheckCircle size={14} className="text-success-text mr-2" />
                        Përmirësuar shërbimet tona
                    </li>
                    <li className="flex items-center text-secondary">
                        <CheckCircle size={14} className="text-success-text mr-2" />
                        Komunikuar për pyetjet tuaja
                    </li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="space-y-8">
                {/* 1. Information We Collect */}
                <section className="bg-surface rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Database className="text-ferrari-red mr-2" size={20} />
                        1. Çfarë të dhënash mbledhim?
                    </h2>
                    <div className="space-y-4 text-primary">
                        <p>Të dhënat që na jepni direkt:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><span className="font-medium">Emri dhe mbiemri</span> - kur plotësoni formularin e kontaktit</li>
                            <li><span className="font-medium">Adresa email</span> - për t'ju kontaktuar</li>
                            <li><span className="font-medium">Numri i telefonit</span> - për komunikim më të shpejtë</li>
                            <li><span className="font-medium">Mesazhet</span> - pyetjet dhe kërkesat tuaja</li>
                        </ul>

                        <p className="mt-4">Të dhënat që mbledhim automatikisht:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><span className="font-medium">Preferencat e kërkimit</span> - për të përmirësuar Matchmaker-in</li>
                            <li><span className="font-medium">Makinat e shikuara</span> - për rekomandime më të mira</li>
                            <li><span className="font-medium">Makinat e ruajtura</span> - për t'ju kujtuar preferencat</li>
                            <li><span className="font-medium">Informacione teknike</span> - IP adresa, lloji i shfletuesit</li>
                        </ul>
                    </div>
                </section>

                {/* 2. How We Use Your Data */}
                <section className="bg-surface rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Eye className="text-ferrari-red mr-2" size={20} />
                        2. Si i përdorim të dhënat tuaja?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-secondary rounded-lg">
                            <h3 className="font-medium mb-2 text-ferrari-red">Për shërbimin</h3>
                            <ul className="text-sm text-secondary space-y-1">
                                <li>✓ Kontakt për makinat që ju interesojnë</li>
                                <li>✓ Ruajtja e preferencave të kërkimit</li>
                                <li>✓ Funksionimi i Matchmaker-it</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-secondary rounded-lg">
                            <h3 className="font-medium mb-2 text-ferrari-red">Për përmirësim</h3>
                            <ul className="text-sm text-secondary space-y-1">
                                <li>✓ Analizë e përdorimit të faqes</li>
                                <li>✓ Përmirësim i rekomandimeve</li>
                                <li>✓ Zhvillim i veçorive të reja</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 3. Cookies */}
                <section className="bg-surface rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Cookie className="text-ferrari-red mr-2" size={20} />
                        3. Cookies
                    </h2>
                    <p className="text-primary mb-4">
                        Përdorim cookies për të përmirësuar përvojën tuaj. Ju keni kontroll të plotë:
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                            <Shield size={18} className="text-ferrari-red mt-1 flex-shrink-0" />
                            <div>
                                <span className="font-medium">Cookies esenciale:</span>
                                <p className="text-sm text-secondary">Ruajnë preferencat tuaja dhe makinat e ruajtura.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                            <Shield size={18} className="text-ferrari-red mt-1 flex-shrink-0" />
                            <div>
                                <span className="font-medium">Cookies funksionale:</span>
                                <p className="text-sm text-secondary">Mundësojnë Matchmaker-in të mësojë preferencat.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                            <Shield size={18} className="text-ferrari-red mt-1 flex-shrink-0" />
                            <div>
                                <span className="font-medium">Cookies analitike:</span>
                                <p className="text-sm text-secondary">Na ndihmojnë të kuptojmë se si përdoret faqja.</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Link
                            href="/cookies"
                            className="text-ferrari-red hover:underline text-sm flex items-center"
                        >
                            Menaxho preferencat e cookies
                            <ChevronRight size={14} className="ml-1" />
                        </Link>
                    </div>
                </section>

                {/* 4. Data Protection */}
                <section className="bg-surface rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Lock className="text-ferrari-red mr-2" size={20} />
                        4. Si i mbrojmë të dhënat tuaja?
                    </h2>
                    <div className="space-y-3 text-primary">
                        <p>Ne marrim masa të rrepta sigurie:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Enkriptim i të dhënave në transmision (SSL/TLS)</li>
                            <li>Access i kufizuar për stafin</li>
                            <li>Monitorim i vazhdueshëm për aktivitete të dyshimta</li>
                            <li>Backup të rregullt të të dhënave</li>
                        </ul>
                    </div>
                </section>

                {/* 5. Your Rights */}
                <section className="bg-surface rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <FileText className="text-ferrari-red mr-2" size={20} />
                        5. Të drejtat tuaja
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 border rounded-lg">
                            <span className="font-medium block">Qasja</span>
                            <span className="text-sm text-secondary">Kërkoni kopje të të dhënave</span>
                        </div>
                        <div className="p-3 border rounded-lg">
                            <span className="font-medium block">Korrigjimi</span>
                            <span className="text-sm text-secondary">Ndryshoni të dhënat e pasakta</span>
                        </div>
                        <div className="p-3 border rounded-lg">
                            <span className="font-medium block">Fshirja</span>
                            <span className="text-sm text-secondary">Kërkoni fshirjen e të dhënave</span>
                        </div>
                        <div className="p-3 border rounded-lg">
                            <span className="font-medium block">Kundërshtimi</span>
                            <span className="text-sm text-secondary">Kundërshtoni përpunimin</span>
                        </div>
                    </div>
                </section>

                {/* 6. Contact Information */}
                <section className="bg-surface rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Mail className="text-ferrari-red mr-2" size={20} />
                        6. Na kontaktoni
                    </h2>
                    <p className="text-primary mb-4">
                        Për çdo pyetje në lidhje me privatësinë, na shkruani:
                    </p>
                    <div className="bg-secondary p-4 rounded-lg space-y-2">
                        <div className="flex items-center">
                            <Mail size={16} className="text-ferrari-red mr-3" />
                            <a href="mailto:privacy@formula-export.com" className="text-ferrari-red hover:underline">
                                privacy@formula-export.com
                            </a>
                        </div>
                        <div className="flex items-center">
                            <Shield size={16} className="text-ferrari-red mr-3" />
                            <span>Formula Export, Prishtinë, Kosovë</span>
                        </div>
                    </div>
                </section>

                {/* Last Updated Notice */}
                <div className="bg-warning-bg p-4 rounded-lg text-sm text-yellow-800 flex items-start">
                    <AlertCircle size={18} className="mr-3 flex-shrink-0 mt-0.5" />
                    <p>
                        Kjo politikë përditësohet rregullisht. Versioni i fundit është i datës {lastUpdated}.
                        Duke përdorur faqen tonë, ju pranoni këtë politikë.
                    </p>
                </div>

                {/* Link to Terms */}
                <div className="text-center text-secondary text-sm">
                    <p>
                        Lexoni gjithashtu{' '}
                        <Link href="/terms" className="text-ferrari-red hover:underline font-medium">
                            Termat e Përdorimit
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
