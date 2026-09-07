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
    size = 64,
    color = '#047857', // Emerald-700
    bgColor = '#ffffff',
    className = '',
}) => {
    const { count, matrix, eyes } = useMemo(() => {
        try {
            // Use low error correction 'L' or 'M' for minimum matrix density (larger, bolder, cuter dots!)
            const qr = qrcode(0, 'L');
            qr.addData(value || 'VERIFIED');
            qr.make();
            const moduleCount = qr.getModuleCount();

            // Function to check if a module is part of the 3 finder eyes (7x7 corners)
            const isFinderEye = (r: number, c: number) => {
                // Top-Left (7x7)
                if (r < 7 && c < 7) return true;
                // Top-Right (7x7)
                if (r < 7 && c >= moduleCount - 7) return true;
                // Bottom-Left (7x7)
                if (r >= moduleCount - 7 && c < 7) return true;
                return false;
            };

            const dataDots: Array<{ r: number; c: number }> = [];
            for (let r = 0; r < moduleCount; r++) {
                for (let c = 0; c < moduleCount; c++) {
                    if (qr.isDark(r, c) && !isFinderEye(r, c)) {
                        dataDots.push({ r, c });
                    }
                }
            }

            const eyePositions = [
                { r: 0, c: 0 },
                { r: 0, c: moduleCount - 7 },
                { r: moduleCount - 7, c: 0 },
            ];

            return {
                count: moduleCount,
                matrix: dataDots,
                eyes: eyePositions,
            };
        } catch {
            return { count: 21, matrix: [], eyes: [] };
        }
    }, [value]);

    const cellSize = 10;
    const padding = 2; // Quiet zone (2 modules)
    const viewBoxSize = (count + padding * 2) * cellSize;

    return (
        <svg
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            width={size}
            height={size}
            className={`shrink-0 select-none ${className}`}
            style={{ backgroundColor: bgColor }}
            shapeRendering="geometricPrecision"
        >
            {/* Background */}
            <rect width={viewBoxSize} height={viewBoxSize} fill={bgColor} />

            {/* 1. Precision Cute Rounded Finder Eyes (100% standard optical compliance) */}
            {eyes.map((eye, idx) => {
                const x = (eye.c + padding) * cellSize;
                const y = (eye.r + padding) * cellSize;
                return (
                    <g key={idx}>
                        {/* Outer 7x7 Squircle Frame */}
                        <rect
                            x={x}
                            y={y}
                            width={7 * cellSize}
                            height={7 * cellSize}
                            rx={18}
                            ry={18}
                            fill={color}
                        />
                        {/* Inner 5x5 White Gap */}
                        <rect
                            x={x + cellSize}
                            y={y + cellSize}
                            width={5 * cellSize}
                            height={5 * cellSize}
                            rx={12}
                            ry={12}
                            fill={bgColor}
                        />
                        {/* Center 3x3 Cute Rounded Core */}
                        <rect
                            x={x + 2 * cellSize}
                            y={y + 2 * cellSize}
                            width={3 * cellSize}
                            height={3 * cellSize}
                            rx={8}
                            ry={8}
                            fill={color}
                        />
                    </g>
                );
            })}

            {/* 2. Cute Rounded Data Dots (High-contrast, scannable) */}
            {matrix.map((dot, idx) => (
                <circle
                    key={idx}
                    cx={(dot.c + padding) * cellSize + cellSize / 2}
                    cy={(dot.r + padding) * cellSize + cellSize / 2}
                    r={cellSize * 0.44}
                    fill={color}
                />
            ))}
        </svg>
    );
};

export default CuteQrCode;
