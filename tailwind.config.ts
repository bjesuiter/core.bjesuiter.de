import { type Config } from "tailwindcss";
// import colors from "tailwindcss/colors";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    // TODO: not working like this right now
    // extend: {
    //   "primary": colors.teal[700],
    //   "primary-light": colors.teal[50],
    //   "foreground-light": colors.gray[50],
    // },
  },
} satisfies Config;
