class Streak {
  static initialize(container) {
    this.outerContainer = {
      element: container,
      perspective: window.getComputedStyle(container).perspective
    };

    // Range of possible streak durations in seconds
    this.durations = {
      min: 0.2,
      max: 0.4
    };

    /**
     * The ranges here detail the percentages that the top and left position properties
     * cannot take.
     * They are centered around 47% as this the value for which streaks are perfectly centered.
     */
    this.positionLimits = {
      thinStreak: {lower: 37, upper: 57},
      thickStreak: {lower: 32, upper: 62} 
    }
  }

  constructor(customAnimationDuration = null) {
    // set a class based on type
    this.attributes = this.getAttributes();
    this.initialPosition = this.getStartingPosition();
    this.animationDuration = customAnimationDuration || this.getAnimationDuration();
    this.correctiveRotation = this.getCorrectiveRotation();
    this.createStreak();
    this.animateStreak();
  }


  /**
   * Method to decide the attributes of the streak being created.
   * There is a 61% chance of a thin green-blue streak,
   *   a 28% chance of a thin colorful streak and
   *   a 11% chance of a thick red-blue-green streak.
   */
  getAttributes() {
    const random = Math.random() * 100;
    if (random < 61) {
      return { type: "thinStreak", color: "green-blue", class:"thin-greenblue-streak" }
    }
    
    if (random < 89) {
      return { type: "thinStreak", color: "many", class: "thin-colorful-streak" }
    }
    
    return { type: "thickStreak", color: "red-blue-green", class: "thick-redbluegreen-streak" }
  }

  /**
   * Method used to generate random starting positions.
   * Positions near the center are less preferred.
   */
  getStartingPosition() {
    const left = this.generateRandomPosition();

    // If the `left` value lies in the restricted range, then top cannot lie there.
    // This prevents streak generation with a certain radius from the center. (imporves aesthetic appeal)
    const restrictiveFlag =
      (left > Streak.positionLimits[this.attributes.type].lower) &&
      (left < Streak.positionLimits[this.attributes.type].upper)
    ;
    const top = this.generateRandomPosition(restrictiveFlag);

    return { left, top };
  }

  /**
   * Generate a restricted or unrestricted position value.
   * 
   * @param {Boolean} restrictive - Does not allow returned number to take a 
   *   value within the restricted range (given by Streak.positionLimits)
   */
  generateRandomPosition(restrictive = false) {
    let min = 0,
      max = 100;

    if (restrictive) {
      if (100 * Math.random() < 50) {
        // min = 0;
        max = Streak.positionLimits[this.attributes.type].lower;
      } else {
        min = Streak.positionLimits[this.attributes.type].upper;
        // max = 100;
      }
    }

    return Number.parseInt(min + (max - min) * Math.random());
  }

  /**
   * Return a random animation duration between set min and max durations.
   */
  getAnimationDuration() {
    let min = Streak.durations.min,
    max = Streak.durations.max;
    
    return Number.parseFloat((min + (max - min) * Math.random()).toFixed(2));
  }

  /**
   * This method returns a corrective angle that will be used to provide proper X rotation in radians.
   * Without this rotation, streaks around `left: 50%` will be too thin to be viewed.
   */
  getCorrectiveRotation() {
    const slope = (this.initialPosition.top - 50) / (this.initialPosition.left - 50);
    return Math.atan(slope);
  }


  initializeStreakContainer() {
    this.elementContainer = document.createElement("div");
    this.elementContainer.setAttribute("class", "streak-container");
    this.elementContainer.style.animationDuration = `${this.animationDuration}s`
  }

  createStreak() {
    this.initializeStreakContainer();
    this.element = document.createElement("div");
    this.element.setAttribute("class", `streak ${this.attributes.class}`);
    this.element.style.left = `${this.initialPosition.left}%`;
    this.element.style.top = `${this.initialPosition.top}%`;
    this.element.style.transform = `rotateY(90deg) rotateX(${this.correctiveRotation}rad)`;

    this.elementContainer.appendChild(this.element);
    Streak.outerContainer.element.appendChild(this.elementContainer);
  }

  animateStreak() {
    this.elementContainer.style.animationPlayState = `running`;
  }

  deleteStreak() {
    Streak.outerContainer.element.removeChild(this.elementContainer);
  }
}

let container = document.querySelector("#container");
Streak.initialize(container);

// Slow animations that get faster and faster for an acceleration effect.
for (let speed = 1; speed > 0.2; speed -= 0.1) {
  Array(20).fill().forEach(() => {
    let streak = new Streak(speed);
    window.setTimeout(() => streak.deleteStreak(), streak.animationDuration * 1000);
  });
}

let interval = null;
window.setTimeout( () => {
  interval = setInterval(() => {
    Array(5).fill().forEach(() => {
      let streak = new Streak();
      window.setTimeout(() => streak.deleteStreak(), streak.animationDuration * 1000);
    });
  }, 1);
}, 300);
