'use strict';
    const editorApp = {
      config: {
        passingPeriodMins: 7,
        periodLengthMins: 47,
        startTime: '08:25',
      },

      state: {
        checkboxes: [],
        scheduleIndex: 0,
        schedules: {},
        currentScheduleObject: {
          title: "",
          blocks: [],
        },
        unsavedChanges: false,
      },

      saveToStorage() {
        localStorage.setItem('classroomTimers',JSON.stringify(this.state.schedules)) 
        window.location.reload()
      },

      switchSchedule(index) {
        this.state.scheduleIndex = index
        this.state.currentScheduleObject = this.state.schedules[index]

        this.state.currentScheduleObject.blocks.forEach((block) => {
          block.alarmsAfterStart ??= []
          block.alarmsBeforeEnd  ??= []
        })

        delete this.state.currentScheduleObject.defaultAlarmsAfterStart
        delete this.state.currentScheduleObject.defaultAlarmsBeforeEnd

        this.update()
      },

      updateScheduleObject(position, per, st, en) {
        const blockObj = this.state.currentScheduleObject.blocks[position]
        blockObj.period = per
        blockObj.start = st
        blockObj.end = en
        this.update()
      },


      makePeriodElement(per, start, end, index, beforeEnd, afterBegin) {

        function newInputMaker(myType, myValue) {
          let newInput = document.createElement('input')
          newInput.type = myType
          newInput.value = myValue
          return newElement.appendChild(newInput)
        }

        const newElement = document.createElement('fieldset')
        newElement.classList.add('grid')

        const perTitle = newInputMaker('text', per)
        const perStart = newInputMaker('time', start)
        const perEnd = newInputMaker('time', end)
        const deleter = newInputMaker('button', 'x')


        perTitle.addEventListener('change', () =>
          this.updateScheduleObject(index, perTitle.value, perStart.value, perEnd.value)
        )
        perStart.addEventListener('change', () =>
          this.updateScheduleObject(index, perTitle.value, perStart.value, perEnd.value)
        )
        perEnd.addEventListener('change', () =>
          this.updateScheduleObject(index, perTitle.value, perStart.value, perEnd.value)
        )
        deleter.addEventListener('click', () =>
          this.deletePeriod(index)
        )

        const alarmContainer = document.createElement('div')

        afterBegin.forEach((alarmTime, j) => {
          const [minutes, seconds] = alarmTime.split(':').map(Number)

          const newAlarm = document.createElement('span')
          newAlarm.innerText = this.militaryStringToAMPMString(this.addTimes(start, minutes))
          newAlarm.classList.add('alarm')


          newAlarm.addEventListener('click', () => {
            this.state.currentScheduleObject.blocks[index].alarmsAfterStart.splice(j, 1)
            this.update()
          })
          alarmContainer.appendChild(newAlarm)
        })

        beforeEnd.forEach((alarmTime, j) => {
          const [minutes, seconds] = alarmTime.split(':').map(Number)

          const newAlarm = document.createElement('span')
          newAlarm.innerText = this.militaryStringToAMPMString(this.addTimes(end, -1 * minutes))
          newAlarm.classList.add('alarm')

          newAlarm.addEventListener('click', () => {
            this.state.currentScheduleObject.blocks[index].alarmsBeforeEnd.splice(j, 1)
            this.update()
          })
          alarmContainer.appendChild(newAlarm)
        })

        newElement.appendChild(alarmContainer)
        this.htmlElements.scheduleContainer.appendChild(newElement)

        const newCheckboxLabel = document.createElement('label')
        const newCheckbox = document.createElement('input')
        newCheckbox.type = 'checkbox'

        newCheckbox.checked = true
        this.state.checkboxes.push(index)

        const text = document.createTextNode(per)

        newCheckbox.addEventListener('change', () => {
          if (newCheckbox.checked) {
            this.state.checkboxes.push(index)
          } else {
            const j = this.state.checkboxes.indexOf(index)
            this.state.checkboxes.splice(j, 1)
          }
        })

        newCheckboxLabel.appendChild(newCheckbox)
        newCheckboxLabel.appendChild(text)
        this.htmlElements.checkboxContainer.appendChild(newCheckboxLabel)

      },

      militaryStringToAMPMString(string) {
        let [hours, minutes] = string.split(':').map(Number)
        let ampm

        switch (true) {
          case (hours == 12):
            ampm = 'pm'
            break
          case (hours > 12):
            hours = hours - 12
            ampm = 'pm'
            break
          default:
            ampm = 'am'
        }

        return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0') + ' ' + ampm
      },

      addTimes(time, minIncrement) {
        const [hours, minutes] = time.split(':').map(Number)
        const newTime = new Date()

        newTime.setHours(hours)
        newTime.setMinutes(minutes + minIncrement)

        const newHours = String(newTime.getHours()).padStart(2, '0')
        const newMinutes = String(newTime.getMinutes()).padStart(2, '0')

        return newHours + ':' + newMinutes
      },

      addPeriod(per = 'untitled period', start, end) {

        if (start === undefined && this.state.currentScheduleObject.blocks.length > 0) {
          start = this.addTimes(this.state.currentScheduleObject.blocks.at(-1).end, this.config.passingPeriodMins)
        }

        if (start === undefined) {
          start = this.config.startTime
        }

        if (end === undefined) {
          end = this.addTimes(start, this.config.periodLengthMins)
        }

        /*if (per === undefined) {
          per = 'Period ' + (this.state.currentScheduleObject.blocks.length + 1)
        }*/

        this.state.currentScheduleObject.blocks.push({ period: per, start: start, end: end, alarmsAfterStart: [], alarmsBeforeEnd: [] })
        this.update()
      },

      deletePeriod(index) {
        this.state.currentScheduleObject.blocks.splice(index, 1)
        this.update()
      },

      update() {
        this.htmlElements.scheduleContainer.replaceChildren()
        this.htmlElements.checkboxContainer.replaceChildren()
        this.state.checkboxes = []
        this.state.currentScheduleObject.blocks.forEach(
          (block, index) => this.makePeriodElement(block.period, block.start, block.end, index, block.alarmsBeforeEnd ?? [], block.alarmsAfterStart ?? [])
        )
        const finalElem = document.createElement('fieldset')
        const addButton = document.createElement('input')
        addButton.type = 'button'
        addButton.value = "+ Add Period"
        addButton.addEventListener('click', () => this.addPeriod())
        finalElem.appendChild(addButton)
        this.htmlElements.scheduleContainer.appendChild(finalElem)
        this.htmlElements.JSONOutputBlock.innerText = JSON.stringify(this.state.currentScheduleObject, null, 2)

        const { listOfSchedulesUL } = this.htmlElements
        const { schedules } = this.state

        listOfSchedulesUL.replaceChildren()

        schedules.forEach((scheduleObj, index) => {
          const newSelector = document.createElement('li')
          newSelector.innerText = scheduleObj.title
          listOfSchedulesUL.appendChild(newSelector)

          newSelector.addEventListener('click', () => {
            this.switchSchedule(index)
          })

          if (index == this.state.scheduleIndex) {
            newSelector.classList.add('current-schedule')
          }

        })

      },

      htmlElements: {
        scheduleContainer: document.getElementById("schedule-container"),
        JSONOutputBlock: document.getElementById("output-json"),
        checkboxContainer: document.getElementById("period-checkboxes"),
        addAfterStartButton: document.getElementById("after-start"),
        addBeforeEndButton: document.getElementById("before-end"),
        numMinutesInput: document.getElementById("num-mins"),
        listOfSchedulesUL: document.getElementById("list-of-schedules")
      },

      insertAlarm(alarmArray, newAlarm) {
        if (!alarmArray.includes(newAlarm)) {
          alarmArray.push(newAlarm)
        }
      },

      addAfterStart() {
        this.state.checkboxes.forEach((j) => {
          this.insertAlarm(
            this.state.currentScheduleObject.blocks[j].alarmsAfterStart,
            this.htmlElements.numMinutesInput.value + ':00')
        })
        this.update()
      },

      addBeforeEnd() {
        this.state.checkboxes.forEach((j) => {
          this.insertAlarm(
            this.state.currentScheduleObject.blocks[j].alarmsBeforeEnd,
            this.htmlElements.numMinutesInput.value + ':00'
          )
        })
        this.update()
      },

      init() {
        this.htmlElements.addAfterStartButton.addEventListener('click', () => { this.addAfterStart() })
        this.htmlElements.addBeforeEndButton.addEventListener('click', () => { this.addBeforeEnd() })
        this.update()
      },
    }

    //editorApp.state.currentScheduleObject = JSON.parse(editorApp.config.defaultJSON)[0]

    editorApp.state.schedules = schedules

    editorApp.switchSchedule(0)
    editorApp.init()
  
    /*window.addEventListener('pagehide', (event) => {
      localStorage.setItem('classroomTimers',JSON.stringify(editorApp.state.schedules)) 
    });*/