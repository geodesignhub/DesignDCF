importScripts('../js/turf.min.js');
importScripts('../js/moment.min.js');

function computeAreas(systemdetails, systems, timeline, startyear) {
    var systemdetails = JSON.parse(systemdetails);
    var systems = JSON.parse(systems);
    var timeline = JSON.parse(timeline);
    var startyear = parseInt(startyear);
    diagCosts = [];
    var syslen = systems.length;
    var sysdetlen = systemdetails.length;
    // for each diagram, compute the area
    for (var x = 0; x < syslen; x++) {
        var cSys = systems[x];
        var allDiagrams = cSys.diagrams;
        var allDiaglen = allDiagrams.length;
        for (var y = 0; y < allDiaglen; y++) {
            var sysCost = 0;
            var cDiag = allDiagrams[y];
            if (cDiag.features.length > 0) {
                var diagID = cDiag.features[0].properties.diagramid;
                var sysName = cDiag.features[0].properties.sysname;
            }
            var curDiagDetails = { 'id': diagID };
            for (var h = 0; h < sysdetlen; h++) {
                var cSys = systemdetails[h];
                var sName = cSys['sysname'];
                if (sName === sysName) {
                    sysCost = cSys['syscost'];
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
            var lastIncome;
            for (var k = 0; k < numYears; k++) {

                if (k < 19) {
                    var incomeIncrease = (tenpercentIncome * 0.03);
                    var newIncome = incomeIncrease + lastIncome;
                    var sYear = (startyear + k);
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
            for (var k = 0; k < 20; k++) {
                if (k < 19) {
                    var sYear = (startyear + k);
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
        'output': JSON.stringify(diagCosts)
    });
}

self.onmessage = function(e) {
    computeAreas(e.data.systemdetails, e.data.systems, e.data.timeline, e.data.startyear);
}
