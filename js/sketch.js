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
  var sites = generatePoints(100);
  // console.log(sites[0]);
  var bbox, diagram;
  var oldSize = paper.view.size;
  var spotColor = new Color("red");
  var mousePos = view.center;
  var selected = true;

  onResize();

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

  function generatePoints(number) {
    let points = [];

    for (let i = 0; i < number; i++) {
      let point = new Point(
        Math.floor(Math.random() * width),
        Math.floor(Math.random() * height)
      );

      points.push(point);
    }

    return points;
  }

  function createPath(points, center) {
    var path = new Path();
    if (!selected) {
      path.fillColor = spotColor;
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

  function onResize() {
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
    if (event.character == "P") {
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
