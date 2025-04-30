# Day Compass - Simple Daily Planner

## 1. Setup and Running the Project

**Prerequisites:**

- You need **Node.js** and **npm** (Node Package Manager) installed on your computer. These are only required for the development process (compiling Tailwind CSS).

**Steps:**

1. **Get the Code:**

    - Clone the repository: `git clone <repository-url>`
    - Or download the project files (`public/index.html`, `public/style.css`, `src/script.js`, `src/style.css`, `package.json`, `tailwind.config.js`).

2. **Navigate to Project Directory:**

    - Open your terminal or command prompt and change into the project's root directory (the one containing `package.json`).
    - ```bash cd <your-project-directory>```

3. **Install Development Dependencies:**

    - Run the following command to install Tailwind CSS:
    -```bash npm install```

4. **Run for Development (Optional but recommended for making changes):**

    - This command will watch for changes in your HTML and CSS and automatically rebuild the `public/style.css` file:
    -```bash npm run dev```

    *Keep this terminal window running while you develop.

5. **Run the Application:**
    - Open the `public/index.html` file directly in your web browser.
    - You can usually do this by double-clicking the file or using a "Open with..." option in your file explorer.

## 2. Dependencies and Configurations

- **Runtime Dependencies:** None. The application runs entirely in the browser using standard HTML, CSS, and JavaScript.
- **Development Dependencies:**
  - `tailwindcss`: Used to compile utility CSS classes into the final `public/style.css` file. This is listed in `package.json` and installed via `npm install`.
- **Configuration:**
  - `tailwind.config.js`: Configures Tailwind CSS (e.g., theme colors, content files to scan).
  - `package.json`: Defines the project and lists development dependencies and scripts (`dev`, `build`).
  - `src/style.css`: Contains Tailwind directives and base CSS variable definitions. **Do not edit `public/style.css` directly** if using the `dev` or `build` scripts, as it will be overwritten.
