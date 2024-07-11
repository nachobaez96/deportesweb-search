import puppeteer from "puppeteer";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

(async () => {
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
      'article.navigation-section-widget-collection-item .navigation-section-widget-collection-item-title[title="Pista de tenis"]'
    );
    await page.evaluate(() => {
      document
        .querySelector(
          'article.navigation-section-widget-collection-item .navigation-section-widget-collection-item-title[title="Pista de tenis"]'
        )
        .click();
    });
    
  } catch (error) {
    console.error("Error occurred:", error);
  } finally {
    await browser.close();
  }
})();
