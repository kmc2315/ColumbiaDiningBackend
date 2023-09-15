import puppeteer from "puppeteer";

export default async function getMenu (url) {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  try {
    await Promise.race([
      page.waitForSelector('[data-ng-bind-html="::meal.title"]', { timeout: 60000 }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 60000))  
    ]);
  } catch (error) {
      await browser.close();
      return 'No menu could be found';
  }

  await new Promise(resolve => setTimeout(resolve, 1000));
  const items = await page.evaluate(() => {
    
    const foodList = document.querySelectorAll('[data-ng-bind-html="::meal.title"]');
    let array = Array.from(foodList).map((food => food.innerText));
    let set = new Set(array);
    return Array.from(set);
  });

  console.log(items);

  await browser.close();

  return items;
};

