/* eslint-disable max-len */
/* eslint-disable no-bitwise */
/** ***************************************************************************
*
* GeoMath is a collection of static methods doing all the nasty sums
*
**************************************************************************** */

// GeoMath is just namespace for all the nasty maths functions
module.exports = class GeoMath {
  static EastingNorthingToLat(East, North, a, b, e0, n0, f0, PHI0) {
    // Un-project Transverse Mercator eastings and northings back to latitude.
    // Input: - _
    // eastings (East) and northings (North) in meters; _
    // ellipsoid axis dimensions (a & b) in meters; _
    // eastings (e0) and northings (n0) of false origin in meters; _
    // central meridian scale factor (f0) and _
    // latitude (PHI0) and longitude (LAM0) of false origin in decimal degrees.

    // 'REQUIRES THE "Marc" AND "InitialLat" FUNCTIONS

    // Convert angle measures to radians
    const Pi = 3.14159265358979;
    const RadPHI0 = PHI0 * (Pi / 180);
    // const RadLAM0 = LAM0 * (Pi / 180);

    // Compute af0, bf0, e squared (e2), n and Et
    const af0 = a * f0;
    const bf0 = b * f0;
    const e2 = ((af0 ** 2) - (bf0 ** 2)) / (af0 ** 2);
    const n = (af0 - bf0) / (af0 + bf0);
    const Et = East - e0;

    // Compute initial value for latitude (PHI) in radians
    const PHId = GeoMath.InitialLat(North, n0, af0, RadPHI0, n, bf0);

    // Compute nu, rho and eta2 using value for PHId
    const nu = af0 / (Math.sqrt(1 - (e2 * ((Math.sin(PHId) ** 2)))));
    const rho = (nu * (1 - e2)) / (1 - (e2 * (Math.sin(PHId) ** 2)));
    const eta2 = (nu / rho) - 1;

    // Compute Latitude
    const VII = (Math.tan(PHId)) / (2 * rho * nu);
    const VIII = ((Math.tan(PHId)) / (24 * rho * (nu ** 3))) * (5 + (3 * ((Math.tan(PHId) ** 2))) + eta2 - (9 * eta2 * ((Math.tan(PHId) ** 2))));
    const IX = ((Math.tan(PHId)) / (720 * rho * (nu ** 5))) * (61 + (90 * ((Math.tan(PHId)) ^ 2)) + (45 * ((Math.tan(PHId) ** 4))));

    const EastingNorthingToLat = (180 / Pi) * (PHId - ((Et ** 2) * VII) + ((Et ** 4) * VIII) - ((Et ^ 6) * IX));

    return (EastingNorthingToLat);
  }

  static EastingNorthingToLng(East, North, a, b, e0, n0, f0, PHI0, LAM0) {
    // Un-project Transverse Mercator eastings and northings back to longitude.
    // Input: - _
    // eastings (East) and northings (North) in meters; _
    // ellipsoid axis dimensions (a & b) in meters; _
    // eastings (e0) and northings (n0) of false origin in meters; _
    // central meridian scale factor (f0) and _
    // latitude (PHI0) and longitude (LAM0) of false origin in decimal degrees.

    // REQUIRES THE "Marc" AND "InitialLat" FUNCTIONS

    // Convert angle measures to radians
    const Pi = 3.14159265358979;
    const RadPHI0 = PHI0 * (Pi / 180);
    const RadLAM0 = LAM0 * (Pi / 180);

    // Compute af0, bf0, e squared (e2), n and Et
    const af0 = a * f0;
    const bf0 = b * f0;
    const e2 = ((af0 ** 2) - (bf0 ** 2)) / (af0 ** 2);
    const n = (af0 - bf0) / (af0 + bf0);
    const Et = East - e0;

    // Compute initial value for latitude (PHI) in radians
    const PHId = GeoMath.InitialLat(North, n0, af0, RadPHI0, n, bf0);

    // Compute nu, rho and eta2 using value for PHId
    const nu = af0 / (Math.sqrt(1 - (e2 * ((Math.sin(PHId) ** 2)))));
    const rho = (nu * (1 - e2)) / (1 - (e2 * (Math.sin(PHId) ** 2)));
    // const eta2 = (nu / rho) - 1;

    // Compute Longitude
    const X = ((Math.cos(PHId) ** -1)) / nu;
    const XI = (((Math.cos(PHId) ** -1)) / (6 * (nu ** 3))) * ((nu / rho) + (2 * ((Math.tan(PHId) ** 2))));
    const XII = (((Math.cos(PHId) ** -1)) / (120 * (nu ** 5))) * (5 + (28 * ((Math.tan(PHId) ** 2))) + (24 * ((Math.tan(PHId) ** 4))));
    const XIIA = (((Math.cos(PHId) ** -1)) / (5040 * (nu ** 7))) * (61 + (662 * ((Math.tan(PHId) ** 2))) + (1320 * ((Math.tan(PHId) ** 4))) + (720 * ((Math.tan(PHId) ** 6))));

    const EastingNorthingToLng = (180 / Pi) * (RadLAM0 + (Et * X) - ((Et ** 3) * XI) + ((Et ** 5) * XII) - ((Et ** 7) * XIIA));

    return EastingNorthingToLng;
  }

  static InitialLat(North, n0, afo, PHI0, n, bfo) {
    // Compute initial value for Latitude (PHI) IN RADIANS.
    // Input: - _
    // northing of point (North) and northing of false origin (n0) in meters; _
    // semi major axis multiplied by central meridian scale factor (af0) in meters; _
    // latitude of false origin (PHI0) IN RADIANS; _
    // n (computed from a, b and f0) and _
    // ellipsoid semi major axis multiplied by central meridian scale factor (bf0) in meters.

    // REQUIRES THE "Marc" FUNCTION
    // THIS FUNCTION IS CALLED BY THE "EastingNorthingToLat", "EastingNorthingToLng" and "E_N_to_C" FUNCTIONS
    // THIS FUNCTION IS ALSO USED ON IT'S OWN IN THE  "Projection and Transformation Calculations.xls" SPREADSHEET

    // First PHI value (PHI1)
    let PHI1 = ((North - n0) / afo) + PHI0;

    // Calculate M
    let M = GeoMath.Marc(bfo, n, PHI0, PHI1);

    // Calculate new PHI value (PHI2)
    let PHI2 = ((North - n0 - M) / afo) + PHI1;

    // Iterate to get final value for InitialLat
    while (Math.abs(North - n0 - M) > 0.00001) {
      PHI2 = ((North - n0 - M) / afo) + PHI1;
      M = GeoMath.Marc(bfo, n, PHI0, PHI2);
      PHI1 = PHI2;
    }
    return PHI2;
  }

  static LatLngHeightToCartesianX(PHI, LAM, H, a, b) {
    // Convert geodetic coords lat (PHI), long (LAM) and height (H) to cartesian X coordinate.
    // Input: - _
    //    Latitude (PHI)& Longitude (LAM) both in decimal degrees; _
    //  Ellipsoidal height (H) and ellipsoid axis dimensions (a & b) all in meters.

    // Convert angle measures to radians
    const Pi = 3.14159265358979;
    const RadPHI = PHI * (Pi / 180);
    const RadLAM = LAM * (Pi / 180);

    // Compute eccentricity squared and nu
    const e2 = ((a ** 2) - (b ** 2)) / (a ** 2);
    const V = a / (Math.sqrt(1 - (e2 * ((Math.sin(RadPHI) ** 2)))));

    // Compute X
    return (V + H) * (Math.cos(RadPHI)) * (Math.cos(RadLAM));
  }

  static LatLngHeightToCartesianY(PHI, LAM, H, a, b) {
    // Convert geodetic coords lat (PHI), long (LAM) and height (H) to cartesian Y coordinate.
    // Input: - _
    // Latitude (PHI)& Longitude (LAM) both in decimal degrees; _
    // Ellipsoidal height (H) and ellipsoid axis dimensions (a & b) all in meters.

    // Convert angle measures to radians
    const Pi = 3.14159265358979;
    const RadPHI = PHI * (Pi / 180);
    const RadLAM = LAM * (Pi / 180);

    // Compute eccentricity squared and nu
    const e2 = ((a ** 2) - (b ** 2)) / (a ** 2);
    const V = a / (Math.sqrt(1 - (e2 * ((Math.sin(RadPHI) ** 2)))));

    // Compute Y
    return (V + H) * (Math.cos(RadPHI)) * (Math.sin(RadLAM));
  }

  static LatHeightToCartesianZ(PHI, H, a, b) {
    // Convert geodetic coord components latitude (PHI) and height (H) to cartesian Z coordinate.
    // Input: - _
    //    Latitude (PHI) decimal degrees; _
    // Ellipsoidal height (H) and ellipsoid axis dimensions (a & b) all in meters.

    // Convert angle measures to radians
    const Pi = 3.14159265358979;
    const RadPHI = PHI * (Pi / 180);

    // Compute eccentricity squared and nu
    const e2 = ((a ** 2) - (b ** 2)) / (a ** 2);
    const V = a / (Math.sqrt(1 - (e2 * ((Math.sin(RadPHI) ** 2)))));

    // Compute X
    return ((V * (1 - e2)) + H) * (Math.sin(RadPHI));
  }

  static HelmertX(X, Y, Z, DX, YRot, ZRot, s) {
    // (X, Y, Z, DX, YRot, ZRot, s)
    // Computed Helmert transformed X coordinate.
    // Input: - _
    //    cartesian XYZ coords (X,Y,Z), X translation (DX) all in meters ; _
    // Y and Z rotations in seconds of arc (YRot, ZRot) and scale in ppm (s).

    // Convert rotations to radians and ppm scale to a factor
    const Pi = 3.14159265358979;
    const sfactor = s * 0.000001;

    const RadYRot = (YRot / 3600) * (Pi / 180);

    const RadZRot = (ZRot / 3600) * (Pi / 180);

    // Compute transformed X coord
    return (X + (X * sfactor) - (Y * RadZRot) + (Z * RadYRot) + DX);
  }

  static HelmertY(X, Y, Z, DY, XRot, ZRot, s) {
    // (X, Y, Z, DY, XRot, ZRot, s)
    // Computed Helmert transformed Y coordinate.
    // Input: - _
    //    cartesian XYZ coords (X,Y,Z), Y translation (DY) all in meters ; _
    //  X and Z rotations in seconds of arc (XRot, ZRot) and scale in ppm (s).

    // Convert rotations to radians and ppm scale to a factor
    const Pi = 3.14159265358979;
    const sfactor = s * 0.000001;
    const RadXRot = (XRot / 3600) * (Pi / 180);
    const RadZRot = (ZRot / 3600) * (Pi / 180);

    // Compute transformed Y coord
    return (X * RadZRot) + Y + (Y * sfactor) - (Z * RadXRot) + DY;
  }

  static HelmertZ(X, Y, Z, DZ, XRot, YRot, s) {
    // (X, Y, Z, DZ, XRot, YRot, s)
    // Computed Helmert transformed Z coordinate.
    // Input: - _
    //    cartesian XYZ coords (X,Y,Z), Z translation (DZ) all in meters ; _
    // X and Y rotations in seconds of arc (XRot, YRot) and scale in ppm (s).
    //
    // Convert rotations to radians and ppm scale to a factor
    const Pi = 3.14159265358979;
    const sfactor = s * 0.000001;
    const RadXRot = (XRot / 3600) * (Pi / 180);
    const RadYRot = (YRot / 3600) * (Pi / 180);

    // Compute transformed Z coord
    return (-1 * X * RadYRot) + (Y * RadXRot) + Z + (Z * sfactor) + DZ;
  }

  static CartesianXYZToLat(X, Y, Z, a, b) {
    // Convert XYZ to Latitude (PHI) in Dec Degrees.
    // Input: - _
    // XYZ cartesian coords (X,Y,Z) and ellipsoid axis dimensions (a & b), all in meters.

    // THIS FUNCTION REQUIRES THE "IterateCartesianXYZToLat" FUNCTION
    // THIS FUNCTION IS CALLED BY THE "XYZ_to_H" FUNCTION

    const RootXYSqr = Math.sqrt((X ** 2) + (Y ** 2));
    const e2 = ((a ** 2) - (b ** 2)) / (a ** 2);
    const PHI1 = Math.atan2(Z, (RootXYSqr * (1 - e2)));

    const PHI = GeoMath.IterateCartesianXYZToLat(a, e2, PHI1, Z, RootXYSqr);

    const Pi = 3.14159265358979;

    return PHI * (180 / Pi);
  }

  static IterateCartesianXYZToLat(a, e2, PHI1, Z, RootXYSqr) {
    // Iteratively computes Latitude (PHI).
    // Input: - _
    //    ellipsoid semi major axis (a) in meters; _
    //    eta squared (e2); _
    //    estimated value for latitude (PHI1) in radians; _
    //    cartesian Z coordinate (Z) in meters; _
    // RootXYSqr computed from X & Y in meters.

    // THIS FUNCTION IS CALLED BY THE "XYZ_to_PHI" FUNCTION
    // THIS FUNCTION IS ALSO USED ON IT'S OWN IN THE _
    // "Projection and Transformation Calculations.xls" SPREADSHEET


    let V = a / (Math.sqrt(1 - (e2 * (Math.sin(PHI1) ** 2))));
    let PHI2 = Math.atan2((Z + (e2 * V * (Math.sin(PHI1)))), RootXYSqr);

    let iterator = PHI1;

    while (Math.abs(iterator - PHI2) > 0.000000001) {
      iterator = PHI2;
      V = a / (Math.sqrt(1 - (e2 * (Math.sin(iterator) ** 2))));
      PHI2 = Math.atan2((Z + (e2 * V * (Math.sin(iterator)))), RootXYSqr);
    }

    return PHI2;
  }

  static XYZToLng(X, Y) {
    // Convert XYZ to Longitude (LAM) in Dec Degrees.
    // Input: - _
    // X and Y cartesian coords in meters.

    const Pi = 3.14159265358979;
    return Math.atan2(Y, X) * (180 / Pi);
  }

  static Marc(bf0, n, PHI0, PHI) {
    // Compute meridional arc.
    // Input: - _
    // ellipsoid semi major axis multiplied by central meridian scale factor (bf0) in meters; _
    // n (computed from a, b and f0); _
    // lat of false origin (PHI0) and initial or final latitude of point (PHI) IN RADIANS.

    // THIS FUNCTION IS CALLED BY THE - _
    // "LatLngToNorthing" and "InitialLat" FUNCTIONS
    // THIS FUNCTION IS ALSO USED ON IT'S OWN IN THE "Projection and Transformation Calculations.xls" SPREADSHEET

    return bf0 * (((1 + n + ((5 / 4) * (n ** 2)) + ((5 / 4) * (n ** 3))) * (PHI - PHI0)) - (((3 * n) + (3 * (n ** 2)) + ((21 / 8) * (n ** 3))) * (Math.sin(PHI - PHI0)) * (Math.cos(PHI + PHI0))) + ((((15 / 8
    ) * (n ** 2)) + ((15 / 8) * (n ** 3))) * (Math.sin(2 * (PHI - PHI0))) * (Math.cos(2 * (PHI + PHI0)))) - (((35 / 24) * (n ** 3)) * (Math.sin(3 * (PHI - PHI0))) * (Math.cos(3 * (PHI + PHI0)))));
  }

  static LatLngToEasting(PHI, LAM, a, b, e0, f0, PHI0, LAM0) {
    // Project Latitude and longitude to Transverse Mercator eastings.
    // Input: - _
    //    Latitude (PHI) and Longitude (LAM) in decimal degrees; _
    //    ellipsoid axis dimensions (a & b) in meters; _
    //    eastings of false origin (e0) in meters; _
    //    central meridian scale factor (f0); _
    // latitude (PHI0) and longitude (LAM0) of false origin in decimal degrees.

    // Convert angle measures to radians
    const Pi = 3.14159265358979;
    const RadPHI = PHI * (Pi / 180);
    const RadLAM = LAM * (Pi / 180);
    // const RadPHI0 = PHI0 * (Pi / 180);
    const RadLAM0 = LAM0 * (Pi / 180);

    const af0 = a * f0;
    const bf0 = b * f0;
    const e2 = ((af0 ** 2) - (bf0 ** 2)) / (af0 ** 2);
    // const n = (af0 - bf0) / (af0 + bf0);
    const nu = af0 / (Math.sqrt(1 - (e2 * (Math.sin(RadPHI) ** 2))));
    const rho = (nu * (1 - e2)) / (1 - (e2 * (Math.sin(RadPHI) ** 2)));
    const eta2 = (nu / rho) - 1;
    const p = RadLAM - RadLAM0;

    const IV = nu * (Math.cos(RadPHI));
    const V = (nu / 6) * ((Math.cos(RadPHI) ** 3)) * ((nu / rho) - ((Math.tan(RadPHI) ** 2)));
    const VI = (nu / 120) * ((Math.cos(RadPHI) ** 5)) * (5 - (18 * ((Math.tan(RadPHI) ** 2))) + ((Math.tan(RadPHI) ** 4)) + (14 * eta2) - (58 * ((Math.tan(RadPHI) ** 2)) * eta2));

    return e0 + (p * IV) + ((p ** 3) * V) + ((p ** 5) * VI);
  }

  static LatLngToNorthing(PHI, LAM, a, b, e0, n0, f0, PHI0, LAM0) {
    // Project Latitude and longitude to Transverse Mercator northings
    // Input: - _
    // Latitude (PHI) and Longitude (LAM) in decimal degrees; _
    // ellipsoid axis dimensions (a & b) in meters; _
    // eastings (e0) and northings (n0) of false origin in meters; _
    // central meridian scale factor (f0); _
    // latitude (PHI0) and longitude (LAM0) of false origin in decimal degrees.

    // REQUIRES THE "Marc" FUNCTION

    // Convert angle measures to radians
    const Pi = 3.14159265358979;
    const RadPHI = PHI * (Pi / 180);
    const RadLAM = LAM * (Pi / 180);
    const RadPHI0 = PHI0 * (Pi / 180);
    const RadLAM0 = LAM0 * (Pi / 180);

    const af0 = a * f0;
    const bf0 = b * f0;
    const e2 = ((af0 ** 2) - (bf0 ** 2)) / (af0 ** 2);
    const n = (af0 - bf0) / (af0 + bf0);
    const nu = af0 / (Math.sqrt(1 - (e2 * (Math.sin(RadPHI) ** 2))));
    const rho = (nu * (1 - e2)) / (1 - (e2 * (Math.sin(RadPHI) ** 2)));
    const eta2 = (nu / rho) - 1;
    const p = RadLAM - RadLAM0;
    const M = GeoMath.Marc(bf0, n, RadPHI0, RadPHI);

    const I = M + n0;
    const II = (nu / 2) * (Math.sin(RadPHI)) * (Math.cos(RadPHI));
    const III = ((nu / 24) * (Math.sin(RadPHI)) * ((Math.cos(RadPHI) ** 3))) * (5 - ((Math.tan(RadPHI) ** 2)) + (9 * eta2));
    const IIIA = ((nu / 720) * (Math.sin(RadPHI)) * ((Math.cos(RadPHI) ** 5))) * (61 - (58 * ((Math.tan(RadPHI) ** 2))) + ((Math.tan(RadPHI) ** 4)));

    return I + ((p ** 2) * II) + ((p ** 4) * III) + ((p ** 6) * IIIA);
  }
};
