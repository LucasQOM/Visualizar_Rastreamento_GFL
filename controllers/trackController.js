const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { executablePath } = require("puppeteer");

exports.track = async function track(req, res) {
  puppeteer.use(StealthPlugin());
  const browser = await puppeteer.launch({
    headless: false,
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
    await page.waitForTimeout(250); //waiting to load the content in headless mode
    await page.evaluate(() => {
      document.getElementsByClassName("tracking-details-title")[0].click();
    });
    await page.waitForSelector(".item-label");
    await page.waitForTimeout(250); //waiting to load the content in headless mode
    let lastMessage = await page.evaluate(() => {
      return document.getElementsByClassName("item-label")[0].textContent;
    });
    browser.close();
    if (req.body.cron) {
      let date = new Date();
      console.log(lastMessage, date);
    } else {
      res.status(200).json({ "Last Message": lastMessage });
    }
  } catch (error) {
    console.log(error);
    browser.close();
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
