module.exports = {
  presets () {
    const presets = []

    // Add Input Mute Presets
    this.state.audioInputs.forEach(({ mute, gain }, index) => {
      presets.push({
        category: 'Audio Input Mute',
        label: `input_mute_${index}`,
        bank: {
          style: 'text',
          text: `Input ${index}\\nMute $(ASPEN:${mute.variable.name})`,
          size: '14',
          color: this.rgb(255, 255, 255),
          bgcolor: this.rgb(0, 0, 0)
        },
        actions: [{
          action: 'input_mute_toggle',
          options: {
            channel: index
          }
        }],
        feedbacks: [{
          type: 'input_mute',
          options: {
            bg: this.rgb(255, 65, 54),
            fg: this.rgb(0, 0, 0),
            channel: index
          }
        }]
      })

      presets.push({
        category: 'Audio Input Gain',
        label: `input_gain_${index}`,
        bank: {
          style: 'text',
          text: `Input ${index}\\nGain $(ASPEN:${gain.variable.name})`,
          size: '14',
          color: this.rgb(255, 255, 255),
          bgcolor: this.rgb(0, 0, 0)
        },
        actions: [{
          action: 'input_gain_step',
          options: {
            channel: index
          }
        }]
      })
    })

    // Add Output Mute Presets
    this.state.audioOutputs.forEach(({ mute, gain }, index) => {
      presets.push({
        category: 'Audio Output',
        label: `output_mute_${index}`,
        bank: {
          style: 'text',
          text: `Output ${index}\\nMute $(ASPEN:${mute.variable.name})`,
          size: '14',
          color: this.rgb(255, 255, 255),
          bgcolor: this.rgb(0, 0, 0)
        },
        actions: [{
          action: 'output_mute_toggle',
          options: {
            channel: index
          }
        }],
        feedbacks: [{
          type: 'output_mute',
          options: {
            bg: this.rgb(255, 65, 54),
            fg: this.rgb(0, 0, 0),
            channel: index
          }
        }]
      })

      presets.push({
        category: 'Audio Output Gain',
        label: `output_gain_${index}`,
        bank: {
          style: 'text',
          text: `Output ${index}\\nGain $(ASPEN:${gain.variable.name})`,
          size: '14',
          color: this.rgb(255, 255, 255),
          bgcolor: this.rgb(0, 0, 0)
        },
        actions: [{
          action: 'output_gain_step',
          options: {
            channel: index
          }
        }]
      })
    })

    // Add Rear Panel Input Gain Presets
    this.state.rearInputs.forEach(({ gain }, index) => {
      presets.push({
        category: 'Rear Panel Input Gain',
        label: `rear_input_gain_${index}`,
        bank: {
          style: 'text',
          text: `Rear In ${index}\\nGain $(ASPEN:${gain.variable.name})`,
          size: '14',
          color: this.rgb(255, 255, 255),
          bgcolor: this.rgb(0, 0, 0)
        },
        actions: [{
          action: 'rear_panel_input_gain_step',
          options: {
            channel: index,
            gain: '2'
          }
        }]
      })
    })

    // Add Rear Panel Output Gain Presets
    this.state.rearOutputs.forEach(({ gain }, index) => {
      presets.push({
        category: 'Rear Panel Output Gain',
        label: `rear_output_gain_${index}`,
        bank: {
          style: 'text',
          text: `Rear Out ${index}\\nGain $(ASPEN:${gain.variable.name})`,
          size: '14',
          color: this.rgb(255, 255, 255),
          bgcolor: this.rgb(0, 0, 0)
        },
        actions: [{
          action: 'rear_panel_output_gain_step',
          options: {
            channel: index,
            gain: '2'
          }
        }]
      })
    })

    // Crosspoint presets (limited set for convenience)
    const maxShowInputs = Math.min(this.data.inputChannels, 4)
    const maxShowOutputs = Math.min(this.data.outputChannels, 4)
    for (let inIdx = 1; inIdx <= maxShowInputs; inIdx++) {
      for (let outIdx = 1; outIdx <= maxShowOutputs; outIdx++) {
        const xp = this.state.crosspoints[inIdx][outIdx]
        presets.push({
          category: 'Crosspoint Mute',
          label: `xp_mute_${inIdx}_${outIdx}`,
          bank: {
            style: 'text',
            text: `XP ${inIdx}→${outIdx}\\nMute $(ASPEN:${xp.mute.variable.name})`,
            size: '14',
            color: this.rgb(255, 255, 255),
            bgcolor: this.rgb(0, 0, 0)
          },
          actions: [{ action: 'xp_mute_toggle', options: { in: inIdx, out: outIdx } }],
          feedbacks: [{ type: 'xp_mute', options: { fg: this.rgb(0, 0, 0), bg: this.rgb(255, 65, 54), in: inIdx, out: outIdx } }]
        })

        presets.push({
          category: 'Crosspoint Gain',
          label: `xp_gain_${inIdx}_${outIdx}`,
          bank: {
            style: 'text',
            text: `XP ${inIdx}→${outIdx}\\nGain $(ASPEN:${xp.gain.variable.name})`,
            size: '14',
            color: this.rgb(255, 255, 255),
            bgcolor: this.rgb(0, 0, 0)
          }
        })
      }
    }

    this.setPresetDefinitions(presets)
  }
}
