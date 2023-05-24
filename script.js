var teamPlayedAgainstTeamsCount = {},
    pointsTable = {},
    totalMatchesPlayed = 0,
    row = 0;

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

    teamPlayedAgainstTeamsCount[team] = playedAgainstMatches;
    pointsTable[team] = [0, 0, 0, 0];
}

$(document).ready(function () {
    while (isMatchLeft()) {
        var matchPlayingTeams = matchBetweenTeams();
        var randomNum = getRandomNumber(2);
        var winnerTeam = matchPlayingTeams[randomNum];
        var loserTeam = (randomNum === 1) ? matchPlayingTeams[0] : matchPlayingTeams[1];

        $(".matches-table").append("<tr>" +
            "<td class='blue'>Match " + (totalMatchesPlayed + 1) + ":</td>" +
            "<td>" + matchPlayingTeams[0] + " vs " + matchPlayingTeams[1] + " &#8658;</td>" +
            "<td class='winner-team'>" + winnerTeam + "</td>" +
            "</tr>"
        );

        pointsTable[winnerTeam] = [pointsTable[winnerTeam][0] + 1, pointsTable[winnerTeam][1] + 1,
            pointsTable[winnerTeam][2], pointsTable[winnerTeam][3] + 2
        ];
        pointsTable[loserTeam] = [pointsTable[loserTeam][0] + 1, pointsTable[loserTeam][1],
            pointsTable[loserTeam][2] + 1, pointsTable[loserTeam][3] + 0
        ];
        totalMatchesPlayed++;
    }

    if (!isMatchLeft()) {
        while (Object.keys(pointsTable).length > 0) {
            displayPointsTable();
        }
    }

    displayGroups();
});

function getRandomNumber(totalPossibility) {
    return Math.floor(Math.random() * totalPossibility);
}

function isMatchLeft() {
    for (const [team, groups] of Object.entries(teamPlayedAgainstTeamsCount)) {
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

function matchBetweenTeams() {
    var homeTeam = chooseHomeTeam();
    var awayTeam = chooseAwayTeam(homeTeam);
    teamPlayedAgainstTeamsCount[homeTeam][teamGroupName(awayTeam)][awayTeam]++;
    teamPlayedAgainstTeamsCount[awayTeam][teamGroupName(homeTeam)][homeTeam]++;
    return [homeTeam, awayTeam];
}

function chooseHomeTeam() {
    var matchesPlayedByTeams = {};
    for (const [team, groups] of Object.entries(teamPlayedAgainstTeamsCount)) {
        var totalMatch = 0;
        for (const [group, opponentTeams] of Object.entries(groups)) {
            for (const [opponentTeam, matchPlayed] of Object.entries(opponentTeams)) {
                totalMatch = totalMatch + matchPlayed;
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
    var homeTeamPlayedAgainstTeams = {},
        totalMatch = 0;
    var homeTeamGroup = teamGroupName(homeTeam);

    for (const [group, opponentTeams] of Object.entries(teamPlayedAgainstTeamsCount[homeTeam])) {
        for (const [opponentTeam, matchPlayed] of Object.entries(opponentTeams)) {
            var tempMatchPlayed = matchPlayed;
            if (group === homeTeamGroup) {
                tempMatchPlayed++;
            }
            homeTeamPlayedAgainstTeams[opponentTeam] = tempMatchPlayed;
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
    var pointsTableValuesList = Object.values(pointsTable);
    var pointList = [];
    pointsTableValuesList.forEach(value => {
        pointList.push(value[3]);
    });
    var maxPoints = Math.max(...pointList);

    for (const [team, pointsData] of Object.entries(pointsTable)) {
        if (pointsData[3] === maxPoints) {
            if (row < 4) {
                $(".points-table").append("<tr class='bg-cyan'>" +
                    "<td>" + teams[team] + " (" + team + ")" + "</td>" +
                    "<td>" + pointsData[0] + "</td>" +
                    "<td>" + pointsData[1] + "</td>" +
                    "<td>" + pointsData[2] + "</td>" +
                    "<td class='bold dark-green'>" + pointsData[3] + "</td>" +
                    "</tr>"
                );
            } else {
                $(".points-table").append("<tr class='bg-pink'>" +
                    "<td>" + teams[team] + " (" + team + ")" + "</td>" +
                    "<td>" + pointsData[0] + "</td>" +
                    "<td>" + pointsData[1] + "</td>" +
                    "<td>" + pointsData[2] + "</td>" +
                    "<td class='bold dark-green'>" + pointsData[3] + "</td>" +
                    "</tr>"
                );
            }

            row++;
            delete pointsTable[team];
            break;
        }
    }
}

function displayGroups() {
    for (const team in groupA) {
        $(".group-A-table").append("<tr>" +
            "<td>" + teams[team] + " (" + team + ")" + "</td>" +
            "</tr>"
        );
    }

    for (const team in groupB) {
        $(".group-B-table").append("<tr>" +
            "<td>" + teams[team] + " (" + team + ")" + "</td>" +
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