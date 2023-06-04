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
    while (isMatchLeft()) {
        var homeTeam = chooseHomeTeam();
        var awayTeam = chooseAwayTeam(homeTeam);
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

        matchResult(tossWinner, firstBattingTeam, secondBattingTeam)
        totalMatchesPlayed++;
    }

    displayGroups();
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
            "<td><img src='images/teams-logo/" + teamsSortedOrder[index] + ".png' alt='" + teamsSortedOrder[index] + "' height='24'></img> " +
            teams[teamsSortedOrder[index]] + " (" + teamsSortedOrder[index] + ")" + "</td>" +
            // "<td>" + pointsTable[teamsSortedOrder[index]]["tossWon"] + "</td>" +
            // "<td>" + pointsTable[teamsSortedOrder[index]]["battingFirst"] + "</td>" +
            // "<td>" + pointsTable[teamsSortedOrder[index]]["bowlingFirst"] + "</td>" +
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
}

function displayGroups() {
    for (const groupATeam in groupA) {
        $(".group-A-table tbody").append("<tr>" +
            "<td><img src='images/teams-logo/" + groupATeam + ".png' alt='" + groupATeam + "' height='24'></img> " +
            teams[groupATeam] + " (" + groupATeam + ")" + "</td>" +
            "</tr>"
        );
    }
    for (const groupBTeam in groupB) {
        $(".group-B-table tbody").append("<tr>" +
            "<td><img src='images/teams-logo/" + groupBTeam + ".png' alt='" + groupBTeam + "' height='24'></img> " +
            teams[groupBTeam] + " (" + groupBTeam + ")" + "</td>" +
            "</tr>"
        );
    }
}

function teamGroupName(team) {
    if (groupA[team]) {
        return "groupA";
    } else {
        return "groupB";
    }
}

function matchResult(tossWinner, firstBattingTeam, secondBattingTeam) {
    var firstBattingRunScored = firstBattingTeamRunScored();
    var firstBattingBallPlayed = firstBattingTeamBallPlayed();
    var firstBattingWicketLost = firstBattingTeamWicketLost(firstBattingBallPlayed);

    var winnerTeam = decideWinnerOfMatch(firstBattingTeam, secondBattingTeam, firstBattingRunScored);
    var loserTeam = (winnerTeam === firstBattingTeam) ? secondBattingTeam : firstBattingTeam;

    var secondBattingRunScored = (secondBattingTeam === winnerTeam) ? secondBattingTeamRunScored(firstBattingRunScored, "won") :
        secondBattingTeamRunScored(firstBattingRunScored, "lost");
    var secondBattingBallPlayed = (secondBattingTeam === winnerTeam) ? secondBattingTeamBallPlayed(firstBattingRunScored, "won") :
        secondBattingTeamBallPlayed(firstBattingRunScored, "lost");
    var secondBattingWicketLost = secondBattingTeamWicketLost(firstBattingRunScored, secondBattingRunScored, secondBattingBallPlayed);

    pointsTable[winnerTeam]["matches"]++;
    pointsTable[winnerTeam]["won"]++;
    pointsTable[winnerTeam]["points"] += 2;
    pointsTable[loserTeam]["matches"]++;
    pointsTable[loserTeam]["lost"]++;
    pointsTable[tossWinner]["tossWon"]++;
    teamPlayedAgainstCount[firstBattingTeam][teamGroupName(secondBattingTeam)][secondBattingTeam]++;
    teamPlayedAgainstCount[secondBattingTeam][teamGroupName(firstBattingTeam)][firstBattingTeam]++;
    pointsTable[firstBattingTeam]["battingFirst"]++;
    pointsTable[secondBattingTeam]["bowlingFirst"]++;
    pointsTable[firstBattingTeam]["runScored"] += firstBattingRunScored;
    pointsTable[firstBattingTeam]["ballPlayed"] += firstBattingBallPlayed;
    pointsTable[firstBattingTeam]["runScoredAgainst"] += secondBattingRunScored;
    pointsTable[firstBattingTeam]["ballPlayedAgainst"] += secondBattingBallPlayed;
    pointsTable[secondBattingTeam]["runScored"] += secondBattingRunScored;
    pointsTable[secondBattingTeam]["ballPlayed"] += secondBattingBallPlayed;
    pointsTable[secondBattingTeam]["runScoredAgainst"] += firstBattingRunScored;
    pointsTable[secondBattingTeam]["ballPlayedAgainst"] += firstBattingBallPlayed;
    pointsTable[firstBattingTeam]["runrate"] =
        ((pointsTable[firstBattingTeam]["runScored"] / (pointsTable[firstBattingTeam]["ballPlayed"] / 6)) -
            (pointsTable[firstBattingTeam]["runScoredAgainst"] / (pointsTable[firstBattingTeam]["ballPlayedAgainst"] / 6))).toFixed(3);
    pointsTable[secondBattingTeam]["runrate"] =
        ((pointsTable[secondBattingTeam]["runScored"] / (pointsTable[secondBattingTeam]["ballPlayed"] / 6)) -
            (pointsTable[secondBattingTeam]["runScoredAgainst"] / (pointsTable[secondBattingTeam]["ballPlayedAgainst"] / 6))).toFixed(3);

    var winStatement;
    if (firstBattingRunScored > secondBattingRunScored) {
        var wonByRun = firstBattingRunScored - secondBattingRunScored;
        winStatement = (teams[firstBattingTeam] + " won by " + wonByRun + ((wonByRun === 1) ? " run" : " runs"));
    } else {
        var wonByWicket = 10 - secondBattingWicketLost;
        winStatement = (teams[secondBattingTeam] + " won by " + wonByWicket + ((wonByWicket === 1) ? " wicket" : " wickets"));
    }

    matchDivAdd(totalMatchesPlayed + 1,
        "<img src='images/teams-logo/" + firstBattingTeam + ".png' alt='" + firstBattingTeam + "' height='24'></img> " +
        firstBattingTeam + " " + firstBattingRunScored + "/" + firstBattingWicketLost + " (" + Math.floor(firstBattingBallPlayed / 6) + "." + (firstBattingBallPlayed % 6) + ")",
        "<img src='images/teams-logo/" + secondBattingTeam + ".png' alt='" + secondBattingTeam + "' height='24'></img> " +
        secondBattingTeam + " " + secondBattingRunScored + "/" + secondBattingWicketLost + " (" + Math.floor(secondBattingBallPlayed / 6) + "." + (secondBattingBallPlayed % 6) + ")",
        winStatement);
}

function matchDivAdd(matchNo, firstTeam, secondTeam, winStatement) {
    $(".matches-schedule").append("<div class='col-md-6 m-0 p-1'>" +
        "<table class='table table-sm table-bordered m-0 p-0'>" +
        "<thead style='background-color:#130f40; color:#dff9fb;'>" +
        "<tr><th colspan='3' class='text-center'>Match " + matchNo + "</th></tr>" +
        "</thead>" +
        "<tbody style='background-color:#303952; color:#fd79a8;'><tr>" +
        "<td class='text-center'>" + firstTeam + "</td>" +
        "<td class='text-center p-0 align-middle' style='background-color:#ffb142;'><img src='images/versus.png' alt='vs' height='30'></img></td>" +
        "<td class='text-center'>" + secondTeam + "</td>" +
        "</tr></tbody>" +
        "<tfoot style='background-color:#006266; color:#81ecec;'>" +
        "<tr><td colspan='3' class='text-center'>" + winStatement + "</td></tr>" +
        "</tfoot>" +
        "</table>" +
        "</div>");
}

function firstBattingTeamRunScored() {
    var numsToGenerate = [1, 21, 41, 61, 81, 101, 121, 141, 161, 181, 201, 221, 241, 261];
    var discreteProbabilities = [0, 20, 300, 600, 1600, 2400, 4000, 8000, 8000, 4000, 2000, 600, 40, 20];
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

function firstBattingTeamBallPlayed() {
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
        for (let index = 0; index < 3; index++) {
            totalPossibilities.push(firstBattingTeam);
        }
        for (let index = 0; index < 97; index++) {
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
        for (let index = 0; index < 65; index++) {
            totalPossibilities.push(firstBattingTeam);
        }
        for (let index = 0; index < 35; index++) {
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