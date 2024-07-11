import puppeteer from "puppeteer";
import dotenv from "dotenv";
dotenv.config({ path: "C:/code/deportesweb-madrid-search/.env" });

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

    // Click first sports center
    await page.waitForSelector(
      "#ContentFixedSection_uReservaEspacios_uCentrosSeleccionar_divCentros .media-list > .media.pull-left"
    );
    await page.click(
      "#ContentFixedSection_uReservaEspacios_uCentrosSeleccionar_divCentros .media-list > .media.pull-left"
    );

    await page.waitForSelector(
      "#ContentFixedSection_uReservaEspacios_uUsosSeleccionar_divUsos .media-list > .media.pull-left"
    );
    await page.click(
      "#ContentFixedSection_uReservaEspacios_uUsosSeleccionar_divUsos .media-list > .media.pull-left"
    );


    await page.waitForSelector(
      "#ContentFixedSection_uReservaEspacios_uFechaSeleccionar_datetimepicker .day"
    );

    await page.evaluate(() => {
      const dateElements = Array.from(
        document.querySelectorAll(
          "#ContentFixedSection_uReservaEspacios_uFechaSeleccionar_datetimepicker .day"
        )
      );
      const targetDateElement = dateElements.find(
        (element) => element.getAttribute("data-day") === "12/07/2024"
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

    
  } catch (error) {
    console.error("Error occurred:", error);
  } finally {
    await browser.close();
  }
})();
