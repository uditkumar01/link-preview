import axios from "axios";
import { load as loadDoc } from "cheerio";
import { ILinkPreviewData } from "../pages/api/preview";

const removeEndingSlash = (url: string) => {
  if (url.endsWith("/")) {
    return url.slice(0, -1);
  }
  return url;
};

const checkIfImageIsNotBroken = async (url?: string) => {
  if (!url) return;
  try {
    const response = await axios.head(url);
    return response.statusText === "OK";
  } catch (error: any) {
    return;
  }
};

const resolveUrl = (url: string, rootUrl: string) => {
  if (typeof url !== "string") return;

  // check if its a data url
  if (url.startsWith("data:")) return url;

  if (url.startsWith("http")) {
    return url;
  }
  if (url.startsWith("/")) {
    return `${removeEndingSlash(rootUrl)}${url}`;
  }
  return `${removeEndingSlash(rootUrl)}/${url}`;
};

const getMetaTags = (doc: any, type: string, attr: string) => {
  let nodes: any[] = [];
  nodes = nodes.concat(doc(`meta[${attr}='${type}']`) || []);
  nodes = nodes.concat(doc(`meta[${attr}='og:${type}']`) || []);
  nodes = nodes.concat(
    doc(`meta[${attr}='og:${type.charAt(0).toUpperCase() + type.slice(1)}']`) ||
      []
  );
  return nodes?.length ? nodes : [];
};

const getMetaTagContent = (doc: any, type: string, attr: string) => {
  return doc(`meta[${attr}='${type}']`).attr(`content`);
};

const getTitle = (doc: any) => {
  return (
    getMetaTagContent(doc, "og:title", "property") ||
    getMetaTagContent(doc, "og:title", "name") ||
    doc("title").text()
  );
};

const getKeywords = (doc: any) => {
  return getMetaTagContent(doc, "keywords", "name");
};

const getDescription = (doc: any) => {
  let nodes: any[] = [];
  nodes = nodes
    .concat(getMetaTags(doc, "description", "name") || [])
    .concat(getMetaTags(doc, "description", "property") || []);
  let description;
  for (const node of nodes) {
    description = node?.attribs?.content || node?.attr?.(`content`);
    if (description) break;
  }

  return description;
};

const getImage = async (doc: any, baseURL: string) => {
  let image =
    getMetaTagContent(doc, "og:image", "property") ||
    getMetaTagContent(doc, "og:image", "name");

  if (image) {
    return resolveUrl(image, baseURL);
  }

  const imageNodeHref = doc(`link[rel=image_src]`).attr(`href`);

  if (imageNodeHref) {
    image = resolveUrl(imageNodeHref, baseURL);
    if (await checkIfImageIsNotBroken(image)) {
      return image;
    }
  }

  let nodes = doc("img");
  if ((nodes?.length || 0) > 0) {
    for (const node of nodes) {
      if (node) {
        image = node?.attribs?.src || node?.attr?.("src");
        if (image) {
          image = resolveUrl(image, baseURL);
          if (await checkIfImageIsNotBroken(image)) {
            return image;
          }
        }
        break;
      }
    }
  }
};

const getFavicon = async (doc: any, baseURL: string) => {
  const relSelectors = [
    `rel=icon`,
    `rel="shortcut icon"`,
    `rel=apple-touch-icon`,
  ];

  let faviconUrl: string | undefined;
  for (const selector of relSelectors) {
    const node = doc(`link[${selector}]`);
    if (node) {
      const href = node?.attribs?.href || node.attr(`href`);
      if (href) {
        faviconUrl = resolveUrl(href, baseURL);
        break;
      }
    }
  }

  let defaultURL = resolveUrl("/favicon.ico", baseURL);
  const isValid = await checkIfImageIsNotBroken(defaultURL);
  if (!isValid) {
    defaultURL = undefined;
  }

  return faviconUrl || defaultURL;
};

const linkPreview = async (
  url: string,
  document: any
): Promise<ILinkPreviewData> => {
  const doc = loadDoc(document);
  const title = getTitle(doc);
  const description = getDescription(doc);
  const image = await getImage(doc, url);
  const favicon = await getFavicon(doc, url);
  const keywords = getKeywords(doc);

  const data = { title, description, image, favicon, keywords, url };
  return data;
};

export default linkPreview;
