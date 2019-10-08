const MobileDetect = require('mobile-detect')

class HardwareInfo {
  static detection = new MobileDetect(window.navigator.userAgent)
  static vendor: string

  static isMobile() {
    return this.detection.mobile()
  }

  static isTablet() {
    return this.detection.phone()
  }

  static gpuVendor() {
    return window.game.engine.getGlInfo().vendor
  }

  static hasGoodVideoCard() {
    return /(NVIDIA|AMD)/.test(this.gpuVendor()) ||
      /(NVIDIA|AMD)/.test(window.game.engine.getGlInfo().renderer)
  }
}

export { HardwareInfo }
