import puppeteer from "puppeteer";
import getMenu from "./scraper.js";

export default async function getLocation () {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  await page.goto("https://dining.columbia.edu/", {
    waitUntil: "domcontentloaded",
  });

  await Promise.race([
    page.waitForSelector(".status.closed", { timeout: 10000 }),
    page.waitForSelector(".status.open", { timeout: 10000 })
  ]);

  
  const locations = await page.evaluate(() => {
    const diningList = document.querySelectorAll(".location");
    let finalLocations = [];

    Array.from(diningList).forEach((place) => {
      let name = null;  
  
      if (place.querySelector(".name") != null) {
          name = place.querySelector(".name").innerText;
          
          const statusElement = place.querySelector(".status");
          if (statusElement.classList.contains("closing") || statusElement.classList.contains("open")) {
            finalLocations.push({name});
          }
      }
    });
    return finalLocations;
    });

  console.log(locations);
  await browser.close();
  
  const urlMapping = {
    "John Jay Dining Hall": "https://dining.columbia.edu/content/john-jay-dining-hall",
    "JJ's Place": "https://dining.columbia.edu/content/jjs-place-0",
    "Ferris Booth Commons": "https://dining.columbia.edu/content/ferris-booth-commons-0",
    "Faculty House": "https://dining.columbia.edu/content/faculty-house-0",
    "Chef Mike's Sub Shop": "https://dining.columbia.edu/chef-mikes",
    "Chef Don's Pizza Pi": "https://dining.columbia.edu/content/chef-dons-pizza-pi",
    "Grace Dodge Dining Hall": "https://dining.columbia.edu/content/grace-dodge-dining-hall-0",
    "Robert F. Smith Dining Hall": "https://dining.columbia.edu/content/robert-f-smith-dining-hall-0",
    "The Fac Shack": "https://dining.columbia.edu/content/fac-shack",
  };

  const allMenus = [];
  for (const { name } of locations) {
    const url = urlMapping[name];
    if (url) {
      const menu = await getMenu(url); 
      allMenus.push({ name, menu });
    } else {
      console.warn(`No URL found for dining hall: ${name}`);
    }
  }
  return allMenus;
};

