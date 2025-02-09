const fs = require("fs");
const path = require("path");
const { BUCKET } = require("../../config");
const { Storage } = require("@google-cloud/storage");
const { v4: uuidv4 } = require("uuid");

class CloudStorage {
  constructor() {
    this.bucket = BUCKET.BUCKET_NAME;
    this.keyFilename = BUCKET.KEYFILENAME;
    this.projectId = BUCKET.projectId;
    this.cred = path.join(__dirname, `./${this.keyFilename}`);
    this.storage = new Storage({
      projectId: this.projectId,
      keyFilename: this.cred,
    });
  }

  async uploadFile(file, outputName) {
    try {
      const bucket = this.storage.bucket(this.bucket);
      const uploadedFile = await bucket.upload(file, {
        destination: outputName,
      });
      return uploadedFile;
    } catch (error) {
      return null;
    }
  }

  async getFile(fileName) {
    try {
      const bucket = this.storage.bucket(this.bucket);
      const file = bucket.file(fileName);
      return file
        .exists()
        .then(([exists]) => (exists ? file.createReadStream() : null));
    } catch (error) {
      return null;
    }
  }

  async deleteFile(fileName) {
    try {
      const bucket = this.storage.bucket(this.bucket);
      await bucket.file(fileName).delete();
      return `File ${fileName} deleted successfully.`;
    } catch (error) {
      return null;
    }
  }
}

module.exports = new CloudStorage();

// const voice = path.join(__dirname, "../voice/output.pcm");
// new CloudStorage().uploadFile(voice, "uploaded-files.pcm")
// .then(console.log);

// new CloudStorage().getFile("uploaded-file.pcm")
// .then(console.log);

// new CloudStorage().deleteFile("uploaded-files.pcm")
// .then(console.log);
