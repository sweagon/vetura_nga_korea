import Link from 'next/link';
import { fetchFilterData } from '@/lib/api';

export default async function BrandsPage() {
    const filterData = await fetchFilterData();
    const brands = filterData?.makes || [];

    return (
        <div className="container-custom py-12">
            <h1 className="text-3xl font-bold mb-2">Markat e makinave</h1>
            <p className="text-gray-600 mb-8">Shfleto makina sipas markës nga Korea</p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {brands.map((brand: string) => (
                    <Link
                        key={brand}
                        href={`/cars?make=${encodeURIComponent(brand)}`}
                        className="bg-surface p-6 rounded-lg shadow-md hover:shadow-lg transition text-center group"
                    >
                        <div className="w-16 h-16 bg-ferrari-red/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-ferrari-red/20 transition">
                            <span className="text-ferrari-red font-bold text-xl">{brand[0]}</span>
                        </div>
                        <h3 className="font-semibold">{brand}</h3>
                    </Link>
                ))}
            </div>
        </div>
    );
}