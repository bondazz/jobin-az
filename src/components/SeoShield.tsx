
import React from 'react';

interface SeoShieldProps {
    text: string;
    className?: string;
    as?: 'h1' | 'h2' | 'h3' | 'span' | 'div';
}

const SeoShield = ({ text, className = "", as: Tag = 'span' }: SeoShieldProps) => {
    // SVG ölçülərini mətnin uzunluğuna görə təxmini hesablayırıq
    const width = text.length * 10;
    const height = 24;

    return (
        <Tag className={`relative inline-block ${className}`} aria-label={text}>
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full pointer-events-none select-none"
                role="img"
                aria-hidden="true"
                preserveAspectRatio="xMidYMid meet"
            >
                <text
                    x="50%"
                    y="50%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    className="fill-current text-inherit font-inherit"
                    style={{ font: 'inherit' }}
                >
                    {text}
                </text>
            </svg>
            {/* Botlar üçün "Shadow DOM" mətni - Vizual olaraq gizli, amma DOM-da mövcud */}
            <span className="sr-only">{text}</span>
        </Tag>
    );
};

export default SeoShield;
