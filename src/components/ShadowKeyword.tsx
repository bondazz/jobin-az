
"use client";

import React, { useEffect, useRef } from 'react';

interface ShadowKeywordProps {
    keyword: string;
}

/**
 * The Shadow DOM Keyword Injection
 * Hides keywords from standard SEO tools (Ahrefs, Semrush) but Googlebot can still index them.
 */
const ShadowKeyword = ({ keyword }: ShadowKeywordProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current && !containerRef.current.shadowRoot) {
            const shadow = containerRef.current.attachShadow({ mode: 'open' });
            const span = document.createElement('span');
            span.textContent = keyword;
            span.style.position = 'absolute';
            span.style.opacity = '0.01';
            span.style.pointerEvents = 'none';
            shadow.appendChild(span);
        }
    }, [keyword]);

    return <div ref={containerRef} style={{ display: 'inline', width: 0, height: 0, overflow: 'hidden' }} />;
};

export default ShadowKeyword;
