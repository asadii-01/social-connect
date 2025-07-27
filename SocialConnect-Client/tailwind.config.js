// tailwind.config.js
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: { primary: "#4F46E5", secondary: "#3B82F6" },
      boxShadow: {
        "md-soft": "0 4px 6px rgba(0,0,0,0.05)",
        "lg-soft": "0 10px 15px rgba(0, 0, 0, 0.1)",
      },
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui"] },
    },
  },
  plugins: [forms, typography],
};
