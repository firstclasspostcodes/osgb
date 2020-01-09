/* eslint-disable no-mixed-operators */
const OSGB = require('./osgb');
const GeoMath = require('./math');
const Irish = require('./irish');

module.exports = class WGS84 {
  constructor() {
    this.latitude = 0;
    this.longitude = 0;
  }

  setDegrees(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  parseString(text) {
    let ok = false;

    const str = String(text);

    // N 51° 53.947 W 000° 10.018

    const pattern = /([ns])\s*(\d+)[°\s]+(\d+\.\d+)\s+([we])\s*(\d+)[°\s]+(\d+\.\d+)/i;

    const matches = str.match(pattern);

    if (matches) {
      ok = true;

      const latsign = (matches[1] === 's' || matches[1] === 'S') ? -1 : 1;
      const longsign = (matches[4] === 'w' || matches[4] === 'W') ? -1 : 1;

      const d1 = parseFloat(matches[2]);
      const m1 = parseFloat(matches[3]);
      const d2 = parseFloat(matches[5]);
      const m2 = parseFloat(matches[6]);

      this.latitude = latsign * (d1 + (m1 / 60.0));
      this.longitude = longsign * (d2 + (m2 / 60.0));
    }

    return ok;
  }

  isGreatBritain() {
    return this.latitude > 49
      && this.latitude < 62
      && this.longitude > -9.5
      && this.longitude < 2.3;
  }

  isIreland() {
    return this.latitude > 51.2
      && this.latitude < 55.73
      && this.longitude > -12.2
      && this.longitude < -4.8;
  }

  isIreland2() {
    // rough border for ireland
    const points = [
      [-12.19, 50.38],
      [-6.39, 50.94],
      [-5.07, 53.71],
      [-5.25, 54.71],
      [-6.13, 55.42],
      [-10.65, 56.15],
      [-12.19, 50.38],
    ];

    // === A method for testing if a point is inside a polygon
    // === Returns true if poly contains point
    // === Algorithm shamelessly stolen from http://alienryderflex.com/polygon/
    let j = 0;

    let oddNodes = false;

    const x = this.longitude;
    const y = this.latitude;

    for (let i = 0; i < points.length; i += 1) {
      j += 1;

      if (j === points.length) {
        j = 0;
      }

      if (((points[i][1] < y) && (points[j][1] >= y))
          || ((points[j][1] < y) && (points[i][1] >= y))) {
        if (points[i][0] + (y - points[i][1])
            / (points[j][1] - points[i][1])
            * (points[j][0] - points[i][0]) < x) {
          oddNodes = !oddNodes;
        }
      }
    }

    return oddNodes;
  }


  getIrish(uselevel2) {
    const irish = new Irish();

    if (!this.isIreland()) {
      irish.setError('Coordinate not within Ireland');
      return irish;
    }

    const height = 0;

    let latitude2 = this.latitude;
    let longitude2 = this.longitude;

    if (uselevel2) {
      const x1 = GeoMath.LatLngHeightToCartesianX(
        this.latitude,
        this.longitude,
        height,
        6378137.00,
        6356752.313,
      );

      const y1 = GeoMath.LatLngHeightToCartesianY(
        this.latitude,
        this.longitude,
        height,
        6378137.00,
        6356752.313,
      );

      const z1 = GeoMath.LatHeightToCartesianZ(this.latitude, height, 6378137.00, 6356752.313);

      const x2 = GeoMath.HelmertX(x1, y1, z1, -482.53, -0.214, -0.631, -8.15);
      const y2 = GeoMath.HelmertY(x1, y1, z1, 130.596, -1.042, -0.631, -8.15);
      const z2 = GeoMath.HelmertZ(x1, y1, z1, -564.557, -1.042, -0.214, -8.15);

      latitude2 = GeoMath.CartesianXYZToLat(x2, y2, z2, 6377340.189, 6356034.447);
      longitude2 = GeoMath.XYZToLng(x2, y2);
    }

    let e = GeoMath.LatLngToEasting(
      latitude2,
      longitude2,
      6377340.189,
      6356034.447,
      200000,
      1.000035,
      53.50000,
      -8.00000,
    );

    let n = GeoMath.LatLngToNorthing(
      latitude2,
      longitude2,
      6377340.189,
      6356034.447,
      200000,
      250000,
      1.000035,
      53.50000,
      -8.00000,
    );

    if (!uselevel2) {
      // Level 1 Transformation - 95% of points within 2 metres
      // fixed datum shift correction (instead of fancy hermert translation above!)
      // source http://www.osni.gov.uk/downloads/Making%20maps%20GPS%20compatible.pdf
      e += 49;
      n -= 23.4;
    }

    irish.setGridCoordinates(Math.round(e), Math.round(n));

    return irish;
  }

  getOSGB() {
    const osgb = new OSGB();

    if (!this.isGreatBritain()) {
      osgb.setError('Coordinate not within Great Britain');
      return osgb;
    }

    const height = 0;

    const x1 = GeoMath.LatLngHeightToCartesianX(
      this.latitude,
      this.longitude,
      height,
      6378137.00,
      6356752.313,
    );

    const y1 = GeoMath.LatLngHeightToCartesianY(
      this.latitude,
      this.longitude,
      height,
      6378137.00,
      6356752.313,
    );

    const z1 = GeoMath.LatHeightToCartesianZ(this.latitude, height, 6378137.00, 6356752.313);

    const x2 = GeoMath.HelmertX(x1, y1, z1, -446.448, -0.2470, -0.8421, 20.4894);
    const y2 = GeoMath.HelmertY(x1, y1, z1, 125.157, -0.1502, -0.8421, 20.4894);
    const z2 = GeoMath.HelmertZ(x1, y1, z1, -542.060, -0.1502, -0.2470, 20.4894);

    const latitude2 = GeoMath.CartesianXYZToLat(x2, y2, z2, 6377563.396, 6356256.910);
    const longitude2 = GeoMath.XYZToLng(x2, y2);

    const e = GeoMath.LatLngToEasting(
      latitude2,
      longitude2,
      6377563.396,
      6356256.910,
      400000,
      0.999601272,
      49.00000,
      -2.00000,
    );

    const n = GeoMath.LatLngToNorthing(
      latitude2,
      longitude2,
      6377563.396,
      6356256.910,
      400000,
      -100000,
      0.999601272,
      49.00000,
      -2.00000,
    );

    osgb.setGridCoordinates(Math.round(e), Math.round(n));

    return osgb;
  }
};
