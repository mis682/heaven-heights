export function cloudinaryDownloadUrl(url, filename = "photo") {
  if (!url || !url.includes("/upload/")) return url;
  const safeName = filename.replace(/[^a-zA-Z0-9-_]/g, "_");
  return url.replace("/upload/", `/upload/fl_attachment:${safeName}/`);
}
