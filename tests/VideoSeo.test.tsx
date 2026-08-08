import "@testing-library/jest-dom";
import React from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HelmetProvider } from "../src/context/HelmetProvider";
import { VideoSeo } from "../src/components/VideoSeo";

describe("VideoSeo Component", () => {
  afterEach(() => {
    cleanup();
    document.title = "";
    document.head.innerHTML = "";
  });

  it("renders VideoObject title, Open Graph video tags, and JSON-LD schema into DOM", async () => {
    render(
      <HelmetProvider>
        <VideoSeo
          title="React Router & SSR Masterclass"
          description="In-depth tutorial on server side rendering"
          thumbnailUrl="https://example.com/thumbs/video.jpg"
          contentUrl="https://example.com/videos/masterclass.mp4"
          uploadDate="2026-08-08"
          duration="PT15M33S"
        />
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(document.title).toBe("React Router & SSR Masterclass");
    });

    expect(document.querySelector('meta[property="og:video"]')).toHaveAttribute(
      "content",
      "https://example.com/videos/masterclass.mp4",
    );

    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script?.textContent ?? "{}");
    expect(parsed["@type"]).toBe("VideoObject");
    expect(parsed.name).toBe("React Router & SSR Masterclass");
  });
});
