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

  const cpf = req.body.cpf;

  try {
    await page.goto("https://www.braspress.com/rastreie-sua-encomenda/");
    await page.waitForSelector("#cnpj-tracking");
    await page.evaluate((cpf) => {
      const formatted = cpf.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        "$1.$2.$3-$4",
      );
      const input = document.querySelector("#cnpj-tracking");
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      ).set;
      nativeInputValueSetter.call(input, formatted);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }, cpf);

    const targetFramePromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () =>
          reject(new Error("Frame de rastreamento não encontrado após 30s")),
        30000,
      );
      const onNavigated = (frame) => {
        if (frame.url().includes("blue.braspress.com")) {
          clearTimeout(timeout);
          page.off("framenavigated", onNavigated);
          resolve(frame);
        }
      };
      page.on("framenavigated", onNavigated);
      const existing = page
        .frames()
        .find((f) => f.url().includes("blue.braspress.com"));
      if (existing) {
        clearTimeout(timeout);
        page.off("framenavigated", onNavigated);
        resolve(existing);
      }
    });

    await page.evaluate(() => {
      const btn = document.querySelector("#btnFindTracking");
      btn.scrollIntoView({ block: "center" });
      btn.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        }),
      );
    });

    const targetFrame = await targetFramePromise;
    await targetFrame.waitForFunction(
      () => document.querySelector(".dt-nf")?.textContent?.trim().length > 0,
      { timeout: 30000 },
    );

    const result = await targetFrame.evaluate(() => ({
      nf: document.querySelector(".dt-nf")?.innerText?.trim() ?? null,
      previsao:
        document.querySelector(".dt-previsao-entrega")?.innerText?.trim() ??
        null,
      tipo:
        document.querySelector(".dt-tipo-entrega")?.innerText?.trim() ?? null,
      status: document.querySelector(".dt-status")?.innerText?.trim() ?? null,
      lastEventDate:
        document
          .querySelector(".details-container .vertical-time-line-date")
          ?.innerText?.trim() ?? null,
      lastEvent:
        document
          .querySelector(".details-container .vertical-time-line-info")
          ?.innerText?.trim() ?? null,
    }));

    browser.close();

    if (req.body.cron) {
      await sendMessage(
        `📦 Braspress | NF: ${result.nf}\n\nStatus: ${result.status}\nPrevisão: ${result.previsao}\nTipo: ${result.tipo}\nÚltimo evento: ${result.lastEventDate} - ${result.lastEvent}`,
      );
    }

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    browser.close();
    if (res) res.status(500).json({ error: error.message });
  }
}
