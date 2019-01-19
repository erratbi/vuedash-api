import request from "request-promise";
import {extname, resolve} from "path";
import {createWriteStream} from "fs";


export const downloadImage = async (uri, dest) => {
  const filename = `poster-${Date.now()}${extname(uri)}`;
  await request(uri).pipe(createWriteStream(resolve(dest, filename)));
  return `/uploads/images/${filename}`;
};
