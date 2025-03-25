import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

const config: Config = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				dark: {
					50: '#f5f5f5',
					100: '#e0e0e0',
					200: '#c2c2c2',
					300: '#a3a3a3',
					400: '#858585',
					500: '#666666',
					600: '#4d4d4d',
					700: '#333333',
					800: '#1a1a1a',
					900: '#0a0a0a',
				},
				brand: {
					50: '#ffebee',
					100: '#ffcdd2',
					200: '#ef9a9a',
					300: '#e57373',
					400: '#ef5350',
					500: '#f44336',
					600: '#e53935',
					700: '#d32f2f',
					800: '#c62828',
					900: '#b71c1c',
				}
			},
			screens: {
				'xs': '420px',
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1536px',
			},
		},
	},
	plugins: [
		forms({
			strategy: 'class'
		}),
		typography
	],
}

export default config