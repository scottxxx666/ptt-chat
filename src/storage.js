import {deepCopy} from "./utils.js";

const saveData = async (key, theme) => {
  try {
    await save(key, theme)
  } catch (e) {
    alert('儲存設定失敗，請確認允許檔案權限')
  }
}

const save = (key, data) => {
  return chrome.storage.local.set({[key]: data})
}

const load = (key) => {
  return chrome.storage.local.get([key])
}

export default {
  saveTheme: (theme) => {
    return saveData('theme', theme)
  },
  loadTheme: async () => {
    try {
      const {theme} = await load('theme');
      return theme
    } catch (e) {
      alert('讀取設定失敗，請確認允許檔案權限')
    }
  },
  saveBounding: (bounding) => {
    return saveData('bounding', deepCopy(bounding))
  },
  loadBounding: async () => {
    try {
      const {bounding} = await load('bounding');
      return bounding
    } catch (e) {
      alert('讀取設定失敗，請確認允許檔案權限')
    }
  },
  clear: async () => {
    try {
      await chrome.storage.local.clear()
    } catch (e) {
      alert('清除設定失敗，請聲後重試')
    }
  }
}