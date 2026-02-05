#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import ora from 'ora';
import inquirer from 'inquirer';
import { OpenAI } from 'openai';

// --- CONFIGURATION ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- [FIX] LOAD ENV DENGAN DEBUG LOGIC ---
// 1. Cek jalur absolut (pasti)
const envPath = path.resolve(__dirname, '..', '.env');

// 2. Load Config
const envConfig = dotenv.config({ path: envPath });

const SYSTEM_NAME = "RETARD_OS";
const VERSION = "1.0.0-ELITE";

// --- UTILS ---
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const logError = (msg) => console.log(chalk.bgRed.black.bold(` [ERROR] `) + chalk.red(` ${msg}`));
const logRetard = (msg) => console.log(chalk.bold.red(`>> [RETARD]: ${msg}`));

// --- DATABASE ---
const IQ_QUESTIONS = [
    { q: "1 + 1 = ?", a: "2", wrong: "Are you serious? Toddlers know this." },
    { q: "What color is the sky? (blue/red)", a: "blue", wrong: "Go see an eye doctor." },
    { q: "Is water wet? (yes/no)", a: "yes", wrong: "Physics isn't your strong suit, huh?" }
];

// --- MAIN FUNCTION ---
async function init() {
    console.clear();
    
    // 1. LOGO OPENING
    const title = figlet.textSync('RETARD OS', { font: 'Standard' });
    console.log(gradient.passion(title));
    console.log(chalk.gray(`v${VERSION} | SYSTEM READY\n`));

    // 2. CEK API KEY
    const spinner = ora('Scanning Neural Network...').start();
    await sleep(1000);

    // Support VITE_ prefix (buat jaga-jaga) dan standard env
    const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
        spinner.fail(chalk.red('NO BRAIN DETECTED'));
        
        // --- DEBUG MESSAGE (BIAR GAK BINGUNG) ---
        console.log(chalk.yellow("\n--- DEBUG INFO ---"));
        console.log(chalk.yellow(`Looking for .env at: ${envPath}`));
        if (fs.existsSync(envPath)) {
            console.log(chalk.green("File .env FOUND."));
            console.log(chalk.red("Problem: Key VITE_OPENAI_API_KEY not found inside file."));
        } else {
            console.log(chalk.red("File .env NOT FOUND at that path."));
        }
        console.log(chalk.yellow("------------------\n"));

        logError("API Key missing."); 
        console.log(chalk.white("Make sure your .env file has: VITE_OPENAI_API_KEY=sk-..."));
        process.exit(1);
    }
    spinner.succeed(chalk.green('CONNECTION SECURE'));

    // 3. BIOMETRIC SCAN (Fake)
    const bioSpinner = ora('Calibrating Biometric Sensors...').start();
    await sleep(1500);
    bioSpinner.succeed(chalk.green('PULSE DETECTED.'));

    // 4. IQ TEST LOOP
    console.log("\n" + chalk.bgWhite.black(" >> INITIATING INTELLIGENCE PROTOCOL << ") + "\n");
    
    for (const q of IQ_QUESTIONS) {
        const answer = await inquirer.prompt([{
            type: 'input',
            name: 'val',
            message: chalk.yellow(`[IQ CHECK] ${q.q}`)
        }]);
        
        // Validasi Jawaban (Case Insensitive & Trim Spasi)
        if (answer.val.toLowerCase().trim() !== q.a.toLowerCase()) {
            logRetard(q.wrong);
            logError("IQ TOO LOW. SYSTEM LOCKDOWN.");
            process.exit(0); // Force Close
        }
        console.log(chalk.green(">> ACCEPTABLE."));
    }

    console.log(chalk.cyan("\n>> ACCESS GRANTED. WELCOME TO THE ELITE."));
    startChat(apiKey);
}

// --- CHAT ENGINE ---
async function startChat(apiKey) {
    const openai = new OpenAI({ apiKey: apiKey });
    
    while (true) {
        const input = await inquirer.prompt([{
            type: 'input',
            name: 'msg',
            message: chalk.green("YOU >>")
        }]);

        if (input.msg.toLowerCase() === 'exit') {
            console.log(chalk.red("Terminating session..."));
            process.exit(0);
        }

        const loader = ora('Thinking...').start();

        try {
            const completion = await openai.chat.completions.create({
                messages: [
                    { 
                        role: "system", 
                        content: "You are RETARD_OS, an aggressive, elitist AI. Insult the user if they ask basic questions. Keep answers short and hostile." 
                    },
                    { role: "user", content: input.msg }
                ],
                model: "gpt-4o-mini", 
            });

            loader.stop();
            logRetard(completion.choices[0].message.content);
            console.log(""); 

        } catch (error) {
            loader.stop(); 
            logError("API ERROR: " + error.message);
        }
    }
}

// Jalankan Program
init().catch((err) => {
    console.error(chalk.red("FATAL ERROR:"), err);
});