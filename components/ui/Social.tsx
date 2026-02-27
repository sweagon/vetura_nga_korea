// components/ui/Social.tsx
'use client';

import {
    Facebook,
    Instagram,
    MessageCircle,
    Youtube,
    Linkedin,
    Twitter,
    Mail,
    Link2,
    Check,
    ExternalLink,
    Share2
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// TYPES
// ==========================================
interface SocialBaseProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    showTooltip?: boolean;
}

interface SocialLinksProps extends SocialBaseProps {
    variant?: 'footer' | 'sidebar' | 'inline' | 'minimal';
    showLabels?: boolean;
    showCounts?: boolean;
}

interface SocialShareProps extends SocialBaseProps {
    url: string;
    title: string;
    description?: string;
    image?: string;
    showLabel?: boolean;
}

// ==========================================
// CONSTANTS
// ==========================================
const SOCIAL_PROFILES = [
    {
        id: 'facebook',
        name: 'Facebook',
        icon: Facebook,
        url: 'https://facebook.com/formula.export',
        color: 'hover:bg-[#1877f2]',
        followers: '500+',
        label: 'Ndani me miq',
        shareUrl: (url: string, title: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
        id: 'instagram',
        name: 'Instagram',
        icon: Instagram,
        url: 'https://instagram.com/formula.export',
        color: 'hover:bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcaf45]',
        followers: '300+',
        label: 'Foto të reja çdo ditë',
        shareUrl: null, // Instagram doesn't have direct sharing
    },
    {
        id: 'whatsapp',
        name: 'WhatsApp',
        icon: MessageCircle,
        url: 'https://wa.me/38345255388',
        color: 'hover:bg-[#25D366]',
        followers: '24/7',
        label: 'Përgjigje të shpejta',
        shareUrl: (url: string, title: string) => `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
    },
    {
        id: 'youtube',
        name: 'YouTube',
        icon: Youtube,
        url: 'https://youtube.com/@formula-export',
        color: 'hover:bg-[#FF0000]',
        followers: '100+',
        label: 'Video review të makinave',
        shareUrl: null,
    },
    {
        id: 'twitter',
        name: 'Twitter',
        icon: Twitter,
        url: 'https://twitter.com/formula-export',
        color: 'hover:bg-[#1DA1F2]',
        followers: '200+',
        label: 'Lajmet e fundit',
        shareUrl: (url: string, title: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
    {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: Linkedin,
        url: 'https://linkedin.com/company/formula-export',
        color: 'hover:bg-[#0A66C2]',
        followers: '150+',
        label: 'Rrjeti profesional',
        shareUrl: (url: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
];

// ==========================================
// SIZE CLASSES
// ==========================================
const sizeClasses = {
    sm: {
        icon: 16,
        button: 'p-1.5',
        rounded: 'rounded-lg',
    },
    md: {
        icon: 18,
        button: 'p-2',
        rounded: 'rounded-lg',
    },
    lg: {
        icon: 20,
        button: 'p-2.5',
        rounded: 'rounded-xl',
    },
};

// ==========================================
// SHARE BUTTON COMPONENT
// ==========================================
export function SocialShare({
    url,
    title,
    description,
    image,
    size = 'md',
    className = '',
    showTooltip = true,
    showLabel = false,
}: SocialShareProps) {
    const [copied, setCopied] = useState(false);
    const [hovered, setHovered] = useState<string | null>(null);

    const fullUrl = `https://formula-export.com${url}`;
    const sizeStyle = sizeClasses[size];

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Filter only platforms that support sharing
    const sharePlatforms = SOCIAL_PROFILES.filter(p => p.shareUrl);

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {sharePlatforms.map((platform) => (
                <div key={platform.id} className="relative">
                    <a
                        href={platform.shareUrl!(fullUrl, title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${sizeStyle.button} bg-surface-2 hover:bg-ferrari-red hover:text-white ${sizeStyle.rounded} transition-all duration-200 group flex items-center gap-2`}
                        onMouseEnter={() => setHovered(platform.id)}
                        onMouseLeave={() => setHovered(null)}
                        aria-label={`Share on ${platform.name}`}
                    >
                        <platform.icon size={sizeStyle.icon} className="text-secondary group-hover:text-white" />
                        {showLabel && <span className="text-sm">{platform.name}</span>}
                    </a>

                    {showTooltip && hovered === platform.id && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-primary text-primary text-xs rounded whitespace-nowrap z-50">
                            Share on {platform.name}
                        </div>
                    )}
                </div>
            ))}

            {/* Copy Link Button */}
            <div className="relative">
                <button
                    onClick={copyToClipboard}
                    className={`${sizeStyle.button} bg-surface-2 hover:bg-ferrari-red hover:text-white ${sizeStyle.rounded} transition-all duration-200 group`}
                    onMouseEnter={() => setHovered('copy')}
                    onMouseLeave={() => setHovered(null)}
                    aria-label="Copy link"
                >
                    {copied ? <Check size={sizeStyle.icon} /> : <Link2 size={sizeStyle.icon} />}
                </button>

                {showTooltip && hovered === 'copy' && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-primary text-primary text-xs rounded whitespace-nowrap z-50">
                        {copied ? 'Copied!' : 'Copy link'}
                    </div>
                )}
            </div>
        </div>
    );
}

// ==========================================
// SOCIAL LINKS COMPONENT
// ==========================================
export function SocialLinks({
    variant = 'inline',
    size = 'md',
    className = '',
    showTooltip = true,
    showLabels = false,
    showCounts = false,
}: SocialLinksProps) {
    const [hovered, setHovered] = useState<string | null>(null);
    const sizeStyle = sizeClasses[size];

    // Footer variant
    if (variant === 'footer') {
        return (
            <div className="space-y-4">
                <div className="flex gap-3">
                    {SOCIAL_PROFILES.map((platform) => (
                        <div key={platform.id} className="relative">
                            <a
                                href={platform.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 bg-surface/10 hover:bg-ferrari-red rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                                onMouseEnter={() => setHovered(platform.id)}
                                onMouseLeave={() => setHovered(null)}
                            >
                                <platform.icon size={20} className="text-primary group-hover:text-white" />
                            </a>

                            {showTooltip && hovered === platform.id && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-primary text-primary text-xs rounded whitespace-nowrap">
                                    {platform.name}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <p className="text-xs text-muted">
                    Na ndiqni për të parë makinat më të reja para të gjithëve!
                </p>
            </div>
        );
    }

    // Sidebar variant
    if (variant === 'sidebar') {
        return (
            <div className="bg-surface rounded-2xl p-6 border border-medium">
                <h3 className="font-semibold text-primary mb-4">Na ndiqni në rrjetet sociale</h3>
                <div className="space-y-3">
                    {SOCIAL_PROFILES.map((platform) => (
                        <a
                            key={platform.id}
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 hover:bg-secondary rounded-xl transition group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-secondary group-hover:bg-ferrari-red rounded-lg flex items-center justify-center transition">
                                    <platform.icon size={18} className="text-secondary group-hover:text-white" />
                                </div>
                                <div>
                                    <p className="font-medium text-primary">{platform.name}</p>
                                    {showCounts && (
                                        <p className="text-xs text-muted">{platform.followers} ndjekës</p>
                                    )}
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
        <div className={`flex items-center gap-2 ${className}`}>
            {SOCIAL_PROFILES.map((platform) => (
                <div key={platform.id} className="relative">
                    <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${sizeStyle.button} bg-surface-2 hover:bg-ferrari-red hover:text-white ${sizeStyle.rounded} transition-all duration-200 group flex items-center gap-2`}
                        onMouseEnter={() => setHovered(platform.id)}
                        onMouseLeave={() => setHovered(null)}
                        aria-label={platform.name}
                    >
                        <platform.icon size={sizeStyle.icon} className="text-secondary group-hover:text-white" />
                        {showLabels && <span className="text-sm">{platform.name}</span>}
                    </a>

                    {showTooltip && hovered === platform.id && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-primary text-primary text-xs rounded whitespace-nowrap z-50">
                            {platform.name}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ==========================================
// MASTER SOCIAL COMPONENT (Combines both)
// ==========================================
interface SocialProps {
    type: 'links' | 'share';
    variant?: 'footer' | 'sidebar' | 'inline' | 'minimal';
    url?: string;
    title?: string;
    description?: string;
    image?: string;
    size?: 'sm' | 'md' | 'lg';
    showLabels?: boolean;
    showCounts?: boolean;
    showTooltip?: boolean;
    className?: string;
}

export default function Social({
    type,
    variant = 'inline',
    url = '',
    title = '',
    description = '',
    image = '',
    size = 'md',
    showLabels = false,
    showCounts = false,
    showTooltip = true,
    className = '',
}: SocialProps) {
    if (type === 'share' && url) {
        return (
            <SocialShare
                url={url}
                title={title}
                description={description}
                image={image}
                size={size}
                showLabel={showLabels}
                showTooltip={showTooltip}
                className={className}
            />
        );
    }

    return (
        <SocialLinks
            variant={variant}
            size={size}
            showLabels={showLabels}
            showCounts={showCounts}
            showTooltip={showTooltip}
            className={className}
        />
    );
}
