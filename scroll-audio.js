// (function(){


  class ScrollAudio {
    constructor(audioUrl){
      this.audioUrl = audioUrl;
      this.isEnabled = false;
    }

    enabled() {
      return this.isEnabled;
    }

    disabled() {
      return !this.isEnabled;
    }

    debounced = Utils.debounce(
      e => this.audioWrapper.playAndFadeIn(), 
      e => this.audioWrapper.fadeOutAndPause(), 
      50
      );

    enable() {
      if (this.enabled == true) return
      this.isEnabled = true;
      this.doOneTimeSetup()
      window.addEventListener("wheel", this.debounced);
      return this.isEnabled;
    }

    disable() {
      if (this.enabled == false) return
      this.isEnabled = false;
      window.removeEventListener("wheel", this.debounced);
      this.audioWrapper.fadeOutAndPause(500);
      return this.isEnabled;
    }

    doOneTimeSetup() {
      if (this.oneTimeSetupDone) return;
      this.oneTimeSetupDone = true;
      this.audioWrapper = new AudioWrapper(this.audioUrl);
    }

    onVolumeChanged(callback) {
      this.audioWrapper.onVolumeChanged(callback);
    }

    onPlayStateChanged(callback) {
      this.audioWrapper.onPlayStateChanged(callback)
    }
  }

  class AudioWrapper {

    constructor(url) {
      this.audio = new Audio(url);
      this.fader = new Fader(this.audio);
      this.playStateChangedCallback = () => false
    }

    fadeOutAndPause(overrideDurationMultiplier = null){ 
      // console.log("pause")
      this.fader.fadeOut(overrideDurationMultiplier, () => {
        this.audio.pause();
        this.playStateChangedCallback(false, this.audio.currentTime);
      })
    }

    playAndFadeIn(overrideDurationMultiplier = null){
      // console.log("play")
      this.audio.play();
      this.playStateChangedCallback(true, this.audio.currentTime);
      this.fader.fadeIn(overrideDurationMultiplier);
    }

    onVolumeChanged(callback) {
      this.fader.onVolumeChanged(callback);
    }

    onPlayStateChanged(callback) {
      this.playStateChangedCallback = callback;
    }

  }

  class Fader {
    constructor(audio) {
      this.audio = audio;
      this.audioFadeInterval = null;
      this.currentFade = null
      this.volumeChangedCallback = () => false
    }

    fadeIn(overrideDurationMultiplier = null, callback = () => false) {
      this.#fade(1, (overrideDurationMultiplier || 1000), callback)
    }

    fadeOut(overrideDurationMultiplier = null, callback = () => false) {
      this.#fade(0, (overrideDurationMultiplier || 5000), callback)
    }

    #fade(targetVolume, durationMultiplier, callback) {
      if (this.currentFade)
        this.currentFade.destructor();

      if (this.audio.volume == targetVolume) return;

      this.currentFade = new FadeTransition(
        this.audio.volume, 
        targetVolume, 
        durationMultiplier, 
        v => { 
          this.audio.volume = v;
          this.volumeChangedCallback(v)
        },
        callback);
      this.currentFade.go();
    }

    onVolumeChanged(callback) {
      callback(this.audio.volume)
      this.volumeChangedCallback = callback
    }
  }

  class FadeTransition {
    constructor(
      beginningValue, 
      targetVolume, 
      durationMultiplier, 
      onChange = () => false, 
      callback = () => false
    ) {
      this.beginningValue = beginningValue;
      this.changeInValue = targetVolume - beginningValue;
      this.duration = Math.abs(this.changeInValue) * durationMultiplier;
      this.onChange = onChange;
      this.callback = callback;
    }

    go() {
      this.t0 = performance.now();
      this.interval = setInterval(this.tick.bind(this), 16)
    } 

    tick() {
      const t = performance.now() - this.t0
      const v = Utils.easeInOutQuad(t, this.beginningValue, this.changeInValue, this.duration);
      // console.log (v)
      if (t < this.duration) {
        this.onChange(v)
      } else {
        this.onChange(this.beginningValue + this.changeInValue)
        this.destructor();
        this.callback();
      }
    }

    destructor() {
      clearInterval(this.interval)
    }
  }

  class Utils {
    // http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
    static debounce(leadingFunc, trailingFunc, threshold) {

      var timeout;

      return function debounced () {
        var obj = this, args = arguments;
        function delayed () {
          trailingFunc.apply(obj, args);
          timeout = null; 
        };

        if (timeout)
          clearTimeout(timeout);
        else
          leadingFunc.apply(obj, args);

        timeout = setTimeout(delayed, threshold || 100); 
      };

    }

     //https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
    // t: current time, b: begInnIng value, c: change In value, d: duration
    static easeInOutQuad(t, b, c, d) {
      if ((t/=d/2) < 1) return c/2*t*t + b;
      return -c/2 * ((--t)*(t-2) - 1) + b;
    }

  }

  window.ScrollAudio = ScrollAudio

// })()
