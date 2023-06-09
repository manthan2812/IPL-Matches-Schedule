var teamPlayedAgainstCount = {},
    pointsTable = {},
    totalMatchesPlayed = 0;

for (const team in teams) {
    var playedAgainstMatches = {},
        playedAgainstGroupATeams = {},
        playedAgainstGroupBTeams = {};

    for (const groupATeam in groupA) {
        if (groupATeam !== team) {
            playedAgainstGroupATeams[groupATeam] = 0;
        }
    }
    playedAgainstMatches["groupA"] = playedAgainstGroupATeams;

    for (const groupBTeam in groupB) {
        if (groupBTeam !== team) {
            playedAgainstGroupBTeams[groupBTeam] = 0;
        }
    }
    playedAgainstMatches["groupB"] = playedAgainstGroupBTeams;

    teamPlayedAgainstCount[team] = playedAgainstMatches;

    pointsTable[team] = {
        "tossWon": 0,
        "matches": 0,
        "won": 0,
        "lost": 0,
        "noresult": 0,
        "runrate": 0,
        "points": 0,
        "runScored": 0,
        "ballPlayed": 0,
        "runScoredAgainst": 0,
        "ballPlayedAgainst": 0,
        "battingFirst": 0,
        "bowlingFirst": 0
    };
}

$(document).ready(function () {
    displayGroups();

    while (isMatchLeft()) {
        var homeTeam = chooseHomeTeam();
        var awayTeam = chooseAwayTeam(homeTeam);

        var resultObject = matchResult(homeTeam, awayTeam);

        teamPlayedAgainstCount[resultObject.firstBattingTeam][teamGroupName(resultObject.secondBattingTeam)][resultObject.secondBattingTeam]++;
        teamPlayedAgainstCount[resultObject.secondBattingTeam][teamGroupName(resultObject.firstBattingTeam)][resultObject.firstBattingTeam]++;
        pointsTable[resultObject.winnerTeam]["matches"]++;
        pointsTable[resultObject.winnerTeam]["won"]++;
        pointsTable[resultObject.winnerTeam]["points"] += 2;
        pointsTable[resultObject.loserTeam]["matches"]++;
        pointsTable[resultObject.loserTeam]["lost"]++;
        pointsTable[resultObject.tossWinner]["tossWon"]++;
        pointsTable[resultObject.firstBattingTeam]["battingFirst"]++;
        pointsTable[resultObject.secondBattingTeam]["bowlingFirst"]++;
        pointsTable[resultObject.firstBattingTeam]["runScored"] += resultObject.firstBattingRunScored;
        pointsTable[resultObject.firstBattingTeam]["ballPlayed"] += resultObject.firstBattingBallPlayed;
        pointsTable[resultObject.firstBattingTeam]["runScoredAgainst"] += resultObject.secondBattingRunScored;
        pointsTable[resultObject.firstBattingTeam]["ballPlayedAgainst"] += resultObject.secondBattingBallPlayed;
        pointsTable[resultObject.secondBattingTeam]["runScored"] += resultObject.secondBattingRunScored;
        pointsTable[resultObject.secondBattingTeam]["ballPlayed"] += resultObject.secondBattingBallPlayed;
        pointsTable[resultObject.secondBattingTeam]["runScoredAgainst"] += resultObject.firstBattingRunScored;
        pointsTable[resultObject.secondBattingTeam]["ballPlayedAgainst"] += resultObject.firstBattingBallPlayed;
        pointsTable[resultObject.firstBattingTeam]["runrate"] =
            ((pointsTable[resultObject.firstBattingTeam]["runScored"] / (pointsTable[resultObject.firstBattingTeam]["ballPlayed"] / 6)) -
                (pointsTable[resultObject.firstBattingTeam]["runScoredAgainst"] / (pointsTable[resultObject.firstBattingTeam]["ballPlayedAgainst"] / 6))).toFixed(3);
        pointsTable[resultObject.secondBattingTeam]["runrate"] =
            ((pointsTable[resultObject.secondBattingTeam]["runScored"] / (pointsTable[resultObject.secondBattingTeam]["ballPlayed"] / 6)) -
                (pointsTable[resultObject.secondBattingTeam]["runScoredAgainst"] / (pointsTable[resultObject.secondBattingTeam]["ballPlayedAgainst"] / 6))).toFixed(3);

        var winStatementDetail = winStatement(resultObject.firstBattingTeam, resultObject.secondBattingTeam, resultObject.firstBattingRunScored,
            resultObject.secondBattingRunScored, resultObject.secondBattingWicketLost, false);
        var firstBattingTeamDetail = "<img src='images/teams-logo/" + resultObject.firstBattingTeam + ".png' alt='" + resultObject.firstBattingTeam + "' height='24'> " +
            resultObject.firstBattingTeam + " " + resultObject.firstBattingRunScored + " / " + resultObject.firstBattingWicketLost + " (" +
            Math.floor(resultObject.firstBattingBallPlayed / 6) + "." + (resultObject.firstBattingBallPlayed % 6) + ")" +
            ((resultObject.firstBattingTeam === resultObject.tossWinner) ? " <img src='images/coin.png' alt='TossWinner' height='16'>" : "");
        var secondBattingTeamDetail = "<img src='images/teams-logo/" + resultObject.secondBattingTeam + ".png' alt='" + resultObject.secondBattingTeam + "' height='24'> " +
            resultObject.secondBattingTeam + " " + resultObject.secondBattingRunScored + " / " + resultObject.secondBattingWicketLost + " (" +
            Math.floor(resultObject.secondBattingBallPlayed / 6) + "." + (resultObject.secondBattingBallPlayed % 6) + ")" +
            ((resultObject.secondBattingTeam === resultObject.tossWinner) ? " <img src='images/coin.png' alt='TossWinner' height='16'>" : "");

        matchDivAdd(totalMatchesPlayed + 1, firstBattingTeamDetail, secondBattingTeamDetail, winStatementDetail,
            resultObject.winnerTeam, resultObject.firstBattingTeam, resultObject.secondBattingTeam);

        totalMatchesPlayed++;
    }

    $(".matches-schedule").removeClass("hide");
    displayPointsTable();
});

function getRandomNumber(totalPossibility) {
    return Math.floor(Math.random() * totalPossibility);
}

function isMatchLeft() {
    for (const [team, groups] of Object.entries(teamPlayedAgainstCount)) {
        for (const [group, opponentTeams] of Object.entries(groups)) {
            for (const [opponentTeam, matchPlayed] of Object.entries(opponentTeams)) {
                if (teamGroupName(team) === group) {
                    if (matchPlayed < 1) {
                        return true;
                    }
                } else {
                    if (matchPlayed < 2) {
                        return true;
                    }
                }
            }
        }
    }

    return false;
}

function chooseHomeTeam() {
    var matchesPlayedByTeams = {};
    for (const [team, groups] of Object.entries(teamPlayedAgainstCount)) {
        var totalMatch = 0;
        for (const [group, opponentTeams] of Object.entries(groups)) {
            for (const [opponentTeam, matchPlayed] of Object.entries(opponentTeams)) {
                totalMatch += matchPlayed;
            }
        }
        matchesPlayedByTeams[team] = totalMatch;
    }

    var leastMatchCountInAll = Math.min(...Object.values(matchesPlayedByTeams));
    var teamsWithLeastMatches = [];
    for (const [team, matchesPlayedByTeam] of Object.entries(matchesPlayedByTeams)) {
        if (matchesPlayedByTeam === leastMatchCountInAll) {
            teamsWithLeastMatches.push(team);
        }
    }
    return teamsWithLeastMatches[getRandomNumber(teamsWithLeastMatches.length)];
}

function chooseAwayTeam(homeTeam) {
    var homeTeamPlayedAgainstTeams = {};
    var homeTeamGroup = teamGroupName(homeTeam);

    for (const [group, opponentTeams] of Object.entries(teamPlayedAgainstCount[homeTeam])) {
        for (const [opponentTeam, matchPlayed] of Object.entries(opponentTeams)) {
            homeTeamPlayedAgainstTeams[opponentTeam] = (group === homeTeamGroup) ? matchPlayed + 1 : matchPlayed;
        }
    }

    var leastMatchCountInAll = Math.min(...Object.values(homeTeamPlayedAgainstTeams));
    var teamsWithLeastMatches = [];
    for (const [team, matchesPlayedByTeam] of Object.entries(homeTeamPlayedAgainstTeams)) {
        if (matchesPlayedByTeam === leastMatchCountInAll) {
            teamsWithLeastMatches.push(team);
        }
    }
    return teamsWithLeastMatches[getRandomNumber(teamsWithLeastMatches.length)];
}

function displayPointsTable() {
    var teamsSortedOrder = Object.keys(pointsTable);

    for (let i = 0; i < teamsSortedOrder.length - 1; i++) {
        for (let j = i + 1; j < teamsSortedOrder.length; j++) {
            if (pointsTable[teamsSortedOrder[i]]["points"] < pointsTable[teamsSortedOrder[j]]["points"]) {
                var temp = teamsSortedOrder[i];
                teamsSortedOrder[i] = teamsSortedOrder[j];
                teamsSortedOrder[j] = temp;
            } else if (pointsTable[teamsSortedOrder[i]]["points"] === pointsTable[teamsSortedOrder[j]]["points"]) {
                if (parseFloat(pointsTable[teamsSortedOrder[i]]["runrate"]) < parseFloat(pointsTable[teamsSortedOrder[j]]["runrate"])) {
                    var temp = teamsSortedOrder[i];
                    teamsSortedOrder[i] = teamsSortedOrder[j];
                    teamsSortedOrder[j] = temp;
                } else if (parseFloat(pointsTable[teamsSortedOrder[i]]["runrate"]) === parseFloat(pointsTable[teamsSortedOrder[j]]["runrate"])) {
                    if (pointsTable[teamsSortedOrder[i]]["runScored"] < pointsTable[teamsSortedOrder[j]]["runScored"]) {
                        var temp = teamsSortedOrder[i];
                        teamsSortedOrder[i] = teamsSortedOrder[j];
                        teamsSortedOrder[j] = temp;
                    }
                }
            }
        }
    }

    for (let index = 0; index < teamsSortedOrder.length; index++) {
        var bgColor = (index < 4) ? "table-primary" : "table-danger";
        $(".points-table tbody").append("<tr class='" + bgColor + "'>" +
            "<th scope='col' class='text-center'>" + (index + 1) + "</th>" +
            "<td><img src='images/teams-logo/" + teamsSortedOrder[index] + ".png' alt='" + teamsSortedOrder[index] + "' height='24'> " +
            teams[teamsSortedOrder[index]] + " (" + teamsSortedOrder[index] + ")" +
            ((index < 4) ? " <img src='images/qualified.png' alt='qualified' height='16'>" : "") + "</td>" +
            "<td>" + pointsTable[teamsSortedOrder[index]]["matches"] + "</td>" +
            "<td>" + pointsTable[teamsSortedOrder[index]]["won"] + "</td>" +
            "<td>" + pointsTable[teamsSortedOrder[index]]["lost"] + "</td>" +
            "<td>" + pointsTable[teamsSortedOrder[index]]["runScored"] + " / " +
            Math.floor(pointsTable[teamsSortedOrder[index]]["ballPlayed"] / 6) + "." + (pointsTable[teamsSortedOrder[index]]["ballPlayed"] % 6) + "</td>" +
            "<td>" + pointsTable[teamsSortedOrder[index]]["runScoredAgainst"] + " / " +
            Math.floor(pointsTable[teamsSortedOrder[index]]["ballPlayedAgainst"] / 6) + "." + (pointsTable[teamsSortedOrder[index]]["ballPlayedAgainst"] % 6) + "</td>" +
            "<td>" + pointsTable[teamsSortedOrder[index]]["runrate"] + "</td>" +
            "<td class='bold dark-green'>" + pointsTable[teamsSortedOrder[index]]["points"] + "</td>" +
            "</tr>"
        );
    }

    $(".points-table").removeClass("hide");
    displayPlayoffs(teamsSortedOrder[0], teamsSortedOrder[1], teamsSortedOrder[2], teamsSortedOrder[3]);
}

function displayPlayoffs(firstTeam, secondTeam, thirdTeam, fourthTeam) {
    // QUALIFIER 1
    var qualifier1Result = matchResult(firstTeam, secondTeam);
    var qualifier1Winner = qualifier1Result.winnerTeam;
    var qualifier1Loser = qualifier1Result.loserTeam;
    $(".playoff-table .firstTeam").html("<img src='images/teams-logo/" + firstTeam + ".png' alt='" + firstTeam + "' height='24'> " +
        firstTeam + " " + qualifier1Result[firstTeam]["battingRunScored"] + " / " + qualifier1Result[firstTeam]["battingWicketLost"] + " (" +
        Math.floor(qualifier1Result[firstTeam]["battingBallPlayed"] / 6) + "." + (qualifier1Result[firstTeam]["battingBallPlayed"] % 6) + ")" +
        ((firstTeam === qualifier1Result["tossWinner"]) ? " <img src='images/coin.png' alt='TossWinner' height='16'>" : "")
    ).css("color", (firstTeam === qualifier1Result["winnerTeam"]) ? "#006400" : "#8b0000").css("background-color", teamsColor[firstTeam]);
    $(".playoff-table .secondTeam").html("<img src='images/teams-logo/" + secondTeam + ".png' alt='" + secondTeam + "' height='24'> " +
        secondTeam + " " + qualifier1Result[secondTeam]["battingRunScored"] + " / " + qualifier1Result[secondTeam]["battingWicketLost"] + " (" +
        Math.floor(qualifier1Result[secondTeam]["battingBallPlayed"] / 6) + "." + (qualifier1Result[secondTeam]["battingBallPlayed"] % 6) + ")" +
        ((secondTeam === qualifier1Result["tossWinner"]) ? " <img src='images/coin.png' alt='TossWinner' height='16'>" : "")
    ).css("color", (secondTeam === qualifier1Result["winnerTeam"]) ? "#006400" : "#8b0000").css("background-color", teamsColor[secondTeam]);
    $(".playoff-table .qualifier1Result").html(winStatement(qualifier1Result.firstBattingTeam, qualifier1Result.secondBattingTeam,
        qualifier1Result.firstBattingRunScored, qualifier1Result.secondBattingRunScored, qualifier1Result.secondBattingWicketLost, true));

    // ELIMINATOR
    var eliminatorResult = matchResult(thirdTeam, fourthTeam);
    var eliminatorWinner = eliminatorResult.winnerTeam;
    $(".playoff-table .thirdTeam").html("<img src='images/teams-logo/" + thirdTeam + ".png' alt='" + thirdTeam + "' height='24'> " +
        thirdTeam + " " + eliminatorResult[thirdTeam]["battingRunScored"] + " / " + eliminatorResult[thirdTeam]["battingWicketLost"] + " (" +
        Math.floor(eliminatorResult[thirdTeam]["battingBallPlayed"] / 6) + "." + (eliminatorResult[thirdTeam]["battingBallPlayed"] % 6) + ")" +
        ((thirdTeam === eliminatorResult["tossWinner"]) ? " <img src='images/coin.png' alt='TossWinner' height='16'>" : "")
    ).css("color", (thirdTeam === eliminatorResult["winnerTeam"]) ? "#006400" : "#8b0000").css("background-color", teamsColor[thirdTeam]);
    $(".playoff-table .fourthTeam").html("<img src='images/teams-logo/" + fourthTeam + ".png' alt='" + fourthTeam + "' height='24'> " +
        fourthTeam + " " + eliminatorResult[fourthTeam]["battingRunScored"] + " / " + eliminatorResult[fourthTeam]["battingWicketLost"] + " (" +
        Math.floor(eliminatorResult[fourthTeam]["battingBallPlayed"] / 6) + "." + (eliminatorResult[fourthTeam]["battingBallPlayed"] % 6) + ")" +
        ((fourthTeam === eliminatorResult["tossWinner"]) ? " <img src='images/coin.png' alt='TossWinner' height='16'>" : "")
    ).css("color", (fourthTeam === eliminatorResult["winnerTeam"]) ? "#006400" : "#8b0000").css("background-color", teamsColor[fourthTeam]);
    $(".playoff-table .eliminatorResult").html(winStatement(eliminatorResult.firstBattingTeam, eliminatorResult.secondBattingTeam,
        eliminatorResult.firstBattingRunScored, eliminatorResult.secondBattingRunScored, eliminatorResult.secondBattingWicketLost, true));

    // QUALIFIER 2
    var qualifier2Result = matchResult(qualifier1Loser, eliminatorWinner);
    var qualifier2Winner = qualifier2Result.winnerTeam;
    $(".playoff-table .q2Team1").html("<img src='images/teams-logo/" + qualifier1Loser + ".png' alt='" + qualifier1Loser + "' height='24'> " +
        qualifier1Loser + " " + qualifier2Result[qualifier1Loser]["battingRunScored"] + " / " + qualifier2Result[qualifier1Loser]["battingWicketLost"] + " (" +
        Math.floor(qualifier2Result[qualifier1Loser]["battingBallPlayed"] / 6) + "." + (qualifier2Result[qualifier1Loser]["battingBallPlayed"] % 6) + ")" +
        ((qualifier1Loser === qualifier2Result["tossWinner"]) ? " <img src='images/coin.png' alt='TossWinner' height='16'>" : "")
    ).css("color", (qualifier1Loser === qualifier2Result["winnerTeam"]) ? "#006400" : "#8b0000").css("background-color", teamsColor[qualifier1Loser]);
    $(".playoff-table .q2Team2").html("<img src='images/teams-logo/" + eliminatorWinner + ".png' alt='" + eliminatorWinner + "' height='24'> " +
        eliminatorWinner + " " + qualifier2Result[eliminatorWinner]["battingRunScored"] + " / " + qualifier2Result[eliminatorWinner]["battingWicketLost"] + " (" +
        Math.floor(qualifier2Result[eliminatorWinner]["battingBallPlayed"] / 6) + "." + (qualifier2Result[eliminatorWinner]["battingBallPlayed"] % 6) + ")" +
        ((eliminatorWinner === qualifier2Result["tossWinner"]) ? " <img src='images/coin.png' alt='TossWinner' height='16'>" : "")
    ).css("color", (eliminatorWinner === qualifier2Result["winnerTeam"]) ? "#006400" : "#8b0000").css("background-color", teamsColor[eliminatorWinner]);
    $(".playoff-table .qualifier2Result").html(winStatement(qualifier2Result.firstBattingTeam, qualifier2Result.secondBattingTeam,
        qualifier2Result.firstBattingRunScored, qualifier2Result.secondBattingRunScored, qualifier2Result.secondBattingWicketLost, true));

    // THE FINAL
    var finalResult = matchResult(qualifier1Winner, qualifier2Winner);
    var finalWinner = finalResult.winnerTeam;
    $(".playoff-table .finalist1").html("<img src='images/teams-logo/" + qualifier1Winner + ".png' alt='" + qualifier1Winner + "' height='24'> " +
        qualifier1Winner + " " + finalResult[qualifier1Winner]["battingRunScored"] + " / " + finalResult[qualifier1Winner]["battingWicketLost"] + " (" +
        Math.floor(finalResult[qualifier1Winner]["battingBallPlayed"] / 6) + "." + (finalResult[qualifier1Winner]["battingBallPlayed"] % 6) + ")" +
        ((qualifier1Winner === finalResult["tossWinner"]) ? " <img src='images/coin.png' alt='TossWinner' height='16'>" : "")
    ).css("color", (qualifier1Winner === finalResult["winnerTeam"]) ? "#006400" : "#8b0000").css("background-color", teamsColor[qualifier1Winner]);
    $(".playoff-table .finalist2").html("<img src='images/teams-logo/" + qualifier2Winner + ".png' alt='" + qualifier2Winner + "' height='24'> " +
        qualifier2Winner + " " + finalResult[qualifier2Winner]["battingRunScored"] + " / " + finalResult[qualifier2Winner]["battingWicketLost"] + " (" +
        Math.floor(finalResult[qualifier2Winner]["battingBallPlayed"] / 6) + "." + (finalResult[qualifier2Winner]["battingBallPlayed"] % 6) + ")" +
        ((qualifier2Winner === finalResult["tossWinner"]) ? " <img src='images/coin.png' alt='TossWinner' height='16'>" : "")
    ).css("color", (qualifier2Winner === finalResult["winnerTeam"]) ? "#006400" : "#8b0000").css("background-color", teamsColor[qualifier2Winner]);
    $(".playoff-table .winnerFinal").html(winStatement(finalResult.firstBattingTeam, finalResult.secondBattingTeam,
        finalResult.firstBattingRunScored, finalResult.secondBattingRunScored, finalResult.secondBattingWicketLost, true));

    $(".playoff-table").removeClass("hide");

    // CHAMPION
    $(".champion-team-logo").html("<img src='images/teams-logo/" + finalWinner + ".png' alt='" + finalWinner + "' height='48'>");
    $(".champion-text").html(teams[finalWinner].toUpperCase() + " (" + finalWinner + ")");
    $(".champion-container").removeClass("hide");
}

function displayGroups() {
    for (const groupATeam in groupA) {
        $(".group-A-table tbody").append("<tr>" +
            "<td><img src='images/teams-logo/" + groupATeam + ".png' alt='" + groupATeam + "' height='24'> " +
            teams[groupATeam] + " (" + groupATeam + ")" + "</td>" +
            "</tr>"
        );
    }

    for (const groupBTeam in groupB) {
        $(".group-B-table tbody").append("<tr>" +
            "<td><img src='images/teams-logo/" + groupBTeam + ".png' alt='" + groupBTeam + "' height='24'> " +
            teams[groupBTeam] + " (" + groupBTeam + ")" + "</td>" +
            "</tr>"
        );
    }

    $(".group-A-table").removeClass("hide");
    $(".group-B-table").removeClass("hide");
}

function teamGroupName(team) {
    if (groupA[team]) {
        return "groupA";
    } else {
        return "groupB";
    }
}

function matchResult(homeTeam, awayTeam) {
    var tossWinner = (getRandomNumber(2) === 1) ? awayTeam : homeTeam;
    var decisionOfBatOrBowl = chooseBatOrBowl();
    var firstBattingTeam, secondBattingTeam;

    if (decisionOfBatOrBowl === "bat") {
        firstBattingTeam = tossWinner;
        secondBattingTeam = (tossWinner === homeTeam) ? awayTeam : homeTeam;
    } else {
        firstBattingTeam = (tossWinner === homeTeam) ? awayTeam : homeTeam;
        secondBattingTeam = tossWinner;
    }

    var firstBattingRunScored = firstBattingTeamRunScored();
    var firstBattingBallPlayed = firstBattingTeamBallPlayed(firstBattingRunScored);
    var firstBattingWicketLost = firstBattingTeamWicketLost(firstBattingBallPlayed);

    var winnerTeam = decideWinnerOfMatch(firstBattingTeam, secondBattingTeam, firstBattingRunScored);
    var loserTeam = (winnerTeam === firstBattingTeam) ? secondBattingTeam : firstBattingTeam;

    var secondBattingRunScored = (secondBattingTeam === winnerTeam) ? secondBattingTeamRunScored(firstBattingRunScored, "won") :
        secondBattingTeamRunScored(firstBattingRunScored, "lost");
    var secondBattingBallPlayed = (secondBattingTeam === winnerTeam) ? secondBattingTeamBallPlayed(firstBattingRunScored, "won") :
        secondBattingTeamBallPlayed(firstBattingRunScored, "lost");
    var secondBattingWicketLost = secondBattingTeamWicketLost(firstBattingRunScored, secondBattingRunScored, secondBattingBallPlayed);

    var resultObject = {
        "winnerTeam": winnerTeam,
        "loserTeam": loserTeam,
        "tossWinner": tossWinner,
        "firstBattingTeam": firstBattingTeam,
        "secondBattingTeam": secondBattingTeam,
        "firstBattingRunScored": firstBattingRunScored,
        "firstBattingBallPlayed": firstBattingBallPlayed,
        "firstBattingWicketLost": firstBattingWicketLost,
        "secondBattingRunScored": secondBattingRunScored,
        "secondBattingBallPlayed": secondBattingBallPlayed,
        "secondBattingWicketLost": secondBattingWicketLost,
    };

    resultObject[firstBattingTeam] = {
        "battingRunScored": firstBattingRunScored,
        "battingBallPlayed": firstBattingBallPlayed,
        "battingWicketLost": firstBattingWicketLost
    };
    resultObject[secondBattingTeam] = {
        "battingRunScored": secondBattingRunScored,
        "battingBallPlayed": secondBattingBallPlayed,
        "battingWicketLost": secondBattingWicketLost
    };

    return resultObject;
}

function winStatement(firstBattingTeam, secondBattingTeam, firstBattingRunScored, secondBattingRunScored, secondBattingWicketLost, isPlayoff) {
    if (isPlayoff === true) {
        if (firstBattingRunScored > secondBattingRunScored) {
            var wonByRun = firstBattingRunScored - secondBattingRunScored;
            return (firstBattingTeam + " won by " + wonByRun + ((wonByRun === 1) ? " run" : " runs"));
        } else {
            var wonByWicket = 10 - secondBattingWicketLost;
            return (secondBattingTeam + " won by " + wonByWicket + ((wonByWicket === 1) ? " wicket" : " wickets"));
        }
    } else {
        if (firstBattingRunScored > secondBattingRunScored) {
            var wonByRun = firstBattingRunScored - secondBattingRunScored;
            return (teams[firstBattingTeam] + " won by " + wonByRun + ((wonByRun === 1) ? " run" : " runs"));
        } else {
            var wonByWicket = 10 - secondBattingWicketLost;
            return (teams[secondBattingTeam] + " won by " + wonByWicket + ((wonByWicket === 1) ? " wicket" : " wickets"));
        }
    }
}

function matchDivAdd(matchNo, firstBattingTeamDetail, secondBattingTeamDetail, winStatement, winnerTeam, firstBattingTeam, secondBattingTeam) {
    $(".matches-schedule").append("<div class='col-md-6 m-0 p-1'>" +
        "<table class='table table-sm table-borderless m-0 p-0'>" +
        "<thead style='background: linear-gradient(to top, #660066 0%, #000066 100%); color:#dff9fb;'>" +
        "<tr><th colspan='3' class='text-center'>Match " + matchNo + "</th></tr>" +
        "</thead>" +
        "<tbody style='background: linear-gradient(to right, #00ffff 0%, #ffff66 100%); color:#cc8e35;'><tr>" +
        "<td class='text-center' style='" + ((winnerTeam === firstBattingTeam) ? "color:#006400;" : "color:#8b0000;") + "'>" + firstBattingTeamDetail + "</td>" +
        "<td class='text-center p-0 align-middle'><img src='images/versus.png' alt='vs' height='30'></td>" +
        "<td class='text-center' style='" + ((winnerTeam === secondBattingTeam) ? "color:#006400;" : "color:#8b0000;") + "'>" + secondBattingTeamDetail + "</td>" +
        "</tr></tbody>" +
        "<tfoot style='background: linear-gradient(to bottom, #cc0099 0%, #cc3300 100%); color:#d8bfd8;'>" +
        "<tr><td colspan='3' class='text-center'>" + winStatement + "</td></tr>" +
        "</tfoot>" +
        "</table>" +
        "</div>");
}

function firstBattingTeamRunScored() {
    var numsToGenerate = [1, 21, 41, 61, 81, 101, 121, 141, 161, 181, 201, 221, 241, 261];
    var discreteProbabilities = [0, 20, 300, 600, 1600, 2400, 4000, 8000, 8000, 5000, 3000, 600, 40, 20];
    var totalPossibilities = [];
    for (const key in numsToGenerate) {
        var count = 0;
        for (let index = 0; index < discreteProbabilities[key]; index++) {
            totalPossibilities.push(numsToGenerate[key] + count);
            count = (count + 1) % 20;
        }
    }
    return totalPossibilities[getRandomNumber(totalPossibilities.length)];
}

function firstBattingTeamBallPlayed(firstBattingRunScored) {
    var numsToGenerate = Array.from({
        length: 120
    }, (_, i) => i + 1);

    var totalPossibilities = [],
        times;
    for (const key in numsToGenerate) {
        if (numsToGenerate[key] <= 36)
            times = 0;
        else if (numsToGenerate[key] <= 50)
            times = 1;
        else if (numsToGenerate[key] <= 80)
            times = 3;
        else if (numsToGenerate[key] <= 100)
            times = 10;
        else if (numsToGenerate[key] <= 119)
            times = 30;
        else
            times = 5000;
        for (let index = 0; index < times; index++) {
            totalPossibilities.push(numsToGenerate[key]);
        }
    }
    return totalPossibilities[getRandomNumber(totalPossibilities.length)];
}

function firstBattingTeamWicketLost(firstBattingBallPlayed) {
    if (firstBattingBallPlayed < 120) {
        return 10;
    } else {
        var discreteProbabilities = [1, 1, 5, 20, 40, 80, 70, 50, 30, 10, 2];
        var totalPossibilities = [];
        for (const key in discreteProbabilities) {
            for (let index = 0; index < discreteProbabilities[key]; index++) {
                totalPossibilities.push(key);
            }
        }
        return totalPossibilities[getRandomNumber(totalPossibilities.length)];
    }
}

function secondBattingTeamRunScored(firstBattingRunScored, wonOrLost) {
    if (wonOrLost === "won") {
        var numsToGenerate = [...Array((firstBattingRunScored + 7)).keys()].filter(item => item > firstBattingRunScored);
        var discreteProbabilities = [32, 16, 8, 4, 2, 1];
        var totalPossibilities = [];
        for (const key in numsToGenerate) {
            for (let index = 0; index < discreteProbabilities[key]; index++) {
                totalPossibilities.push(numsToGenerate[key]);
            }
        }
        return totalPossibilities[getRandomNumber(totalPossibilities.length)];
    } else {
        var numsToGenerate = [...Array((firstBattingRunScored)).keys()];
        var totalPossibilities = [],
            times;
        for (const key in numsToGenerate) {
            if (firstBattingRunScored <= 100) {
                if (numsToGenerate[key] <= 40)
                    times = 0;
                else if (numsToGenerate[key] <= 60)
                    times = 1;
                else if (numsToGenerate[key] <= 80)
                    times = 15;
                else
                    times = 500;
            } else if (firstBattingRunScored <= 150) {
                if (numsToGenerate[key] <= 30)
                    times = 0;
                else if (numsToGenerate[key] <= 60)
                    times = 1;
                else if (numsToGenerate[key] <= 90)
                    times = 8;
                else if (numsToGenerate[key] <= 120)
                    times = 90;
                else
                    times = 500;
            } else if (firstBattingRunScored <= 200) {
                if (numsToGenerate[key] <= 50)
                    times = 0;
                else if (numsToGenerate[key] <= 100)
                    times = 5;
                else if (numsToGenerate[key] <= 150)
                    times = 60;
                else
                    times = 500;
            } else {
                if (numsToGenerate[key] <= 50)
                    times = 0;
                else if (numsToGenerate[key] <= 100)
                    times = 5;
                else if (numsToGenerate[key] <= 150)
                    times = 100;
                else if (numsToGenerate[key] <= 200)
                    times = 300;
                else
                    times = 500;
            }

            for (let index = 0; index < times; index++) {
                totalPossibilities.push(numsToGenerate[key]);
            }
        }
        return totalPossibilities[getRandomNumber(totalPossibilities.length)];
    }
}

function secondBattingTeamBallPlayed(firstBattingRunScored, wonOrLost) {
    var numsToGenerate = Array.from({
        length: 120
    }, (_, i) => i + 1);

    if (wonOrLost === "won") {
        var totalPossibilities = [],
            times;
        for (const key in numsToGenerate) {
            if (firstBattingRunScored <= 60) {
                if (numsToGenerate[key] <= 20)
                    times = 0;
                else if (numsToGenerate[key] <= 50)
                    times = 500;
                else if (numsToGenerate[key] <= 80)
                    times = 50;
                else
                    times = 50;
            } else if (firstBattingRunScored <= 100) {
                if (numsToGenerate[key] <= 36)
                    times = 0;
                else if (numsToGenerate[key] <= 50)
                    times = 1;
                else if (numsToGenerate[key] <= 70)
                    times = 200;
                else if (numsToGenerate[key] <= 90)
                    times = 200;
                else if (numsToGenerate[key] <= 102)
                    times = 50;
                else
                    times = 20;
            } else if (firstBattingRunScored <= 150) {
                if (numsToGenerate[key] <= 36)
                    times = 0;
                else if (numsToGenerate[key] <= 50)
                    times = 1;
                else if (numsToGenerate[key] <= 70)
                    times = 50;
                else if (numsToGenerate[key] <= 90)
                    times = 80;
                else if (numsToGenerate[key] <= 102)
                    times = 500;
                else
                    times = 500;
            } else if (firstBattingRunScored <= 200) {
                if (numsToGenerate[key] <= 50)
                    times = 0;
                else if (numsToGenerate[key] <= 70)
                    times = 1;
                else if (numsToGenerate[key] <= 90)
                    times = 10;
                else if (numsToGenerate[key] <= 100)
                    times = 30;
                else if (numsToGenerate[key] <= 110)
                    times = 300;
                else
                    times = 900;
            } else {
                if (numsToGenerate[key] <= 50)
                    times = 0;
                else if (numsToGenerate[key] <= 70)
                    times = 1;
                else if (numsToGenerate[key] <= 90)
                    times = 5;
                else if (numsToGenerate[key] <= 100)
                    times = 20;
                else if (numsToGenerate[key] <= 110)
                    times = 300;
                else
                    times = 1500;
            }

            for (let index = 0; index < times; index++) {
                totalPossibilities.push(numsToGenerate[key]);
            }
        }
        return totalPossibilities[getRandomNumber(totalPossibilities.length)];
    } else {
        var totalPossibilities = [],
            times;
        for (const key in numsToGenerate) {
            if (numsToGenerate[key] <= 36)
                times = 0;
            else if (numsToGenerate[key] <= 50)
                times = 1;
            else if (numsToGenerate[key] <= 70)
                times = 5;
            else if (numsToGenerate[key] <= 90)
                times = 30;
            else if (numsToGenerate[key] <= 102)
                times = 90;
            else
                times = 1500;
            for (let index = 0; index < times; index++) {
                totalPossibilities.push(numsToGenerate[key]);
            }
        }
        return totalPossibilities[getRandomNumber(totalPossibilities.length)];
    }
}

function secondBattingTeamWicketLost(firstBattingRunScored, secondBattingRunScored, secondBattingBallPlayed) {
    var margin = firstBattingRunScored - secondBattingRunScored;
    if (margin > 0 && secondBattingBallPlayed < 120) {
        return 10;
    } else if (margin > 0 && secondBattingBallPlayed === 120) {
        var discreteProbabilities = [1, 1, 5, 20, 40, 80, 70, 50, 30, 10, 5];
        var totalPossibilities = [];
        for (const key in discreteProbabilities) {
            for (let index = 0; index < discreteProbabilities[key]; index++) {
                totalPossibilities.push(key);
            }
        }
        return totalPossibilities[getRandomNumber(totalPossibilities.length)];
    } else {
        var discreteProbabilities = [1, 8, 30, 50, 90, 60, 40, 20, 10, 5];
        var totalPossibilities = [];
        for (const key in discreteProbabilities) {
            for (let index = 0; index < discreteProbabilities[key]; index++) {
                totalPossibilities.push(key);
            }
        }
        return totalPossibilities[getRandomNumber(totalPossibilities.length)];
    }
}

function decideWinnerOfMatch(firstBattingTeam, secondBattingTeam, firstBattingRunScored) {
    if (firstBattingRunScored <= 75) {
        return secondBattingTeam;
    } else if (firstBattingRunScored <= 120) {
        var totalPossibilities = [];
        for (let index = 0; index < 2; index++) {
            totalPossibilities.push(firstBattingTeam);
        }
        for (let index = 0; index < 98; index++) {
            totalPossibilities.push(secondBattingTeam);
        }
        return totalPossibilities[getRandomNumber(totalPossibilities.length)];
    } else if (firstBattingRunScored <= 150) {
        var totalPossibilities = [];
        for (let index = 0; index < 35; index++) {
            totalPossibilities.push(firstBattingTeam);
        }
        for (let index = 0; index < 65; index++) {
            totalPossibilities.push(secondBattingTeam);
        }
        return totalPossibilities[getRandomNumber(totalPossibilities.length)];
    } else if (firstBattingRunScored <= 180) {
        var totalPossibilities = [];
        for (let index = 0; index < 50; index++) {
            totalPossibilities.push(firstBattingTeam);
        }
        for (let index = 0; index < 50; index++) {
            totalPossibilities.push(secondBattingTeam);
        }
        return totalPossibilities[getRandomNumber(totalPossibilities.length)];
    } else if (firstBattingRunScored <= 210) {
        var totalPossibilities = [];
        for (let index = 0; index < 60; index++) {
            totalPossibilities.push(firstBattingTeam);
        }
        for (let index = 0; index < 40; index++) {
            totalPossibilities.push(secondBattingTeam);
        }
        return totalPossibilities[getRandomNumber(totalPossibilities.length)];
    } else if (firstBattingRunScored <= 240) {
        var totalPossibilities = [];
        for (let index = 0; index < 95; index++) {
            totalPossibilities.push(firstBattingTeam);
        }
        for (let index = 0; index < 5; index++) {
            totalPossibilities.push(secondBattingTeam);
        }
        return totalPossibilities[getRandomNumber(totalPossibilities.length)];
    } else {
        var totalPossibilities = [];
        for (let index = 0; index < 99; index++) {
            totalPossibilities.push(firstBattingTeam);
        }
        for (let index = 0; index < 1; index++) {
            totalPossibilities.push(secondBattingTeam);
        }
        return totalPossibilities[getRandomNumber(totalPossibilities.length)];
    }
}

function chooseBatOrBowl() {
    var totalPossibilities = [];
    for (let index = 0; index < 4; index++) {
        totalPossibilities.push("bat");
    }
    for (let index = 0; index < 6; index++) {
        totalPossibilities.push("bowl");
    }
    return totalPossibilities[getRandomNumber(totalPossibilities.length)];
}