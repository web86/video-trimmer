const { createFFmpeg, fetchFile } = FFmpeg;
// const ffmpeg = createFFmpeg({ log: false });
const ffmpeg = createFFmpeg({
  mainName: "main",
  corePath: "https://unpkg.com/@ffmpeg/core-st@0.11.1/dist/ffmpeg-core.js",
});
(async function () {
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }
})();

// Video src inputs
const elm = document.getElementById("uploader");
const el = document.getElementById("uploadlink");

// wrappers
const inputs = document.getElementById("inputs");
const video_container = document.querySelector(".custom-video-area");
const inputVideoArea = document.getElementById("input-video-area");
const background = document.querySelector(".start");
//   const backfround_box = document.querySelector('.background');

// info
const message = document.getElementById("message");
const oldDuration = document.querySelector("#oldDuration");
const newDuration = document.querySelector("#newDuration");
const link = document.getElementById("download");
const title = document.querySelector(".title");

// trim btns
const cleaning = document.getElementById("cleaning");
const start_trim = document.getElementById("trim");

// Video
const video = video_container.querySelector("#input-video");
const outputVideo = document.getElementById("output-video");
// Video Controls
const video_controls = video_container.querySelector(".video-controls");
const button_controls = video_container.querySelector(".bottom-wrapper");
const progress_bar = video_container.querySelector(".progress-bar");
const progress_bar_left = video_container.querySelector(".progress-bar-left");
const progress_left = video_container.querySelector(".time-bar-left");
const progress = video_container.querySelector(".time-bar");
const buffer_bar = video_container.querySelector(".buffer-bar");
const play_button = video_container.querySelector(".play-button");
const current = video_container.querySelector(".current");
const duration = video_container.querySelector(".duration");

const spinner = (text) => {
  message.innerHTML = `
            <div class="load">
                <div>${text}</div>
                <div class="sk-chase">
                  <div class="sk-chase-dot"></div>
                  <div class="sk-chase-dot"></div>
                  <div class="sk-chase-dot"></div>
                  <div class="sk-chase-dot"></div>
                  <div class="sk-chase-dot"></div>
                  <div class="sk-chase-dot"></div>
                </div>
            </div>`;
};
let startTime = 0;
let endTime = 0;

// Toggles play/pause for the video
function playVideo() {
  if (video.paused) {
    video.play();
    video_controls.classList.add("playing");
  } else {
    video.pause();
    video_controls.classList.remove("playing");
  }
}

function time_format(seconds) {
  var m =
    Math.floor(seconds / 60) < 10
      ? "0" + Math.floor(seconds / 60)
      : Math.floor(seconds / 60);
  var s =
    Math.floor(seconds - m * 60) < 10
      ? "0" + Math.floor(seconds - m * 60)
      : Math.floor(seconds - m * 60);
  return m + ":" + s;
}

function startBuffer() {
  if (video.buffered.length) {
    //  video.buffered.start(0);

    current_buffer = video.buffered.end(0);
    max_duration = video.duration;
    perc = (100 * current_buffer) / max_duration;
    // buffer_bar.css("width", perc + "%");
    buffer_bar.style.width = perc + "%";

    if (current_buffer < max_duration) {
      setTimeout(startBuffer, 500);
    }
  }
}

function updatebar(x) {
  // position = x - progress.offset().left;
  let offsetleft = progress.getBoundingClientRect().left + window.scrollX;
  position = x - offsetleft;

  percentage = (100 * position) / progress_bar.offsetWidth;
  if (percentage > 100) {
    percentage = 100;
  }
  if (percentage < 0) {
    percentage = 0;
  }
  progress.style.width = percentage + "%";
  video.currentTime = (video.duration * percentage) / 100;
  duration.textContent = time_format(video.currentTime);
  // запишем последний показатель времени конца
  endTime = video.currentTime;
  // console.log('endTime ', endTime);
}

function updatebar_left(x) {
  // position = x - progress.offset().left;
  let offsetleft = progress_left.getBoundingClientRect().left + window.scrollX;
  position = x - offsetleft;

  percentage = (100 * position) / progress_bar_left.offsetWidth;
  if (percentage > 100) {
    percentage = 100;
  }
  if (percentage < 0) {
    percentage = 0;
  }
  progress_left.style.width = percentage + "%";
  video.currentTime = (video.duration * percentage) / 100;

  current.textContent = time_format(video.currentTime);
  // запишем последний показатель времени начала
  startTime = video.currentTime;
  // console.log('startTime ', startTime);
}

video.addEventListener("loadedmetadata", function () {
  //   playVideo();
  //   video.pause();

  inputVideoArea.classList.remove("hide");
  message.innerHTML =
    "Укажите ползунком сколько секунд отрезать и нажмите кнопку 'Обрезать'";
  current.textContent = time_format(0);
  duration.textContent = time_format(video.duration);
  // updateVolume(0, 0.7);
  setTimeout(startBuffer, 150);

  // установим начальное значение правой границы
  progress.style.width = "95%";
  video.currentTime = (video.duration * 95) / 100;
  duration.textContent = time_format(video.currentTime);
  progress_left.style.width = "0";
  endTime = video.currentTime;
});

// Play/pause on video click
video.addEventListener("click", function () {
  playVideo();
});

// Video duration timer
//   video.addEventListener("timeupdate", function() {
//     current.textContent = time_format(video.currentTime);
//     duration.textContent = time_format(video.duration);
//     var currentPos = video.currentTime;
//     var maxduration = video.duration;
//     var perc = 100 * video.currentTime / video.duration;
//     // progress.style.width = perc + "%";

//   });

/* VIDEO CONTROLS
    		------------------------------------------------------- */

// Show button controls on hover
video_container.addEventListener("mouseover", function () {});

// Play/pause on button click
play_button.addEventListener("click", function () {
  playVideo();
});

// VIDEO PROGRESS BAR
//when video timebar clicked
var timeDrag = false; /* check for drag event */
var timeDragLeft = false; /* check for drag event */

getEvent = function () {
  return event.type.search("touch") !== -1 ? event.touches[0] : event;
  // p.s. event - аргумент по умолчанию в функции
};

const swipeStartRight = () => {
  let evt = getEvent();
  timeDrag = true;
  updatebar(evt.pageX);

  document.addEventListener("touchmove", swipeAction);
  document.addEventListener("mousemove", swipeAction);
  document.addEventListener("touchend", swipeEnd);
  document.addEventListener("mouseup", swipeEnd);
};

// двигаем ползунок
const swipeAction = () => {
  let evt = getEvent();

  if (timeDrag) {
    updatebar(evt.pageX);
  }
  if (timeDragLeft) {
    updatebar_left(evt.pageX);
  }
};
// Отпустили ползунок
const swipeEnd = () => {
  let evt = getEvent();

  if (timeDrag) {
    timeDrag = false;
    updatebar(evt.pageX);
  }
  if (timeDragLeft) {
    timeDragLeft = false;
    updatebar_left(evt.pageX);
  }
  // по завершению подчищаем слушатель
  document.removeEventListener("touchmove", swipeAction);
  document.removeEventListener("mousemove", swipeAction);
  document.removeEventListener("touchend", swipeEnd);
  document.removeEventListener("mouseup", swipeEnd);
};

const swipeStartLeft = () => {
  let evt = getEvent();
  timeDragLeft = true;
  updatebar_left(evt.pageX);

  document.addEventListener("touchmove", swipeAction);
  document.addEventListener("mousemove", swipeAction);
  document.addEventListener("touchend", swipeEnd);
  document.addEventListener("mouseup", swipeEnd);
};

// Слушаем праваую кнопку
progress_bar.addEventListener("touchstart", swipeStartRight);
progress_bar.addEventListener("mousedown", swipeStartRight);
// Слушаем левую кнопку
progress_bar_left.addEventListener("touchstart", swipeStartLeft);
progress_bar_left.addEventListener("mousedown", swipeStartLeft);

// Функция преобразования секунд в минуты
const convertTime = (seconds) => {
  let splitArr = [0, seconds];

  if (seconds.indexOf(":") !== -1) {
    splitArr = [];
    splitArr = seconds.split(":"); // -> ['2','30']
  }
  if (seconds.indexOf(",") !== -1) {
    splitArr = [];
    splitArr = seconds.split(",");
  }
  if (seconds.indexOf(".") !== -1) {
    splitArr = [];
    splitArr = seconds.split(".");
  }

  if (splitArr.length > 1) {
    seconds = parseInt(splitArr[0]) * 60 + parseInt(splitArr[1]);
    //   console.log(seconds);
  }
  return seconds;
};

// окно с выбором своих начала и конца видео
const timeChooseModal = document.querySelector(".time_choose.modal");
const setCustomTime = document.querySelector(".custom_time");
const openTimeModal = () => {
  timeChooseModal.classList.toggle("hide");
  setCustomTime.classList.toggle("opened");
};
setCustomTime.addEventListener("click", openTimeModal);

// получить кнопку "применить"
const applyTimeBtn = document.getElementById("apply_custom_time");
// добавить обработчик событий
applyTimeBtn.addEventListener("click", (e) => {
  e.preventDefault();
  // получить значение поля
  let endTimeBtn = convertTime(document.getElementById("custom_end").value);
  let startTimeBtn = convertTime(document.getElementById("custom_start").value);

  if (startTimeBtn > 0) {
    // получим процент от ширины бара
    let startProcent = (startTimeBtn * 100) / video.duration;
    // Переместим ползунок начала на эту ширину
    progress_left.style.width = startProcent + "%";
    //  Изменим надпись времени на табло
    current.textContent = time_format(startTimeBtn);
    //  данные для работы FFmpeg
    startTime = startTimeBtn;
  }

  if (endTimeBtn > 0) {
    // переместим кадр на указанную секунду
    video.currentTime = endTimeBtn;
    // playVideo();
    // получим процент от ширины бара
    let endProcent = (video.currentTime * 100) / video.duration;
    // передвинем ползунок
    progress.style.width = endProcent + "%";
    // напишем на табло время конца
    duration.textContent = time_format(video.currentTime);
    // закрыть модал окно
    timeChooseModal.classList.toggle("hide");
    setCustomTime.classList.toggle("opened");

    endTime = endTimeBtn;

    console.log("endTimeBtn: ", endTimeBtn);
    console.log("endProcent: ", endProcent);
  }
});
const cancel_modal = document.getElementById("cancel_modal");
// добавить обработчик событий
cancel_modal.addEventListener("click", (e) => {
  e.preventDefault();
  // закрыть модал окно
  timeChooseModal.classList.toggle("hide");
  setCustomTime.classList.toggle("opened");
});

const checkFile = () => {
  const fileType = elm.files[0].type;
  console.log(fileType);
  if (fileType.indexOf("video") !== -1) {
    croppe(elm.files[0]);
  } else {
    alert("Ошибка! Этот файл обработать нельзя, загрузите видео файл");
    return;
  }
};

const checkUrl = (e) => {
  e.preventDefault();

  // get the Link
  let weblink = document.getElementById("weblink").value;
  if (weblink === "") {
    alert("Ошибка, укажите ссылку");
    return;
  }
  if (weblink.indexOf(".mp4") !== -1 || weblink.indexOf(".mov") !== -1) {
    croppe(weblink);
    return;
  }
  fetchDataAsync(getJsonLink(weblink));
};

const croppe = async (weblink) => {
  console.log(weblink);
  inputs.classList.add("hide");
  title.classList.add("hide");
  background.classList.remove("start");
  // alert('Загружаю инструменты...');
  background.classList.add("loading");
  spinner("Загружаю инструменты...");

  let timerId = setInterval(async () => {
    if (!ffmpeg.isLoaded()) {
      console.log("Не загружен WASM");
    } else {
      clearInterval(timerId);
      console.log("Wasm загружен!");
      spinner("Загружаю видео...");
      try {
        const videofile = await FFmpeg.fetchFile(weblink);
        await ffmpeg.FS("writeFile", `myfile.mp4`, videofile);
        const origData = await ffmpeg.FS("readFile", "myfile.mp4");

        video.src = URL.createObjectURL(
          new Blob([origData.buffer], { type: "video/mp4" })
        );
        background.classList.remove("loading");
      } catch (e) {
        if (e instanceof TypeError) {
          message.innerHTML = "Упс.. Кажется указанная ссылка не рабочая";
        }
      }
    }
  }, 1000);
};

function cleanup() {
  // clean up
  URL.revokeObjectURL(video.src);
  URL.revokeObjectURL(outputVideo.src);
  ffmpeg.exit();
  location.reload();
}

// Listen to uploading file
elm.addEventListener("change", checkFile);
// Listen to click download & trim
el.addEventListener("click", checkUrl);
// Listen to clean up
cleaning.addEventListener("click", cleanup);
// Listen button to start trimming
start_trim.addEventListener("click", async function () {
  inputVideoArea.classList.add("hide");
  background.classList.add("loading");
  spinner("Начинаю обрезку...");

  startTime = Math.floor(startTime);
  endTime = Math.floor(endTime);
  console.log(startTime, endTime);
  oldDuration.innerText = `Длительность до обрезки: ${time_format(
    Math.floor(video.duration)
  )} мин`;
  newDuration.innerText = `Длительность после обрезки: ${time_format(
    endTime - startTime
  )} мин`;

  // cut and copy the result to output.mp4
  await ffmpeg.run(
    "-i",
    "myfile.mp4",
    "-ss",
    `${startTime}`,
    "-to",
    `${endTime}`,
    "-c",
    "copy",
    "output.mp4"
  );
  background.classList.remove("loading");
  message.innerHTML = "Обрезка завершена!";
  const data = await ffmpeg.FS("readFile", "output.mp4");
  //Create a link for the received video
  outputVideo.src = URL.createObjectURL(
    new Blob([data.buffer], { type: "video/mp4" })
  );
  outputVideo.classList.add("show");
  link.download = "video.mp4"; // Let's set the name of the video file
  link.href = outputVideo.src;
  link.innerText = link.download;
  link.click();
  cleaning.innerHTML = "<button>Очистить и обрезать новое видео</button>";
  el.value = "";

  ffmpeg.FS("unlink", "myfile.mp4");
  ffmpeg.FS("unlink", "output.mp4");
  // console.log(ffmpeg.FS('readdir', '/'));
});

// -------------------------------------------
// Преобразование ссылок из Library в MP4
// -------------------------------------------

const modal = document.querySelector(".quality_choose.modal");
const selectQuality = document.querySelector(".selectQuality");

let jsonFormat = 0; // формат json будет 0 или 1

function getJsonLink(link) {
  const searchParams = new URLSearchParams(link);
  let lank = searchParams.get("lank"); // вернет строку pub-nwtsv_10_VIDEO
  let lang = searchParams.get("wtlocale");
  // 1) Условие: если начинается с "docid" то https://b.jw-cdn.org/apis/pub-media/GETPUBMEDIALINKS?docid=502017181&output=json&fileformat=mp4%2Cmp3&alllangs=0&track=1&langwritten=U&txtCMSLang=U
  // 2) Условие: если начинается с "pub-jw" или "pub-mw" то https://b.jw-cdn.org/apis/mediator/v1/media-items/U/pub-jwb-087_1_VIDEO?clientType=www
  // 3) В остальных случаях:
  // https://b.jw-cdn.org/apis/pub-media/GETPUBMEDIALINKS?output=json&pub=sjjm&fileformat=m4v%2Cmp4%2C3gp%2Cmp3&alllangs=0&track=1&langwritten=U&txtCMSLang=U

  if (lank.indexOf("docid", 0) !== -1) {
    jsonFormat = 1; // изменим формат json
    lankArr = lank.split("_"); // Получим ['docid-502017181', '1', 'VIDEO']
    lankArrFirst = lankArr[0].replace("-", "="); // Получим 'docid=502017181'
    return {
      url: `https://b.jw-cdn.org/apis/pub-media/GETPUBMEDIALINKS?${lankArrFirst}&output=json&fileformat=mp4%2Cmp3&alllangs=0&track=${lankArr[1]}&langwritten=${lang}&txtCMSLang=${lang}`,
      lang: `${lang}`,
    };
  }
  if (lank.indexOf("pub-jw", 0) !== -1 || lank.indexOf("pub-mw", 0) !== -1) {
    return {
      url: `https://b.jw-cdn.org/apis/mediator/v1/media-items/${lang}/${lank}?clientType=www`,
      lang: `${lang}`,
    };
  }
  jsonFormat = 1; // изменим формат json
  lankArr = lank.split("_"); // Получим ['pub-sjjm', '1', 'VIDEO']
  lankArrFirst = lankArr[0].replace("-", "="); // Получим 'pub=sjjm'
  return {
    url: `https://b.jw-cdn.org/apis/pub-media/GETPUBMEDIALINKS?output=json&${lankArrFirst}&fileformat=m4v%2Cmp4%2C3gp%2Cmp3&alllangs=0&track=${lankArr[1]}&langwritten=${lang}&txtCMSLang=${lang}`,
    lang: `${lang}`,
  };
}
//Пример ссылки из Library

// let linkFromLibrary = "https://www.jw.org/finder?srcid=jwlshare&wtlocale=U&lank=pub-jwb-084_5_VIDEO";
// let linkFromLibrary2 = "https://www.jw.org/finder?srcid=jwlshare&wtlocale=U&lank=pub-osg_73_VIDEO";
// let linkFromLibrary3 = "https://www.jw.org/finder?srcid=jwlshare&wtlocale=U&lank=docid-502018215_1_VIDEO";
//   https://www.jw.org/finder?srcid=jwlshare&wtlocale=CHS&lank=pub-ebtv_103_VIDEO
// Проверка получения ссылки на json
// console.log(linkFromLibrary);
// console.log(getJsonLink(linkFromLibrary));
// console.log(getJsonLink(linkFromLibrary2));
// console.log(getJsonLink(linkFromLibrary3));

async function fetchDataAsync(link_obj) {
  const response = await fetch(link_obj.url, { cache: "no-store" });
  if (response.ok) {
    const content = await response.json();
    // console.log(content);
    // console.log(jsonFormat);
    if (jsonFormat < 1) {
      // console.log(content.media[0].files[0].progressiveDownloadURL);
      buildSelectQuaolity(content.media[0].files);
      selectQuality.addEventListener("click", (e) => {
        if (e.target.getAttribute("data-qual")) {
          console.log(e.target.getAttribute("data-qual"));
          console.log(
            content.media[0].files[`${e.target.getAttribute("data-qual")}`]
              .progressiveDownloadURL
          );
          modal.classList.add("hide"); // Скроем модальное окно
          croppe(
            content.media[0].files[`${e.target.getAttribute("data-qual")}`]
              .progressiveDownloadURL
          );
        }
      });
      // croppe(e, content.media[0].files[0].progressiveDownloadURL);
    }
    if (jsonFormat > 0) {
      // var key = 'lang';
      // alert( link_obj[key] );
      // console.log(content.files[`${link_obj.lang}`].MP4');

      buildSelectQuaolity(content.files[`${link_obj.lang}`].MP4);
      selectQuality.addEventListener("click", (e) => {
        if (e.target.getAttribute("data-qual")) {
          // console.log(e.target.getAttribute('data-qual'));
          // console.log(content.files.${link_obj.lang}`.MP4[`${e.target.getAttribute('data-qual')}`].file.url);
          modal.classList.add("hide"); // Скроем модальное окно
          croppe(
            content.files[`${link_obj.lang}`].MP4[
              `${e.target.getAttribute("data-qual")}`
            ].file.url
          );
        }
      });
      // console.log(content.files.U.MP4[0].file.url);
      // croppe(e, content.files.U.MP4[0].file.url);
    }
  } else {
    alert("Ошибка: " + response.status);
  }
}

function buildSelectQuaolity(obj) {
  modal.classList.remove("hide"); // показываем модальное окно

  obj.forEach((item, i) => {
    let span = document.createElement("span");
    span.setAttribute("data-qual", i);
    let filesize = item.filesize / 1024 / 1024;
    span.innerHTML = `${item.label} (${filesize.toFixed(2)}Mb)`;
    selectQuality.append(span);
  });
  console.log(obj.length);
}
