'use client';

import { useState } from 'react';
import { Facebook, Twitter, Mail, Link2, Check, Linkedin, MessageCircle } from 'lucide-react';
import { useToast } from './Toast';

interface ShareButtonsProps {
    url: string;
    title: string;
    description?: string;
    image?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function ShareButtons({
    url,
    title,
    description = '',
    image = '',
    className = '',
    size = 'md'
}: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);
    const { showToast } = useToast();

    const fullUrl = url.startsWith('http') ? url : `https://formulaexport.com${url}`;
    const encodedUrl = encodeURIComponent(fullUrl);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);

    const sizeClasses = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-2.5'
    };

    const iconSizes = {
        sm: 16,
        md: 18,
        lg: 20
    };

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
        whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            showToast('success', 'Linku u kopjua në clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            showToast('error', 'Nuk mund të kopjohej linku');
        }
    };

    const handleShare = (platform: string, link: string) => {
        // Open in new window with specified dimensions
        const width = 600;
        const height = 400;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;

        window.open(
            link,
            `share-${platform}`,
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Facebook */}
            <button
                onClick={() => handleShare('facebook', shareLinks.facebook)}
                className={`${sizeClasses[size]} bg-[#1877f2] text-white rounded-full hover:bg-[#1877f2]/90 transition transform hover:scale-110 active:scale-95`}
                aria-label="Share on Facebook"
                title="Shpërndaje në Facebook"
            >
                <Facebook size={iconSizes[size]} />
            </button>

            {/* Twitter */}
            <button
                onClick={() => handleShare('twitter', shareLinks.twitter)}
                className={`${sizeClasses[size]} bg-[#1da1f2] text-white rounded-full hover:bg-[#1da1f2]/90 transition transform hover:scale-110 active:scale-95`}
                aria-label="Share on Twitter"
                title="Shpërndaje në Twitter"
            >
                <Twitter size={iconSizes[size]} />
            </button>

            {/* LinkedIn */}
            <button
                onClick={() => handleShare('linkedin', shareLinks.linkedin)}
                className={`${sizeClasses[size]} bg-[#0a66c2] text-white rounded-full hover:bg-[#0a66c2]/90 transition transform hover:scale-110 active:scale-95`}
                aria-label="Share on LinkedIn"
                title="Shpërndaje në LinkedIn"
            >
                <Linkedin size={iconSizes[size]} />
            </button>

            {/* WhatsApp */}
            <button
                onClick={() => handleShare('whatsapp', shareLinks.whatsapp)}
                className={`${sizeClasses[size]} bg-[#25d366] text-white rounded-full hover:bg-[#25d366]/90 transition transform hover:scale-110 active:scale-95`}
                aria-label="Share on WhatsApp"
                title="Shpërndaje në WhatsApp"
            >
                <MessageCircle size={iconSizes[size]} />
            </button>

            {/* Email */}
            <a
                href={shareLinks.email}
                className={`${sizeClasses[size]} bg-gray-600 text-white rounded-full hover:bg-gray-700 transition transform hover:scale-110 active:scale-95`}
                aria-label="Share via Email"
                title="Shpërndaje me email"
                target="_blank"
                rel="noopener noreferrer"
            >
                <Mail size={iconSizes[size]} />
            </a>

            {/* Copy Link */}
            <button
                onClick={copyToClipboard}
                className={`${sizeClasses[size]} bg-ferrari-red text-white rounded-full hover:bg-ferrari-dark transition transform hover:scale-110 active:scale-95 relative`}
                aria-label="Copy link"
                title="Kopjo linkun"
            >
                {copied ? <Check size={iconSizes[size]} /> : <Link2 size={iconSizes[size]} />}
            </button>
        </div>
    );
}