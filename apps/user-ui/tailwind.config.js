/** @type {import('tailwindcss').Config} */
// import postcss from '@tailwindcss/postcss';
import colors from 'tailwindcss/colors';
module.exports = {
    darkMode: ['class'],
    content: [
        './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
        './src/**/*.{ts,tsx,js,jsx}',
        './src/app/components/ui/*.{ts,tsx,js,jsx}',
        '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
        // ...createGlobPatternsForDependencies(__dirname),
    ],
    theme: {
        extend: {
            fontFamily: {
                Roboto: ['var(--font-roboto)'],
                Poppins: ['var(--font-poppins)'],
            },
            keyframes: {
                'accordion-down': {
                    from: {
                        height: '0',
                    },
                    to: {
                        height: 'var(--radix-accordion-content-height)',
                    },
                },
                'accordion-up': {
                    from: {
                        height: 'var(--radix-accordion-content-height)',
                    },
                    to: {
                        height: '0',
                    },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
            },

            colors: {
                ...colors,
                primary: 'var(--color-primary)',
                secondary: 'var(--color-secondary)',
                bgPrimary: 'var(--background)',
                tBase: 'var(--color-text-base)',
                primaryFocus: 'var(--color-primary-focused)',
                tUnfocused : 'var(--color-text-unfocused)'
            },
        },
    },
    plugins: [],
};
