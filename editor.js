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
      },

      enableSaving() {
        this.htmlElements.saveChangesButton.disabled = false
      },

      saveToStorage() {
        localStorage.setItem('classroomTimers',JSON.stringify(this.state.schedules)) 
        window.location.reload()
      },

      switchSchedule(index) {
        this.state.scheduleIndex = index
        this.state.currentScheduleObject = this.state.schedules[index]
        this.htmlElements.currentScheduleTitleHeading.innerText = this.state.currentScheduleObject.title

        this.state.currentScheduleObject.blocks.forEach((block) => {
          const { defaultAlarmsAfterStart, defaultAlarmsBeforeEnd } = structuredClone(this.state.currentScheduleObject)

          block.alarmsAfterStart ??= defaultAlarmsAfterStart ??= []
          block.alarmsBeforeEnd  ??= defaultAlarmsBeforeEnd ??= []
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
        this.enableSaving()
      },

      updateTitle() {
        const {currentScheduleObject} = this.state
        currentScheduleObject.title = this.htmlElements.currentScheduleTitleHeading.innerText
        this.enableSaving()
        this.refreshScheduleNav()
      },


      makePeriodElement(per, start, end, index, beforeEnd, afterBegin) {
        
        function newInputMaker(myType, myValue) {
          let newInput = document.createElement('input')
          newInput.type = myType
          newInput.value = myValue
          newInput.classList.add('input', 'is-small')
          const newControl = document.createElement('p')
          newControl.classList.add('control')
          newControl.appendChild(newInput)
          newFieldset.appendChild(newControl)
          return newInput
        }

        const newElement = document.createElement('div')
        newElement.classList.add('box','p-2', 'm-2')
        const newFieldset = document.createElement('fieldset')
        newFieldset.classList.add('field','is-grouped')

        newElement.appendChild(newFieldset)

        const perTitle = newInputMaker('text', per)
        const perStart = newInputMaker('time', start)
        const perEnd = newInputMaker('time', end)

        const deleter = document.createElement('p')
        
        const button = document.createElement('button')
        
        button.classList.add('delete')
        deleter.classList.add('control')
        deleter.appendChild(button)
        newFieldset.appendChild(deleter)


        const handleEvent = () => {
          this.updateScheduleObject(index, perTitle.value, perStart.value, perEnd.value)
        }


        perTitle.addEventListener('input', () => handleEvent())
        perStart.addEventListener('input', () => handleEvent())
        perEnd.addEventListener('input', () => handleEvent())
        deleter.addEventListener('click', () => this.deletePeriod(index))

        const alarmContainer = document.createElement('div')
        alarmContainer.classList.add('tags')

        afterBegin.forEach((alarmTime, j) => {
          const [minutes, seconds] = alarmTime.split(':').map(Number)

          const newAlarm = document.createElement('span')
          newAlarm.classList.add('tag','is-info','is-small')
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
          newAlarm.classList.add('tag','is-info')
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
        newCheckboxLabel.classList.add('checkbox', 'control')
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
        this.enableSaving()
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
        finalElem.classList.add('box','p-2', 'm-2')
        const addButton = document.createElement('input')
        addButton.type = 'button'
        addButton.value = "+ Add Period"
        addButton.classList.add('button', 'is-fullwidth')
        addButton.addEventListener('click', () => {
          this.addPeriod()
          this.enableSaving()
        })
        finalElem.appendChild(addButton)
        this.htmlElements.scheduleContainer.appendChild(finalElem)
 
        this.refreshScheduleNav()

      },

      refreshScheduleNav() {

        const { listOfSchedulesUL } = this.htmlElements

        listOfSchedulesUL.replaceChildren()

        const newEntryMaker = (newTitle) => {
          const newSelector = document.createElement('li')
          const newa = document.createElement('a')
          newSelector.appendChild(newa)
          newa.innerText = newTitle


          listOfSchedulesUL.appendChild(newSelector)

          return newSelector
        }

        this.state.schedules.forEach((scheduleObj, index) => {
          const newSelector = newEntryMaker(scheduleObj.title, index)

          newSelector.addEventListener('click', () => {
            this.switchSchedule(index)
          })

          if (index == this.state.scheduleIndex) {
            newSelector.classList.add('is-active')
          }

        })

        const newSelector = newEntryMaker('+')

        newSelector.addEventListener('click', () => this.createNewSchedule())

      },

      createNewSchedule() {
        const newSchedule = {
          title: "New Schedule",
          blocks: [],
        }

        const newIndex = this.state.schedules.length

        this.state.schedules.push(newSchedule)

        this.switchSchedule(newIndex)

      },

      htmlElements: {
        scheduleContainer: document.getElementById("schedule-container"),
        checkboxContainer: document.getElementById("period-checkboxes"),
        addAfterStartButton: document.getElementById("after-start"),
        addBeforeEndButton: document.getElementById("before-end"),
        numMinutesInput: document.getElementById("num-mins"),
        listOfSchedulesUL: document.getElementById("list-of-schedules"),
        editorModal: document.getElementById('editor-modal'),
        openEditorModalButton: document.getElementById('open-editor-modal'),
        saveChangesButton: document.getElementById('save-changes'),
        currentScheduleTitleHeading: document.getElementById('current-schedule-title')
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
        this.htmlElements.openEditorModalButton.addEventListener('click', () => { 
          this.state.schedules = JSON.parse(JSON.stringify(schedules))
          this.switchSchedule(0)
          this.htmlElements.saveChangesButton.disabled = true
          this.htmlElements.editorModal.classList.add('is-active')
        })
        this.htmlElements.saveChangesButton.addEventListener('click', () => {this.saveToStorage()})
        this.htmlElements.currentScheduleTitleHeading.addEventListener('input', () => this.updateTitle())

      },
    }

    //editorApp.state.currentScheduleObject = JSON.parse(editorApp.config.defaultJSON)[0]

    editorApp.init()
  
    /*window.addEventListener('pagehide', (event) => {
      localStorage.setItem('classroomTimers',JSON.stringify(editorApp.state.schedules)) 
    });*/