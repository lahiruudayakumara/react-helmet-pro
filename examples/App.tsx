import {
  Analytics,
  Favicon,
  Helmet,
  HelmetProvider,
  SecurityMeta,
  StructuredData,
  appendSiteName,
  buildSchema,
  injectLocale,
  mergeHead,
  useHead,
  useHeadMiddleware,
} from "react-helmet-pro";
import React, { useEffect, useMemo, useState } from "react";

const deepEqual = (a: any, b: any): boolean => {
  return JSON.stringify(a) === JSON.stringify(b);
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <HeadContent />
    </HelmetProvider>
  );
};

const HeadContent: React.FC = () => {
  const { setHead, title, meta } = useHead();
  const [prevHead, setPrevHead] = useState<any>(null);

  useHeadMiddleware(appendSiteName, [title, meta]);
  useHeadMiddleware((head) => injectLocale(head, "en"), [title, meta]);

  const structuredData = buildSchema("WebPage", {
    name: "Example WebPage",
    description: "This is an example webpage with dynamic metadata.",
  });

  const mergedHead = useMemo(() => {
    return mergeHead(
      { title, meta },
      {
        title: "Home Page",
        meta: [{ name: "description", content: "This is the home page." }],
      }
    );
  }, [title, meta]);

  useEffect(() => {
    if (!deepEqual(mergedHead, prevHead)) {
      setHead?.(mergedHead);
      setPrevHead(mergedHead);
    }
  }, [mergedHead, prevHead, setHead]);

  return (
    <div>
      <Favicon href="./vite.svg" />
      <Helmet title={title} meta={meta} />
      <StructuredData json={structuredData} />
      <SecurityMeta />
      <h1>Welcome to the Example App</h1>
      <p>This app demonstrates how to use dynamic head management.</p>
    </div>
  );
};

export default App;
