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

  let cpf = req.body.cpf;

  try {
    await page.goto(`https://cademinhaentrega.com.br/gfl/tracking/D/${cpf}`);
    await page.waitForSelector(".shipment-wrapper");
    await page.evaluate(() => {
      document.getElementsByClassName("shipment-item")[0].click();
    });
    await page.waitForSelector(".tracking-details-title");
    await page.waitForTimeout(250);
    await page.evaluate(() => {
      document.getElementsByClassName("tracking-details-title")[0].click();
    });
    await page.waitForSelector(".item-label");
    await page.waitForTimeout(250);
    let lastMessage = await page.evaluate(() => {
      return document.getElementsByClassName("item-label")[0].textContent;
    });
    browser.close();
    if (req.body.cron) {
      await sendMessage(`🚚 Rastreio ${cpf}\n\n${lastMessage}`);
    }

    res.status(200).json({ "Last Message": lastMessage });
  } catch (error) {
    console.log(error);
    browser.close();
    if (res) res.status(500).json({ error: error.message });
  }
}
