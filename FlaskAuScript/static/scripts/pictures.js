import { MediaService } from '/static/scripts/helpers/camera.js';

class AfPictures {

  constructor() {
    /**
     * @type {HTMLVideoElement}
     */
    this.videoRef = null;
  }

  attached() {
    /**
     * @type {MediaService}
     */
    this.$media = new MediaService(this.videoRef);
  }

  async startCamera() {
    // currently investigating why didn't this fire up before
    if (!this.$media) { this.attached(); }
    try {
      await this.$media.startCamera({ video: true });
    } catch (error) {
      console.warn(error);
    }
  }
}

au.enhance({
  host: document.querySelector('[data-name="afPictures"]'),
  root: AfPictures,
  debug: true
}).catch(console.error);