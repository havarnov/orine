import './style.css';

import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import Style from 'ol/style/Style.js';
import Icon from 'ol/style/Icon.js';
import {MVT} from "ol/format";
import {ImageTile, TileDebug} from "ol/source";
import {Control} from "ol/control";
import {defaults as defaultControls} from 'ol/control/defaults.js';
import Geolocation from 'ol/Geolocation.js';
import {Point} from "ol/geom";
import {Feature} from "ol";
import CircleStyle from "ol/style/Circle";
import {Fill, Stroke} from "ol/style";
import {toLonLat} from "ol/proj";

class ToggleControl extends Control {
  /**
   * @param {Object} [opt_options] Control options.
   */
  constructor(icon, className, onClick, opt_options) {
    const options = opt_options || {};

    const button = document.createElement('button');
    button.innerHTML = icon;

    const element = document.createElement('div');
    element.className = `${className} ol-unselectable ol-control`;
    element.appendChild(button);

    super({
      element: element,
      target: options.target,
    });

    this.onClick = onClick;

    button.addEventListener('click', this.handleClick.bind(this), false);
  }

  handleClick() {
    this.onClick(this);
  }
}

const info = document.getElementById('info');

const view = new View({
  projection: 'EPSG:3857',
  center: [1152058.890314, 8033837.420885],
  zoom: 8,
});

const source = new VectorTileSource({
  format: new MVT(),
  tileUrlFunction: (tileCoord) => `https://gfstileserver.fly.dev/tiles/gfs/${new Date().toISOString()}/wind/M10/${tileCoord[1]}/${tileCoord[2]}/${tileCoord[0]}`,
  tileSize: 100,
  projection: 'EPSG:3857',
});

const windLayer = new VectorTileLayer({
  source: source,
  visible: false,
  style: function (feature) {
    const properties = feature.getProperties();
    const windSpeed = Math.sqrt(properties.u * properties.u + properties.v * properties.v);
    const name = metersPerSecondToKnotsString(windSpeed);
    return new Style({
      image: new Icon({
        opacity: 1,
        src: `svgs/${name}.svg`, // 'data:image/svg+xml;utf8,' + svg,
        scale: 100, // Start with a scale of 1 and adjust as needed
        rotation: Math.PI - Math.atan2(properties.v, properties.u) + (Math.PI/2) + view.getRotation(), // properties.direction/Math.PI,
      })
    });
  },
});

const osmLayer = new TileLayer({
  source: new OSM(),
  maxZoom: 7,
});

const eniroLayer = new TileLayer({
  source: new ImageTile({
    url: 'https://map02.eniro.com/geowebcache/service/tms1.0.0/nautical2x/{z}/{x}/{-y}.png',
  }),
  minZoom: 7,
});

const toggleWindControl = new ToggleControl(
    '<img src="svgs/wind.svg" />',
    'toggle-wind',
    (e) => {
      if (windLayer.getVisible()) {
        osmLayer.setOpacity(1);
        eniroLayer.setOpacity(1);
        windLayer.setVisible(false);
        e.element.childNodes[0].childNodes[0].className = '';
        info.style.visibility = 'hidden';
      } else {
        osmLayer.setOpacity(0.3);
        eniroLayer.setOpacity(0.3);
        windLayer.setVisible(true);
        e.element.childNodes[0].childNodes[0].className = 'active';
      }
    });

const geolocation = new Geolocation({
  // enableHighAccuracy must be set to true to have the heading value.
  trackingOptions: {
    enableHighAccuracy: true,
  },
  projection: view.getProjection(),
});

// handle geolocation error.
geolocation.on('error', function (error) {
  const info = document.getElementById('info');
  info.innerHTML = error.message;
  info.style.display = '';
});

const accuracyFeature = new Feature();
geolocation.on('change:accuracyGeometry', function () {
  accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
});

const positionFeature = new Feature();
positionFeature.setStyle(
    new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({
          color: '#3399CC',
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 2,
        }),
      }),
    }),
);

let tracking = false;

geolocation.on('change:position', function () {
  const coordinates = geolocation.getPosition();
  positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
  if (tracking) {
    view.setCenter(coordinates);
  }
});

const locationLayer = new VectorLayer({
  source: new VectorSource({
    features: [accuracyFeature, positionFeature],
  }),
});

const toggleTrackControl = new ToggleControl(
    '<img src="svgs/crosshair.svg" style="width: 100%; object-fit: cover;" />',
    'toggle-track-location',
    e => {
      geolocation.setTracking(true);
      tracking = !tracking;
      e.element.childNodes[0].childNodes[0].className = tracking ? 'active' : '';
    });

const map = new Map({
  target: 'map',
  controls: defaultControls().extend([toggleWindControl, toggleTrackControl]),
  layers: [
    // new TileLayer({
    //     source: new TileDebug({
    //         source: source,
    //     }),
    // }),
    osmLayer,
    eniroLayer,
    windLayer,
    locationLayer,
  ],
  view: view,
});

function metersPerSecondToKnotsString(metersPerSecond) {
  const knots = metersPerSecond * 1.94384;

  if (knots >= 0 && knots < 2) {
    return "0";
  } else if (knots >= 2 && knots < 5) {
    return "2";
  } else if (knots >= 5 && knots < 10) {
    return "5";
  } else if (knots >= 10 && knots < 15) {
    return "10";
  } else if (knots >= 15 && knots < 20) {
    return "15";
  } else if (knots >= 20 && knots < 25) {
    return "20";
  } else if (knots >= 25 && knots < 30) {
    return "25";
  } else if (knots >= 30 && knots < 35) {
    return "30";
  } else if (knots >= 35 && knots < 40) {
    return "35";
  } else if (knots >= 40 && knots < 45) {
    return "40";
  } else if (knots >= 45 && knots < 50) {
    return "45";
  } else if (knots >= 50 && knots < 55) {
    return "50";
  } else if (knots >= 55 && knots < 60) {
    return "55";
  } else if (knots >= 60 && knots < 65) {
    return "60";
  } else if (knots >= 65 && knots < 70) {
    return "65";
  } else if (knots >= 70 && knots < 75) {
    return "70";
  } else if (knots >= 75 && knots < 80) {
    return "75";
  } else if (knots >= 80 && knots < 85) {
    return "80";
  } else if (knots >= 85 && knots < 90) {
    return "85";
  } else if (knots >= 90 && knots < 95) {
    return "90";
  } else if (knots >= 95 && knots < 100) {
    return "95";
  } else if (knots >= 100 && knots < 105) {
    return "100";
  } else if (knots >= 105 && knots < 110) {
    return "105";
  } else if (knots >= 110 && knots < 115) {
    return "110";
  } else if (knots >= 115 && knots < 120) {
    return "115";
  } else if (knots >= 120 && knots < 125) {
    return "120";
  } else if (knots >= 125 && knots < 130) {
    return "125";
  } else if (knots >= 130 && knots < 135) {
    return "130";
  } else if (knots >= 135 && knots < 140) {
    return "135";
  } else if (knots >= 140 && knots < 145) {
    return "140";
  } else if (knots >= 145 && knots < 150) {
    return "145";
  } else if (knots >= 150 && knots < 155) {
    return "150";
  } else if (knots >= 155 && knots < 160) {
    return "155";
  } else if (knots >= 160 && knots < 165) {
    return "160";
  } else if (knots >= 165 && knots < 170) {
    return "165";
  } else if (knots >= 170 && knots < 175) {
    return "170";
  } else if (knots >= 175 && knots < 180) {
    return "175";
  } else if (knots >= 180 && knots < 185) {
    return "180";
  } else if (knots >= 185 && knots < 190) {
    return "185";
  } else {
    return "190";
  }
}


map.addEventListener('movestart', function(e) {
  info.style.visibility = 'hidden';
})

map.addEventListener('click', async function (evt) {
  info.style.visibility = 'hidden';

  if (!windLayer.getVisible())
  {
    return;
  }

  const point = map.getCoordinateFromPixel(evt.pixel);
  const lonLat = toLonLat(point);

  const response = await fetch(`https://gfstileserver.fly.dev/position/gfs/${new Date().toISOString()}/wind/M10/${lonLat[1]}/${lonLat[0]}`);
  const data = await response.json();

  info.style.left = evt.pixel[0] + 'px';
  info.style.top = evt.pixel[1] + 'px';
  info.style.visibility = 'visible';

  const u = data.u;
  const v = data.v;
  const speed = Math.sqrt(u * u + v * v);
  const rad = Math.PI - Math.atan2(v, u) + (Math.PI / 2);
  const angle = rad * (180 / Math.PI);
  const adj = (angle + 360) % 360;
  info.innerText = speed.toFixed(2) + 'm/s @' + adj.toFixed(1) + '°';
});
