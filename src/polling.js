module.exports = {
  /**
   * Inits the polling logic
   */
  initPolling () {
    // Cleanup old interval
    if (this.data.pollingInterval) {
      clearInterval(this.data.pollingInterval)
    }

    // Setup polling if enabled and host is set
    if (this.config.enable_polling && this.config.host) {
      this.log('debug', `Polling ${this.socket.host} started...`)

      this.data.pollingInterval = setInterval(() => {
        // Send Input Gain Query
        this.sendTCP('!ingn(*)?\n', false)

        // Send Input Mute Query
        this.sendTCP('!inmt(*)?\n', false)

        // Send Output Gain Query
        this.sendTCP('!outgn(*)?\n', false)

        // Send Output Mute Query
        this.sendTCP('!outmt(*)?\n', false)

        // Send Rear Panel Input Gain Query
        this.sendTCP('!rpingn(*)?\n', false)

        // Send Rear Panel Input Gain Query
        this.sendTCP('!rpoutgn(*)?\n', false)

        // Crosspoint Gain and Mute queries: iterate pairs to avoid giant payloads
        // XP responses are per (input,output)
        const inCount = this.data.inputChannels
        const outCount = this.data.outputChannels
        // Poll a rolling subset to limit rate
        const maxPairsPerTick = 8
        if (!this._xpPollIdx) this._xpPollIdx = 0
        for (let n = 0; n < maxPairsPerTick; n++) {
          const pairIdx = (this._xpPollIdx + n) % (inCount * outCount)
          const inIdx = Math.floor(pairIdx / outCount) + 1
          const outIdx = (pairIdx % outCount) + 1
          this.sendTCP(`!xpgn(${inIdx},${outIdx})?\n`, false)
          this.sendTCP(`!xpmt(${inIdx},${outIdx})?\n`, false)
        }
        this._xpPollIdx = (this._xpPollIdx + maxPairsPerTick) % (inCount * outCount)
      }, this.config.polling_rate)
    }
  }
}
