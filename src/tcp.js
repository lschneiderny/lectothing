const TCP = require('../../../tcp')

module.exports = {
  /**
   * Inits the TCP connection and updates status
   */
  initTCP () {
    if (this.socket !== undefined) {
      this.socket.destroy()
      delete this.socket
    }

    if (this.config.host) {
      this.debug('Initiating socket...')
      this.socket = new TCP(this.config.host, this.config.port)

      this.socket.on('status_change', (status, message) => {
        this.status(status, message)
      })

      this.socket.on('error', (err) => {
        this.debug('Network error', err)
        this.log('error', 'Network error: ' + err.message)
      })

      let buffer = ''

      this.socket.on('data', data => {
        buffer += data.toString()
        if (buffer.endsWith('\r\n')) {
          buffer
            .split('\r\n')
            .filter(message => message !== '')
            .forEach(message => this.processData(message.trim()))
          buffer = ''
        }
      })
    }
  },

  /**
   * Sends a TCP Package
   *
   * @param {string} payload The actual payload string for the connected device
   * @param {bool} log When false, skip logging. (To prevent flooding logs by polling)
   */
  sendTCP (payload, log = true) {
    if (log) {
      this.log('debug', `Sending ${payload} to ${this.socket.host}...`)
    }

    this.socket.send(payload)
  },

  /**
   * Parses and processes the response from the device and updates variables
   *
   * Example message: OK ingn(3)=45
   * Example message: OK inmt(*)={1,1,0,1,1,0,1,0,1,1,0,0,0,0,0,1,0,0,0,0}
   *
   * @param {string} message The return message from the device
   */
  processData (message) {
    // Try to match: OK <cmd>(...)=<value>
    const match = /(OK|ERROR)(?:\s+([^\s\(]+)\(([^)]*)\)=(.*))?/.exec(message)
    if (!match) return
    const status = match[1]
    const command = match[2]
    const addr = match[3]
    const value = match[4]

    if (status === 'ERROR') {
      this.status(this.STATUS_ERROR)
      this.log('warning', `ERROR received in TCP stream from ${this.socket.host}...`)
      return
    }

    if (status === 'OK') {
      this.status(this.STATUS_OK)

      // Crosspoint responses are 2D: (inIdx,outIdx)
      if ((command === 'xpgn' || command === 'xpmt') && addr && addr.includes(',')) {
        const [inStr, outStr] = addr.split(',')
        const inIdx = Number(inStr)
        const outIdx = Number(outStr)
        if (Number.isFinite(inIdx) && Number.isFinite(outIdx)) {
          this.setXPState(command, inIdx, outIdx, value)
        }
        return
      }

      // 1D array responses like ingn(*), inmt(*), outgn(*), outmt(*), rpingn(*), rpoutgn(*)
      if (addr === '*') {
        const values = value.substring(1, value.length - 1).split(',')
        for (let i = 0; i < values.length; i++) {
          this.setState(command, i + 1, values[i])
        }
        return
      }

      // Single 1D address
      const ch = Number(addr)
      if (Number.isFinite(ch)) {
        this.setState(command, ch, value)
        return
      }
    }
  }
}
