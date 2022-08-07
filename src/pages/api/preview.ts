// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
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

const getDocument = async (url: string) => {
  const response = await axios.get(url);
  return response.data;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { url } = req.body;
    console.log("Normal preview:", url);
    const document = await getDocument(url);
    const data = await linkPreview(url, document);
    res.status(200).json({ success: true, data: data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
