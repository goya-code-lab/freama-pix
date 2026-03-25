import React from 'react';

/**
 * AdPlaceholder component for mocking Google AdSense or similar ad units.
 * In a real environment, this would be replaced with `<ins className="adsbygoogle" ...>` 
 * and a script tag initialization.
 */
const AdPlaceholder = ({ format = 'auto', width = '100%', height = '250px', message = '広告枠' }) => {
    return (
        <div
            className="flex flex-col items-center justify-center bg-gray-100/50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden relative group"
            style={{ width, height }}
        >
            <span className="text-sm font-medium text-gray-400 select-none pb-1">{message}</span>
            <span className="text-xs text-gray-300 select-none">{format}</span>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
    );
};

export default AdPlaceholder;
