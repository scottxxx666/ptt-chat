
export default function ResizeLayer({onClick}) {
  return <section id="ptt-size-layer">
    <button
      className="ptt-w-fit ptt-h-fit ptt-absolute ptt-top-0 ptt-right-0 ptt-left-0 ptt-bottom-0 ptt-m-auto ptt-fill-red-600"
      onClick={onClick}>
    </button>
  </section>
}