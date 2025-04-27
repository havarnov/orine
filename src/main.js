import './style.css';
import './barbs/0.svg';

import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import Style from 'ol/style/Style.js';
import Icon from 'ol/style/Icon.js';
import {MVT} from "ol/format";
import {ImageTile, TileDebug} from "ol/source";


const source = new VectorTileSource({
  format: new MVT(),
  url: `https://gfstileserver.fly.dev/tiles/gfs/${new Date().toISOString()}/wind/M10/{x}/{y}/{z}`,
  tileSize: 128,
  projection: 'EPSG:3857',
});

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(),
      maxZoom: 7,
    }),
    new TileLayer({
      source: new ImageTile({
        url: 'https://map02.eniro.com/geowebcache/service/tms1.0.0/nautical2x/{z}/{x}/{-y}.png',
      }),
      minZoom: 7,
    }),
    // new TileLayer({
    //     source: new TileDebug({
    //         source: source,
    //     }),
    // }),
    new VectorTileLayer({
      source: source,
      style: function (feature) {
        const properties = feature.getProperties();
        const windSpeed = Math.sqrt(properties.u * properties.u + properties.v * properties.v);
        const name = metersPerSecondToKnotsString(windSpeed);
        return new Style({
          image: new Icon({
            opacity: 1,
            src: `barbs/${name}.svg`, // 'data:image/svg+xml;utf8,' + svg,
            scale: 100, // Start with a scale of 1 and adjust as needed
            rotation: Math.PI - Math.atan2(properties.v, properties.u) + (Math.PI/2), // properties.direction/Math.PI,
          })
        });
      },
    }),
  ],
  view: new View({
    projection: 'EPSG:3857',
    center: [1152058.890314, 8033837.420885],
    zoom: 8,
  })
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

const info = document.getElementById('info');

let currentFeature;
const displayFeatureInfo = function (pixel, target) {
  const feature = target.closest('.ol-control')
      ? undefined
      : map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
      });
  if (feature) {
    info.style.left = pixel[0] + 'px';
    info.style.top = pixel[1] + 'px';
    if (feature !== currentFeature) {
      info.style.visibility = 'visible';
      const u = feature.get('u');
      const v = feature.get('v');
      const speed = Math.sqrt(u * u + v * v);
      const rad = Math.PI - Math.atan2(v, u) + (Math.PI/2);
      const angle = rad * (180 / Math.PI);
      const adj = (angle + 360) % 360;
      info.innerText = speed.toFixed(2) + 'm/s @' + adj.toFixed(1) + '°'; // + ` (${u},${v},${Math.atan2(v, u)})`;
    }
  } else {
    info.style.visibility = 'hidden';
  }
  currentFeature = feature;
};

map.on('pointermove', function (evt) {
  if (evt.dragging) {
    info.style.visibility = 'hidden';
    currentFeature = undefined;
    return;
  }
  displayFeatureInfo(evt.pixel, evt.originalEvent.target);
});

map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel, evt.originalEvent.target);
});

map.getTargetElement().addEventListener('pointerleave', function () {
  currentFeature = undefined;
  info.style.visibility = 'hidden';
});
