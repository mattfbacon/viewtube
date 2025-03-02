import { HttpsProxyAgent } from 'https-proxy-agent';
import { fetch } from 'ofetch';
import { Request, RequestInit } from 'undici';

type InputType = Request & {
  method?: string;
};

export const innertubeFetch = async (
  input: InputType,
  init?: RequestInit & { agent: HttpsProxyAgent<string> }
) => {
  if (!init) {
    init = {} as RequestInit & { agent: HttpsProxyAgent<string> };
  }

  if (process.env.VIEWTUBE_PROXY_URL) {
    const proxy = process.env.VIEWTUBE_PROXY_URL;
    const proxyAgent = new HttpsProxyAgent(proxy);
    init.agent = proxyAgent;
  }

  let url;

  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof URL) {
    url = input.href;
  } else {
    url = input.url;
  }

  return fetch(url, {
    method: init?.method ?? input?.method ?? 'GET',
    headers: init?.headers,
    body: init?.body,
    ...(typeof input === 'string' ? {} : input),
    ...init
  });
};
