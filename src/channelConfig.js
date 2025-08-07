module.exports = {
  /**
   * Creates the channel configuration
   */
  channelConfiguration () {
    this.state = {
      audioInputs: [],
      audioOutputs: [],
      rearInputs: [],
      rearOutputs: [],
      crosspoints: []
    }

    for (let i = 1; i <= this.data.inputChannels; i++) {
      // Add Audio Input
      this.state.audioInputs[i] = {
        mute: {
          currentValue: undefined,
          variable: {
            label: `Input ${i} - Mute Status`,
            name: `input_mute_status_${i}`
          }
        },
        gain: {
          currentValue: undefined,
          variable: {
            label: `Input ${i} - Gain Value`,
            name: `input_gain_${i}`
          }
        }
      }

      // Add Rear Input
      this.state.rearInputs[i] = {
        gain: {
          currentValue: undefined,
          variable: {
            label: `Rear Panel Input ${i} - Gain Value`,
            name: `rear_panel_input_gain_${i}`
          }
        }
      }
      // Init crosspoint rows for each input
      this.state.crosspoints[i] = []
    }

    for (let i = 1; i <= this.data.outputChannels; i++) {
      // Add Audio Output
      this.state.audioOutputs[i] = {
        mute: {
          currentValue: undefined,
          variable: {
            label: `Output ${i} - Mute Status`,
            name: `output_mute_status_${i}`
          }
        },
        gain: {
          currentValue: undefined,
          variable: {
            label: `Output ${i} - Gain Value`,
            name: `output_gain_${i}`
          }
        }
      }

      // Add Rear Output
      this.state.rearOutputs[i] = {
        gain: {
          currentValue: undefined,
          variable: {
            label: `Rear Panel Output ${i} - Gain Value`,
            name: `rear_panel_output_gain_${i}`
          }
        }
      }

      // Init crosspoint columns for each output under each input
      for (let inputIdx = 1; inputIdx <= this.data.inputChannels; inputIdx++) {
        this.state.crosspoints[inputIdx][i] = {
          mute: {
            currentValue: undefined,
            variable: {
              label: `XP (${inputIdx} → ${i}) - Mute Status`,
              name: `xp_mute_status_${inputIdx}_${i}`
            }
          },
          gain: {
            currentValue: undefined,
            variable: {
              label: `XP (${inputIdx} → ${i}) - Gain Value`,
              name: `xp_gain_${inputIdx}_${i}`
            }
          }
        }
      }
    }
  },

  /**
   * Updates the variable definitions.
   */
  updateVariableDefinitions () {
    const variables = []

    // Add Input Variables
    this.state.audioInputs.forEach(({ mute, gain }) => {
      variables.push(mute.variable)
      variables.push(gain.variable)
    })

    // Add Output Variables
    this.state.audioOutputs.forEach(({ mute, gain }) => {
      variables.push(mute.variable)
      variables.push(gain.variable)
    })

    // Add Rear Panel Input Variables
    this.state.rearInputs.forEach(({ gain }) => {
      variables.push(gain.variable)
    })

    // Add Rear Panel Output Variables
    this.state.rearOutputs.forEach(({ gain }) => {
      variables.push(gain.variable)
    })

    // Add Crosspoint Variables (mute + gain)
    for (let inIdx = 1; inIdx <= this.data.inputChannels; inIdx++) {
      for (let outIdx = 1; outIdx <= this.data.outputChannels; outIdx++) {
        const xp = this.state.crosspoints[inIdx][outIdx]
        variables.push(xp.mute.variable)
        variables.push(xp.gain.variable)
      }
    }

    this.setVariableDefinitions(variables)
  },

  /**
   * Processes and updates a device state and it's variable.
   *
   * @param {string} command The command that corresponds with the function
   * @param {string} channel The channel that needs to update
   * @param {string} value The updated value of the variable
   */
  setState (command, channel, value) {
    let stateChannel

    switch (command) {
      case 'ingn': // Input Gain
        stateChannel = this.state.audioInputs[channel]
        if (stateChannel && stateChannel.gain.currentValue !== value) {
          stateChannel.gain.currentValue = value
          this.setVariable(stateChannel.gain.variable.name, value)
        }
        break

      case 'inmt': // Input Mute
        stateChannel = this.state.audioInputs[channel]
        if (stateChannel && stateChannel.mute.currentValue !== value) {
          stateChannel.mute.currentValue = value
          this.setVariable(stateChannel.mute.variable.name, value === '1' ? 'ON' : 'OFF')
          this.checkFeedbacks('input_mute')
        }
        break

      case 'outgn': // Output Gain
        stateChannel = this.state.audioOutputs[channel]
        if (stateChannel && stateChannel.gain.currentValue !== value) {
          stateChannel.gain.currentValue = value
          this.setVariable(stateChannel.gain.variable.name, value)
        }
        break

      case 'outmt': // Output Mute
        stateChannel = this.state.audioOutputs[channel]
        if (stateChannel && stateChannel.mute.currentValue !== value) {
          stateChannel.mute.currentValue = value
          this.setVariable(stateChannel.mute.variable.name, value === '1' ? 'ON' : 'OFF')
          this.checkFeedbacks('output_mute')
        }
        break

      case 'rpingn': // Rear Panel Input Gain
        stateChannel = this.state.rearInputs[channel]
        if (stateChannel && stateChannel.gain.currentValue !== value) {
          stateChannel.gain.currentValue = value
          this.setVariable(stateChannel.gain.variable.name, value)
        }
        break

      case 'rpoutgn': // Rear Panel Output Gain
        stateChannel = this.state.rearOutputs[channel]
        if (stateChannel && stateChannel.gain.currentValue !== value) {
          stateChannel.gain.currentValue = value
          this.setVariable(stateChannel.gain.variable.name, value)
        }
        break

      case 'xpgn':
      case 'xpmt':
        // Not used for crosspoints. Use setXPState instead.
        break
    }
  },

  /**
   * Updates crosspoint state and variables.
   * @param {string} command 'xpgn' | 'xpmt'
   * @param {number} inputIdx 1-based input index
   * @param {number} outputIdx 1-based output index
   * @param {string} value value as string from device (e.g. '-10' or '1')
   */
  setXPState (command, inputIdx, outputIdx, value) {
    const xp = this.state.crosspoints?.[inputIdx]?.[outputIdx]
    if (!xp) return

    if (command === 'xpgn') {
      if (xp.gain.currentValue !== value) {
        xp.gain.currentValue = value
        this.setVariable(xp.gain.variable.name, value)
      }
    } else if (command === 'xpmt') {
      if (xp.mute.currentValue !== value) {
        xp.mute.currentValue = value
        this.setVariable(xp.mute.variable.name, value === '1' ? 'ON' : 'OFF')
      }
    }
  }
}
