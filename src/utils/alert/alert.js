const alertTypes = {
  show: {
    type: 'dark',
    icon: ''
  },
  info: {
    type: 'info',
    icon: 'info-circle'
  },
  warn: {
    type: 'warning',
    icon: 'exclamation'
  },
  success: {
    type: 'success',
    icon: 'check-circle'
  },
  error: {
    type: 'danger',
    icon: 'exclamation-circle'
  }
}

const instance = Object.entries(alertTypes).reduce((acc, [k, v]) => {
  acc[k] = (msg, opts) => {
    opts = Object.assign({}, opts, {
      icon: v.icon,
      type: v.type
    })
    const alert = new Alert(msg, opts)
    alert.show()
  }
  return acc
}, alertTypes)

export default instance

export const plugin = {
  install(app, options) {
    app.config.globalProperties.$alert = instance
  }
}

class Alert {
  constructor(message, options) {
    this.options = Object.assign({
      type: 'dark',
      duration: 3000,
      animationDuration: 300,
      icon: ''
    }, options)

    const alert = document.createElement('div')
    alert.className = `alert alert-${this.options.type} alert-global`
    alert.setAttribute('role', 'alert')

    alert.onclick = this.onClick.bind(this)
    alert.onmouseover = this.onMouseOver.bind(this)
    alert.onmouseout = this.onMouseOut.bind(this)

    this.el = alert
    this.setMessage(message)
  }

  getIconHtml() {
    if (this.options.icon) {
      return '<i class="alert-icon fas fa-fw fa-' + this.options.icon + '" aria-hidden="true"></i>'
    }

    return ''
  }

  setMessage(message) {
    this.el.innerHTML = [this.getIconHtml(), message].filter(Boolean).join('')
  }

  show() {
    const container = this.getAlertContainer()
    container.insertBefore(this.el, container.firstChild)
    if (this.el.scrollHeight > 55) {
      this.el.style.textAlign = 'left'
    }
    setTimeout(() => {
      this.el.classList.add('active')
    })
    setTimeout(() => {
      this.startCountdown()
    }, this.options.animationDuration)
  }

  hide() {
    this.el.classList.add('leaving')
    setTimeout(() => {
      this.destroy()
    }, this.options.animationDuration)
  }

  destroy() {
    this.el?.remove?.()
  }

  onClick() {
    if (window.getSelection()?.type !== 'Range') {
      this.hide()
    }
  }

  onMouseOver() {
    this.stopCountdown()
  }

  onMouseOut() {
    this.timeout = setTimeout(() => {
      this.hide()
    }, 500)
  }

  startCountdown() {
    this.timeout = setTimeout(() => {
      this.hide()
    }, this.options.duration)
  }

  stopCountdown() {
    clearTimeout(this.timeout)
  }

  getAlertContainer() {
    let container = document.body.querySelector('#alertContainer')

    if (!container) {
      container = document.createElement('div')
      container.id = 'alertContainer'
      document.body.appendChild(container)
    }

    return container
  }
}
