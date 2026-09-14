export function cloudinaryDownloadUrl(url, filename = "photo") {
  if (!url || !url.includes("/upload/")) return url;
  const safeName = filename.replace(/[^a-zA-Z0-9-_]/g, "_");
  return url.replace("/upload/", `/upload/fl_attachment:${safeName}/`);
}

// Requests a small on-the-fly derived version instead of the full ~1600px
// original for thumbnail/grid display — the original stays untouched (and
// is what Lightbox/full-view and downloads use), this only shaves bandwidth
// off the many small previews shown in submission lists and proof grids.
// Not a Cloudinary URL (e.g. already archived to Drive) — returned as-is.
export function cloudinaryThumbnailUrl(url, size = 300) {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/w_${size},h_${size},c_fill,q_auto,f_auto/`);
}
