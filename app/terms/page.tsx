import Link from 'next/link';
import {
    Scale,
    Truck,
    CreditCard,
    AlertCircle,
    Shield,
    FileText,
    ChevronRight,
    CheckCircle,
    XCircle,
    Info
} from 'lucide-react';

export default function TermsPage() {
    const lastUpdated = "25 Shkurt 2026";

    return (
        <div className="container-custom py-12 max-w-4xl">
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-ferrari-red">Formula Export</Link>
                <ChevronRight size={14} className="mx-2" />
                <span className="text-ferrari-red">Termat e Përdorimit</span>
            </div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Termat e Përdorimit</h1>
                <div className="flex items-center gap-3 text-gray-600">
                    <Scale size={18} className="text-ferrari-red" />
                    <p>Përditësuar më: {lastUpdated}</p>
                </div>
            </div>

            {/* Quick Summary Card */}
            <div className="bg-gradient-to-r from-ferrari-red/5 to-transparent p-6 rounded-lg border border-ferrari-red/20 mb-8">
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                    <Info size={20} className="text-ferrari-red mr-2" />
                    Përmbledhje e shkurtër
                </h2>
                <p className="text-gray-700">
                    Duke përdorur faqen Formula Export, ju pranoni këto terma.
                    Ne jemi një platformë që ju lidh me shitës të makinave në Kore.
                    Ju lutemi lexoni me kujdes para se të përdorni shërbimet tona.
                </p>
            </div>

            {/* Main Content */}
            <div className="space-y-8">
                {/* 1. Acceptance of Terms */}
                <section className="bg-surface rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <CheckCircle className="text-ferrari-red mr-2" size={20} />
                        1. Pranimi i termave
                    </h2>
                    <div className="space-y-3 text-gray-700">
                        <p>
                            Duke aksesuar ose përdorur faqen Formula Export, ju pranoni të jeni të detyruar nga këto terma.
                            Nëse nuk pranoni ndonjë pjesë të termave, nuk mund të përdorni shërbimet tona.
                        </p>
                        <div className="bg-secondary p-4 rounded-lg mt-3">
                            <p className="text-sm font-medium mb-2">Duke përdorur faqen, ju konfirmoni se:</p>
                            <ul className="text-sm space-y-1">
                                <li className="flex items-start">
                                    <CheckCircle size={14} className="text-green-500 mr-2 mt-0.5" />
                                    <span>Jeni mbi 18 vjeç</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle size={14} className="text-green-500 mr-2 mt-0.5" />
                                    <span>Keni autoritetin për të hyrë në marrëveshje ligjore</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle size={14} className="text-green-500 mr-2 mt-0.5" />
                                    <span>Do t'i përdorni shërbimet tona në përputhje me ligjin</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 2. Our Role */}
                <section className="bg-surface rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Truck className="text-ferrari-red mr-2" size={20} />
                        2. Roli i Formula Export
                    </h2>
                    <div className="space-y-3 text-gray-700">
                        <p>
                            Formula Export vepron si një platformë që lidh blerësit në Kosovë me shitësit e makinave në Kore.
                            Ne nuk jemi shitës të makinave, por ofrojmë:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Akses në listimin e makinave nga tregu Korean</li>
                            <li>Informacion rreth specifikave të makinave</li>
                            <li>Llogaritës të kostove të importit (vlerësim)</li>
                            <li>Platformë për komunikim me shitësit</li>
                        </ul>
                        <div className="bg-yellow-50 p-4 rounded-lg mt-3">
                            <p className="text-sm text-yellow-800 flex items-start">
                                <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                                <span>
                                    <strong>E rëndësishme:</strong> Ne nuk jemi palë në transaksionet midis jush dhe shitësve.
                                    Çdo marrëveshje blerjeje është drejtpërdrejt midis jush dhe shitësit.
                                </span>
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. Pricing and Costs */}
                <section className="bg-surface rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <CreditCard className="text-ferrari-red mr-2" size={20} />
                        3. Çmimet dhe kostot
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium mb-2">Çmimet e shfaqura:</h3>
                            <ul className="space-y-2">
                                <li className="flex items-start">
                                    <span className="w-2 h-2 bg-ferrari-red rounded-full mt-2 mr-3"></span>
                                    <span className="text-gray-700">
                                        <span className="font-medium">Çmimi në Kore:</span> Çmimi bazë i makinës në tregun Korean
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-2 h-2 bg-ferrari-red rounded-full mt-2 mr-3"></span>
                                    <span className="text-gray-700">
                                        <span className="font-medium">Llogaritësi i kostos:</span> Vlerësim i kostove të importit (jo garanci)
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-2 h-2 bg-ferrari-red rounded-full mt-2 mr-3"></span>
                                    <span className="text-gray-700">
                                        <span className="font-medium">Kostot doganore:</span> Përcaktohen nga dogana e Kosovës
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-secondary p-4 rounded-lg">
                            <p className="text-sm text-gray-600 flex items-start">
                                <Info size={16} className="text-ferrari-red mr-2 flex-shrink-0 mt-0.5" />
                                <span>
                                    Kostot e importit (dogana, TVSH, transport) janë vlerësime.
                                    Kostot reale mund të ndryshojnë në bazë të vlerësimit doganor dhe tarifave aktuale.
                                </span>
                            </p>
                        </div>
                    </div>
                </section>

                {/* 4. User Responsibilities */}
                <section className="bg-surface rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Shield className="text-ferrari-red mr-2" size={20} />
                        4. Përgjegjësitë e përdoruesit
                    </h2>
                    <div className="space-y-3">
                        <p className="text-gray-700">Si përdorues, ju pranoni që:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3 border rounded-lg">
                                <h3 className="font-medium text-green-600 mb-1">✓ Duhet të</h3>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Jepni informacion të saktë</li>
                                    <li>• Verifikoni vetë makinat</li>
                                    <li>• Komunikoni me shitësit</li>
                                    <li>• Përmbushni detyrimet tuaja</li>
                                </ul>
                            </div>
                            <div className="p-3 border rounded-lg">
                                <h3 className="font-medium text-red-600 mb-1">✗ Nuk duhet të</h3>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Postoni informacion të rremë</li>
                                    <li>• Shkelni të drejtat e autorit</li>
                                    <li>• Përdorni faqen për qëllime të paligjshme</li>
                                    <li>• Abuzoni me sistemin</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. Limitation of Liability */}
                <section className="bg-surface rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <XCircle className="text-ferrari-red mr-2" size={20} />
                        5. Kufizimi i përgjegjësisë
                    </h2>
                    <div className="space-y-3 text-gray-700">
                        <p>Formula Export nuk mban përgjegjësi për:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Saktësinë e informacionit të makinave (informacioni vjen nga burime të treta)</li>
                            <li>Gjendjen fizike të makinave</li>
                            <li>Vonesat në transport</li>
                            <li>Ndryshimet në taksat doganore</li>
                            <li>Transaksionet midis jush dhe shitësve</li>
                            <li>Dëmet direkte ose indirekte nga përdorimi i faqes</li>
                        </ul>
                        <div className="bg-red-50 p-4 rounded-lg mt-3">
                            <p className="text-sm text-red-800 flex items-start">
                                <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                                <span>
                                    <strong>Shënim ligjor:</strong> Ne ofrojmë platformën "ashtu siç është"
                                    dhe nuk garantojmë që shërbimi do të jetë pa gabime ose i pandërprerë.
                                </span>
                            </p>
                        </div>
                    </div>
                </section>

                {/* 6. Intellectual Property */}
                <section className="bg-surface rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <FileText className="text-ferrari-red mr-2" size={20} />
                        6. Pronësia intelektuale
                    </h2>
                    <p className="text-gray-700 mb-3">
                        E gjithë përmbajtja në këtë faqe, përfshirë:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-1">
                        <li>Logot dhe markat tregtare</li>
                        <li>Dizajni dhe kodi i faqes</li>
                        <li>Përmbajtja e shkruar</li>
                        <li>Fotografitë (përveç atyre të makinave)</li>
                    </ul>
                    <p className="text-gray-700 mt-3">
                        janë pronë e Formula Export dhe mbrohen nga ligjet e pronësisë intelektuale.
                    </p>
                </section>

                {/* 7. Termination */}
                <section className="bg-surface rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <XCircle className="text-ferrari-red mr-2" size={20} />
                        7. Ndërprerja e shërbimit
                    </h2>
                    <p className="text-gray-700">
                        Ne rezervojmë të drejtën të ndërpresim ose kufizojmë aksesin tuaj në faqe
                        pa njoftim paraprak për çdo arsye, përfshirë shkeljen e këtyre termave.
                    </p>
                </section>

                {/* 8. Changes to Terms */}
                <section className="bg-surface rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <FileText className="text-ferrari-red mr-2" size={20} />
                        8. Ndryshimet në terma
                    </h2>
                    <p className="text-gray-700">
                        Ne mund të ndryshojmë këto terma në çdo kohë. Ndryshimet hyjnë në fuqi
                        menjëherë pas publikimit në faqe. Vazhdimi i përdorimit të faqes pas
                        ndryshimeve nënkupton pranimin e termave të reja.
                    </p>
                </section>

                {/* 9. Contact Information */}
                <section className="bg-surface rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Shield className="text-ferrari-red mr-2" size={20} />
                        9. Na kontaktoni
                    </h2>
                    <p className="text-gray-700 mb-4">
                        Për pyetje në lidhje me këto terma, na kontaktoni:
                    </p>
                    <div className="bg-secondary p-4 rounded-lg space-y-2">
                        <div className="flex items-center">
                            <span className="font-medium w-24">Email:</span>
                            <a href="mailto:legal@formula-export.com" className="text-ferrari-red hover:underline">
                                legal@formula-export.com
                            </a>
                        </div>
                        <div className="flex items-center">
                            <span className="font-medium w-24">Adresa:</span>
                            <span>Prishtinë, Kosovë</span>
                        </div>
                    </div>
                </section>

                {/* Governing Law */}
                <section className="bg-surface rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Scale className="text-ferrari-red mr-2" size={20} />
                        10. Ligji në fuqi
                    </h2>
                    <p className="text-gray-700">
                        Këto terma rregullohen nga ligjet e Republikës së Kosovës.
                        Çdo mosmarrëveshje që lind nga përdorimi i faqes do të zgjidhet
                        në gjykatat kompetente të Kosovës.
                    </p>
                </section>

                {/* Last Updated Notice */}
                <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800 flex items-start">
                    <AlertCircle size={18} className="mr-3 flex-shrink-0 mt-0.5" />
                    <p>
                        <strong>Versioni aktual:</strong> {lastUpdated}. Duke përdorur faqen tonë,
                        ju pranoni këto terma. Për versionet e mëparshme, na kontaktoni.
                    </p>
                </div>

                {/* Link to Privacy */}
                <div className="text-center text-gray-600 text-sm">
                    <p>
                        Lexoni gjithashtu{' '}
                        <Link href="/privacy" className="text-ferrari-red hover:underline font-medium">
                            Politikën e Privatësisë
                        </Link>
                    </p>
                </div>

                {/* Acceptance Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Link
                        href="/"
                        className="px-8 py-3 border-2 border-ferrari-red text-ferrari-red rounded-lg font-medium hover:bg-ferrari-red/5 transition text-center"
                    >
                        Refuzoj
                    </Link>
                    <Link
                        href="/cars"
                        className="px-8 py-3 bg-ferrari-red text-white rounded-lg font-medium hover:bg-ferrari-dark transition text-center"
                    >
                        Pranoj dhe vazhdoj
                    </Link>
                </div>
            </div>
        </div>
    );
}