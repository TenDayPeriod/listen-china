export default function Header({ title = '听风轩', tagline = '传承千年瓷艺，品味东方美学', icon = '/img/icon.jpg', theme = '' }) {
  return (
    <header className={`header ${theme}`}>
      <div className="header-content">
        <div className="header-title">
          <img src={icon} alt={title} className="header-icon" />
          <h1 className="logo">{title}</h1>
        </div>
        <p className="tagline">{tagline}</p>
      </div>
    </header>
  )
}
