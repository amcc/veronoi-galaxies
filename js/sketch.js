let svgCount = 0;

let titleText;
let textCol = "black";
let textSize = 20;
let textHeight = 20;
let textX = 50;
let textY = 50;
let lineWidth = 1;

let margin = 50;
let bottomMargin = 100;
let width;
let height;

let timeLimit;
let printed = false;

// get data from galaxies
// http://voyages.sdss.org/launch/milky-way/sdss-constellations/discovering-constellations-using-sdss-plates/
let data;

// Make the paper scope global, by injecting it into window:
paper.install(window);
window.onload = function () {
  // Setup directly from canvas id:
  paper.setup("myCanvas");

  // timelimit
  // timeLimit = Math.random() * 20 + 20;
  timeLimit = 1;

  width = paper.view.size.width;
  height = paper.view.size.height;

  // console.log("paper size", width, height);

  path = new Path();
  path.visible = false;

  ///////////////////////
  // VERONOI FUNCTIONS //
  ///////////////////////

  var voronoi = new Voronoi();
  var sites, bbox, diagram;
  var oldSize = paper.view.size;
  var spotColor = new Color("skyblue");
  var mousePos = view.center;
  var selected = false;

  // get the data

  const parser = Papa.parse("../data/results-100.csv", {
    download: true,
    header: true,
    skipEmptyLines: "greedy",
    complete: function (results, file) {
      data = results.data;
      // console.log("Parsing complete:", results, file);

      // all x
      // const xes = data.map((d) => d.x);
      // const yes = data.map((d) => d.y);
      // console.log("xes", Math.max(...xes));

      onResize();
    },
  });

  function onResize() {
    sites = generatePoints(data);
    var margin = 20;
    bbox = {
      xl: margin,
      xr: width - margin,
      yt: margin,
      yb: height - margin,
    };
    for (var i = 0, l = sites.length; i < l; i++) {
      // console.log(sites[i]);
      sites[i] = sites[i].multiply(view.size).divide(oldSize);
    }
    oldSize = view.size;
    renderDiagram();
    sites.forEach((site) => makeCircle(site));
  }

  function generatePoints(points) {
    let sites = points.map(
      (point) =>
        // new Point(Math.floor(Math.abs(point.x)), Math.floor(Math.abs(point.y)))
        new Point(
          Math.floor(mapRange(point.x, -360, 360, 0, width)),
          Math.floor(mapRange(point.y, -360, 360, 0, height))
        )
    );
    return sites;
  }

  function renderDiagram() {
    project.activeLayer.children = [];
    var diagram = voronoi.compute(sites, bbox);
    // console.log("sites", sites);
    if (diagram) {
      for (var i = 0, l = sites.length; i < l; i++) {
        var cell = diagram.cells[sites[i].voronoiId];
        if (cell) {
          var halfedges = cell.halfedges,
            length = halfedges.length;
          if (length > 2) {
            var points = [];
            for (var j = 0; j < length; j++) {
              v = halfedges[j].getEndpoint();
              points.push(new Point(v));
            }
            createPath(points, sites[i]);
          }
        }
      }
    }
  }

  function createPath(points, center) {
    var path = new Path();
    if (!selected) {
      path.strokeColor = spotColor;
    } else {
      path.fullySelected = selected;
    }
    path.closed = true;

    for (var i = 0, l = points.length; i < l; i++) {
      var point = points[i];
      var next = points[i + 1 == points.length ? 0 : i + 1];
      var vector = next.subtract(point).divide(2);
      path.add({
        // point: point.add(vector),
        point: point,
        handleIn: -vector,
        handleOut: vector,
      });
    }
    // path.scale(0.95);
    // removeSmallBits(path);
    return path;
  }

  function makeCircle(point) {
    var path = new Path.Circle({
      center: [point.x, point.y],
      radius: 2,
      fillColor: "red",
      // selected: true,
    });
  }

  paper.view.onMouseMove = function (event) {};

  paper.view.onFrame = function (event) {
    // console.log("event.time", event.time);
    // console.log("timeLimit", timeLimit);
    // if (event.time < timeLimit) {
    // within time limit
    // } else if (!printed) {
    //   console.log("print, disabled for now");
    //print();
    //   printed = true;
    // }
  };

  paper.view.onResize = function (resizeAmount) {
    onResize();
  };

  /////////////////////
  // PRINT FUNCTIONS //
  /////////////////////

  // start of printing/svg functions
  function downloadAsSVG(fileName) {
    let date = Date.now();
    console.log(date);
    if (!fileName) {
      fileName = `rain-${svgCount}-${date}.svg`;
    }

    var url =
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        paper.project.exportSVG({ bounds: "view", asString: true })
      );

    var link = document.createElement("a");
    link.download = fileName;
    link.href = url;
    link.click();
  }

  t = new Tool();

  //Listen for SHIFT-P to save content as SVG file.
  t.onKeyUp = function (event) {
    if (event.character == "s") {
      print();
    }
  };

  function print() {
    // pendulumLayer.remove(); // this prevents the redCircle from being drawn
    path.smooth();
    downloadAsSVG();
  }

  // now draw
  paper.view.draw();
  // console.log("rain count:", svgCount);
};
// end of printing/svg functions

function titles() {
  textX = 50;
  textY = paper.view.size.height - 50;

  titleText = new PointText(new Point(textX, textY));
  titleText.fontFamily = "IBM Plex Mono";
  titleText.justification = "left";
  titleText.fontSize = 12;

  titleText.fillColor = textCol;
  titleText.content = "rain";
}

// Helper functions for radians and degrees.
Math.radians = function (degrees) {
  return (degrees * Math.PI) / 180;
};

Math.degrees = function (radians) {
  return (radians * 180) / Math.PI;
};

// linearly maps value from the range (a..b) to (c..d)
function mapRange(value, a, b, c, d) {
  // first map value from (a..b) to (0..1)
  value = (value - a) / (b - a);
  // then map it from (0..1) to (c..d) and return it
  return c + value * (d - c);
}
