export const saveTheme = async (theme) => {
  try {
    await save('theme', theme)
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

export const loadTheme = async () => {
  try {
    const {theme} = await load('theme');
    return theme
  } catch (e) {
    alert('讀取設定失敗，請確認允許檔案權限')
  }
}

export default {
  saveTheme,
  loadTheme,
}