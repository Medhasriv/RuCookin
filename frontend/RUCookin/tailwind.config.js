/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter-Regular', 'sans-serif'],
        "inter-bold": ['Inter-SemiBold', 'sans-serif'],
        "inknutantiquasemibold": ['InknutAntiqua-SemiBold', 'helvetica'],
      },
      colors:{
        "primary": "#721121",
        "secondary": "#A5402D",
        "tertiary": "#F15156",
        "quaternary": "#FFC074",
        "quinary": "#FFCF99",
        "white": "#FFFFFF",
        "black": "#000000",
      }
    },
  },
  plugins: [],
}