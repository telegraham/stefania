class BeatBox {
  constructor(bpm, minorBeatsPerBeat){
    this.majorBeatDuration = (60 * 1000) / bpm;
    this.minorBeatsPerBeat = minorBeatsPerBeat
    this.minorBeatDuration = this.majorBeatDuration / this.minorBeatsPerBeat;
    this.onBeatCallback = () => false
  }

  onBeat(callback){
    this.onBeatCallback = callback;
  }

  play(time){

    console.log("plAY")
    clearInterval(this.interval)
    clearTimeout(this.timeout)

    const timeMs = time * 1000;
    this.cachedSongTime = timeMs;
    this.lastPlay = performance.now();

    const timeSinceLastBeat = timeMs % this.minorBeatDuration
    const timeUntilNextBeat = this.minorBeatDuration - timeSinceLastBeat;
    const timeoutMs = (timeSinceLastBeat < (this.minorBeatDuration / 16)) ? 0 : timeUntilNextBeat;

    this.timeout = setTimeout(() => {
      this.#beat("timeout", this.timeout);
      this.interval = setInterval(() => { 
        this.#beat("interval", this.interval); 
      }, this.minorBeatDuration)
    }, timeoutMs);
  }

  pause(){
    console.log("pause")
    clearInterval(this.interval)
    clearTimeout(this.timeout)
    this.interval = null
  }

  #beat(source, id){
    const estimatedSongTime = (performance.now() - this.lastPlay) + this.cachedSongTime;


    const elapsedBeats = Math.floor(estimatedSongTime / this.minorBeatDuration);
    const msSinceLastBeat = estimatedSongTime % this.minorBeatDuration;
    const closerToNextBeat = msSinceLastBeat > (this.minorBeatDuration / 2);

    const currentMinorBeatNumber = elapsedBeats + (closerToNextBeat ? 1 : 0);
    const currentMajorBeatNumber = Math.floor(currentMinorBeatNumber / this.minorBeatsPerBeat);

    // console.log({
    //   beat: (currentBeatNumber % 4) + 1,
    //   estimatedSongTime: estimatedSongTime,
    //   pnow: performance.now(),
    //   beatTime: currentBeatNumber * this.minorBeatDuration,
    //   delta: estimatedSongTime - currentBeatNumber * this.minorBeatDuration,
    //   source: source,
    //   sourceId: id,
    // })

    this.onBeatCallback(currentMajorBeatNumber, currentMinorBeatNumber)
  }


}