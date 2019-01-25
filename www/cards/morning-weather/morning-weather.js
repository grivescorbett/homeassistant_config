const LitElement = Object.getPrototypeOf(
  customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;

function hasConfigOrEntityChanged(element, changedProps) {
  if (changedProps.has("_config")) {
    return true;
  }

  const oldHass = changedProps.get("hass");
  if (oldHass) {
    return (
      oldHass.states[element._config.entity] !==
        element.hass.states[element._config.entity] ||
      oldHass.states["sun.sun"] !== element.hass.states["sun.sun"]
    );
  }

  return true;
}

const weatherIconsDay = {
  clear: "039-sun", 
  "clear-night": "022-night-3",
cloudy: "001-cloud", 
  fog: "001-cloud", 
  hail: "005-hail",
  lightning: "013-storm-2",
  "lightning-rainy": "013-storm-2",
  partlycloudy: "038-cloudy-3",
  pouring: "034-cloudy-1",
  rainy: "034-cloudy-1",
  snowy: "012-snowy-1",
  "snowy-rainy": "012-snowy-1",
  sunny: "039-sun",
  windy: "050-windy-3",
  "windy-variant": "050-windy-3",
  exceptional: "049-windy-2"
};

const weatherIconsNight = {
  ...weatherIconsDay,
  clear: "022-night-3",
  sunny: "022-night-3",
  partlycloudy: "007-night",
  "windy-variant": "007-night"
};

class MorningWeather extends LitElement {
  static get properties() {
    return {
      _config: {},
      hass: {}
    };
  }

  static getStubConfig() {
    return {};
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("Please define a weather entity");
    }
    if (!config.mta) {
      throw new Error("Please provide an mta sensor");
    }
    this._config = config;
  }

  render() {
    if (!this._config || !this.hass) {
      return html``;
    }



    // const next_rising = new Date(
    //   this.hass.states["sun.sun"].attributes.next_rising
    // );
    // const next_setting = new Date(
    //   this.hass.states["sun.sun"].attributes.next_setting
    // );

    return html`
      <ha-card class="morning-weather">
        <div class="top-strip">
          <div style="width: 35%; flex-grow: 1;"></div>
          ${this.renderCurrent()}
          ${this.renderMta()}
        </div>
        ${this.renderWeather()}
      </ha-card>
    `;
  }

  renderCurrent() {
    const stateObj = this.hass.states[this._config.entity];

    return html`
      ${this.renderCurrentStyle()}
      <div class="current-stats">
        <div class="current-time">
          8:15<span class="current-ampm">am</span>
        </div>
        <div class="weather-overview">
          <span class="currently-text">currently</span>
          <span class="currently-temp">${Math.round(stateObj.attributes.temperature)}</span>
          <div>
            <span>10</span>
            <span>50</span>
          </div>
        </div>
      </div>
    `;
  }

  renderCurrentStyle() {
    return html`
    <style>
      .top-strip {
        display: flex;
        align-items: center;
      }

      .weather-overview {
        display: flex;
        flex-direction: column;
      }

      .currently-text {
        font-size: 50px;
        font-weight: 100;
      }

      .currently-temp {
        font-size: 80px;
        font-weight: 200;
      }

      .currently-temp::after {
        content: "°"
      }

      .current-stats {
        width: 33%;
        text-align: center;
      }

      .current-time {
        font-size: 140px;
        font-weight: 200;
      }

      .current-ampm {
        font-size: 100px
      }
    </style>
    `;
  }

  renderMta() {
    let subways = Object.keys(this.hass.states).filter(key => key.startsWith('sensor.mta_subway'));
    subways.sort();

    return html`
        ${this.renderMtaStyle()}
        <div class="mta">
          ${
            subways.map(
              subway_key => {
                const subway_sensor = this.hass.states[subway_key]

                //last_updated not on attributes

                return html`
                  <div class="train">
                    <div class="icon-container">
                      <img class="train-icon" src="${subway_sensor.attributes.entity_picture}" />
                    </div>
                    <div class="status-container">
                      <span class="subway-status">${subway_sensor.state}</span>
                    </div>
                  </div>
                `;
              }
            )
          }
        </div>
    `;
  }

  renderMtaStyle() {
    return html`
    <style>
      .mta {
        display: flex;
        flex-direction: column;
        width: 33%;
        flex-grow: 1;
      }

      .train {
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      .status-container {
        margin-left: 70px;
      }

      .subway-status {
        font-size: 40px;
        font-weight: 300;
      }

      .train-icon {
        width: 50px;
        height: 50px;
      }
    </style>
    `;
  }

  renderWeather() {
    const stateObj = this.hass.states[this._config.entity];

    if (!stateObj) {
      return html`
        <style>
          .not-found {
            flex: 1;
            background-color: yellow;
            padding: 8px;
          }
        </style>
        <ha-card>
          <div class="not-found">
            Entity not available: ${this._config.entity}
          </div>
        </ha-card>
      `;
    }

    return html`
      ${this.renderWeatherStyle()}
      <div class="hourly-container">
        ${
          stateObj.attributes.forecast.slice(0, 12).map(
            hourly => html `
              <div class="hourly">
                <span>${this.renderTime(hourly.datetime)}</span>
                <span>
                  <div>
                    <img class="condition-icon" src="${this.getWeatherIcon(hourly.condition, this.hass.states["sun.sun"].state)}" />
                  </div>
                </span>
                <span class="temperature">${hourly.temperature}</span>
              </div>
            `
          )
        }
      </div>
    `;
  }

  getWeatherIcon(condition, sun) {
    return `${
      this._config.icons
    }${
      sun && sun == 'below_horizon'
        ? weatherIconsNight[condition]
        : weatherIconsDay[condition]
    }.svg`;
  }

  renderTime(datetime) {
    var timeString = new Date(datetime).toLocaleTimeString();
    var hour = timeString.split(':')[0];
    var ampm = timeString.split(' ')[1].toLowerCase();
    return html`
      <span class="weather-hour">${hour}<span class="weather-ampm">${ampm}</span></span>
    `;
  }

  renderWeatherStyle() {
    return html`
    <style>
      .morning-weather {

      }

      .hourly-container {
        display: flex;
      }

      .hourly {
        flex-grow: 1;
        text-align: center;
        box-shadow: var(--paper-material-elevation-1_-_box-shadow);
        margin: 15px;
      }

      .condition-icon {
        width: 60px;
        height: 60px;
      }

      .weather-hour {
        font-size: 73px;
        font-weight: 200;
      }

      .weather-ampm {
        font-size: 40px;
      }

      .temperature {
        font-size: 73px;
        font-weight: 200;
      }

      .temperature::after {
        content: "°";
      }
    </style>
    `;
  }
}

customElements.define('morning-weather-card', MorningWeather);
