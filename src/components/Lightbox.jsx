import { useEffect, useRef, useState } from 'react'

const MIN_SCALE = 1
const MAX_SCALE = 5
const ZOOM_STEP = 0.5

const clampScale = (s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s))

export default function Lightbox({ isOpen, images, currentIndex, onClose, onPrev, onNext }) {
  const touchStartX = useRef(null)
  const touchEndX = useRef(null)
  const pinchRef = useRef(null)
  const panRef = useRef(null)
  const draggedRef = useRef(false)
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [gesturing, setGesturing] = useState(false)
  const [loading, setLoading] = useState(false)

  const zoomIn = () => setScale(s => clampScale(s + ZOOM_STEP))
  const zoomOut = () => setScale(s => clampScale(s - ZOOM_STEP))
  const resetZoom = () => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'r' || e.key === 'R') setRotation(r => r + 90)
      if (e.key === '+' || e.key === '=') zoomIn()
      if (e.key === '-' || e.key === '_') zoomOut()
      if (e.key === '0') resetZoom()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, onPrev, onNext])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    setRotation(0)
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }, [currentIndex])

  // 关闭时重置缩放、平移、旋转及手势状态
  useEffect(() => {
    if (!isOpen) {
      setRotation(0)
      setScale(1)
      setOffset({ x: 0, y: 0 })
      setGesturing(false)
      pinchRef.current = null
      panRef.current = null
    }
  }, [isOpen])

  useEffect(() => {
    if (scale === 1) setOffset({ x: 0, y: 0 })
  }, [scale])

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
    }
  }, [isOpen, currentIndex])

  // 鼠标拖拽平移（仅缩放后可用），拖拽后抑制误触关闭
  useEffect(() => {
    if (!isOpen) return
    const handleMouseMove = (e) => {
      if (!panRef.current?.isMouse) return
      const dx = e.clientX - panRef.current.startX
      const dy = e.clientY - panRef.current.startY
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) draggedRef.current = true
      setOffset({
        x: panRef.current.baseX + dx,
        y: panRef.current.baseY + dy,
      })
    }
    const handleMouseUp = () => {
      if (panRef.current?.isMouse) {
        panRef.current = null
        setGesturing(false)
        setTimeout(() => { draggedRef.current = false }, 0)
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isOpen])

  const getDistance = (t1, t2) =>
    Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchRef.current = {
        startDist: getDistance(e.touches[0], e.touches[1]),
        startScale: scale,
      }
      setGesturing(true)
      touchStartX.current = null
      touchEndX.current = null
      return
    }
    touchStartX.current = e.touches[0].clientX
    touchEndX.current = null
    if (scale > 1) {
      panRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        baseX: offset.x,
        baseY: offset.y,
      }
      setGesturing(true)
    }
  }

  const handleTouchMove = (e) => {
    if (pinchRef.current && e.touches.length === 2) {
      const dist = getDistance(e.touches[0], e.touches[1])
      setScale(clampScale(pinchRef.current.startScale * (dist / pinchRef.current.startDist)))
      return
    }
    if (panRef.current && e.touches.length === 1) {
      const t = e.touches[0]
      setOffset({
        x: panRef.current.baseX + (t.clientX - panRef.current.startX),
        y: panRef.current.baseY + (t.clientY - panRef.current.startY),
      })
      return
    }
    touchEndX.current = e.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = () => {
    if (pinchRef.current) {
      pinchRef.current = null
      setGesturing(false)
      touchStartX.current = null
      touchEndX.current = null
      return
    }
    if (panRef.current) {
      panRef.current = null
      setGesturing(false)
      touchStartX.current = null
      touchEndX.current = null
      return
    }
    if (touchStartX.current === null || touchEndX.current === null) return

    const diff = touchStartX.current - touchEndX.current
    const threshold = 50

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        onNext()
      } else {
        onPrev()
      }
    }

    touchStartX.current = null
    touchEndX.current = null
  }

  const handleWheel = (e) => {
    const factor = e.deltaY < 0 ? 1.2 : 1 / 1.2
    setScale(s => clampScale(s * factor))
  }

  const handleMouseDown = (e) => {
    if (scale === 1 || e.button !== 0) return
    panRef.current = {
      isMouse: true,
      startX: e.clientX,
      startY: e.clientY,
      baseX: offset.x,
      baseY: offset.y,
    }
    draggedRef.current = false
    setGesturing(true)
  }

  const handleDoubleClick = (e) => {
    e.stopPropagation()
    if (scale > 1) {
      resetZoom()
    } else {
      setScale(2.5)
    }
  }

  if (!isOpen || !images || images.length === 0) return null

  return (
    <div
      className="lightbox"
      onClick={() => { if (!draggedRef.current) onClose() }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {loading && (
        <div className="lightbox-loader">
          <div className="spinner"></div>
        </div>
      )}
      <button className="lightbox-close" onClick={onClose}>&times;</button>
      <button className="lightbox-prev" onClick={(e) => { e.stopPropagation(); onPrev(); }}>
        &#10094;
      </button>
      <button className="lightbox-next" onClick={(e) => { e.stopPropagation(); onNext(); }}>
        &#10095;
      </button>
      <button
        className="lightbox-rotate"
        onClick={(e) => { e.stopPropagation(); setRotation(r => r + 90); }}
      >
        &#10227;
      </button>
      <button
        className="lightbox-zoom-in"
        onClick={(e) => { e.stopPropagation(); zoomIn(); }}
        aria-label="放大"
      >
        +
      </button>
      <button
        className="lightbox-zoom-out"
        onClick={(e) => { e.stopPropagation(); zoomOut(); }}
        aria-label="缩小"
      >
        &minus;
      </button>
      <button
        className="lightbox-zoom-reset"
        onClick={(e) => { e.stopPropagation(); resetZoom(); }}
        aria-label="重置缩放"
      >
        1:1
      </button>
      <img
        className="lightbox-image"
        src={images[currentIndex]}
        alt=""
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${scale})`,
          transition: gesturing ? 'none' : undefined,
          cursor: scale > 1 ? 'grab' : 'default',
        }}
        onLoad={() => setLoading(false)}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={handleDoubleClick}
        draggable={false}
      />
    </div>
  )
}
