import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const MAX_PHOTOS = 6;
const MAX_BYTES = 5 * 1024 * 1024;

const EXTENSIONS = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export function assertListingPhotos(files: File[]) {
  const photos = files.filter((file) => file.size > 0);
  if (photos.length > MAX_PHOTOS) {
    throw new Error(`Add up to ${MAX_PHOTOS} photos`);
  }
  for (const file of photos) {
    if (!EXTENSIONS.has(file.type)) {
      throw new Error("Photos must be JPEG, PNG, or WebP");
    }
    if (file.size > MAX_BYTES) {
      throw new Error("Each photo must be 5 MB or smaller");
    }
  }
  return photos;
}

export async function saveListingPhotos(listingId: string, files: File[]) {
  const photos = assertListingPhotos(files);
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });

  const saved: { path: string; sortOrder: number }[] = [];
  for (const [index, file] of photos.entries()) {
    const extension = EXTENSIONS.get(file.type)!;
    const name = `${listingId}-${index}-${randomBytes(4).toString("hex")}.${extension}`;
    await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    saved.push({ path: `/uploads/${name}`, sortOrder: index });
  }
  return saved;
}
