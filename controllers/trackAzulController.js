import puppeteerExtra from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { executablePath } from "puppeteer";
import { sendMessage } from "../services/telegramService.js";

export async function track(req, res) {
  puppeteerExtra.use(StealthPlugin());
  const browser = await puppeteerExtra.launch({
    headless: "new",
    executablePath: executablePath(),
  });
  const page = await browser.newPage();

  let trackCode = req.body.trackCode;

  try {
    await page.goto(`https://www.azulcargoexpress.com.br/Rastreio/Rastreio`);
    await page.waitForSelector("#chaveParaRastreio");
    await page.evaluate((trackCode) => {
      document.querySelector("#chaveParaRastreio").value = trackCode;
    }, trackCode);
    await page.click("#btnAddRastreio");
    await page.waitForSelector("#btnConsultarRastreio");
    await page.click("#btnConsultarRastreio");
    await page.waitForSelector(".botaoDetalhes");
    await page.evaluate(() => {
      document.querySelector(".botaoDetalhes").click();
    });
    await page.waitForSelector(".cardDetalhado.sucesso");
    let lastMessage = await page.evaluate(() => {
      return document.querySelector(".cardDetalhado.sucesso").textContent;
    });

    lastMessage = lastMessage.replace(/\s+/g, " ").trim();

    browser.close();

    if (req.body.cron) {
      await sendMessage(`🚚 Rastreio ${trackCode}\n\n${lastMessage}`);
    }

    res.status(200).json({ "Last Message": lastMessage });
  } catch (error) {
    console.log(error);
    browser.close();
    if (res) res.status(500).json({ error: error.message });
  }
}
