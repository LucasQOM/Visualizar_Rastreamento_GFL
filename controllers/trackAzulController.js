const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { executablePath } = require("puppeteer");

exports.track = async function track(req, res) {
  puppeteer.use(StealthPlugin());
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: executablePath(),
  });
  const page = await browser.newPage();

  let trackCode = req.body.trackCode;

  try {
    await page.goto(`https://www.azulcargoexpress.com.br/Rastreio/Rastreio`);
    await page.waitForSelector("#chaveParaRastreio");
    await page.type("#chaveParaRastreio", trackCode);
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
      let date = new Date();
      console.log(lastMessage, date);
    } else {
      res.status(200).json({ "Last Message": lastMessage });
    }
  } catch (error) {
    console.log(error);
    if (process.env.APP_ENV === "development") {
      return error;
    } else {
      if (req.body.cron) {
        console.log("Internal Server Error");
      } else {
        res.status(500).json({ Error: "Internal Server Error" });
      }
    }
  }
};
