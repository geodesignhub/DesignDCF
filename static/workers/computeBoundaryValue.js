importScripts('../js/turf.min.js');
importScripts('../js/rtree.min.js');

function computeBoundaryValue(design, boundary, investmentdata, selectedsystems) {
    // get the grid in a rTree
    var boundary = JSON.parse(boundary);
    var design = JSON.parse(design);
    var investmentdata = JSON.parse(investmentdata);
    var selectedsystems = JSON.parse(selectedsystems);
    // loop over boundaries
    var selectedsystems = selectedsystems.map(function(x) {
        return parseInt(x, 10);
    });

    function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 6; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
    var gridTree = RTree();
    gridTree.geoJSON(design);
    var newboundaries = { "type": "FeatureCollection", "features": [] };
    var bfeatlen = boundary.features.length;
    for (var j2 = 0; j2 < bfeatlen; j2++) {
        var cbndfeat = boundary.features[j2];
        var bndid = makeid();
        cbndfeat.properties.id = bndid;
        newboundaries.features.push(cbndfeat);
    }
    var bndIDDiags = {};
    for (var j = 0; j < bfeatlen; j++) {
        var curbnd = newboundaries.features[j];
        var curBndbounds = turf.bbox(curbnd);
        var cData = gridTree.bbox([curBndbounds[0], curBndbounds[1]], [curBndbounds[2], curBndbounds[3]]); // array of features
        // get all the diagrams within this boundary
        var curbndid = curbnd.properties.id;
        bndIDDiags[curbndid] = {};
        var diags = [];
        for (var g1 = 0; g1 < cData.length; g1++) {
            var curIFeatGrid = cData[g1];
            var curIFeatDiagramID = curIFeatGrid.properties.diagramid;
            diags.push(curIFeatDiagramID);
        }
        bndIDDiags[curbndid]['diagrams'] = diags;
    }
    // console.log(JSON.stringify(bndIDDiags));
    console.log(JSON.stringify(selectedsystems));
    // var opboundaries = { "type": "FeatureCollection", "features": [] };
    for (var j3 = 0; j3 < bfeatlen; j3++) {
        var cbndfeat = newboundaries.features[j3];
        var bndID = cbndfeat.properties.id;
        var diagramIDs = bndIDDiags[bndID]['diagrams'];
        var totalIncome = 0;
        var totalInvestment = 0;
        // get the items in the grid that intersect the boundary. 
        for (var i1 = 0; i1 < investmentdata.length; i1++) { // loop over the investment data. 
            var curData = investmentdata[i1]; // current investment data
            var diagID = curData.id; // diagram id of the current investment
            var sysID = curData.sysid;
            if (diagramIDs.includes(diagID) && (selectedsystems.includes(sysID))) {
                //
                totalIncome += parseInt(curData['income']['total']);
                totalInvestment += curData['totalInvestment'];
            }
        }
        cbndfeat.properties.totalIncome = totalIncome;
        // opboundaries.features.push(cbndfeat);
        bndIDDiags[curbndid]['totalIncome'] = totalIncome;
        bndIDDiags[curbndid]['totalInvestment'] = totalInvestment;
        bndIDDiags[curbndid]['bname'] = cbndfeat.properties.bname;
    }

    self.postMessage({
        'boundaryValue': JSON.stringify(bndIDDiags),
        // 'newboundaries': JSON.stringify(opboundaries)
    });

    // close the worker
    self.close();
}
self.onmessage = function(e) {
    computeBoundaryValue(e.data.design, e.data.boundaries, e.data.investmentdata, e.data.selectedsystems);
}