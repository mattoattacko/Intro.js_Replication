class Modal {
  #modal
  #closeBtn
  #title
  #body
  #backBtn
  #nextBtn

  constructor(onBack, onNext, onClose) {
    this.#modal = document.createElement("div")
    this.#modal.classList.add("modal")

    this.#closeBtn = document.createElement("button")
    this.#closeBtn.innerHTML = "&times;"
    this.#closeBtn.classList.add("close-btn")
    this.#closeBtn.addEventListener("click", onClose)
    this.#modal.append(this.#closeBtn)

    this.#title = document.createElement("header")
    this.#title.classList.add("title")
    this.#modal.append(this.#title)

    this.#body = document.createElement("div")
    this.#body.classList.add("body")
    this.#modal.append(this.#body)

    const footer = document.createElement("footer")
    footer.classList.add("footer")
    this.#modal.append(footer)

    this.#backBtn = document.createElement("button")
    this.#backBtn.textContent = "Back"
    this.#backBtn.addEventListener("click", onBack)
    footer.append(this.#backBtn)

    this.#nextBtn = document.createElement("button")
    this.#nextBtn.textContent = "Next"
    this.#nextBtn.addEventListener("click", onNext)
    footer.append(this.#nextBtn)

    document.body.append(this.#modal)
  }

  set title(value) {
    this.#title.innerText = value
  }

  set body(value) {
    this.#body.innerText = value
  }

  show(value = true) {
    this.#modal.classList.toggle("show", value)
  }

  center(value = true) {
    this.#modal.classList.toggle("center", value)
  }

  position({ bottom, left }) {
    const offset = ".5rem"
    this.#modal.style.setProperty(
      "--x",
      `calc(${left + window.scrollX}px + ${offset})` //convert to px
    )
    this.#modal.style.setProperty(
      "--y",
      `calc(${bottom + window.scrollY}px + ${offset} + .25rem)` //the .25rem is to account for the padding so it's more centered.
    )
  }

  // After the full set of modal steps completes, this helps get rid of the modal on screen
  remove() {
    this.#modal.remove()
  }

  enableBackButton(enabled) {
    this.#backBtn.disabled = !enabled
  }
}

class Intro {
  #modal
  #highlightContainer
  #bodyClick

  constructor(steps) {
    this.steps = steps
    this.#bodyClick = e => {
      if (
        e.target === this.#currentStep.element ||
        this.#currentStep.element?.contains(e.target) || //need this line to be able to click/highlight the element if it's not in the modal. w/o it, we can't click inside the highlighted element. Also closes the modal if we click outside the modal.
        e.target.closest(".highlight-container") != null || //this all says 'if we click the highlight container, or anywhere inside the highlight container, or if we click the modal, or anywhere inside the modal, then do nothing'. All this makes sure that only clicking on the 'buttons' will move the tutorial along and not close the modal. 
        e.target.matches(".modal") ||
        e.target.closest(".modal") != null
      ) {
        return
      }

      this.finish() //if the user clicks outside of the highlighted element, finish the tutorial
    }
  }

  start() {
    this.currentStepIndex = 0
    this.#modal = new Modal(
      () => {
        this.currentStepIndex--
        this.#showCurrentStep()
      },
      () => {
        this.currentStepIndex++
        // if the current step is the last one, finish the tutorial (give 'done' button)
        if (this.currentStepIndex >= this.steps.length) {
          this.finish() //hide modal
        } else {
          this.#showCurrentStep() // else show the next step
        }
      },
      () => this.finish() //hide modal
    )
    document.addEventListener("click", this.#bodyClick)
    this.#highlightContainer = this.#createHighlightContainer()
    this.#showCurrentStep()
  }

  //Gets rid of the modal on screen 
  finish() {
    document.removeEventListener("click", this.#bodyClick)
    this.#modal.remove()
    this.#highlightContainer.remove()
  }

  get #currentStep() {
    return this.steps[this.currentStepIndex]
  }

  #showCurrentStep() {
    this.#modal.show()
    this.#modal.enableBackButton(this.currentStepIndex !== 0)
    this.#modal.title = this.#currentStep.title
    this.#modal.body = this.#currentStep.body
    if (this.#currentStep.element == null) {
      this.#highlightContainer.classList.add("hide") //without this, the highlight container would be visible at the bottom as a black dot
      this.#positionHighlightContainer({ x: 0, y: 0, width: 0, height: 0 }) //keeps the highlighted container from showing until we hit the 'next' button.
      this.#modal.center()
    } else { //this code runs if we have an element to highlight
      this.#modal.center(false) //this centers the modal, but doesn't center the highlight container
      const rect = this.#currentStep.element.getBoundingClientRect()
      this.#modal.position(rect)
      this.#highlightContainer.classList.remove("hide") //if we don't remove 'hide' the border wont show up around the highlighted element
      this.#positionHighlightContainer(rect)
      this.#currentStep.element.scrollIntoView({ //this will auto scroll the element into view if it's not already visible. 'scrollIntoView' takes an Object with a few properties listed below.
        behavior: "smooth",
        block: "center",
        inline: "center",
      })
    }
  }

  #createHighlightContainer() {
    const highlightContainer = document.createElement("div")
    highlightContainer.classList.add("highlight-container")
    document.body.append(highlightContainer)
    return highlightContainer
  }

  #positionHighlightContainer(rect) {
    this.#highlightContainer.style.top = `${rect.top + window.scrollY}px` //w/o the '+ window.scrollY', the highlight container would be positioned at the bottom of the page. These also need to be placed in 'position' method.
    this.#highlightContainer.style.left = `${rect.left + window.scrollX}px` //w/o the '+ window.scrollX', the highlight container would be positioned at the right of the page. Together they would make our highlighted element appear wayyyyy off the page.
    this.#highlightContainer.style.width = `${rect.width}px`
    this.#highlightContainer.style.height = `${rect.height}px`
  }
}

const intro = new Intro([
  {
    title: "Test Title",
    body: "This is the body of the modal",
  },
  {
    title: "Test Title 2",
    body: "This is the body of the modal 2",
    element: document.querySelector("[data-first]"),
  },
  {
    title: "Test Title 3",
    body: "This is the body of the modal 3",
    element: document.querySelector("[data-second]"),
  },
])
intro.start()

// after 2 seconds, the modal auto closes itself
setTimeout(() => {
  intro.finish()
}, 2000)
