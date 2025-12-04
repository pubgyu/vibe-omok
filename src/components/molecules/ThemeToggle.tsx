type ThemeToggleProps = {
  theme: 'light' | 'dark'
  onToggle: () => void
}

export const ThemeToggle = ({ theme, onToggle }: ThemeToggleProps) => (
  <button
    type="button"
    className="theme-toggle"
    aria-label={`${theme === 'dark' ? '라이트' : '다크'} 모드로 전환`}
    onClick={onToggle}
  >
    <span className="toggle-track" aria-hidden>
      <span className="toggle-icon sun" />
      <span className="toggle-icon moon" />
      <span className={`toggle-thumb ${theme}`} />
    </span>
    <span className="sr-only">
      {theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
    </span>
  </button>
)
