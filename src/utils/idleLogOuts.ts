let idleTimer: ReturnType<typeof setTimeout> | null = null
const IDLE_TIMEOUT = 15 * 60 * 1000 // 15 minutes

let resetTimer: (() => void) | null = null

export function startIdleLogout(logoutCallback: () => void): void {
  resetTimer = () => {
    if (idleTimer) {
      clearTimeout(idleTimer)
    }

    idleTimer = setTimeout(() => {
      console.warn('User idle for 15 minutes, logging out')
      logoutCallback()
    }, IDLE_TIMEOUT)
  }

  const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll', 'wheel']

  events.forEach((event) => window.addEventListener(event, resetTimer!))

  // Start immediately
  resetTimer()
}

export function stopIdleLogout(): void {
  if (idleTimer) {
    clearTimeout(idleTimer)
    idleTimer = null
  }

  if (resetTimer) {
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll', 'wheel']

    events.forEach((event) => window.removeEventListener(event, resetTimer!))
  }

  resetTimer = null
}
