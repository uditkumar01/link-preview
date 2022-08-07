// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer-core";
import chrome from "chrome-aws-lambda";
import linkPreview from "../../utils/linkPreview";

export interface ILinkPreviewData {
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  keywords?: string;
  url?: string;
}

type Data =
  | {
      success: true;
      data: ILinkPreviewData;
    }
  | {
      success: false;
      error: string;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { url } = req.body;
    // const document = await getDocument(url);
    const browser = await puppeteer.launch(
      process.env.NODE_ENV === "production"
        ? {
            args: chrome.args,
            executablePath: await chrome.executablePath,
            headless: chrome.headless,
          }
        : {
            args: chrome.args,
            executablePath: await chrome.executablePath,
            headless: true,
          }
    );

    const page = await browser.newPage();
    await page.goto(url);
    const document = await page.content();
    console.log(document);
    const data = await linkPreview(url, document);
    await browser.close();
    res.status(200).json({ success: true, data: data });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
}
