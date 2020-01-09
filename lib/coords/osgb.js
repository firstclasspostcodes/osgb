const GeoMath = require('./math');

module.exports = class OSGB {
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
    let precision = 0;

    if (num > 5) {
      precision = 5;
    }

    let e = '';

    let n = '';

    let prefix = '';

    if (precision > 0) {
      const y = Math.floor(this.northings / 100000);
      const x = Math.floor(this.eastings / 100000);

      prefix = OSGB.prefixes[y][x];

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
      const pattern = new RegExp(`^([A-Z]{2})\\s*(\\d{${precision}})\\s*(\\d{${precision}})$`, 'i');

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
        search: for (let y = 0; y < OSGB.prefixes.length; y += 1) {
          for (let x = 0; x < OSGB.prefixes[y].length; x += 1) {
            if (OSGB.prefixes[y][x] === gridSheet) {
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


  getWGS84() {
    const height = 0;

    const lat1 = GeoMath.EastingNorthingToLat(
      this.eastings,
      this.northings,
      6377563.396,
      6356256.910,
      400000,
      -100000,
      0.999601272,
      49.00000,
      -2.00000,
    );

    const lon1 = GeoMath.EastingNorthingToLng(
      this.eastings,
      this.northings,
      6377563.396,
      6356256.910,
      400000,
      -100000,
      0.999601272,
      49.00000,
      -2.00000,
    );

    const x1 = GeoMath.LatLngHeightToCartesianX(lat1, lon1, height, 6377563.396, 6356256.910);
    const y1 = GeoMath.LatLngHeightToCartesianY(lat1, lon1, height, 6377563.396, 6356256.910);
    const z1 = GeoMath.LatHeightToCartesianZ(lat1, height, 6377563.396, 6356256.910);

    const x2 = GeoMath.HelmertX(x1, y1, z1, 446.448, 0.2470, 0.8421, -20.4894);
    const y2 = GeoMath.HelmertY(x1, y1, z1, -125.157, 0.1502, 0.8421, -20.4894);
    const z2 = GeoMath.HelmertZ(x1, y1, z1, 542.060, 0.1502, 0.2470, -20.4894);

    const latitude = GeoMath.CartesianXYZToLat(x2, y2, z2, 6378137.000, 6356752.313);
    const longitude = GeoMath.XYZToLng(x2, y2);

    return { latitude, longitude };
  }

  static get prefixes() {
    return [
      ['SV', 'SW', 'SX', 'SY', 'SZ', 'TV', 'TW'],
      ['SQ', 'SR', 'SS', 'ST', 'SU', 'TQ', 'TR'],
      ['SL', 'SM', 'SN', 'SO', 'SP', 'TL', 'TM'],
      ['SF', 'SG', 'SH', 'SJ', 'SK', 'TF', 'TG'],
      ['SA', 'SB', 'SC', 'SD', 'SE', 'TA', 'TB'],
      ['NV', 'NW', 'NX', 'NY', 'NZ', 'OV', 'OW'],
      ['NQ', 'NR', 'NS', 'NT', 'NU', 'OQ', 'OR'],
      ['NL', 'NM', 'NN', 'NO', 'NP', 'OL', 'OM'],
      ['NF', 'NG', 'NH', 'NJ', 'NK', 'OF', 'OG'],
      ['NA', 'NB', 'NC', 'ND', 'NE', 'OA', 'OB'],
      ['HV', 'HW', 'HX', 'HY', 'HZ', 'JV', 'JW'],
      ['HQ', 'HR', 'HS', 'HT', 'HU', 'JQ', 'JR'],
      ['HL', 'HM', 'HN', 'HO', 'HP', 'JL', 'JM'],
    ];
  }
};
