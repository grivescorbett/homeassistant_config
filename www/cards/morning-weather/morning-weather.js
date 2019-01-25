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
    this._config = config;
  }

  render() {
    if (!this._config || !this.hass) {
      return html``;
    }

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

    const next_rising = new Date(
      this.hass.states["sun.sun"].attributes.next_rising
    );
    const next_setting = new Date(
      this.hass.states["sun.sun"].attributes.next_setting
    );

    return html`
      ${this.renderStyle()}
      <ha-card class="morning-weather">
        <div class="current-stats">

        </div>
        <div class="mta">
          
        </div>
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
      </ha-card>
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

  renderStyle() {
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
