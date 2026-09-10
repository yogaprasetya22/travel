import React, { useMemo } from 'react';
import qrcode from 'qrcode-generator';

interface CuteQrCodeProps {
    value: string;
    size?: number;
    color?: string;
    bgColor?: string;
    className?: string;
}

export const CuteQrCode: React.FC<CuteQrCodeProps> = ({
    value,
    size = 80,
    color = '#000000',
    bgColor = '#ffffff',
    className = '',
}) => {
    const { count, cells } = useMemo(() => {
        try {
            // Type 0 = auto detect best version (1-40), 'M' error correction (15% redundancy)
            const qr = qrcode(0, 'M');
            qr.addData(value || 'VERIFIED');
            qr.make();
            const moduleCount = qr.getModuleCount();

            const darkCells: Array<{ r: number; c: number }> = [];
            for (let r = 0; r < moduleCount; r++) {
                for (let c = 0; c < moduleCount; c++) {
                    if (qr.isDark(r, c)) {
                        darkCells.push({ r, c });
                    }
                }
            }

            return {
                count: moduleCount,
                cells: darkCells,
            };
        } catch {
            return { count: 21, cells: [] };
        }
    }, [value]);

    const cellSize = 10;
    const padding = 4; // ISO/IEC 18004 standard 4-module quiet zone for instant camera detection
    const viewBoxSize = (count + padding * 2) * cellSize;

    return (
        <svg
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            width={size}
            height={size}
            className={`shrink-0 select-none ${className}`}
            style={{ backgroundColor: bgColor }}
            shapeRendering="crispEdges"
        >
            {/* White Background Quiet Zone */}
            <rect width={viewBoxSize} height={viewBoxSize} fill={bgColor} />

            {/* Standard Scannable Optical QR Matrix */}
            {cells.map((cell, idx) => (
                <rect
                    key={idx}
                    x={(cell.c + padding) * cellSize}
                    y={(cell.r + padding) * cellSize}
                    width={cellSize}
                    height={cellSize}
                    fill={color}
                />
            ))}
        </svg>
    );
};

export default CuteQrCode;
