export const MAX_MESSAGE_COUNT = 300

export const defaultSettings = function () {
  return {
    top: 10,
    right: +(4 / window.innerWidth * 100).toFixed(2),
    width: +(300 / window.innerWidth * 100).toFixed(2),
    height: 80
  };
}