import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/routes/**/*.{svelte,js,ts}"],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                lg: "1800px",
            },
        },
    },
    plugins: [require("@tailwindcss/typography"), daisyui],
};
