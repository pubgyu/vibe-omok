type ApiStatus = 'checking' | 'ok' | 'error'

type ApiStatusIndicatorProps = {
  status: ApiStatus
}

export const ApiStatusIndicator = ({ status }: ApiStatusIndicatorProps) => {
  const label =
    status === 'ok' ? 'AI 연결' : status === 'error' ? '연결 오류' : '확인 중'

  return (
    <div className={`api-indicator ${status}`}>
      <span className="api-dot" aria-hidden />
      <span className="api-label">{label}</span>
    </div>
  )
}
