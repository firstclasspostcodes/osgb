# OSGB 

![](https://github.com/firstclasspostcodes/osgb/workflows/Publish%20Package/badge.svg)

This tiny JS library is used as a helper library to convert between both OSGB and WGS84 geo-cordinate systems. It provides two exported functions `toLatLng()` and `toEastingNorthing()`.

## Installation

The CLI can be installed globally, using:

```
npm i -g @firstclasspostcodes/osgb
```

## Usage

```js
const { toLatLng, toEastingNorthing } = require('@firstclasspostcodes/osgb');

const position = {
latitude: 51.5018949,
  longitude: -0.2107977,
};

const osgb = toEastingNorthing(position);

const { easting, northing } = osgb;

const wgs84 = toLatLng({ easting, northing });
```