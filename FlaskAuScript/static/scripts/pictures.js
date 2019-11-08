import { MediaService } from '/static/scripts/helpers/camera.js';

class AfPictures {

  constructor() {
    this.videoRef = null;
    this.cameraStarted = false;
    this.pictures = [];
    this.facingEnvironment = true;
  }

  /**
   * starts the camera stream trying to first use the rear camera
   * if not it tries to use the front camera if we're out of retries
   * it ends up using the most basic media constraing for video which is `{ video: true }`
   * @param {boolean} facingEnvironment 
   * @param {MediaStreamConstraints} constraints 
   * @param {number} retries 
   */
  async startCamera(facingEnvironment = this.facingEnvironment, constraints = null, retries = 2) {
    if (!this.$media) { this._configureMediaService() }

    const willUse = constraints || {
      video: { facingMode: { exact: facingEnvironment ? 'environment' : 'user' } }
    }

    try {
      await this.$media.startCamera(willUse);
    } catch (error) {
      if (retries > -1) {
        return this.startCamera(videoRef, !facingEnvironment, retries == 0 ? { video: true } : null, retries - 1)
      }
      console.warn(error);
    }

    this.cameraStarted = true;
    this.facingEnvironment = facingEnvironment;
  }

  async switchCamera() {
    try {
      await this.startCamera(!this.facingEnvironment);
    } catch (error) {
      console.warn(error.message)
    }
  }

  async stopCamera() {
    try {
      await this.$media.stopCamera();
      this.cameraStarted = false;
    } catch (error) {
      console.warn(error.message);
    }
  }

  async takePicture() {
    try {
      const src = await this.$media.takeScreenshot();
      this.pictures.push({ id: this._getRandomHex(), src });
    } catch (error) {
      console.warn(error.message);
    }
  }

  /**
   *
   * @param {HTMLVideoElement} videoRef
   */
  _configureMediaService(videoRef = null) {
    /**
     * @type {MediaService}
     */
    this.$media = new MediaService(videoRef || this.videoRef);
  }

  _getRandomHex() {
    return "000000".replace(/0/g, () => (~~(Math.random() * 16)).toString(16));
  }
}

au.enhance({
  host: document.querySelector('[data-name="afPictures"]'),
  root: AfPictures,
  debug: true
}).catch(console.error);