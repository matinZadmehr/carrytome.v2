import dotenv from "dotenv";
dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
console.log("Loaded token:", BOT_TOKEN);
