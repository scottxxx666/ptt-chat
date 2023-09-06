function clearPointerEvent() {
  document.querySelectorAll("iframe").forEach(e => e.style.pointerEvents = 'none')
}

function autoPointerEvent() {
  document.querySelectorAll("iframe").forEach(e => e.style.pointerEvents = 'auto')
}


export default {
  clearPointerEvent,
  autoPointerEvent,
}