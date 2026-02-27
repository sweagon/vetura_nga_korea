import { FileCheck, Euro, AlertCircle } from 'lucide-react';

export default function CustomsInfo() {
    return (
        <div className="bg-surface rounded-lg shadow-md p-6">
            <h3 className="font-bold mb-4 flex items-center">
                <FileCheck size={18} className="mr-2 text-ferrari-red" />
                Informacion Doganor
            </h3>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-secondary p-3 rounded-lg">
                        <p className="text-xs text-secondary">Dogana</p>
                        <p className="font-bold text-ferrari-red">10%</p>
                    </div>
                    <div className="bg-secondary p-3 rounded-lg">
                        <p className="text-xs text-secondary">TVSH</p>
                        <p className="font-bold text-ferrari-red">18%</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                        <Euro size={16} className="text-muted mt-1" />
                        <div>
                            <p className="font-medium">Makina nën 10 vjet</p>
                            <p className="text-sm text-secondary">Dogana 10% + TVSH 18%</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-2">
                        <Euro size={16} className="text-muted mt-1" />
                        <div>
                            <p className="font-medium">Makina mbi 10 vjet</p>
                            <p className="text-sm text-secondary">Dogana 10% + TVSH 18% + taksë shtesë</p>
                        </div>
                    </div>
                </div>

                <div className="bg-warning-bg p-3 rounded-lg">
                    <p className="text-xs text-yellow-700 flex items-start">
                        <AlertCircle size={14} className="mr-2 mt-0.5 flex-shrink-0" />
                        Llogaritja doganore bëhet në bazë të vlerësimit të doganës së Kosovës.
                    </p>
                </div>
            </div>
        </div>
    );
}
