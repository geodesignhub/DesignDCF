function computeFinanceMaps(grid, sysGrid, diagGrid, investmentdata, selectedsystems) {
    var grid = JSON.parse(grid);
    var sysGrid = JSON.parse(sysGrid);
    var diagGrid = JSON.parse(diagGrid);
    var investmentdata = JSON.parse(investmentdata);

    if (selectedsystems !== 'all') {
        var selectedsystems = JSON.parse(selectedsystems);
    }

    var incomeGrid = { "type": "FeatureCollection", "features": [] };
    var investmentGrid = { "type": "FeatureCollection", "features": [] };
    var maintainenceGrid = { "type": "FeatureCollection", "features": [] };
    var dcfGrid = { "type": "FeatureCollection", "features": [] };

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

    for (var sysid in sysGrid) { // iterate over the systems. 
        if ((selectedsystems == 'all') || (selectedsystems.includes(sysid))) { // this system is in the filtered list. 
            if (sysGrid.hasOwnProperty(parseInt(sysid))) {
                var filteredinvestmentData = investmentdata.filter(function(el) {
                    return el.sysid == parseInt(sysid);
                }); // filtered investment data has only the diagrams for this system. 
                for (var i1 = 0; i1 < filteredinvestmentData.length; i1++) { // loop over the investment data. 
                    var curData = filteredinvestmentData[i1]; // current investment data
                    var diagID = curData.id; // diagram id of the current investment
                    var filteredIDs = diagGrid[diagID]; // the grid IDs that this diagram intersects. 
                    var filteredGridlen = filteredIDs.length; // number of grid cells that this diagram intersects
                    for (var i2 = 0; i2 < filteredGridlen; i2++) {
                        var curDiagGrid = filteredIDs[i2]; // the unique ID of the idagram. 
                        for (var i3 = 0; i3 < grid.features.length; i3++) {
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
                                    Object.keys(origYearlyInvestment).map(function(a) {
                                        newYearlyInvestment[a] = origYearlyInvestment[a] + curYearlyInvestment[a]
                                    });
                                    investGrid.properties.investment = newYearlyInvestment;

                                    var origYearlyIncome = incGrid.properties.income;
                                    var curYearlyIncome = curData.income;
                                    var newYearlyIncome = {};
                                    Object.keys(origYearlyIncome).map(function(a) {
                                        newYearlyIncome[a] = origYearlyIncome[a] + curYearlyIncome[a]
                                    });
                                    incGrid.properties.income = newYearlyIncome;


                                    var origYearlyMaintainence = maintGrid.properties.income;
                                    var curYearlyMaintainence = curData.income;
                                    var newYearlyMaintainence = {};
                                    Object.keys(origYearlyMaintainence).map(function(a) {
                                        newYearlyMaintainence[a] = origYearlyMaintainence[a] + curYearlyMaintainence[a]
                                    });
                                    maintGrid.properties.maintainence = newYearlyMaintainence;

                                } else {
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
}


self.onmessage = function(e) {
    grid = computeFinanceMaps(e.data.grid, e.data.sysGrid, e.data.diagGrid, e.data.investmentdata, e.data.selectedsystems);

}