
import React from 'react';

const Logo = () => {
    return (
        <div className="relative h-[38px] w-auto flex items-center">
            {/* Light Mode Logo - Hidden in dark mode */}
            <img
                src="/jobin-logo-light.png"
                alt="Jobin Logo"
                className="h-full w-auto object-contain dark:hidden"
            />

            {/* Dark Mode Logo - Hidden in light mode, shown in dark mode */}
            <img
                src="/jobin-logo-dark.png"
                alt="Jobin Logo"
                className="h-full w-auto object-contain hidden dark:block"
            />
        </div>
    );
};

export default Logo;
