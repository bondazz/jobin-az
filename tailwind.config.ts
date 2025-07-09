import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'rgb(var(--border))',
				input: 'rgb(var(--input))',
				ring: 'rgb(var(--ring))',
				background: 'rgb(var(--background))',
				foreground: 'rgb(var(--foreground))',
				primary: {
					DEFAULT: 'rgb(var(--primary))',
					foreground: 'rgb(var(--primary-foreground))',
					hover: 'rgb(var(--primary-hover))',
					light: 'rgb(var(--primary-light))'
				},
				secondary: {
					DEFAULT: 'rgb(var(--secondary))',
					foreground: 'rgb(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'rgb(var(--destructive))',
					foreground: 'rgb(var(--destructive-foreground))'
				},
				success: {
					DEFAULT: 'rgb(var(--success))',
					foreground: 'rgb(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'rgb(var(--warning))',
					foreground: 'rgb(var(--warning-foreground))'
				},
				muted: {
					DEFAULT: 'rgb(var(--muted))',
					foreground: 'rgb(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'rgb(var(--accent))',
					foreground: 'rgb(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'rgb(var(--popover))',
					foreground: 'rgb(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'rgb(var(--card))',
					foreground: 'rgb(var(--card-foreground))'
				},
				job: {
					card: 'rgb(var(--job-card))',
					'card-alt': 'rgb(var(--job-card-alt))',
					'tag-premium': 'rgb(var(--job-tag-premium))',
					'tag-new': 'rgb(var(--job-tag-new))',
					'tag-urgent': 'rgb(var(--job-tag-urgent))',
					sidebar: 'rgb(var(--job-sidebar))',
					details: 'rgb(var(--job-details))'
				},
				sidebar: {
					DEFAULT: 'rgb(var(--sidebar-background))',
					foreground: 'rgb(var(--sidebar-foreground))',
					primary: 'rgb(var(--sidebar-primary))',
					'primary-foreground': 'rgb(var(--sidebar-primary-foreground))',
					accent: 'rgb(var(--sidebar-accent))',
					'accent-foreground': 'rgb(var(--sidebar-accent-foreground))',
					border: 'rgb(var(--sidebar-border))',
					ring: 'rgb(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(10px)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-in-left': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'bounce-in': {
					'0%': { transform: 'scale(0.3)', opacity: '0' },
					'50%': { transform: 'scale(1.05)' },
					'70%': { transform: 'scale(0.9)' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 20px rgb(59 130 246 / 0.3)' },
					'50%': { boxShadow: '0 0 40px rgb(59 130 246 / 0.6)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-in-left': 'slide-in-left 0.3s ease-out',
				'bounce-in': 'bounce-in 0.6s ease-out',
				'glow': 'glow 2s ease-in-out infinite',
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-card': 'var(--gradient-card)',
				'gradient-premium': 'var(--gradient-premium)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-surface': 'var(--gradient-surface)',
				'gradient-background': 'var(--gradient-background)'
			},
			boxShadow: {
				'card': 'var(--shadow-card)',
				'card-hover': 'var(--shadow-card-hover)',
				'elegant': 'var(--shadow-elegant)',
				'glow': 'var(--shadow-glow)',
				'premium': 'var(--shadow-premium)'
			},
			transitionTimingFunction: {
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;