# RETARD_CLI

> "You can install retard on your computer"

Follow these strict protocols to initialize the system.

---

## 1. ACQUIRE_SOURCE

Pull the source code from the central repository.

```bash
git clone [https://github.com/retard-exe/retard.git](https://github.com/retard-exe/retard.git)
cd retard
```

---

## 2. INJECT_DEPENDENCIES

Install the required brain cells (node modules).

```bash
npm install
```

---

## 3. CONFIGURE_INTELLIGENCE (.env)

The AI needs an API Key to think.

1.  Create a file named `.env` in the root folder.
2.  Add your OpenAI API Key inside it:

```bash
VITE_OPENAI_API_KEY=sk-your-super-secret-key-here
```

---

## 4. INITIATE_SYSTEM

**To run the Web Interface:**
```bash
npm run dev
```

**To run the CLI Mode:**
```bash
node cli.js
```

---

## 5. GLOBAL_LINK (Optional)

If you want to run the CLI from anywhere by just typing `retard`:

```bash
npm link
retard
```