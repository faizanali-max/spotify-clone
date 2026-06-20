console.log("javaScript is processing...")
let currentSong = new Audio();
let songs;
let currFolder;

function formateTime(totalSeconds) {
    if (isNaN(totalSeconds)) {
        return "00:00";
    };
    let minutes = Math.floor(totalSeconds / 60);
    let secondsdecimal = totalSeconds % 60;
    let seconds = Math.floor(secondsdecimal);

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://192.168.118.123:3000/${folder}`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`%5C${folder}%5C`)[1]);
        }
    }
    return songs
};

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "images/pause.svg"
    }
    document.querySelector(".songName").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00/00:00";
}

function renderPlaylist() {
    //Add all the songs in the playList  
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="images/music.svg" alt="">
                        <div class="info">
                            <div>${song.replaceAll("%20", " ")}</div>
                            <div>Mohd. Faizan</div>
                        </div>
                        <div class="playNow">
                            <span>Play Now</span>
                            <img class="invert" src="images/playNow.svg" alt="">
                        </div></li>`;
    };
}

function listPlay() {
    //Attach an event listner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            //console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        });
    });
}

function hamburgerClick() {
    //Add an event listner to hamburger
    document.querySelector(".left").style.left = 0;
}

async function displayAlbums() {
    let a = await fetch(`http://192.168.118.123:3000/songs`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("%5Csongs%5C")) {
            let folder = e.href.split("%5Csongs%5C")[1].replace("/", "")
            //Get the meta data of folder
            let a = await fetch(`http://192.168.118.123:3000/songs/${folder}/info.json`);
            let response = await a.json();
            //console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder= ${folder} class="card">
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <div class="cardPlay"><img src="images/cardPlay.webp" alt=""></div>
                    <div class="disk"><img src="images/Disc.png" alt=""></div>
                    <h3>${response.title}</h3>
                    <p>${response.description}</p>
                </div>`
        }
    }

    //Load the playLists whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            Array.from(document.getElementsByClassName("card")).forEach(card => {
                card.classList.remove("active")
            });
            let folder = card.dataset.folder;
            songs = await getSongs(`songs%5C${folder}`);
            card.classList.add("active")
            renderPlaylist();
            playMusic(songs[0]);
            listPlay();
            hamburgerClick();
        });

    });
};

function nextPlay() {
    //Funtion for play next song
    let currentFile = currentSong.src.split("/").pop();
    let index = songs.indexOf(currentFile);

    if (index < songs.length - 1) {
        playMusic(songs[index + 1]);
    };
};

async function main() {
    await getSongs("songs%5CArjit_singh");
    //console.log(songs);
    playMusic(songs[0], true)

    //Display all the albums on the page
    displayAlbums();

    renderPlaylist();

    listPlay();

    //Attach an event listner to each play, pause buttons
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "images/pause.svg";
        } else {
            currentSong.pause();
            play.src = "images/play.svg";
        };
    });

    //listen for time update duration
    currentSong.addEventListener("timeupdate", () => {
        //console.log(formateTime(currentSong.currentTime), formateTime(currentSong.duration));
        document.querySelector(".songTime").innerHTML = `${formateTime(currentSong.currentTime)} / ${formateTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        if (currentSong.currentTime == currentSong.duration) {
            console.log("Song completed");
            nextPlay();
        }
    });

    //Add an event listner to seekbaar
    document.querySelector(".seekbaar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (percent * currentSong.duration) / 100;
    });
      
    //Add an event listner to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        hamburgerClick();
    });

    //Add an event listner to close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    });

    //Add an event Listner to previous
    previous.addEventListener("click", () => {
        let currentFile = currentSong.src.split("/").pop();
        let index = songs.indexOf(currentFile);

        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    //Add an evnt listner to next button
    next.addEventListener("click", () => {
        nextPlay();
    });


    //Add an Event Listner to volume
    document.querySelector(".range").value = 100;
    document.querySelector(".range").addEventListener("input", (e) => {
        console.log(e.target.value + "/100");
        currentSong.volume = (e.target.value) / 100;
    });

    //Add an event listner to mute the track
    document.querySelector(".volume > img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".range").value = 10;
        }
    })

};

main();
