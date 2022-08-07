import type { NextPage } from "next";
import { FiExternalLink } from "react-icons/fi";
import { ImSpinner8 } from "react-icons/im";
import axios from "axios";
import Head from "next/head";
import { useState } from "react";
import { ILinkPreviewData } from "./api/preview";
import Link from "next/link";
import addEllipses from "../utils/addEllipses";

const defaultData = {
  title: "Google: Don't be evil",
  description:
    "Google is a search engine that lets you search the web and find information and useful tools.",
  image:
    "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
  favicon: "https://www.google.com/favicon.ico",
  url: "https://google.com",
};

const Home: NextPage = () => {
  const [urlData, setUrlData] = useState<ILinkPreviewData>(defaultData);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const getDomainName = (url?: string) => {
    if (!url) return "";
    const domain = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
    return domain.split(/[/?#]/)[0]?.toLowerCase();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    let url = formData.get("urlToPreview") as string;
    if (typeof url === "string" && url.length > 0) {
      url = url.trim();
      if (!url.startsWith("http")) {
        url = `http://${url}`;
      }
      if (getDomainName(url) === "google.com") {
        setUrlData(defaultData);
        return;
      }
      setIsLoading(true);
      setErrorMessage("");
      try {
        const { data } = await axios.post(
          "/api/preview",
          { url },
          {
            timeout: 10000,
          }
        );
        console.log(data);
        setIsLoading(false);
        if (!data?.success) {
          setErrorMessage(data?.message);
          return;
        }
        setUrlData(data.data);
      } catch (error: any) {
        setIsLoading(false);
        setErrorMessage(error.message);
      }
    }
  };

  return (
    <div className={""}>
      <Head>
        <title>Link Previewer</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <main className="bg-[#cad7e9] flex flex-col justify-center items-center min-h-screen">
        <div className="flex-1 flex justify-center items-center h-full">
          {!isLoading && !errorMessage ? (
            <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white min-w-[340px]">
              <img
                className="w-full max-h-60 object-contain p-4"
                src={urlData.image || urlData.favicon || "/images/default.png"}
                alt="Url preview image"
              />
              <div className="px-6 py-4">
                <div className="flex gap-2 justify-between items-start font-bold text-lg mb-4 break-words">
                  {addEllipses(urlData?.title || "", 90)}
                </div>
                <div className="flex gap-2 mb-3 items-center">
                  <img
                    className="w-6 h-6 mr-4 ring-2 shadow-lg ring-gray-500 ring-offset-2 rounded-full"
                    src={urlData.favicon || "/images/default.png"}
                    alt="Url favicon"
                  />
                  <p className="flex flex-col">
                    <span className="text-xs">website</span>
                    <span className="flex text-sm font-bold items-start">
                      {getDomainName(urlData?.url)}
                      {urlData?.url ? (
                        <Link href={urlData?.url} passHref>
                          <a className="pl-1" target="_blank">
                            <FiExternalLink
                              size={18}
                              className="text-gray-500 pt-1 hover:text-blue-500 cursor-pointer transition-all duration-200 hover:scale-125"
                            />
                          </a>
                        </Link>
                      ) : (
                        <></>
                      )}
                    </span>
                  </p>
                </div>
                <p className="text-gray-700 text-base">
                  {addEllipses(urlData?.description || "", 200)}
                </p>
              </div>
              <div className="px-6 pt-4 pb-2">
                {(urlData?.keywords?.split(",").slice(0, 5) || []).map(
                  (keyword) =>
                    keyword ? (
                      <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                        {keyword}
                      </span>
                    ) : (
                      ""
                    )
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-sm rounded overflow-hidden p-2 px-3 shadow-lg bg-white min-w-[340px]">
              {isLoading ? (
                <div className="flex gap-4 items-center">
                  <ImSpinner8 size={18} className="animate-spin" />
                  <span className="text-md">Loading...</span>
                </div>
              ) : errorMessage ? (
                "🚨 Failed to fetch preview"
              ) : (
                ""
              )}
            </div>
          )}
        </div>
        <div className="flex justify-center w-full max-w-lg">
          <form className="flex gap-2 mb-6 mx-3 w-full" onSubmit={onSubmit}>
            <input
              type="text"
              name="urlToPreview"
              className="
                block
                w-full
                px-3
                py-1.5
                shadow-sm
                text-base
                font-normal
                text-gray-700
                bg-white bg-clip-padding
                border border-solid border-gray-300
                rounded
                transition
                ease-in-out
                m-0
                focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
              "
              id="url-to-preview"
              placeholder="https://github.com"
              aria-label="Url input field"
            />
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all ease-in-out duration-200 min-w-[100px] flex justify-center items-center"
              disabled={isLoading}
            >
              {isLoading ? <ImSpinner8 className="animate-spin" /> : "Preview"}
            </button>
          </form>
        </div>
        <p className="mb-2 text-md">
          Made with ❣️ by{" "}
          <Link href="https://twitter.com/uditkumar_01" passHref>
            <a className="text-blue-500" target="_blank">
              Udit Kumar
            </a>
          </Link>
        </p>
      </main>
    </div>
  );
};

export default Home;
