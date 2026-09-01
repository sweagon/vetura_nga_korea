// components/cars/DownloadPdfButton.tsx
// Generates a client-side PDF of a car: description, key specs, price
// breakdown and photos. Images are pulled through the CORS-free server proxy
// at /api/photo (the Encar CDN does not send CORS headers to browsers).
'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

export interface PdfPriceRow {
    label: string;
    value: string;
    bold?: boolean;
    accent?: boolean;
}

export interface PdfCarData {
    carId: string;
    siteName: string;
    contactPhone: string;
    contactEmail: string;
    carTitle: string;
    year: number | null;
    mileageKm: number;
    location: string;
    vin: string | null;
    lot: number | string | null;
    description?: string;
    specs: { label: string; value: string }[];
    priceRows: PdfPriceRow[];
    images: string[];
}

const MAX_PDF_IMAGES = 12;
const IMAGE_MAX_WIDTH = 760;
const IMAGE_QUALITY = 0.72;

const proxyUrl = (url: string) => `/api/photo?url=${encodeURIComponent(url)}`;

async function fetchImageDataUrl(url: string): Promise<string> {
    const res = await fetch(proxyUrl(url));
    if (!res.ok) throw new Error(`image fetch ${res.status}`);
    const blob = await res.blob();
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`image load failed`));
        img.src = src;
    });
}

async function toJpegDataUrl(src: string): Promise<string> {
    const img = await loadImage(src);
    const scale = Math.min(1, IMAGE_MAX_WIDTH / img.width);
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas unavailable');
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', IMAGE_QUALITY);
}

interface DownloadPdfButtonProps {
    data: PdfCarData;
    className?: string;
}

export default function DownloadPdfButton({ data, className }: DownloadPdfButtonProps) {
    const [busy, setBusy] = useState(false);

    const generate = async () => {
        if (busy) return;
        setBusy(true);
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF({ unit: 'mm', format: 'a4' });
            const pageW = doc.internal.pageSize.getWidth();
            const pageH = doc.internal.pageSize.getHeight();
            const margin = 15;
            const contentW = pageW - margin * 2;

            // ---- Header / title block --------------------------------------
            doc.setFillColor(255, 107, 0);
            doc.rect(0, 0, pageW, 6, 'F');
            doc.setTextColor(255, 107, 0);
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text(data.siteName, margin, 22);
            doc.setFontSize(14);
            doc.setTextColor(20, 20, 20);
            doc.text(data.carTitle, margin, 32);

            doc.setFontSize(10);
            doc.setTextColor(90, 90, 90);
            const infoLine = [
                data.year ? `Viti: ${data.year}` : null,
                data.mileageKm ? `Kilometrazha: ${data.mileageKm.toLocaleString('sq')} km` : null,
                data.location ? `Lokacioni: ${data.location}` : null,
                data.lot ? `Lot: ${data.lot}` : null,
                data.vin ? `VIN: ${data.vin}` : null,
            ].filter(Boolean).join('   |   ');
            doc.text(infoLine, margin, 38);

            // ---- Price breakdown -------------------------------------------
            let y = 50;
            const sectionTitle = (title: string) => {
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(255, 107, 0);
                doc.text(title, margin, y);
                y += 6;
                doc.setDrawColor(220, 220, 220);
                doc.line(margin, y, pageW - margin, y);
                y += 4;
            };

            sectionTitle('Çmimi');
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            data.priceRows.forEach(row => {
                if (row.accent) {
                    doc.setTextColor(255, 107, 0);
                    doc.setFont('helvetica', 'bold');
                } else {
                    doc.setTextColor(row.bold ? 20 : 70, row.bold ? 20 : 70, row.bold ? 20 : 70);
                    doc.setFont('helvetica', row.bold ? 'bold' : 'normal');
                }
                doc.text(row.label, margin, y);
                const valueX = pageW - margin - doc.getTextWidth(row.value);
                doc.text(row.value, valueX, y);
                y += 6;
            });
            y += 4;

            // ---- Key specs --------------------------------------------------
            sectionTitle('Karakteristikat kryesore');
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            data.specs.forEach(spec => {
                doc.setTextColor(70, 70, 70);
                doc.text(spec.label, margin, y);
                doc.setTextColor(20, 20, 20);
                doc.setFont('helvetica', 'bold');
                const valueX = pageW - margin - doc.getTextWidth(spec.value);
                doc.text(spec.value, valueX, y);
                doc.setFont('helvetica', 'normal');
                y += 6;
                if (y > pageH - 25) {
                    doc.addPage();
                    y = margin;
                }
            });
            y += 4;

            // ---- Description -----------------------------------------------
            if (data.description?.trim()) {
                sectionTitle('Përshkrimi');
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(50, 50, 50);
                const lines = doc.splitTextToSize(data.description, contentW) as string[];
                lines.forEach(line => {
                    if (y > pageH - 15) {
                        doc.addPage();
                        y = margin;
                    }
                    doc.text(line, margin, y);
                    y += 5;
                });
                y += 4;
            }

            // ---- Photos -----------------------------------------------------
            const photos = data.images.slice(0, MAX_PDF_IMAGES);
            if (photos.length) {
                sectionTitle(`Fotot (${photos.length})`);
                doc.setFontSize(10);
                doc.setTextColor(90, 90, 90);
                doc.text('Dy imazhe për faqe — shkarkoni PDF-në për rezolucion të plotë.', margin, y);
                y += 8;

                // Two images stacked per page.
                const gap = 8;
                const captionH = 6;
                const topY = margin + 6;
                const rowH = (pageH - topY - margin - captionH - gap) / 2;

                for (let i = 0; i < photos.length; i += 2) {
                    const pair = [i, i + 1].filter(j => j < photos.length);
                    doc.setPage(doc.getNumberOfPages());
                    doc.addPage('a4', 'p');

                    for (let row = 0; row < pair.length; row++) {
                        const j = pair[row];
                        const jpeg = await toJpegDataUrl(await fetchImageDataUrl(photos[j]));
                        const img = await loadImage(jpeg);
                        const ratio = Math.min(contentW / img.width, rowH / img.height);
                        const w = img.width * ratio;
                        const h = img.height * ratio;
                        const x = (pageW - w) / 2;
                        const imgY = topY + row * (rowH + gap) + (rowH - h) / 2;
                        doc.addImage(jpeg, 'JPEG', x, imgY, w, h);
                        doc.setFontSize(9);
                        doc.setTextColor(120, 120, 120);
                        doc.text(
                            `Foto ${j + 1} / ${photos.length}`,
                            pageW / 2,
                            topY + (row + 1) * (rowH + gap) - gap + captionH,
                            { align: 'center' }
                        );
                    }
                }
            }

            doc.save(`makina-${data.carId}.pdf`);
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('Dështoi gjenerimi i PDF-së. Provo përsëri.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <button
            type="button"
            onClick={generate}
            disabled={busy}
            className={className}
        >
            <Download size={16} />
            {busy ? 'Duke u gjeneruar…' : 'Shkarko PDF'}
        </button>
    );
}