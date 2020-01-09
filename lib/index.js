const { OSGB, WGS84 } = require('./coords');

const toLatLng = ({ easting, northing }) => {
  const osgb = new OSGB();
  osgb.setGridCoordinates(easting, northing);
  const { latitude, longitude } = osgb.getWGS84();
  return { latitude, longitude };
};

const toEastingNorthing = ({ latitude, longitude }) => {
  const wgs84 = new WGS84();
  wgs84.setDegrees(latitude, longitude);
  const { eastings: easting, northings: northing } = wgs84.getOSGB();
  return { easting, northing };
};

module.exports = {
  toLatLng,
  toEastingNorthing,
};
