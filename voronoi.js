var VoronoiRenderer = {
  voronoi: new Voronoi(),
  sites: [],
  diagram: null,
  margin: 0.1,
  canvas: null,
  bbox: {
    xl: 0,
    xr: 800,
    yt: 0,
    yb: 600
  },
  lastCell: undefined,

  init: function(canvas_element, number_of_parts, width, height) {
    this.canvas = canvas_element;
    this.bbox.xr = width;
    this.bbox.yb = height;
    this.randomSites(number_of_parts, true);
    this.render();
  },

  clearSites: function() {
    this.sites = [];
    this.diagram = this.voronoi.compute(this.sites, this.bbox);
  },

  randomSites: function(n, clear) {
    if (clear) {
      this.sites = [];
    }
    // create vertices
    var xmargin = this.canvas.width * this.margin,
      ymargin = this.canvas.height * this.margin,
      xo = xmargin,
      dx = this.canvas.width - xmargin * 2,
      yo = ymargin,
      dy = this.canvas.height - ymargin * 2;
    for (var i = 0; i < n; i++) {
      this.sites.push({
        x: self.Math.round((xo + self.Math.random() * dx) * 10) / 10,
        y: self.Math.round((yo + self.Math.random() * dy) * 10) / 10
      });
    }
    this.diagram = this.voronoi.compute(this.sites, this.bbox);
  },

// this.renderCell(cellid, '#f00', '#00f');
  renderCell: function(id, fillStyle, strokeStyle) {
    if (id === undefined) {
      return;
    }
    if (!this.diagram) {
      return;
    }
    var cell = this.diagram.cells[id];
    if (!cell) {
      return;
    }
    var ctx = this.canvas.getContext('2d');
    ctx.globalAlpha = 1;
    // edges
    ctx.beginPath();
    var halfedges = cell.halfedges,
      nHalfedges = halfedges.length,
      v = halfedges[0].getStartpoint();
    ctx.moveTo(v.x, v.y);
    for (var iHalfedge = 0; iHalfedge < nHalfedges; iHalfedge++) {
      v = halfedges[iHalfedge].getEndpoint();
      ctx.lineTo(v.x, v.y);
    }
    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;
    ctx.fill();
    ctx.stroke();
    // site
    // v = cell.site;
    // ctx.fillStyle = '#44f';
    // ctx.beginPath();
    // ctx.rect(v.x - 2 / 3, v.y - 2 / 3, 2, 2);
    // ctx.fill();
  },

  render: function() {
    var ctx = this.canvas.getContext('2d');
    // background
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.rect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#888';
    ctx.stroke();
    // voronoi
    if (!this.diagram) {
      return;
    }
    // edges
    ctx.beginPath();
    ctx.strokeStyle = '#000';
    var edges = this.diagram.edges,
      iEdge = edges.length,
      edge, v;
    while (iEdge--) {
      edge = edges[iEdge];
      v = edge.va;
      ctx.moveTo(v.x, v.y);
      v = edge.vb;
      ctx.lineTo(v.x, v.y);
    }
    ctx.stroke();
    // sites
    ctx.beginPath();
    ctx.fillStyle = '#44f';
    var sites = this.sites,
      iSite = sites.length;
    while (iSite--) {
      v = sites[iSite];
      ctx.rect(v.x - 2 / 3, v.y - 2 / 3, 2, 2);
    }
    ctx.fill();
  },
};