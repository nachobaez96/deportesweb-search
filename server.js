import express from "express";
import bodyParser from "body-parser";
import puppeteer from "puppeteer";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config({ path: "C:/code/deportesweb-madrid-search/.env" });

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.post("/search", async (req, res) => {
  const { sport, date, time } = req.body;

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto("https://deportesweb.madrid.es/DeportesWeb/login", {
      waitUntil: "networkidle2",
    });

    await page.waitForSelector(
      'article.navigation-section-widget-collection-item .navigation-section-widget-collection-item-title[title="Correo y contraseña"]'
    );
    await page.evaluate(() => {
      document
        .querySelector(
          'article.navigation-section-widget-collection-item .navigation-section-widget-collection-item-title[title="Correo y contraseña"]'
        )
        .click();
    });

    await page.waitForSelector("#ContentFixedSection_uLogin_txtIdentificador");
    await page.type(
      "#ContentFixedSection_uLogin_txtIdentificador",
      process.env.EMAIL
    );

    await page.waitForSelector("#ContentFixedSection_uLogin_txtContrasena");
    await page.type(
      "#ContentFixedSection_uLogin_txtContrasena",
      process.env.PASSWORD
    );

    await page.waitForSelector("#ContentFixedSection_uLogin_btnLogin");
    await page.click("#ContentFixedSection_uLogin_btnLogin");

    await page.waitForNavigation({ waitUntil: "networkidle2" });

    await page.waitForSelector(
      'article.navigation-section-widget-collection-item .navigation-section-widget-collection-item-title[title="Deportes de raqueta"]'
    );
    await page.evaluate(() => {
      document
        .querySelector(
          'article.navigation-section-widget-collection-item .navigation-section-widget-collection-item-title[title="Deportes de raqueta"]'
        )
        .click();
    });

    await page.waitForSelector(
      `article.navigation-section-widget-collection-item .navigation-section-widget-collection-item-title[title="${sport}"]`
    );
    await page.evaluate((sport) => {
      document
        .querySelector(
          `article.navigation-section-widget-collection-item .navigation-section-widget-collection-item-title[title="${sport}"]`
        )
        .click();
    }, sport);

    await page.waitForSelector(
      "#ContentFixedSection_uReservaEspacios_uCentrosSeleccionar_divCentros .media-list"
    );

    // Get number of sports centers
    const sportsCenterCount = await page.evaluate(() => {
      return document.querySelectorAll(
        "#ContentFixedSection_uReservaEspacios_uCentrosSeleccionar_divCentros .media-list > .media.pull-left"
      ).length;
    });

    console.log("Number of Sports Centers:", sportsCenterCount);

    const allFreeSlots = [];

    for (let i = 1; i <= sportsCenterCount; i++) {
      console.log(`Processing sports center ${i}`);

      await delay(20);

      await page.waitForSelector(
        "#ContentFixedSection_uReservaEspacios_uCentrosSeleccionar_divCentros .media-list"
      );

      await performStep(async () => {
        await page.waitForSelector(
          `#ContentFixedSection_uReservaEspacios_uCentrosSeleccionar_divCentros .media-list > .media.pull-left:nth-child(${i})`
        );
        await page.click(
          `#ContentFixedSection_uReservaEspacios_uCentrosSeleccionar_divCentros .media-list > .media.pull-left:nth-child(${i})`
        );
      }, `Click on sports center ${i}`);

      console.log(`Clicked on sports center ${i}`);

      await page.waitForSelector(
        "#ContentFixedSection_uReservaEspacios_uUsosSeleccionar_divUsos .media-list > .media.pull-left"
      );
      await page.click(
        "#ContentFixedSection_uReservaEspacios_uUsosSeleccionar_divUsos .media-list > .media.pull-left"
      );

      console.log(`Selected usage for sports center ${i}`);

      await page.waitForSelector(
        "#ContentFixedSection_uReservaEspacios_uFechaSeleccionar_datetimepicker"
      );

      console.log(`Date variable before passing to evaluate: ${date}`);

      await page.evaluate((date) => {
        const cleanedDate = date.replace(/['"]+/g, "").trim();

        const calendar = document.getElementById(
          "ContentFixedSection_uReservaEspacios_uFechaSeleccionar_datetimepicker"
        );
        const dateElements = Array.from(calendar.querySelectorAll(".day"));

        const targetDateElement = dateElements.find(
          (element) => element.getAttribute("data-day").trim() === cleanedDate
        );
        if (targetDateElement) {
          targetDateElement.click();
          console.log(`Clicked on date: ${cleanedDate}`);
        } else {
          console.error(`Date element for ${cleanedDate} not found`);
        }
      }, date);

      await page.waitForSelector(
        "#ContentFixedSection_uReservaEspacios_uFechaSeleccionar_btnContinuar"
      );
      await page.click(
        "#ContentFixedSection_uReservaEspacios_uFechaSeleccionar_btnContinuar"
      );

      console.log(`Clicked continue button for sports center ${i}`);

      await page.waitForFunction(() => {
        const div = document.getElementById(
          "ContentFixedSection_uReservaEspacios_uReservaCuadrante_divContenedor"
        );
        return (
          div &&
          window.getComputedStyle(div).getPropertyValue("display") === "block"
        );
      });

      console.log(`Cuadrante loaded for sports center ${i}`);

      await page.waitForSelector(
        "#ContentFixedSection_uReservaEspacios_uReservaCuadrante_uplCuadrante"
      );

      console.log(`Waiting for free slots for sports center ${i}`);

      // Get free slots
      const freeSlots = await page.evaluate(() => {
        const freeSlotsArray = [];
        const freeSlotsElements = document.querySelectorAll(
          'img[estado="Libre"]'
        );
        freeSlotsElements.forEach((element) => {
          const onclickAttr = element.getAttribute("onclick");
          const timeMatch = onclickAttr.match(/'(\d{2}:\d{2})'/);
          freeSlotsArray.push(timeMatch[1]);
        });
        return freeSlotsArray;
      });

      console.log(`Free slots for sports center ${i}:`, freeSlots);

      allFreeSlots.push({
        sportsCenter: `Sports Center ${i}`,
        freeSlots,
      });

      const backButtonSelector =
        ".cronos-btn.cronos-btn-translucent.cronos-box-round.cronos-btn-back";

      await performStep(async () => {
        while (true) {
          const backButtonExists = await page.$(backButtonSelector);
          if (!backButtonExists) break;

          await page.waitForSelector(backButtonSelector);
          await page.click(backButtonSelector);
          await delay(20);
        }
      }, "Click back button until it no longer exists");
    }

    // res.json({ courts: allFreeSlots });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    // await browser.close();
  }
});

async function performStep(stepFunction, description, maxRetries = 3) {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      await stepFunction();
      console.log(`Step succeeded: ${description}`);
      return; // exit if success
    } catch (error) {
      attempts++;
      console.error(
        `Step failed (${attempts}/${maxRetries}): ${description}`,
        error
      );
      if (attempts >= maxRetries) {
        return; // rethrow after max retries --------------------------------------------------------
      }
      await new Promise((resolve) => setTimeout(resolve, 20)); // delay before retry
    }
  }
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
