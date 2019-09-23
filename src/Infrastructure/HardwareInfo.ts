import * as MobileDetect from 'mobile-detect'

class HardwareInfo {
  static detection = new MobileDetect(window.navigator.userAgent)

  static isMobile() {
    return this.detection.mobile()
  }

  static isTablet() {
    return this.detection.phone()
  }
}

export { HardwareInfo }
