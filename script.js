/* Designed by: Jarlan Perez */
const h = document.querySelector("#h");
const b = document.body;

let base = (e) => {
  var x = e.pageX / window.innerWidth - 0.5;
  var y = e.pageY / window.innerHeight - 0.5;
  h.style.transform = `
        perspective(90vw)
        rotateX(${y * 10 + 75}deg)
        rotateZ(${-x * 25 + 45}deg)
        translateZ(-9vw)
    `;
};

b.addEventListener("pointermove", base);

const theSwitch = document.getElementById("the_switch");
const tvSwitch = document.getElementById("tv_switch");

let configLed = null,
  newStatusLed = null,
  actions = [],
  tvActionOn = null,
  tvActionOff = null;

const eraWidget = new EraWidget();
eraWidget.init({
  needRealtimeConfigs: true,
  needHistoryConfigs: true,
  needActions: true,
  maxRealtimeConfigsCount: 2,
  maxHistoryConfigsCount: 2,
  maxActionsCount: 5,
  minRealtimeConfigsCount: 2,
  minHistoryConfigsCount: 0,
  minActionsCount: 2,
  mobileHeight: 600,

  onConfiguration: (config) => {
    configTemp = config.realtime_configs[0];
    configHumi = config.realtime_configs[1];
    actions = config.actions;

    // Tìm hành động TV qua GPIO 2
    config.actions.forEach((action) => {
      if (action.gpio === 2 && action.type === "gpio") {
        if (action.name?.toLowerCase().includes("on")) tvActionOn = action;
        if (action.name?.toLowerCase().includes("off")) tvActionOff = action;
      }
    });

    console.log("📥 ESP32 cấu hình xong:", config);
  },

  onValues: (values) => {
    if (window.configTemp && window.configHumi) {
      let temperature = values[window.configTemp.id]?.value ?? "N/A";
      let humidity = values[window.configHumi.id]?.value ?? "N/A";

      updateHumidity(humidity);
      updateTemperature(temperature);
    }
  },
});

function updateTemperature(temperature) {
  const el = document.getElementById("temperatureValue");
  if (el) el.innerText = `${temperature}°C`;
}

function updateHumidity(humidity) {
  const el = document.getElementById("humidityValue");
  if (el) el.innerText = `${humidity}%`;
}

// Bật/Tắt đèn
if (theSwitch) {
  theSwitch.addEventListener("click", () => {
    if (newStatusLed === 1) {
      eraWidget.triggerAction(actions[1]?.action, null);
    } else {
      eraWidget.triggerAction(actions[0]?.action, null);
    }
  });
}

// Bật/Tắt TV qua GPIO 2
if (tvSwitch) {
  tvSwitch.addEventListener("change", () => {
    const isOn = tvSwitch.checked;
    if (isOn && tvActionOn) {
      eraWidget.triggerAction(tvActionOn.action, null);
      document.getElementById("tv-video").style.display = "block";
    } else if (!isOn && tvActionOff) {
      eraWidget.triggerAction(tvActionOff.action, null);
      document.getElementById("tv-video").style.display = "none";
    }
  });
}
