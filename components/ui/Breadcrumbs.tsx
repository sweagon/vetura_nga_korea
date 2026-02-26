import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <div className="flex items-center space-x-2 text-sm text-gray-500">
            {items.map((item, index) => (
                <div key={index} className="flex items-center">
                    {index > 0 && <ChevronRight size={14} className="mx-2" />}
                    {item.href ? (
                        <Link href={item.href} className="hover:text-ferrari-red transition">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-ferrari-red font-medium">{item.label}</span>
                    )}
                </div>
            ))}
        </div>
    );
}