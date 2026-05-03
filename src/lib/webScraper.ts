import { Browser as PBrowser, Page } from "puppeteer-core";
import dotenv from "dotenv";
dotenv.config({ path: "/.env" });

export class WebScraper {
  #browser: undefined | PBrowser;
  #page: undefined | Page;

  async init(headless: boolean = false) {
    const isVercel = (typeof process !== "undefined" && process.env.VERCEL_ENV) || (import.meta as any).env?.VERCEL_ENV;

    let puppeteer: any,
      launchOptions: any = {
        headless: headless,
      };

    if (isVercel) {
      // Production
      // Vercel: Use puppeteer-core with downloaded Chromium binary
      const chromium = (await import("@sparticuz/chromium")).default;
      puppeteer = await import("puppeteer-core");

      const executablePath = await chromium.executablePath();

      launchOptions = {
        ...launchOptions,
        args: chromium.args,
        executablePath,
      };
    } else {
      // Development
      // Local: Use regular puppeteer with bundled Chromium
      puppeteer = await import("puppeteer");
    }

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    this.#browser = browser;
    this.#page = page;
  }

  async navigate(url: string, selector?: string) {
    if (!this.#page || !this.#browser) {
      throw new Error("Page or Browser should be initialized first");
    }

    await this.#page.goto(url, { waitUntil: "networkidle0" });

    if (selector) {
      await this.#page.waitForSelector(selector);
    }
  }

  async click(selector: string) {
    await this.#page?.waitForSelector(selector, { timeout: 5000 });

    await this.#page?.click(selector);
  }

  async fill(selector: string, text: string) {
    await this.#page?.waitForSelector(selector, { timeout: 5000 });

    await this.#page?.type(selector, text);
  }

  async refresh() {
    await this.#page?.reload();
  }

  async evaluate(callback: () => any, ...args: any[]) {
    if (!callback) {
      throw new Error("extract() must be implemented");
    }

    const data = await this.#page?.evaluate(callback, ...args);

    return data;
  }

  async catchPetition() {
    const response = await this.#page?.waitForResponse((res) => res.url().includes("/4/transacciones/inscripcion/cursado/comisiones") && res.status() === 200);

    const data = await response?.json();
    return data;
  }

  async waitForNewPage() {
    return new Promise<Page>((resolve) => {
      this.#browser!.once("targetcreated", async (target) => {
        const newPage = await target.page();
        if (newPage) resolve(newPage);
      });
    });
  }

  async wait() {
    await this.#page?.waitForNavigation({ waitUntil: "networkidle2" });
  }

  async close() {
    await this.#browser?.close();
  }

  getBrowser() {
    return this.#browser;
  }

  getPage() {
    return this.#page;
  }

  getUrl(): string | undefined {
    return this.#page?.url();
  }
}
