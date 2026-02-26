'use client';

import { Search, Ship, FileCheck, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
    {
        icon: Search,
        title: 'Zgjidh makinën',
        description: 'Shfleto makinat nga Korea dhe zgjedh atë që dëshiron'
    },
    {
        icon: FileCheck,
        title: 'Porosit dhe kontrakto',
        description: 'Ne kujdesemi për të gjitha dokumentet dhe kontratën'
    },
    {
        icon: Ship,
        title: 'Transporti nga Korea',
        description: 'Makina transportohet me anije drejt Kosovës'
    },
    {
        icon: Truck,
        title: 'Dorëzimi në Kosovë',
        description: 'Makina vjen në Kosovë dhe ti e merr në vendin tënd'
    }
];

export default function HowItWorks() {
    return (
        <div>
            <h2 className="text-3xl font-bold text-center mb-12">Si funksionon?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((step, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="text-center"
                    >
                        <div className="bg-ferrari-red/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <step.icon className="text-ferrari-red" size={32} />
                        </div>
                        <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                        <p className="text-gray-600">{step.description}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}