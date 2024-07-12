import puppeteer from "puppeteer";
import dotenv from "dotenv";
dotenv.config({ path: "C:/code/deportesweb-madrid-search/.env" });

// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto("https://deportesweb.madrid.es/DeportesWeb/login", {
      waitUntil: "networkidle2",
    });

    console.log(process.env.EMAIL);

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

    // TODO: sport variable
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
      'article.navigation-section-widget-collection-item .navigation-section-widget-collection-item-title[title="Pista de tenis"]'
    );
    await page.evaluate(() => {
      document
        .querySelector(
          'article.navigation-section-widget-collection-item .navigation-section-widget-collection-item-title[title="Pista de tenis"]'
        )
        .click();
    });

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

    for (let i = 1; i <= sportsCenterCount; i++) {
      console.log(`Processing sports center ${i}`);

      await page.waitForSelector(
        "#ContentFixedSection_uReservaEspacios_uCentrosSeleccionar_divCentros .media-list"
      );

      await page.waitForSelector(
        `#ContentFixedSection_uReservaEspacios_uCentrosSeleccionar_divCentros .media-list > .media.pull-left:nth-child(${i})`
      );
      await page.click(
        `#ContentFixedSection_uReservaEspacios_uCentrosSeleccionar_divCentros .media-list > .media.pull-left:nth-child(${i})`
      );

      console.log(`Clicked on sports center ${i}`);

      await page.waitForSelector(
        "#ContentFixedSection_uReservaEspacios_uUsosSeleccionar_divUsos .media-list > .media.pull-left"
      );
      await page.click(
        "#ContentFixedSection_uReservaEspacios_uUsosSeleccionar_divUsos .media-list > .media.pull-left"
      );

      console.log(`Selected usage for sports center ${i}`);

      await page.waitForSelector(
        "#ContentFixedSection_uReservaEspacios_uFechaSeleccionar_datetimepicker .day" // TODO: .day.weekend
      );

      console.log(`Selected date for sports center ${i}`);

      await page.evaluate(() => {
        const dateElements = Array.from(
          document.querySelectorAll(
            "#ContentFixedSection_uReservaEspacios_uFechaSeleccionar_datetimepicker .day"
          )
        );
        const targetDateElement = dateElements.find(
          (element) => element.getAttribute("data-day") === "15/07/2024" // TODO: day variable
        );
        if (targetDateElement) {
          targetDateElement.click();
        } else {
          console.error("Date element not found");
        }
      });

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

      const backButtonSelector =
        ".cronos-btn.cronos-btn-translucent.cronos-box-round.cronos-btn-back";
      await page.waitForSelector(backButtonSelector); // not sure why loop isnt working
      await page.click(backButtonSelector);

      await page.waitForSelector(backButtonSelector);
      await page.click(backButtonSelector);

      await page.waitForSelector(backButtonSelector);
      await page.click(backButtonSelector);
    }
  } catch (error) {
    console.error("Error occurred:", error);
  } finally {
    await browser.close();
  }
})();
