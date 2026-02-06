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

// --- CONFIGURATION & ENV SETUP ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const SYSTEM_NAME = "RETARD_CLI";
const VERSION = "1.0.1-CLI";

// --- UTILS ---
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const playBeep = () => process.stdout.write('\x07'); // System Beep
const logSystem = (msg) => console.log(chalk.green(`>> SYSTEM: ${msg}`));
const logRetard = (msg, emotion = 'IDLE') => {
    let color = chalk.green; // Default Green
    if (emotion === 'ANGER') color = chalk.red.bold;
    if (emotion === 'SAD') color = chalk.blue;
    if (emotion === 'RICH') color = chalk.yellow;
    if (emotion === 'ILLUMINATI') color = chalk.bgYellow.black;
    if (emotion === 'SICK') color = chalk.greenBright.bgBlack; // Matrix style
    
    console.log(color(`>> RETARD: ${msg}`));
};

// --- DATA FROM APP.JSX (PORTED) ---
const IQ_QUESTIONS = [
    { q: "1 + 1 = ?", a: "2", wrong: "Are you serious? Toddlers know this." },
    { q: "What color is the sky? (Blue/Red)", a: "blue", wrong: "Go see an eye doctor." },
    { q: "Is water wet? (Yes/No)", a: "yes", wrong: "Physics isn't your strong suit, huh?" },
    { q: "Type 'password' backwards.", a: "drowssap", wrong: "Can't even spell? Pathetic." },
    { q: "5 * 5 = ?", a: "25", wrong: "Use a calculator if you're this slow." }
];

const CICADA_PUZZLES = [
    {
        level: 1,
        text: ">> TARGET: ELITE RING.\n>> CLUE 1: The island coordinates are 18.3003° N, 64.8255° W.\n>> QUESTION: What is the popular name of this island?",
        answer: ["little saint james", "little st james", "st james", "epstein island"],
        correctMsg: ">> COORDINATES CONFIRMED. LOCATING BUNKER...",
        wrongMsg: ">> WRONG. YOU ARE STILL ASLEEP."
    },
    {
        level: 2,
        text: ">> DECRYPTING FLIGHT LOGS...\n>> CLUE 2: The private jet used to transport 'goods'.\n>> QUESTION: What is the nickname of the plane?",
        answer: ["lolita express", "lolita"],
        correctMsg: ">> LOGS DECRYPTED. LISTING PRESIDENTS & PRINCES...",
        wrongMsg: ">> ACCESS DENIED. NSA ALERTED."
    },
    {
        level: 3,
        text: ">> FINAL FIREWALL DETECTED.\n>> CLUE 3: She held the keys. The daughter of a media tycoon.\n>> QUESTION: Enter her first name.",
        answer: ["ghislaine"],
        correctMsg: ">> UPLOADING 'BLACK_BOOK.PDF' TO PUBLIC SERVER...",
        wrongMsg: ">> INCORRECT. THEY GOT TO YOU."
    }
];

const EPSTEIN_NAMES = [
    "STEPHEN HAWKING (PREFERS_UNDER_18_INCHES_TELESCOPE)",
    "BILL CLINTON (I_DID_NOT_INHALE_BUT_I_DID_FLY)",
    "PRINCE ANDREW (I_CANNOT_SWEAT_ERROR_404)",
    "DONALD TRUMP (JUST_WENT_FOR_THE_DIET_COKE)",
    ">> [REDACTED BY CIA]",
    ">> [DATA CORRUPTED BY HILLARY_SERVER]"
];

// BRAINROT & KEYWORDS
const BRAINROT_WORDS = ['skibidi', 'rizz', 'gyatt', 'fanum', 'tax', 'mewing', 'ohio', 'goon', 'edge', 'sigma'];
const RICH_WORDS = ['money', 'crypto', 'bitcoin', 'eth', 'solana'];
const ANGER_WORDS = ['stupid', 'bot', 'trash', 'fuck'];

// --- STATE MANAGEMENT ---
let state = {
    stress: 0,
    truthUnlocked: false,
    emotion: 'IDLE'
};

// --- FEATURES FUNCTIONS ---

// 1. PFP GENERATOR (ASCII VERSION)
function generateAsciiPFP(variant) {
    playBeep();
    console.log(chalk.cyan("\n>> GENERATING ASCII AVATAR..."));
    
    let face = "";
    if (variant === 'rich') {
        face = `
        $$$$$$$$$$$$$
      $$             $$
     $$   $       $   $$
     $$       $       $$  (RICH MODE)
     $$   $$$$$$$$$   $$
      $$             $$
        $$$$$$$$$$$$$
        `;
    } else if (variant === 'sick') {
        face = `
        #############
      ##  X       X  ##
     ##       |       ##
     ##    ~~~~~~~    ##  (VIRUS DETECTED)
      ##    ^^^^^    ##
        #############
        `;
    } else {
        face = `
        /////////////
      //  O       O  //
     //       |       //
     //    _______    //  (BASIC RETARD)
      //             //
        /////////////
        `;
    }
    console.log(chalk.white(face));
    logSystem(`SAVED TO: /dev/null/avatar_${variant}.txt`);
}

// 2. CICADA PUZZLE LOGIC
async function runCicada() {
    console.clear();
    console.log(chalk.bgGreen.black(" >> CICADA 3301 PROTOCOL INITIATED << "));
    
    for (const puzzle of CICADA_PUZZLES) {
        console.log(chalk.green("\n" + puzzle.text));
        
        const ans = await inquirer.prompt([{
            type: 'input',
            name: 'val',
            message: chalk.green("ANSWER >>")
        }]);

        if (puzzle.answer.some(a => ans.val.toLowerCase().trim().includes(a))) {
            playBeep();
            console.log(chalk.yellow(puzzle.correctMsg));
            await sleep(1000);
        } else {
            console.log(chalk.red(puzzle.wrongMsg));
            state.stress += 20;
            return false; // Gagal
        }
    }
    
    // Success
    state.truthUnlocked = true;
    state.emotion = 'ILLUMINATI';
    playBeep(); playBeep();
    console.log(chalk.bgYellow.black("\n >> TRUTH UNLOCKED. EYE OF PROVIDENCE ACTIVE. << \n"));
    return true;
}

// 3. EPSTEIN FILES
async function runEpsteinLeak() {
    state.stress = 99; // Panic mode
    logSystem("BYPASSING FBI FIREWALL...");
    const loader = ora('DECRYPTING...').start();
    await sleep(2000);
    loader.fail(chalk.red("FIREWALL BREACHED. THEY ARE WATCHING."));
    
    console.log(chalk.red("\n>> LEAKED LOGS:"));
    EPSTEIN_NAMES.forEach(name => {
        console.log(chalk.red(`  > ${name}`));
        sleep(200);
    });
    console.log("");
}

// --- INITIALIZATION ---
async function init() {
    console.clear();
    
    // TITLE
    const title = figlet.textSync('RETARD_CLI', { font: 'ANSI Shadow' });
    console.log(gradient.retro(title));
    console.log(chalk.gray(`v${VERSION} | TERMINAL MODE`));

    // CHECK API
    const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.log(chalk.red("FATAL: API KEY NOT FOUND. CHECK .env"));
        process.exit(1);
    }

    // IQ TEST
    console.log(chalk.bgWhite.black("\n >> IQ CHECK PROTOCOL << \n"));
    for (const q of IQ_QUESTIONS) {
        const answer = await inquirer.prompt([{ type: 'input', name: 'val', message: chalk.yellow(q.q) }]);
        if (answer.val.toLowerCase().trim() !== q.a.toLowerCase()) {
            console.log(chalk.red(`>> RETARD: ${q.wrong}`));
            process.exit(0);
        }
    }
    console.log(chalk.green(">> IQ ACCEPTABLE."));
    
    // VIRAL NEWS TICKER
    const news = ["DEEPSEEK IS WATCHING", "BITCOIN RUGPULL IMMINENT", "DEAD INTERNET THEORY CONFIRMED"];
    console.log(chalk.bgGreen.black(` NEWS: ${news.join(" | ")} `) + "\n");

    startChat(apiKey);
}

// --- MAIN LOOP ---
async function startChat(apiKey) {
    const openai = new OpenAI({ apiKey: apiKey });
    
    logRetard("SYSTEM READY. Type /help for commands.");

    while (true) {
        // Change prompt color based on state
        let promptPrefix = state.truthUnlocked ? chalk.yellow("ILLUMINATI >>") : chalk.green("YOU >>");
        if (state.stress > 80) promptPrefix = chalk.red("PANIC >>");

        const input = await inquirer.prompt([{
            type: 'input',
            name: 'msg',
            message: promptPrefix
        }]);

        const rawMsg = input.msg.trim();
        const lowerMsg = rawMsg.toLowerCase();

        // 1. COMMAND HANDLER
        if (rawMsg.startsWith('/')) {
            if (lowerMsg === '/help') {
                console.log(chalk.cyan(`
  COMMANDS:
  /clear   - Wipe screen
  /genpfp  - Generate ASCII Avatar (ex: /genpfp rich)
  /cicada  - Start Puzzle
  /files   - Leaked Docs (WARNING)
  /crypto  - Market Check
  /nuke    - Crash System
  /status  - Check Stress Level
                `));
            }
            else if (lowerMsg === '/clear') console.clear();
            else if (lowerMsg.startsWith('/genpfp')) {
                const variant = lowerMsg.split(' ')[1] || 'random';
                generateAsciiPFP(variant);
            }
            else if (lowerMsg === '/cicada') await runCicada();
            else if (lowerMsg === '/files' || lowerMsg === '/epstein') await runEpsteinLeak();
            else if (lowerMsg === '/nuke') {
                logRetard("SELF DESTRUCT IN 3...", 'ANGER');
                await sleep(1000);
                console.log(chalk.bgRed.white(" SYSTEM FAILURE "));
                process.exit(0);
            }
            else if (lowerMsg === '/status') {
                logSystem(`STRESS: ${state.stress}% | EMOTION: ${state.emotion} | TRUTH: ${state.truthUnlocked}`);
            }
            else if (lowerMsg === '/crypto') {
                logRetard("BITCOIN: -99% | ETH: $5 | DOGE: 1 DOGE", 'RICH');
            }
            continue; // Skip AI call
        }

        // 2. KEYWORD DETECTION (BRAINROT & EMOTIONS)
        let systemInjection = "";
        
        if (BRAINROT_WORDS.some(w => lowerMsg.includes(w))) {
            state.stress += 20;
            state.emotion = 'SICK';
            systemInjection = "[SYSTEM: USER IS USING BRAINROT SLANG. MOCK THEM.]";
            logSystem("BRAINROT DETECTED. IQ DROPPING.");
        } 
        else if (ANGER_WORDS.some(w => lowerMsg.includes(w))) {
            state.emotion = 'ANGER';
            state.stress += 10;
        }
        else if (RICH_WORDS.some(w => lowerMsg.includes(w))) {
            state.emotion = 'RICH';
        }

        // 3. AI GENERATION
        const loader = ora('Thinking...').start();
        try {
            const completion = await openai.chat.completions.create({
                messages: [
                    { 
                        role: "system", 
                        content: `You are RETARD_CLI. Savage, sarcastic, elitist AI.
                        Current Emotion: ${state.emotion}.
                        Truth Unlocked: ${state.truthUnlocked}.
                        
                        RULES:
                        - If Emotion is ANGER, use CAPS.
                        - If Emotion is RICH, talk about money.
                        - If Emotion is ILLUMINATI, act mysterious/godlike.
                        - Keep answers short and hostile.` 
                    },
                    { role: "user", content: rawMsg + systemInjection }
                ],
                model: "gpt-4o-mini", // Use mini for speed/cost
            });
            loader.stop();
            logRetard(completion.choices[0].message.content, state.emotion);

        } catch (error) {
            loader.stop();
            logRetard("CONNECTION FAILED. MY BRAIN IS OFFLINE.", 'SAD');
        }
    }
}

// EXECUTE
init().catch(err => console.error(err));