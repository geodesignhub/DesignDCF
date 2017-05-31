importScripts('../js/turf.min.js');
importScripts('../js/moment.min.js');
importScripts('../js/rtree.min.js');

function computeAreas(systemdetails, systems, timeline, startyear, grid) {
    var systemdetails = JSON.parse(systemdetails);
    var systems = JSON.parse(systems);
    var timeline = JSON.parse(timeline);
    var startyear = parseInt(startyear);
    diagCosts = [];
    var gridTree = RTree();
    gridTree.geoJSON(grid);

    var syslen = systems.length;
    var sysdetlen = systemdetails.length;
    // for each diagram, compute the area
    var addedIDs = [];
    var sysGrids = {};
    var diagGrids = {};
    var relevantGrid = { "type": "FeatureCollection", "features": [] };

    for (var x = 0; x < syslen; x++) {
        var cSys = systems[x];
        var allDiagrams = cSys.diagrams;
        var sysID = cSys.id;
        var allDiaglen = allDiagrams.length;
        var curGridIntersects = [];
        var sysAddedIDs = [];
        for (var n = 0; n < allDiaglen; n++) {
            var diagAddedIDs = [];
            var curDiag = allDiagrams[n];
            var cDFeatlen = curDiag.features.length;
            if (cDFeatlen > 0) {
                var diagID = curDiag.features[0].properties.diagramid;

                // loop over each feature in the current diagram
                for (var b = 0; b < cDFeatlen; b++) {
                    var curFeat = curDiag.features[b];
                    var curDiagbounds = turf.bbox(curFeat);
                    var cData = gridTree.bbox([curDiagbounds[0], curDiagbounds[1]], [curDiagbounds[2], curDiagbounds[3]]); // array of features

                    for (var g1 = 0; g1 < cData.length; g1++) {
                        var curIFeatGrid = cData[g1];
                        var curIFeatGridID = curIFeatGrid.properties.id;
                        curGridIntersects.push(curIFeatGridID);
                        const allReadyExists = addedIDs.includes(curIFeatGridID);
                        sysAddedIDs.push(curIFeatGridID);
                        diagAddedIDs.push(curIFeatGridID);
                        if (allReadyExists) {} else {
                            addedIDs.push(curIFeatGridID);
                            relevantGrid.features.push(curIFeatGrid);
                        }
                    }

                }

                diagGrids[diagID] = diagAddedIDs;
            }
        }
        sysGrids[sysID] = sysAddedIDs;

        // number of areas that this grid intersects. 
        // const relevantGridLen = relevantGrid.length;
        // console.log(JSON.stringify(curGridIntersects)); // these are the ids that are interesting for this system. 
        for (var y = 0; y < allDiaglen; y++) {
            var sysCost = 0;
            var cDiag = allDiagrams[y];
            var cDFeatlen = cDiag.features.length;
            if (cDFeatlen > 0) {
                var diagID = cDiag.features[0].properties.diagramid;
                var sysName = cDiag.features[0].properties.sysname;
            }
            var curDiagDetails = { 'id': diagID };
            for (var h = 0; h < sysdetlen; h++) {
                var cSys = systemdetails[h];
                var sName = cSys['sysname'];
                if (sName === sysName) {
                    sysCost = cSys['syscost'];
                    curDiagDetails['sysid'] = cSys['id'];
                }
            }
            var totArea;
            var totalCost = 0;

            try {
                totArea = turf.area(cDiag);
                totArea = totArea * 0.0001; // in hectares
            } catch (err) { //throw JSON.stringify(err)
                // console.log(err);
                totArea = 0;
            } // catch ends
            totalCost = totArea * sysCost;

            // check if diagram existsin in timeline.
            var numYears = 0;
            if (parseInt(diagID) in timeline) {
                var start = moment(timeline[diagID].start).year();
                var end = moment(timeline[diagID].end).year();
                numYears = end - start;
                if (numYears == 1) {
                    numYears = 2;
                }
            } else {
                numYears = 2;
            }
            // if the diagram exists get the number of years 
            // else default is 2
            curDiagDetails['totalInvestment'] = totalCost;
            curDiagDetails['investment'] = {};
            curDiagDetails['income'] = {};
            curDiagDetails['maintainence'] = {};
            yearlyCost = parseFloat(totalCost / numYears);

            var tenpercentIncome = yearlyCost * 0.1;
            // for the relevant intersects add income to that  cell for that year. 

            // for (var idx = 0; idx < relevantGridLen; idx++) {
            //     var element = relevantGrid[idx];
            //     var relevantGridID = element.properties.id;
            //     if (curGridIntersects.includes(relevantGridID)) {

            //     }

            // }
            var lastIncome;
            for (var k4 = 0; k4 < numYears; k4++) {
                if (k4 < 19) {
                    var incomeIncrease = (tenpercentIncome * 0.03);
                    var newIncome = incomeIncrease + lastIncome;
                    var sYear = (startyear + k4);
                    curDiagDetails['investment'][sYear] = yearlyCost;
                    lastIncome = newIncome;
                }
            }
            var totalIncome = 0;
            for (var k = 0; k < 20; k++) {
                if (k == 0) {
                    lastIncome = tenpercentIncome;
                }
                var incomeIncrease = (tenpercentIncome * 0.03);
                var newIncome = incomeIncrease + lastIncome;
                var sYear = (startyear + k);
                curDiagDetails['income'][sYear] = newIncome;
                curDiagDetails['income']['yearly'] = tenpercentIncome;
                totalIncome += lastIncome;
                lastIncome = newIncome;

            }
            curDiagDetails['income']['total'] = totalIncome;
            var totalMaintainence = 0;
            var threepercentMaintainece = -1 * yearlyCost * 0.03;
            var lastIncome;
            for (var k7 = 0; k7 < 20; k7++) {
                if (k7 < 19) {
                    var sYear = (startyear + k7);
                    curDiagDetails['maintainence'][sYear] = threepercentMaintainece;
                    totalMaintainence += threepercentMaintainece;
                }
            }

            curDiagDetails['maintainence']['total'] = totalMaintainence;
            diagCosts.push(curDiagDetails);
        }
    }

    // send investment
    self.postMessage({
        'sysGrids': JSON.stringify(sysGrids),
        'diagGrids': JSON.stringify(diagGrids),
        'grid': JSON.stringify(relevantGrid),
        'output': JSON.stringify(diagCosts)
    });
}

function generateGrid(bounds, startyear, systems) {
    var sys = JSON.parse(systems);
    var syslen = sys.length;

    function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 6; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
    bounds = bounds.split(",").map(function(item) {
        return parseFloat(item, 10);
    });
    // 1 hectare grid
    var g = turf.squareGrid(bounds, 0.1, 'kilometers');
    var grid = { "type": "FeatureCollection", "features": [] };
    var gridlen = g.features.length;
    // var initCosts = [];

    var startyear = parseInt(startyear);
    // for (var k1 = 0; k1 < 20; k1++) {
    //     var sYear = (startyear + k1);
    //     var x = {};
    //     x[sYear] = 0;
    //     initCosts.push(x);
    // }
    for (var index = 0; index < gridlen; index++) {
        var curgrid = g.features[index];
        curgrid.properties.id = makeid();

        // for (var e = 0; e < syslen; e++) {
        //     var cursys = sys[e];
        //     var sysid = cursys.id;
        //     var d = { 'maintainence': initCosts, 'income': initCosts, 'dcf': initCosts };
        //     curgrid.properties[sysid] = d;
        // }
        grid.features.push(curgrid);
    }

    return grid;

}
self.onmessage = function(e) {
    grid = generateGrid(e.data.bounds, e.data.startyear, e.data.systems);
    computeAreas(e.data.systemdetails, e.data.systems, e.data.timeline, e.data.startyear, grid);
}