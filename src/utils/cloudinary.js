export function cloudinaryDownloadUrl(url, filename = "photo") {
  if (!url || !url.includes("/upload/")) return url;
  const safeName = filename.replace(/[^a-zA-Z0-9-_]/g, "_");
  return url.replace("/upload/", `/upload/fl_attachment:${safeName}/`);
}

// Requests a small on-the-fly derived version instead of the full ~1600px
// original for thumbnail/grid display — the original stays untouched (and
// is what Lightbox/full-view and downloads use), this only shaves bandwidth
// off the many small previews shown in submission lists and proof grids.
//
// A photo archived to Drive (see server/utils/archiveOldMedia.js) is
// served through our own /api/media/drive/:fileId proxy instead of
// Cloudinary — that route resizes on the fly too (server/routes/media.js)
// when given the same ?w= it's handed here, so callers don't need to know
// or care which backend a given photo currently lives on.
export function cloudinaryThumbnailUrl(url, size = 300) {
  if (!url) return url;
  if (url.includes("/api/media/drive/")) {
    return `${url}${url.includes("?") ? "&" : "?"}w=${size}`;
  }
  if (!url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/w_${size},h_${size},c_fill,q_auto,f_auto/`);
}
