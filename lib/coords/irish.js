const GeoMath = require('./math');
const WGS84 = require('./wgs84');

module.exports = class Irish {
  constructor() {
    this.northings = 0;
    this.eastings = 0;
    this.status = 'Undefined';
  }

  setGridCoordinates(eastings, northings) {
    this.northings = northings;
    this.eastings = eastings;
    this.status = 'OK';
  }

  setError(msg) {
    this.status = msg;
  }

  static zeropad(num, len) {
    let str = String(num);
    while (str.length < len) {
      str = `0${str}`;
    }
    return str;
  }

  getGridRef(num) {
    let precision = num;

    if (precision < 0) {
      precision = 0;
    }

    if (precision > 5) {
      precision = 5;
    }

    let e = '';

    let n = '';

    let prefix = '';

    if (precision > 0) {
      const y = Math.floor(this.northings / 100000);
      const x = Math.floor(this.eastings / 100000);

      prefix = Irish.prefixes[x][y];

      e = Math.floor(this.eastings % 100000);
      n = Math.floor(this.northings % 100000);

      const div = (5 - precision);
      e = Math.floor(e / (10 ** div));
      n = Math.floor(n / (10 ** div));
    }

    return `${prefix} ${this.zeropad(e, precision)} ${this.zeropad(n, precision)}`;
  }

  parseGridRef(landranger) {
    let ok = false;

    this.northings = 0;
    this.eastings = 0;

    for (let precision = 5; precision >= 1; precision -= 1) {
      const pattern = new RegExp(`^([A-Z]{1})\\s*(\\d{${precision}})\\s*(\\d{${precision}})$`, 'i');
      const gridRef = landranger.match(pattern);

      if (gridRef) {
        const gridSheet = gridRef[1];

        let gridEast = 0;
        let gridNorth = 0;

        // 5x1 4x10 3x100 2x1000 1x10000
        if (precision > 0) {
          const mult = 10 ** (5 - precision);
          gridEast = parseInt(gridRef[2], 10) * mult;
          gridNorth = parseInt(gridRef[3], 10) * mult;
        }

        // eslint-disable-next-line
        search: for (let x = 0; x < Irish.prefixes.length; x += 1) {
          for (let y = 0; y < Irish.prefixes[x].length; y += 1) {
            if (Irish.prefixes[x][y] === gridSheet) {
              this.eastings = (x * 100000) + gridEast;
              this.northings = (y * 100000) + gridNorth;
              ok = true;
              // eslint-disable-next-line no-labels
              break search;
            }
          }
        }
      }
    }

    return ok;
  }


  getWGS84(uselevel2) {
    const height = 0;

    let e = this.eastings;
    let n = this.northings;

    if (!uselevel2) {
      // fixed datum shift correction (instead of fancy hermert translation below!)
      e = this.eastings - 49;
      n = this.northings + 23.4;
    }

    const lat1 = GeoMath.EastingNorthingToLat(
      e,
      n,
      6377340.189,
      6356034.447,
      200000,
      250000,
      1.000035,
      53.50000,
      -8.00000,
    );

    const lon1 = GeoMath.EastingNorthingToLng(
      e,
      n,
      6377340.189,
      6356034.447,
      200000,
      250000,
      1.000035,
      53.50000,
      -8.00000,
    );

    const wgs84 = new WGS84();

    wgs84.setDegrees(lat1, lon1);

    if (uselevel2) {
      const x1 = GeoMath.LatLngHeightToCartesianX(lat1, lon1, height, 6377340.189, 6356034.447);
      const y1 = GeoMath.LatLngHeightToCartesianY(lat1, lon1, height, 6377340.189, 6356034.447);
      const z1 = GeoMath.LatHeightToCartesianZ(lat1, height, 6377340.189, 6356034.447);

      const x2 = GeoMath.HelmertX(x1, y1, z1, 482.53, 0.214, 0.631, 8.15);
      const y2 = GeoMath.HelmertY(x1, y1, z1, -130.596, 1.042, 0.631, 8.15);
      const z2 = GeoMath.HelmertZ(x1, y1, z1, 564.557, 1.042, 0.214, 8.15);

      const latitude = GeoMath.CartesianXYZToLat(x2, y2, z2, 6378137.000, 6356752.313);
      const longitude = GeoMath.XYZToLng(x2, y2);
      wgs84.setDegrees(latitude, longitude);
    }

    return wgs84;
  }

  static get prefixes() {
    return [
      ['V', 'Q', 'L', 'F', 'A'],
      ['W', 'R', 'M', 'G', 'B'],
      ['X', 'S', 'N', 'H', 'C'],
      ['Y', 'T', 'O', 'J', 'D'],
      ['Z', 'U', 'P', 'K', 'E'],
    ];
  }
};
