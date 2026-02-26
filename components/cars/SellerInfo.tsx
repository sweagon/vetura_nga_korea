import { MapPin, Phone, Mail, Building2, Star } from 'lucide-react';

interface SellerInfoProps {
    dealer?: {
        name?: string | null;
        firm?: string | null;
        location?: string | null;
        phone?: string | null;
    } | null;
    sellerName?: string | null;
    sellerPhone?: string | null;
    sellerEmail?: string | null;
    sellerLocation?: string | null;
}

export default function SellerInfo({
    dealer,
    sellerName,
    sellerPhone,
    sellerEmail,
    sellerLocation
}: SellerInfoProps) {

    const name = dealer?.firm || dealer?.name || sellerName || 'Shitës në Kore';
    const phone = dealer?.phone || sellerPhone;
    const email = sellerEmail;
    const location = dealer?.location || sellerLocation || 'Kore e Jugut';

    return (
        <div className="bg-surface rounded-lg shadow-md p-6">
            <h3 className="font-bold mb-4 flex items-center">
                <Building2 size={18} className="mr-2 text-ferrari-red" />
                Informacioni i shitësit
            </h3>

            <div className="space-y-4">
                <div>
                    <p className="font-semibold text-lg">{name}</p>
                    <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} className="text-yellow-400 fill-current" />
                        ))}
                        <span className="text-sm text-gray-500 ml-2">Shitës i verifikuar</span>
                    </div>
                </div>

                <div className="space-y-2">
                    {location && (
                        <div className="flex items-start space-x-2">
                            <MapPin size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{location}</span>
                        </div>
                    )}

                    {phone && (
                        <div className="flex items-center space-x-2">
                            <Phone size={16} className="text-gray-400 flex-shrink-0" />
                            <a href={`tel:${phone}`} className="text-sm text-ferrari-red hover:underline">
                                {phone}
                            </a>
                        </div>
                    )}

                    {email && (
                        <div className="flex items-center space-x-2">
                            <Mail size={16} className="text-gray-400 flex-shrink-0" />
                            <a href={`mailto:${email}`} className="text-sm text-ferrari-red hover:underline">
                                {email}
                            </a>
                        </div>
                    )}
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-700">
                        ✓ Shitës i verifikuar nga Auto Korea Kosova
                    </p>
                </div>
            </div>
        </div>
    );
}