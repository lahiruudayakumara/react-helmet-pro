export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation?: string;
  urlList: string[];
}

export const buildIndexNowPayload = (payload: IndexNowPayload): IndexNowPayload => {
  if (!payload.host) {
    throw new Error("IndexNow payload requires a valid host.");
  }
  if (!payload.key) {
    throw new Error("IndexNow payload requires a valid API key.");
  }
  if (!payload.urlList?.length) {
    throw new Error("IndexNow payload requires at least one URL in urlList.");
  }
  if (payload.urlList.length > 10000) {
    throw new Error(
      `IndexNow payload urlList exceeds maximum limit of 10,000 URLs (received ${payload.urlList.length}).`,
    );
  }

  return {
    host: payload.host,
    key: payload.key,
    keyLocation: payload.keyLocation,
    urlList: payload.urlList,
  };
};

export const submitIndexNowPayload = async (
  payload: IndexNowPayload,
  endpoint = "https://api.indexnow.org/indexnow",
): Promise<{ ok: boolean; status: number; statusText: string }> => {
  const validPayload = buildIndexNowPayload(payload);

  const response = await fetch(endpoint, {
    body: JSON.stringify(validPayload),
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    method: "POST",
  });

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
  };
};
