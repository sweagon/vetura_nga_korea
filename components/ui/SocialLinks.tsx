'use client';

import { Facebook, Instagram, MessageCircle, Youtube, Linkedin, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface SocialLinksProps {
    variant?: 'footer' | 'sidebar' | 'inline';
    showLabels?: boolean;
}


export default function SocialLinks({ variant = 'inline', showLabels = false }: SocialLinksProps) {
    const [hovered, setHovered] = useState<string | null>(null);

    const socials = [
        {
            name: 'Facebook',
            icon: Facebook,
            url: 'https://facebook.com/formula-export.ks',
            color: 'hover:bg-[#1877f2]',
            followers: '500+',
            label: 'Ndani me miq'
        },
        {
            name: 'Instagram',
            icon: Instagram,
            url: 'https://instagram.com/formula-export.ks',
            color: 'hover:bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcaf45]',
            followers: '300+',
            label: 'Foto të reja çdo ditë'
        },
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            url: 'https://wa.me/38345255388',
            color: 'hover:bg-[#25D366]',
            followers: '24/7',
            label: 'Përgjigje të shpejta'
        },
        {
            name: 'YouTube',
            icon: Youtube,
            url: 'https://youtube.com/@formula-export',
            color: 'hover:bg-[#FF0000]',
            followers: '100+',
            label: 'Video review të makinave'
        }
    ];

    if (variant === 'footer') {
        return (
            <div className="space-y-4">
                <div className="flex gap-3">
                    {socials.map((social) => (
                        <a
                            key={social.name}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative group"
                            onMouseEnter={() => setHovered(social.name)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            <div className="w-12 h-12 bg-surface/10 hover:bg-ferrari-red rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg">
                                <social.icon size={20} className="text-primary" />
                            </div>

                            {/* Tooltip */}
                            {hovered === social.name && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-primary text-primary text-xs rounded-lg whitespace-nowrap">
                                    {social.name}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                            )}
                        </a>
                    ))}
                </div>

                <p className="text-xs text-muted">
                    Na ndiqni për të parë makinat më të reja para të gjithëve!
                </p>
            </div>
        );
    }

    if (variant === 'sidebar') {
        return (
            <div className="bg-surface rounded-2xl p-6 border border-theme">
                <h3 className="font-semibold mb-4">Na ndiqni në rrjetet sociale</h3>
                <div className="space-y-3">
                    {socials.map((social) => (
                        <a
                            key={social.name}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 hover:bg-secondary rounded-xl transition group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-secondary group-hover:bg-ferrari-red rounded-lg flex items-center justify-center transition">
                                    <social.icon size={18} className="text-secondary group-hover:text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">{social.name}</p>
                                    <p className="text-xs text-secondary">{social.followers} ndjekës</p>
                                </div>
                            </div>
                            <ExternalLink size={16} className="text-muted group-hover:text-ferrari-red" />
                        </a>
                    ))}
                </div>
            </div>
        );
    }

    // Inline variant (default)
    return (
        <div className="flex items-center gap-2">
            {socials.map((social) => (
                <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-secondary rounded-lg transition group"
                    title={social.name}
                >
                    <social.icon size={18} className="text-secondary group-hover:text-ferrari-red" />
                </a>
            ))}
        </div>
    );
}
