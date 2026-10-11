// A guard entry keeps native Back inside the app, including a direct launch on Accounts.
// The capture listener runs before HashRouter so it never renders an old route behind a popup.
export function createAppHistory(win, onBack) {
  let currentUrl = win.location.href
  let currentState = win.history.state
  if (!currentState?.bgymBackGuard) {
    currentState = { ...currentState, bgymBackGuard: true }
    win.history.pushState(currentState, '', currentUrl)
  }
  const back = event => {
    event.stopImmediatePropagation()
    win.history.pushState(currentState, '', currentUrl)
    onBack()
  }
  win.addEventListener('popstate', back, true)
  return {
    remember: () => { currentUrl = win.location.href; currentState = { ...win.history.state, bgymBackGuard: true } },
    dispose: () => win.removeEventListener('popstate', back, true),
  }
}
