export class MediaService {
  /**
   * @param {HTMLVideoElement} source existing video tag where to perform video operations
   */
  constructor(source) {
    this.source = source;
    this.defaultMediaStreamConstraints = {
      video: true
    };
    this.cameras = [];
    this.canvas = document.createElement("canvas");
  }
  get supportsUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
  get supportsEnumerateDevices() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices);
  }
  get hasMultipleCameras() {
    return this.cameras.length > 1;
  }
  delay(timeout = 100) {
    return new Promise(resolve => setTimeout(() => resolve(), timeout));
  }
  /**
   * gets the stream of the current video source
   * @returns {MediaStream}
   */
  getStream() {
    return (this.source.srcObject instanceof MediaStream && this.source.srcObject);
  }
  /**
   * tries to get the active video tracks from the current screen.
   * helps to determine which camera not to use when switching cameras
   */
  getActiveVideoTracks() {
    const stream = this.getStream();
    if (!stream)
      return [];
    const tracks = stream.getVideoTracks();
    return tracks.filter(track => track.enabled);
  }
  /**
   * from the current cameras registered on the class filters the ones not in use
   */
  getInactiveCameras() {
    return this.cameras.filter(camera => !camera.active);
  }
  /**
   * tries to start a stream to trigger the browser's permission dialog
   * once the permission is given it stop the tracks of the stream
   * @returns {Promise<boolean>}
   */
  async requestPermission() {
    if (!this.supportsUserMedia)
      throw new Error("The Browser does not support getUserMedia");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      for (const track of stream.getTracks()) {
        track.stop();
      }
      return true;
    }
    catch (error) {
      console.warn(error.message);
      return false;
    }
  }
  /**
   * gets the video devices returned as "videoinput" from `navigator.mediaDevices.enumerateDevices()`
   */
  async getVideoDevices() {
    if (!this.supportsEnumerateDevices)
      throw new Error("The browser does not support enumerateDevices");
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter(device => device.kind == "videoinput")
        .map(device => {
          const isFront = this.checkIsFront(device);
          const isBack = this.checkIsBack(device);
          return { ...device, isFront, isBack };
        });
    }
    catch (error) {
      return Promise.reject(error);
    }
  }
  /**
   * Starts the camera and streams the content into the provided video element from the **args**
   * if no video and constraints are provided, this method will use it's defaults from the class
   * @param {IStartCameraArgs} args arguments needed to start the camera
   */
  async startCamera({ constraints = this.defaultMediaStreamConstraints, retryCount = 10 } = {}) {
    if (!this.supportsUserMedia)
      throw new Error("The Browser does not support getUserMedia");
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.source.srcObject = stream;
    }
    catch (error) {
      if (retryCount > 0) {
        console.warn(`Error ${error.message}... retrying once more`);
        await this.delay(500);
        return this.startCamera({ constraints, retryCount: retryCount - 1 });
      }
      return Promise.reject(error);
    }
    return this.setActiveCamera();
  }
  /**
   * stops the current camera stream and removes the **srcObject** from the given video element
   * if not video  element provided, the default from the class will be used, a deviceId
   * can be passed to switch to a specific camera
   * @param {ISwitchCameraArgs} args
   */
  async switchCamera({ deviceId } = {}) {
    try {
      await this.stopCamera();
    }
    catch (error) {
      return Promise.reject(error);
    }
    try {
      if (deviceId) {
        await this.startCamera({
          constraints: { video: { deviceId: { exact: deviceId } } }
        });
      }
      else {
        const inactive = this.getInactiveCameras();
        const [camera] = inactive.filter(camera => camera.label !== this.lastActiveCamera);
        await this.startCamera({
          constraints: { video: { deviceId: { exact: camera.deviceId } } }
        });
      }
    }
    catch (error) {
      return Promise.reject(error);
    }
  }
  async stopCamera() {
    this.source.pause();
    const stream = this.getStream();
    if (!stream)
      return;
    const tracks = stream.getTracks();
    for (const track of tracks) {
      track.stop();
    }
    this.source.srcObject = null;
  }
  async takeScreenshot(asFile = false, mimeType = "image/webp") {
    this.canvas.width = this.source.videoWidth;
    this.canvas.height = this.source.videoHeight;
    this.canvas.getContext("2d").drawImage(this.source, 0, 0);
    const url = this.canvas.toDataURL(mimeType);
    if (!asFile) {
      return url;
    }
    const namelike = this.getDateLikeStr(new Date());
    return this.base64ToFile(url, `${namelike}`, mimeType);
  }
  /**
   * from the current stream pick the first active video track
   * then get the enumeratedDevices and add flag to it
   */
  async setActiveCamera() {
    const [activeTrack] = this.getActiveVideoTracks();
    try {
      this.cameras = await this.getVideoDevices();
    }
    catch (error) {
      return Promise.reject(error);
    }
    if (!activeTrack) {
      this.cameras = this.cameras.map(camera => {
        camera.active = false;
        return camera;
      });
    }
    else {
      this.lastActiveCamera = activeTrack && activeTrack.label;
      this.cameras = this.cameras.map(camera => {
        camera.active = camera.label === activeTrack.label;
        return camera;
      });
    }
  }
  base64ToFile(url, name, mimeType = "image/webp") {
    return fetch(url)
      .then(res => res.arrayBuffer())
      .then(buffer => new File([buffer], name, { type: mimeType }));
  }

  getDateLikeStr(now) {
    return `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, "0")}-${`${now.getDate()}`.padStart(2, "0")}-${`${now.getHours()}`.padStart(2, "0")}${`${now.getUTCMinutes()}`.padStart(2, "0")}${`${now.getMilliseconds()}`.padStart(2, "0").slice(0, 2)}`;
  }

  checkIsBack(device) {
    const isBack = device.label.includes("back");
    const isRear = device.label.includes("rear");
    const isEnvironment = device.label.includes("environment");
    const isSecond = device.label.includes("1");
    return isBack || isRear || isEnvironment || isSecond;
  }

  checkIsFront(device) {
    const isFront = device.label.includes("front");
    const isFacing = device.label.includes("facing");
    const isUser = device.label.includes("user");
    const isFirst = device.label.includes("0");
    return isFront || isFacing || isUser || isFirst;
  }
}
