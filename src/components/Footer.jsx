import { useState, useEffect, useRef } from 'react'

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
  }
  return new Promise((resolve, reject) => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy') ? resolve() : reject(new Error('copy failed'))
    } catch (err) {
      reject(err)
    } finally {
      document.body.removeChild(textarea)
    }
  })
}

export default function Footer() {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const handleCopy = () => {
    copyText('H19061530106')
      .then(() => {
        setCopied(true)
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => setCopied(false), 1500)
      })
      .catch(() => { })
  }

  return (
    <footer className="footer">
      <p>&copy; 2026 听风轩. 传承中华瓷艺文化
        <p>
          联系我们
          微信：<span className="wechat" onClick={handleCopy} title="点击复制">{copied ? '已复制 ✓' : 'H19061530106'}</span></p>
      </p>
    </footer>
  )
}
