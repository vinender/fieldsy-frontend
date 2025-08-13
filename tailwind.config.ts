import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'DM Sans', 'sans-serif'],
      },
      colors: {
        // Custom Fieldsy Colors
        green: '#3A6B22',            // Primary green
        'light-green': '#8FB366',    // Pastel green
        'dark-green': '#192215',     // Dark green
        cream: '#F8F1D7',    
        'cream-hover': '#efe5bf',    // Hover state for cream
        light: '#FFFCF3',            // Light yellow/cream
        'light-cream': '#FFFCF3',    // Very light background
        yellow: '#FFBD00',           // Dark yellow/gold
        
        // Additional colors found in codebase
        'gray-text': '#8d8d8d',      // Gray text
        'gray-dark': '#6B737D',      // Dark gray text
        'gray-border': '#e3e3e3',    // Gray border
        'gray-light': '#F8F9FA',     // Light gray background
        'gray-lighter': '#f7f7f7',   // Lighter gray background
        'gray-lightest': '#F0F0F0',  // Lightest gray
        'gray-input': '#6B6B6B',     // Gray color for input text
        'green-hover': '#2d5319',    // Dark green hover
        'green-darker': '#2D5A1B',   // Even darker green
        'green-light': '#8ad04d',    // Light green (card)
        'green-lighter': '#E8F5E1',  // Very light green
        'blue-dark': '#0A2533',      // Dark blue text
        'red': '#e31c20',            // Red for errors/delete
          
        // Pastel backgrounds
        'bg-faq': '#FAF7F2',         // FAQ section background
         // Existing colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;