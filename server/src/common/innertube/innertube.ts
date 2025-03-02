import { Innertube, InnertubeConfig, UniversalCache } from 'youtubei.js';
import path from 'path';
// import { innertubeFetch } from './innertubeFetch';

let cacheDirectory = './cache';
if (process.env.VIEWTUBE_DATA_DIRECTORY) {
  cacheDirectory = path.join(process.env.VIEWTUBE_DATA_DIRECTORY, 'cache');
}

const innertubeOptions: InnertubeConfig = {
  cache: new UniversalCache(true, cacheDirectory)
  // fetch: innertubeFetch
};

if (process.env.VIEWTUBE_YOUTUBE_COOKIE) {
  innertubeOptions.cookie = process.env.VIEWTUBE_YOUTUBE_COOKIE;
}

export const innertubeClient = () => Innertube.create(innertubeOptions);
