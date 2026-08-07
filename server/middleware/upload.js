const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryStorage {
  _handleFile(req, file, cb) {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "heaven-heights",
        resource_type: "image",
        transformation: [{ width: 1600, height: 1600, crop: "limit", quality: "auto:good", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) return cb(error);
        cb(null, { path: result.secure_url, filename: result.public_id, size: result.bytes });
      }
    );
    file.stream.pipe(uploadStream);
  }

  _removeFile(req, file, cb) {
    cloudinary.uploader.destroy(file.filename, () => cb());
  }
}

const upload = multer({
  storage: new CloudinaryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

// file.path is the Cloudinary secure_url set by CloudinaryStorage above
function fileToUrl(file) {
  return file.path;
}

module.exports = { upload, cloudinary, fileToUrl };
