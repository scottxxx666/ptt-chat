const saveTheme = (theme) => {
  return saveData('theme', theme)
}

const saveBounding = (bounding) => {
  console.log('saveBounding', bounding)
  return saveData('bounding', bounding)
}

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

const loadTheme = async () => {
  try {
    const {theme} = await load('theme');
    return theme
  } catch (e) {
    alert('讀取設定失敗，請確認允許檔案權限')
  }
}

const loadBounding = async () => {
  try {
    const {bounding} = await load('bounding');
    console.log('loadBounding', bounding)
    return bounding
  } catch (e) {
    alert('讀取設定失敗，請確認允許檔案權限')
  }
}

export default {
  saveTheme,
  loadTheme,
  saveBounding,
  loadBounding,
}