import axios from "axios";

const BASE_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

export const sendMessage = (text) =>
  axios.post(`${BASE_URL}/sendMessage`, {
    chat_id: process.env.TELEGRAM_CHAT_ID,
    text,
  });
