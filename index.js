document.addEventListener("DOMContentLoaded", function(){

  const emojiTable = document.querySelector("#emojis");

  const emojify = new Emojify(emojiTable);
  emojify.do();

  const beatBox = new BeatBox(105, 4);

  const body = document.querySelector("body");
  beatBox.onBeat(function(majorBeatNumber, minorBeatNumber){
    console.log("BEAT", majorBeatNumber, minorBeatNumber)


    const majorBeat = majorBeatNumber % 4 + 1;
    const minorBeat = minorBeatNumber % 4 + 1;
    const offBeat = majorBeatNumber % 3 + 1;

    body.className = `major-${ majorBeat } minor-${ minorBeat } off-${ offBeat }`;

    body.style.background = ({
     "1": "pink", 
     "2": "yellow", 
     "3": "orange", 
     "4": "#CCCCFF", 
    })[minorBeat];


  })

  const scrollAudio = new ScrollAudio('womp.m4a');
  const volume = document.querySelector(".volume")
  const audioControls = document.querySelector("#audio-controls")

  document.querySelector("#audio-toggle").addEventListener("click", function(){
    if (scrollAudio.enabled()) {
      scrollAudio.disable()
      audioControls.classList.add("disabled")
    } 
    else {
      scrollAudio.enable();
      audioControls.classList.remove("disabled")
    }

    scrollAudio.onVolumeChanged(function(v){
      volume.value = v;
      // volume.max = 1;
    });

    scrollAudio.onPlayStateChanged(function(playing, currentTime){
      if (playing) {
        beatBox.play(currentTime);
      } else {
        beatBox.pause(currentTime);
      }
    });  
  })



})