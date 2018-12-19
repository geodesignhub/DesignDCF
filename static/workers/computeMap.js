function getDiagramSystemTitle(allDiagrams, diagramid) {
    var sysName = 'NA';
    var diagName = 'NA';
    var syslen = allDiagrams.length;
    loop1:
        for (var x = 0; x < syslen; x++) {
            var cSys = allDiagrams[x];

            var all_current_Diagrams = cSys.diagrams;

            var allDiaglen = all_current_Diagrams.length;

            if (allDiaglen > 0) {
                loop2: for (var y = 0; y < allDiaglen; y++) {
                    var cDiag = all_current_Diagrams[y];
                    var diagram_ID = cDiag.features[0].properties.diagramid;
                    if (diagramid == diagram_ID) {
                        sysName = cDiag.features[0].properties.sysname;
                        diagName = cDiag.features[0].properties.description;
                        break loop1;
                    }
                }
            }
        }
    const sys_title = sysName + ' ' + diagName;

    return sys_title
}

function computeFinanceMaps(grid, sysGrid, diagGrid, investmentdata, selectedsystems, all_diagrams) {
    var grid = JSON.parse(grid);
    var sysGrid = JSON.parse(sysGrid);
    var diagGrid = JSON.parse(diagGrid);
    var investmentdata = JSON.parse(investmentdata);
    const allDiagrams = JSON.parse(all_diagrams);

    if (selectedsystems !== 'all') {
        var selectedsystems = JSON.parse(selectedsystems);
    }

    var incomeGrid = {
        "type": "FeatureCollection",
        "features": []
    };
    var investmentGrid = {
        "type": "FeatureCollection",
        "features": []
    };
    var maintainenceGrid = {
        "type": "FeatureCollection",
        "features": []
    };
    var dcfGrid = {
        "type": "FeatureCollection",
        "features": []
    };

    // console.log(JSON.stringify(grid));
    // console.log(JSON.stringify(sysGrid));
    // console.log(JSON.stringify(diagGrid));
    // console.log(JSON.stringify(investmentdata));

    var gridlen = grid.features.length;

    var addedIDs = [];
    var finalInvestmentGrid = {};
    var finalMaintainenceGrid = {};
    var finalIncomeGrid = {};
    var finaldcfGrid = {};
    var fullproc = Object.keys(sysGrid).length;
    var counter = 0;
    for (var sysid in sysGrid) { // iterate over the systems. 
        if ((selectedsystems == 'all') || (selectedsystems.includes(sysid))) { // this system is in the filtered list. 
            if (sysGrid.hasOwnProperty(parseInt(sysid))) {
                var filteredinvestmentData = investmentdata.filter(function (el) {
                    return el.sysid == parseInt(sysid);
                }); // filtered investment data has only the diagrams for this system. 
                const filtered_investmentdata_length = filteredinvestmentData.length;
                for (var i1 = 0; i1 < filtered_investmentdata_length; i1++) { // loop over the investment data. 
                    var curData = filteredinvestmentData[i1]; // current investment data
                    var diagID = curData.id; // diagram id of the current investment
                    const diagram_name_sys = getDiagramSystemTitle(allDiagrams, diagID);
                    // console.log(diagram_name_sys);
                    var name_added = 0;
                    var filteredIDs = diagGrid[diagID]; // the grid IDs that this diagram intersects. 
                    var filteredGridlen = filteredIDs.length; // number of grid cells that this diagram intersects
                    for (var i2 = 0; i2 < filteredGridlen; i2++) {
                        // var curDiagGrid = filteredIDs[i2]; // the unique ID of the idagram. 
                        var prop_added = 0;
                        for (var i3 = 0; i3 < gridlen; i3++) {
                            var curGrid = grid.features[i3];
                            var curGridID = curGrid.properties.id;

                            if (filteredIDs.includes(curGridID)) { // while looping over the master grid, check if this ID needs to be included. 
                                var investGrid;
                                var totalInvest = curData.totalInvestment;
                                var yearlyInvestment = curData.investment;

                                var incGrid;
                                var yearlyIncome = curData.income;

                                var maintGrid;
                                var yearlyMaintainence = curData.maintainence;


                                if (addedIDs.includes(curGridID)) { // someone has already added the data, retrive it and work with it. 
                                    investGrid = finalInvestmentGrid[curGridID];
                                    var newtotalInvest = (curData.totalInvestment / filteredGridlen);
                                    var origInvest = investGrid.properties.totalInvestment;

                                    investGrid.properties.totalInvestment = (origInvest + newtotalInvest);

                                    incGrid = finalIncomeGrid[curGridID];
                                    var newtotalIncome = (curData.income['total'] / filteredGridlen);
                                    var origIncome = incGrid.properties.totalIncome;

                                    incGrid.properties.totalIncome = (origIncome + newtotalIncome);

                                    maintGrid = finalMaintainenceGrid[curGridID];
                                    var newtotalMaintainence = (curData.maintainence['total'] / filteredGridlen);
                                    var origMaintainence = maintGrid.properties.totalMaintainence;
                                    maintGrid.properties.totalMaintainence = (origMaintainence + newtotalMaintainence);


                                    var origYearlyInvestment = investGrid.properties.investment;
                                    var curYearlyInvestment = curData.investment;
                                    var newYearlyInvestment = {};
                                    Object.keys(origYearlyInvestment).map(function (a) {
                                        newYearlyInvestment[a] = (origYearlyInvestment[a] / filteredGridlen) + (curYearlyInvestment[a] / filteredGridlen)
                                    });
                                    investGrid.properties.investment = newYearlyInvestment;

                                    var origYearlyIncome = incGrid.properties.income;
                                    var curYearlyIncome = curData.income;
                                    var newYearlyIncome = {};
                                    Object.keys(origYearlyIncome).map(function (a) {
                                        newYearlyIncome[a] = (origYearlyIncome[a] / filteredGridlen) + (curYearlyIncome[a] / filteredGridlen)
                                    });
                                    incGrid.properties.income = newYearlyIncome;

                                    var origYearlyMaintainence = maintGrid.properties.maintainence;
                                    var curYearlyMaintainence = curData.maintainence;
                                    var newYearlyMaintainence = {};
                                    Object.keys(origYearlyMaintainence).map(function (a) {
                                        newYearlyMaintainence[a] = (origYearlyMaintainence[a] / filteredGridlen) + (curYearlyMaintainence[a] / filteredGridlen)
                                    });
                                    maintGrid.properties.maintainence = newYearlyMaintainence;

                                } else {

                                    const x = (typeof curGrid.properties.diagrams !== 'undefined') ? (curGrid.properties.diagrams + diagram_name_sys) : diagram_name_sys;
                                    curGrid.properties.diagrams = x;

                                    investGrid = curGrid;
                                    investGrid.properties.totalInvestment = (totalInvest / filteredGridlen);
                                    investGrid.properties.investment = yearlyInvestment;

                                    incGrid = curGrid;
                                    incGrid.properties.income = yearlyIncome;
                                    incGrid.properties.totalIncome = (yearlyIncome['total'] / filteredGridlen);

                                    maintGrid = curGrid;
                                    maintGrid.properties.maintainence = yearlyMaintainence;
                                    maintGrid.properties.totalMaintainence = (yearlyMaintainence['total'] / filteredGridlen);
                                }

                                addedIDs.push(curGridID);
                                finalInvestmentGrid[curGridID] = investGrid; // assign back. 
                                finalIncomeGrid[curGridID] = incGrid; // assign back. 
                                finalMaintainenceGrid[curGridID] = maintGrid; // assign back. 
                            }
                        }
                    }
                }
            }
        }

        counter += 1;
        self.postMessage({
            'percentcomplete': parseInt((100 * counter) / fullproc),
            'mode': 'status',
        });
    }

    // console.log(JSON.stringify(finalInvestmentGrid));
    for (var gridid in finalInvestmentGrid) {
        if (finalInvestmentGrid.hasOwnProperty(gridid)) {
            var curInvestmentGrid = finalInvestmentGrid[gridid];
            investmentGrid.features.push(curInvestmentGrid);
        }
    }

    for (var gridid in finalIncomeGrid) {
        if (finalIncomeGrid.hasOwnProperty(gridid)) {
            var curIncomeGrid = finalIncomeGrid[gridid];
            incomeGrid.features.push(curIncomeGrid);
        }
    }

    for (var gridid in finalMaintainenceGrid) {
        if (finalMaintainenceGrid.hasOwnProperty(gridid)) {
            var curMaintainenceGrid = finalMaintainenceGrid[gridid];
            maintainenceGrid.features.push(curMaintainenceGrid);
        }
    }

    //     self.postMessage({
    //     'percentcomplete': parseInt((100 * counter) / fullproc),
    //     'mode': 'status',
    // });

    // send investment
    self.postMessage({
        'incomeGrid': JSON.stringify(incomeGrid),
        'investmentGrid': JSON.stringify(investmentGrid),
        'maintainenceGrid': JSON.stringify(maintainenceGrid),
        'dcfgrid': JSON.stringify(dcfGrid)
    });

    // close the worker
    self.close();
}


self.onmessage = function (e) {
    grid = computeFinanceMaps(e.data.grid, e.data.sysGrid, e.data.diagGrid, e.data.investmentdata, e.data.selectedsystems, e.data.allDiagrams);

}