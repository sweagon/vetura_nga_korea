import { Search, FileCheck, Ship, Truck, Shield, CreditCard, Clock, Headphones } from 'lucide-react';

const steps = [
    {
        icon: Search,
        title: '1. Zgjidh makinën',
        description: 'Shfleto katalogun tonë me mbi 500 makina nga Korea. Filtro sipas markës, modelit, vitit dhe çmimit.'
    },
    {
        icon: FileCheck,
        title: '2. Porosit dhe kontrakto',
        description: 'Pasi zgjedh makinën, ne përgatisim kontratën dhe të gjitha dokumentet e nevojshme.'
    },
    {
        icon: Ship,
        title: '3. Transporti nga Korea',
        description: 'Makina transportohet me anije nga Korea në Durrës. Koha e transportit është rreth 15-20 ditë.'
    },
    {
        icon: Truck,
        title: '4. Dorëzimi në Kosovë',
        description: 'Pasi makina arrin në Durrës, ne organizojmë transportin deri në vendin tënd në Kosovë.'
    }
];

const features = [
    {
        icon: Shield,
        title: 'Inspektim i plotë',
        description: 'Çdo makinë inspektohet para dërgesës'
    },
    {
        icon: CreditCard,
        title: 'Pagesë e sigurt',
        description: 'Oferta transparente pa shpenzime të fshehura'
    },
    {
        icon: Clock,
        title: '15-20 ditë transport',
        description: 'Transport i shpejtë nga Korea në Kosovë'
    },
    {
        icon: Headphones,
        title: 'Mbështetje 24/7',
        description: 'Jemi gjithmonë në dispozicion për pyetjet e tua'
    }
];

export default function HowItWorksPage() {
    return (
        <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
                <div className="container-custom text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Si funksionon <span className="text-ferrari-red">Formula Export</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Importimi i makinës nga Korea në Kosovë në 4 hapa të thjeshtë
                    </p>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-16">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="text-center">
                                <div className="bg-ferrari-red/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <step.icon className="text-ferrari-red" size={40} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                                <p className="text-gray-600">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-secondary py-16">
                <div className="container-custom">
                    <h2 className="text-3xl font-bold text-center mb-12">Pse të zgjidhni ne?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-surface p-6 rounded-lg shadow-md">
                                <feature.icon className="text-ferrari-red mb-4" size={32} />
                                <h3 className="font-bold mb-2">{feature.title}</h3>
                                <p className="text-gray-600 text-sm">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16">
                <div className="container-custom max-w-3xl">
                    <h2 className="text-3xl font-bold text-center mb-8">Pyetje të shpeshta</h2>

                    <div className="space-y-4">
                        <div className="bg-surface p-6 rounded-lg shadow-md">
                            <h3 className="font-bold mb-2">Sa kushton transporti?</h3>
                            <p className="text-gray-600">Transporti nga Korea në Kosovë kushton rreth 800-1200€ në varësi të madhësisë së makinës.</p>
                        </div>

                        <div className="bg-surface p-6 rounded-lg shadow-md">
                            <h3 className="font-bold mb-2">Sa zgjat transporti?</h3>
                            <p className="text-gray-600">Transporti zgjat rreth 15-20 ditë nga Korea në Durrës, plus 2-3 ditë për procedurat doganore.</p>
                        </div>

                        <div className="bg-surface p-6 rounded-lg shadow-md">
                            <h3 className="font-bold mb-2">A kam garanci?</h3>
                            <p className="text-gray-600">Po, të gjitha makinat vijnë me garanci dhe inspektim të plotë teknik.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}