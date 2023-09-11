# Code Quality Examples

- Function binding in React's render method (https://d.pr/i/Vkfm3o)
> Avoid arrow functions and binds in render. It breaks performance optimizations like shouldComponentUpdate and PureComponent.

- Arrow functions in the render method (https://d.pr/i/jX43y9)

> Here’s why: The parent component is passing down an arrow function on props. Arrow functions are reallocated on every render (same story with using bind). 

- Using TEXT instead of VARCHAR for less than 256 character database columns (https://d.pr/i/yTXf0c, https://d.pr/i/vt2kxc)

> You cannot put an index (except for a fulltext index) on a TEXT column. Querying for data across many tables containing thousands of rows without indexes is SLOW!

- Input values are not sanitized when submitted (trailing spaces not removed, html values escaped, etc)

- Locations table contains the drivers, trucks, waypoints, locations and GPS coordinates.
> GPS coordinates are submitted every 10s by every driver and saved every coordinate change. This adds up. 60 sec / 10 * 60 minutes * 8 hours = 2880. If 25% of the submissions have different coordinates thats approx 720 new rows per driver per day. Before it was removed completely, loading the locations table in Admin => Locations would cause the entire application to crash because it sent all the locations in the database. Unnecessary and unnecessarily large amounts of data are requested and sent throughout.

The flow of listing locations is as follows:
This code is executed:    
```javascript
export const findAll = R.curry((httpQuery, query) => {
  return query(
    locations
      .select(locations.star())
      .from(locationsFrom(httpQuery))
      .where(byId(httpQuery))
      .where(byName(httpQuery))
      .where(byCoordinates(httpQuery))
      .where(byType(httpQuery))
      .where(byEmpty(httpQuery))
      .where(byDeleted(httpQuery)),
  );
});

```
Which gets all 500,000+ rows of locations data.
Afterwards, it maps each one of those 500,000+ objects to the following:

```javascript
// views/location
const locationView = (obj, mutate = false) => {
  const retObj = mutate ? obj : R.clone(obj);
  if (retObj.location) {
    if (retObj.location.x) {
      retObj.location.lon = retObj.location.x;
      delete retObj.location.x;
    } else {
      retObj.location.lon = null;
    }

    if (retObj.location.y) {
      retObj.location.lat = retObj.location.y;
      delete retObj.location.y;
    } else {
      retObj.location.lat = null;
    }
  } else {
    retObj.location = { lon: null, lat: null };
  }
  return retObj;
};
```

Before it begins to send the data back to the browser.
Once (if) the data makes it back to the browser, it's then mapped and sorted before rendering onto the page into a table. Those X number of locations are kept in memory while the page is up. 


The basics of a view in MySQL is that a join(s), query, etc is stored as a "fake table" in the database. This is available for quick memory access without performing a whole lookup throughout the tables again. 

The code from Motocol originally had actual views written in mysql. When Dan took over, he converted those views to JavaScript. However thats not even remotely close to the same thing. JavaScript views are essentially just a pre-defined query. The benefits of a mysql view are negated.
