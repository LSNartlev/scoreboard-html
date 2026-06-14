var matchTitle = "(insert Match Title here)";
var teamAname = "Team A", teamBname = "Team B";
var teamAcolor = "#6dbcf5", teamBcolor = "#f56d66";
var teamAscore = 0, teamBscore = 0;
var teamAupperCounter = 0, teamBupperCounter = 0;
var teamAlowerCounter = 0, teamBlowerCounter = 0;
var isBasketball = true, ballPossession = 0; // 0 = none, 1 = Team A, 2 = Team B
var isTimerEnabled = true, isMiniTimerEnabled = true, isHornAutoTrigger = true;
var isTimerRunning = false, isMiniTimerRunning = false, isHornPlaying = false, isBuzzerPlaying = false;
var timer = [10, 0, 0], miniTimer = [24, 0], isTimeout = false, isShotClockInAutoReset = true, isHotkeyMode = false;
var timerThread, isTimerThreadActive;
var defaultTimer = [10, 0, 0], defaultminiTimers = [24, 14, 60];


function setDefaults() {
	setTeamColors("A", teamAcolor);
	setTeamInfo("A");
	setTeamColors("B", teamBcolor);
	setTeamInfo("B");
	setMatchTitle(matchTitle);
	setScoreboardElements();
	changePeriod(true);
	resetCounters("A");
	resetCounters("B");
	activateTimerThread();
	setHotkeyFunctions();
}

function setMatchTitle(matchTitle) {
	document.getElementById("matchTitle").value = matchTitle;
}

function setTeamColors(team, color) {
	if(team === "A") teamAcolor = color;
	if(team === "B") teamBcolor = color;
	
	// Background Colors of Input Color, Score Control Buttons
	document.getElementById("team"+team+"color").value = 
	document.getElementById("score"+team+"funcA").style.backgroundColor = isBasketball? color:getShadedColor(color, 0.7, true);
	document.getElementById("score"+team+"funcB").style.backgroundColor = 
	document.getElementById("score"+team+"funcC").style.backgroundColor = 
	document.getElementById("score"+team+"funcD").style.backgroundColor = color;
	
	// Text Colors of Score Control Buttons and Ball Possession indicator
	document.getElementById("score"+team+"funcA").style.color = isBasketball? getTextColor(color):getTextColor(getShadedColor(color, 0.7, true));
	document.getElementById("score"+team+"funcB").style.color = 
	document.getElementById("score"+team+"funcC").style.color = 
	document.getElementById("score"+team+"funcD").style.color = getTextColor(color);
	
	// Colors of Timeout/Sets Won Control Buttons
	document.getElementById("upper"+team+"zero").style.backgroundColor = getShadedColor(color, 0.7, true);
	document.getElementById("upper"+team+"zero").style.color = getTextColor(getShadedColor(color, 0.7, true));
	document.getElementById("upper"+team+"minus1").style.backgroundColor =
	document.getElementById("upper"+team+"plus1").style.backgroundColor = getShadedColor(color, 0.7, false);
	document.getElementById("upper"+team+"minus1").style.color =
	document.getElementById("upper"+team+"plus1").style.color = getTextColor(getShadedColor(color, 0.7, false));
	
	// Colors of Team Foul Control Buttons
	document.getElementById("lower"+team+"zero").style.backgroundColor = getShadedColor(color, 0.45, true);
	document.getElementById("lower"+team+"zero").style.color = getTextColor(getShadedColor(color, 0.45, true));
	document.getElementById("lower"+team+"minus1").style.backgroundColor =
	document.getElementById("lower"+team+"plus1").style.backgroundColor = getShadedColor(color, 0.45, false);
	document.getElementById("lower"+team+"minus1").style.color =
	document.getElementById("lower"+team+"plus1").style.color = getTextColor(getShadedColor(color, 0.45, false));
	
	// Colors of Possession/Service Buttons
	document.getElementById("team"+team+"poss").style.backgroundColor = color;
	document.getElementById("team"+team+"poss").style.color = getTextColor(color);
}

function setTeamInfo(team) {
	document.getElementById("team"+team+"name").value = 
	document.getElementById("sbTeam"+team+"name").innerHTML = team == "A"? teamAname:teamBname;
}

function setScoreboardElements() {
	// Scoreboard Background
	document.getElementById("scoreboard").style.background = "linear-gradient(to right, " + teamAcolor + " 0 50%, " + teamBcolor + " 50% 100%)";
	
	// Match Title
	matchTitle = document.getElementById("matchTitle").value;
	document.getElementById("sbMatchTitle").innerHTML = matchTitle;
	
	// Scoreboard Labels
	document.getElementById("teamAupperctrl").innerHTML = 
	document.getElementById("teamBupperctrl").innerHTML = isBasketball? "Team Fouls":"Sets Won";
	document.getElementById("upperLabelA").innerHTML = 
	document.getElementById("upperLabelB").innerHTML = isBasketball? "TEAM FOULS":"SETS WON";
	document.getElementById("teamAlowerctrl").innerHTML = 
	document.getElementById("teamBlowerctrl").innerHTML = "Timeouts Left";
	document.getElementById("lowerLabelA").innerHTML = 
	document.getElementById("lowerLabelB").innerHTML = "TIMEOUTS LEFT";
}

function toggleTimerUsage() {
	let isEnabled = document.getElementById("timerCheckbox").checked;
	isTimerEnabled = isEnabled;
	isTimerRunning = false;
	document.getElementById("timerStatus").innerHTML = isEnabled? "TIMER STOPPED":"TIMER DISABLED";
	document.getElementById("timerStatus").style.backgroundColor = isEnabled? "#ff0000":"#101010";
	document.getElementById("timerMin").disabled = isEnabled? false:true;
	document.getElementById("timerSec").disabled = isEnabled? false:true;
	document.getElementById("timerDsec").disabled = isEnabled? false:true;
	document.getElementById("setTimer").disabled = isEnabled? false:true;
	document.getElementById("toggleTimerState").disabled = isEnabled? false:true;
	document.getElementById("sbPeriodNum").style.visibility = isEnabled? "visible":"hidden";
	document.getElementById("toggleAllTimerState").disabled = (isTimerEnabled && isMiniTimerEnabled)? false:true;
}

function changeTimerState() {
	isTimerRunning = (timer[0] == 0 && timer[1] == 0 && timer[2] == 0)? changeTimer():!isTimerRunning;
	updateTimerElements();
	updateAllTimerButton();
}

function updateTimerElements() {
	document.getElementById("toggleTimerState").value = isTimerRunning? "\u{275A}\u{275A}":
		(timer[0] == 0 && timer[1] == 0 && timer[2] == 0)? "\u{27F3}":"\u{2BC8}";
	document.getElementById("toggleTimerState").style.backgroundColor = isTimerRunning? "#ff0000":"";
	document.getElementById("toggleTimerState").style.color =	isTimerRunning? "#ffffff":"";
	document.getElementById("timerStatus").innerHTML = isTimerRunning? "TIMER RUNNING":"TIMER STOPPED";
	document.getElementById("timerStatus").style.backgroundColor = isTimerRunning? "#008000":"#ff0000";
	document.getElementById("sbPeriodNum").style.backgroundColor = isTimerRunning? "#000000":"#404040";
}

function toggleMiniTimerUsage(isByClick) {
	if(isByClick) {
		let isEnabled = document.getElementById("miniTimerCheckbox").checked;
		isMiniTimerEnabled = isEnabled;
	}
	else document.getElementById("miniTimerCheckbox").checked = isMiniTimerEnabled;
	isMiniTimerRunning = false;
	document.getElementById("miniTimerStatus").innerHTML = isMiniTimerEnabled? "TIMER STOPPED":"TIMER DISABLED";
	document.getElementById("miniTimerStatus").style.backgroundColor = isMiniTimerEnabled? "#ff0000":"#101010";
	document.getElementById("setMiniTimerA").disabled = isMiniTimerEnabled? false:true;
	document.getElementById("setMiniTimerB").disabled = isMiniTimerEnabled? false:true;
	document.getElementById("setMiniTimerC").disabled = isMiniTimerEnabled? false:true;
	document.getElementById("miniTimerAsec").disabled = isMiniTimerEnabled? false:true;
	document.getElementById("miniTimerBsec").disabled = isMiniTimerEnabled? false:true;
	document.getElementById("miniTimerCsec").disabled = isMiniTimerEnabled? false:true;
	document.getElementById("toggleMiniTimerState").disabled = isMiniTimerEnabled? false:true;
	document.getElementById("sbMiniNum").style.visibility = isMiniTimerEnabled? "visible":"hidden";
	document.getElementById("sbMiniText").style.visibility = isMiniTimerEnabled? "visible":"hidden";
	document.getElementById("toggleAllTimerState").disabled = (isTimerEnabled && isMiniTimerEnabled)? false:true;
	if(isMiniTimerEnabled === false)
		isMiniTimerRunning = false;
}

function changeMiniTimerState() {
	isMiniTimerRunning = miniTimer[0] == 0? setMiniTimer("A"):!isMiniTimerRunning;
	updateMiniTimerElements();
	updateAllTimerButton();
}

function updateMiniTimerElements() {
	document.getElementById("toggleMiniTimerState").value = isMiniTimerRunning? "\u{275A}\u{275A}":
		miniTimer[0] == 0? "\u{27F3}":"\u{2BC8}";
	document.getElementById("toggleMiniTimerState").style.backgroundColor = isMiniTimerRunning? "#ff0000":"";
	document.getElementById("toggleMiniTimerState").style.color = isMiniTimerRunning? "#ffffff":"";
	document.getElementById("miniTimerStatus").innerHTML = isMiniTimerRunning? "TIMER RUNNING":"TIMER STOPPED";
	document.getElementById("miniTimerStatus").style.backgroundColor = isMiniTimerRunning? "#008000":"#ff0000";
	document.getElementById("sbMiniNum").style.backgroundColor = isMiniTimerRunning? "#000000":"#400000";
	document.getElementById("sbMiniNum").style.color = isMiniTimerRunning? "#ff3030":"#ff0000";
	if(miniTimer[0] == 0 && miniTimer[1] == 0) {
		document.getElementById("sbMiniNum").style.backgroundColor = "#ff0000";
		document.getElementById("sbMiniNum").style.color = "#000000";
	}
}

function changeAllTimerState() {
	if(!isTimerRunning && !isMiniTimerRunning) {
		isTimerRunning = true;
		isMiniTimerRunning = true;
	}
	else {
		isTimerRunning = false;
		isMiniTimerRunning = false;
	}
	updateTimerElements();
	updateMiniTimerElements();
	updateAllTimerButton();
}

function updateAllTimerButton() {
	let isTimerTimeup = (timer[0] == 0 && timer[1] == 0 && timer[2] == 0);
	let isMiniTimerTimeup = miniTimer[0] == 0;
	document.getElementById("toggleAllTimerState").disabled = (isTimerTimeup || isMiniTimerTimeup)? true:false;
	document.getElementById("toggleAllTimerState").value = (isTimerRunning || isMiniTimerRunning)? "\u{275A}\u{275A}":"\u{2BC8}";
	document.getElementById("toggleAllTimerState").style.backgroundColor = (isTimerRunning || isMiniTimerRunning)? "#ff0000":"";
	document.getElementById("toggleAllTimerState").style.color = (isTimerRunning || isMiniTimerRunning)? "#ffffff":"";
}

function setMiniTimer(timerType) {
	let miniTimerA = document.getElementById("miniTimerAsec").value == ""? defaultminiTimers[0]:document.getElementById("miniTimerAsec").value;
	let miniTimerB = document.getElementById("miniTimerBsec").value == ""? defaultminiTimers[1]:document.getElementById("miniTimerBsec").value;
	let miniTimerC = document.getElementById("miniTimerCsec").value == ""? defaultminiTimers[2]:document.getElementById("miniTimerCsec").value;
	console.log("All timer state before resetting mini timer: " + document.getElementById("toggleAllTimerState").disabled);
	switch(timerType) {
		case "A":
			if(timer[0] == 0 && timer[1]+(timer[2]*0.1) <= miniTimerA) {
				isMiniTimerEnabled = false;
				toggleMiniTimerUsage(false);
				console.log("All timer state before disabling via setMiniTimer(): " + document.getElementById("toggleAllTimerState").disabled);
				document.getElementById("toggleAllTimerState").disabled = true;
				console.log("All timer state after disabling via setMiniTimer(): " + document.getElementById("toggleAllTimerState").disabled);
			}
			else miniTimer[0] = miniTimerA;
			isTimeout = false;
			break;
		case "B":
			if(timer[0] == 0 && timer[1]+(timer[2]*0.1) <= miniTimerB) {
				isMiniTimerEnabled = false;
				toggleMiniTimerUsage(false);
				document.getElementById("toggleAllTimerState").disabled = true;
			}
			else miniTimer[0] = miniTimerB;
			isTimeout = false;
			break;
		default:
			miniTimer[0] = miniTimerC;
			isTimeout = true;
			break;
	}
	miniTimer[1] = 0;
	if(isMiniTimerRunning)
		changeMiniTimerState();
	document.getElementById("sbMiniText").innerHTML = isTimeout? "TIMEOUT":isBasketball? "SHOT CLOCK":"TO SERVE";
	updateMiniTimerDisplay();
	updateAllTimerButton();
}

function toggleShotClockAutoReset() {
	let isEnabled = document.getElementById("resetMiniTimerOnScore").checked;
	isShotClockInAutoReset = isEnabled;
}

function setHornPlaying(state) {
	isHornPlaying = state;
	let hornVolume = document.getElementById("hornVolume").value*0.01;
	if(!(hornVolume >= 0) || !(hornVolume <= 1)) hornVolume = 1;
	if(isHornPlaying) {
		document.getElementById("sound_horn").volume = hornVolume;
		document.getElementById("sound_horn").play();
	}
	else {
		document.getElementById("sound_horn").pause();
	}
	document.getElementById("hornButton").value = isHornPlaying? "\u{1F50A}":"\u{1F508}";
	document.getElementById("hornButton").style.backgroundColor = isHornPlaying? "#ff0000":"";
	document.getElementById("hornButton").style.color = isHornPlaying? "#ffffff":"";
}

function playCustomSound(sfxNumber) {
	if(!document.getElementById("sound_sfx"+sfxNumber).paused && document.getElementById("sound_sfx"+sfxNumber).currentTime > 0) {
		document.getElementById("sound_sfx"+sfxNumber).pause();
		document.getElementById("sound_sfx"+sfxNumber).currentTime = 0;
	}
	else {
		document.getElementById("sound_sfx"+sfxNumber).play();
	}
}

function getTextColor(color) {
	return getColorLightness(color) >= 0.5? "#000000":"#ffffff";
}

/**
	Based on my understanding on color conversion formulas on Wikipedia:
	https://en.wikipedia.org/wiki/HSL_and_HSV
*/
function getShadedColor(color, multiplier, isGrayscaled) {
	let r = parseInt(color.substr(1, 2), 16) / 255; // red %
	let g = parseInt(color.substr(3, 2), 16) / 255; // green %
	let b = parseInt(color.substr(5, 2), 16) / 255; // blue %
	let maxRGB, minRGB, chroma, hue, saturation, lightness;
	maxRGB = Math.max(r, g, b);
	minRGB = Math.min(r, g, b);
	chroma = maxRGB - minRGB;
	lightness = (maxRGB + minRGB) / 2;
	
	// getting Hue and Saturation
	if(maxRGB == minRGB || isGrayscaled) {
		hue = saturation = 0;
	}
	else {
		switch(maxRGB) {
			case r: hue = (((g - b) / chroma) + (g < b? 6 : 0)) / 6; break;
			case g: hue = (((b - r) / chroma) + 2) / 6; break;
			case b: hue = (((r - g) / chroma) + 4) / 6; break;
		}
		hue = Math.round(hue*360); // in degrees
		saturation = lightness > 0.5? (chroma / (2 - maxRGB - minRGB)):(chroma / (maxRGB + minRGB));
		saturation *= 100; // in percent
	}
	
	// getting the new Lightness
	lightness *= multiplier * 100; // in percent
	
	return "hsl(" + hue + "," + saturation + "%," + lightness + "%)";
}

/**
	Based on my understanding on RGB to HSL formulas on Wikipedia:
	https://en.wikipedia.org/wiki/HSL_and_HSV
*/
function getColorLightness(color) {
	let r = parseInt(color.substr(1, 2), 16) / 255; // red %
	let g = parseInt(color.substr(3, 2), 16) / 255; // green %
	let b = parseInt(color.substr(5, 2), 16) / 255; // blue %
	return (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
}

function changeTeamName(team) {
	if(team === "A")
		teamAname = document.getElementById("team"+team+"name").value;
	if(team === "B")
		teamBname = document.getElementById("team"+team+"name").value;
	setTeamInfo(team);
}

function changeMatchTitle() {
	matchTitle = document.getElementById("matchTitle").value;
	setScoreboardElements();
}

function changeTeamColor(team) {
	setTeamColors(team, document.getElementById("team"+team+"color").value);
	setScoreboardElements();
}

function updateScore(team, scoreButton) {
	let update = 0;
	if(isBasketball) {
		switch(scoreButton) {
			case "A": update = -1; break;
			case "B": update = 1; break;
			case "C":
				update = 2;
				if(isShotClockInAutoReset) {
					isMiniTimerRunning = false;
					updateMiniTimerElements();
					updateAllTimerButton();
					setMiniTimer("A");
				}
				team === "A"? changeBallPossession(2):changeBallPossession(1);
				break;
			case "D": 
				update = 3;
				if(isShotClockInAutoReset) {
					isMiniTimerRunning = false;
					updateMiniTimerElements();
					updateAllTimerButton();
					setMiniTimer("A");
				}
				team === "A"? changeBallPossession(2):changeBallPossession(1);
				break;
		}
	}
	else {
		switch(scoreButton) {
			case "A": team === "A"? teamAscore = 0:teamBscore = 0; break;
			case "B": update = -1; break;
			case "C": update = 1; break;
			default: break; // button D is unavailable in volleyball mode
		}
	}
	if(team === "A") teamAscore += update;
	if(team === "B") teamBscore += update;
	// prevent negative scores
	if(teamAscore < 0) teamAscore = 0;
	if(teamBscore < 0) teamBscore = 0;
	// prevent scores above 999
	if(teamAscore > 999) teamAscore = 999;
	if(teamBscore > 999) teamBscore = 999;
	refreshCounters();
}

function updateCounter(team, ctrType, ctrButton) {
	if(ctrButton === 0) {
		if(ctrType === "T") team === "A"? teamAupperCounter = 0:teamBupperCounter = 0;
		if(ctrType === "F") team === "A"? teamAlowerCounter = 0:teamBlowerCounter = 0;
	}
	else {
		if(ctrType === "T") team === "A"? teamAupperCounter += ctrButton:teamBupperCounter += ctrButton;
		if(ctrType === "F") team === "A"? teamAlowerCounter += ctrButton:teamBlowerCounter += ctrButton;
	}
	// prevent negative values
	if(teamAupperCounter < 0) teamAupperCounter = 0;
	if(teamBupperCounter < 0) teamBupperCounter = 0;
	if(teamAlowerCounter < 0) teamAlowerCounter = 0;
	if(teamBlowerCounter < 0) teamBlowerCounter = 0;
	// prevent values above 9
	if(teamAupperCounter > 9) teamAupperCounter = 9;
	if(teamBupperCounter > 9) teamBupperCounter = 9;
	if(teamAlowerCounter > 9) teamAlowerCounter = 9;
	if(teamBlowerCounter > 9) teamBlowerCounter = 9;
	refreshCounters();
}

function updateTimerDisplay() {
	document.getElementById("sbPeriodNum").style.backgroundColor = isTimerRunning? "#000000":"#404040";
	document.getElementById("sbPeriodNum").innerHTML = timer[0] > 0?
		timer[0]+":"+timer[1].toString().padStart(2,"0") // mm:ss
		:
		timer[1]+"."+timer[2]; // s.d
}

function updateMiniTimerDisplay() {
	if(miniTimer[0] <= 4)
        document.getElementById("sbMiniNum").innerHTML = miniTimer[0]+"."+(miniTimer[1]);
    else document.getElementById("sbMiniNum").innerHTML = miniTimer[0]+"";
}

function refreshCounters() {
	document.getElementById("sbTeamAscore").innerHTML = teamAscore;
	document.getElementById("sbTeamBscore").innerHTML = teamBscore;
	document.getElementById("upperCounterA").innerHTML = teamAupperCounter;
	document.getElementById("upperCounterB").innerHTML = teamBupperCounter;
	document.getElementById("lowerCounterA").innerHTML = teamAlowerCounter;
	document.getElementById("lowerCounterB").innerHTML = teamBlowerCounter;
}

function resetCounters(team) {
	if(team === "A") {
		teamAscore = 0;
		teamAupperCounter = 0;
		teamAlowerCounter = 0;
	}
	else {
		teamBscore = 0;
		teamBupperCounter = 0;
		teamBlowerCounter = 0;
	}
	refreshCounters();
}

function changeGameMode(isNewModeBasketball) {
	isBasketball = isNewModeBasketball;
	document.getElementById(isBasketball?"bbDefault":"vbDefault").selected = "selected";
	changePeriod();
	document.getElementById("scoreAfuncA").value = isBasketball? "\u22121":"=0";
	document.getElementById("scoreAfuncA").style.backgroundColor = 
	document.getElementById("teamAposs").style.backgroundColor = isBasketball? teamAcolor:getShadedColor(teamAcolor, 0.7, true);
	document.getElementById("scoreAfuncA").style.color =
	document.getElementById("teamAposs").style.color = isBasketball? getTextColor(teamAcolor):getTextColor(getShadedColor(teamAcolor, 0.7, true));
	document.getElementById("scoreBfuncA").value = isBasketball? "\u22121":"=0";
	document.getElementById("scoreBfuncA").style.backgroundColor =
	document.getElementById("teamBposs").style.backgroundColor =	isBasketball? teamBcolor:getShadedColor(teamBcolor, 0.7, true);
	document.getElementById("scoreBfuncA").style.color =
	document.getElementById("teamBposs").style.color = isBasketball? getTextColor(teamBcolor):getTextColor(getShadedColor(teamBcolor, 0.7, true));
	document.getElementById("scoreAfuncB").value = isBasketball? "+1":"\u22121";
	document.getElementById("scoreBfuncB").value = isBasketball? "+1":"\u22121";
	document.getElementById("scoreAfuncC").value = isBasketball? "+2":"+1";
	document.getElementById("scoreBfuncC").value = isBasketball? "+2":"+1";
	document.getElementById("scoreAfuncD").style.display = isBasketball? "inline-block":"none";
	document.getElementById("scoreBfuncD").style.display = isBasketball? "inline-block":"none";
	document.getElementById("possessionServiceLabel").innerHTML = isBasketball? "Ball Possession":"Ball Service";
	document.getElementById("setMiniTimerA").value = isBasketball? "Shot Clock":"Serve Time";
	document.getElementById("setMiniTimerB").value = isBasketball? "Off. Reb.":"Long Serve";
	document.getElementById("sbMiniText").innerHTML = isBasketball? "SHOT CLOCK":"TO SERVE";
	document.getElementById("timerCheckbox").checked = isBasketball? true:false;
	document.getElementById("miniTimerCheckbox").checked = isBasketball? true:false;
	document.getElementById("resetMiniTimerOnScore").style.visibility = isBasketball? "visible":"hidden";
	document.getElementById("resetMiniTimerOnScoreLabel").style.visibility = isBasketball? "visible":"hidden";
	toggleTimerUsage();
	toggleMiniTimerUsage();
	changeTimerDefaults();
	setMiniTimer("A");
	changeBallPossession(0);
	setScoreboardElements();
}

function changeTimerDefaults() {
	if(isBasketball) {
		defaultTimer = [10, 0, 0];
		defaultminiTimers = [24, 14, 60];
	}
	else {
		defaultTimer = [10, 0, 0];
		defaultminiTimers = [8, 10, 60];
	}
	document.getElementById("timerMin").value = defaultTimer[0];
	document.getElementById("timerSec").value = defaultTimer[1];
	document.getElementById("timerDsec").value = defaultTimer[2];
	document.getElementById("miniTimerAsec").value = defaultminiTimers[0];
	document.getElementById("miniTimerBsec").value = defaultminiTimers[1];
	document.getElementById("miniTimerCsec").value = defaultminiTimers[2];
}

function changeTimer() {
	let minutes = document.getElementById("timerMin").value == ""? 0:document.getElementById("timerMin").value;
	let seconds = document.getElementById("timerSec").value == ""? 0:document.getElementById("timerSec").value;
	let deciSeconds = document.getElementById("timerDsec").value == ""? 0:document.getElementById("timerDsec").value;
	// input validity check
	if(!(parseInt(minutes) >= 0) || !(parseInt(minutes) <= 99)) minutes = defaultTimer[0];
	if(!(parseInt(seconds) >= 0) || !(parseInt(seconds) <= 59)) seconds = defaultTimer[1];
	if(!(parseInt(deciSeconds) >= 0) || !(parseInt(deciSeconds) <= 9)) deciSeconds = defaultTimer[2];
	// disable timer if all set to 0
	if(minutes == 0 && seconds == 0 && deciSeconds == 0) {
		document.getElementById("timerCheckbox").checked = false;
		toggleTimerUsage();
	}
	timer[0] = minutes;
	timer[1] = seconds;
	timer[2] = deciSeconds;
	document.getElementById("timerStatus").innerHTML = "TIMER SET";
	updateTimerDisplay();
	updateAllTimerButton();
}

function changePeriod(isInitialValue) {
	let periodNum = isInitialValue? "1":document.getElementById("periodNum").value;
	let gamePeriod = isInitialValue? "QUARTER":document.querySelector("#gamePeriod").value;
	let periodLabel = "";
	switch(periodNum) {
		case "1": periodLabel += "1ST " + gamePeriod; break;
		case "2": periodLabel += "2ND " + gamePeriod; break;
		case "3": periodLabel += gamePeriod === "HALF"? "OVERTIME":"3RD " + gamePeriod; break;
		case "4": periodLabel += gamePeriod === "HALF"? "OVERTIME":"4TH " + gamePeriod; break;
		case "5": periodLabel += gamePeriod != "SET"? "OVERTIME":"5TH " + gamePeriod; break;
		default: periodNum = "0"; break;
	}
	document.getElementById("sbPeriodText").style.visibility = periodNum === "0"? "hidden":"visible";
	document.getElementById("sbPeriodText").innerHTML = periodLabel;
}

function changeCourt() {
	[teamAcolor, teamBcolor] = [teamBcolor, teamAcolor];
	[teamAname, teamBname] = [teamBname, teamAname];
	[teamAscore, teamBscore] = [teamBscore, teamAscore];
	[teamAupperCounter, teamBupperCounter] = [teamBupperCounter, teamAupperCounter];
	[teamAlowerCounter, teamBlowerCounter] = [teamBlowerCounter, teamAlowerCounter];
	setTeamColors("A", teamAcolor);
	setTeamInfo("A");
	setTeamColors("B", teamBcolor);
	setTeamInfo("B");
	if(ballPossession != 0) ballPossession === 1? changeBallPossession(2):changeBallPossession(1);
	setScoreboardElements();
	refreshCounters();
}

function changeBallPossession(teamNum) {
	if(teamNum === 0 || teamNum === ballPossession) {
		ballPossession = 0;
		document.getElementById("sbTeamAposs").innerHTML =
		document.getElementById("sbTeamBposs").innerHTML = "";
		document.getElementById("teamAposs").style.backgroundColor = teamAcolor;
		document.getElementById("teamAposs").style.color = getTextColor(teamAcolor);
		document.getElementById("teamAposs").value = "\u{2BC7}";
		document.getElementById("teamBposs").style.backgroundColor = teamBcolor;
		document.getElementById("teamBposs").style.color = getTextColor(teamBcolor);
		document.getElementById("teamBposs").value = "\u{2BC8}";
	}
	else {
		let teamLetter = teamNum === 1? "A":"B";
		let teamColor = teamNum === 1? teamAcolor:teamBcolor;
		let oppLetter = teamNum === 1? "B":"A";
		let oppColor = teamNum === 1? teamBcolor:teamAcolor;
		ballPossession = teamNum;
		document.getElementById("sbTeam"+teamLetter+"poss").innerHTML = isBasketball? "\u{1F3C0}":"\u{1F3D0}";
		document.getElementById("sbTeam"+oppLetter+"poss").innerHTML = "";
		document.getElementById("team"+teamLetter+"poss").style.backgroundColor = getShadedColor(teamColor, 0.7, true);
		document.getElementById("team"+teamLetter+"poss").style.color = getTextColor(getShadedColor(teamColor, 0.7, true));
		document.getElementById("team"+teamLetter+"poss").value = "\u{1F5D9}";
		document.getElementById("team"+oppLetter+"poss").style.backgroundColor = oppColor;
		document.getElementById("team"+oppLetter+"poss").style.color = getTextColor(oppColor);
		document.getElementById("team"+oppLetter+"poss").value = teamNum === 1? "\u{2BC8}":"\u{2BC7}";
	}
}

function adjustTimer(adjustDsec) {
	let rawDsec = timer[0]*600 + timer[1]*10 + timer[2];
	rawDsec = rawDsec+adjustDsec;
	if(rawDsec > 59999) rawDsec = 59999;
	if(rawDsec <= 1) rawDsec = 1;
	timer[0] = Math.floor(rawDsec/600);
	timer[1] = Math.floor(rawDsec/10)%60;
	timer[2] = rawDsec%10;
	updateTimerDisplay();
}

function adjustMiniTimer(adjustDsec) {
	let rawDsec = miniTimer[0]*10 + miniTimer[1];
	rawDsec = rawDsec+adjustDsec;
	if(rawDsec > 999) rawDsec = 999;
	if(rawDsec <= 1) rawDsec = 1;
	miniTimer[0] = Math.floor(rawDsec/10);
	miniTimer[1] = rawDsec%10;
	updateMiniTimerDisplay();
}

function activateTimerThread() {
	let timerRun, miniTimerRun, timerDelta, lastTimerDelta = 0, miniTimerDelta, lastMiniTimerDelta = 0;
	
	timerThread = () => {
		if(!isTimerRunning) timerRun = Date.now();
		else {
			timerDelta = (Date.now() - timerRun) % 100;
			if(timerDelta <= lastTimerDelta) countdownTimer();
			lastTimerDelta = timerDelta;
		}
		
		if(!isMiniTimerRunning) miniTimerRun = Date.now();
		else {
			miniTimerDelta = (Date.now() - miniTimerRun) % 100;
			if(miniTimerDelta <= lastMiniTimerDelta) countdownMiniTimer();
			lastMiniTimerDelta = miniTimerDelta;
		}
		requestAnimationFrame(timerThread);
	};
	requestAnimationFrame(timerThread);
}

function countdownTimer() {
	if(isTimerRunning) {
		if(timer[2] > 0) timer[2]--;
		else {
			if(timer[1] > 0) {
				timer[1]--;
				timer[2] = 9;
			}
			else if(timer[0] > 0) {
				timer[0]--;
				timer[1] = 59;
				timer[2] = 9;
			}
		}
		updateTimerDisplay();
		if(timer[0] == 0 && timer[1] == 0 && timer[2] == 0) {
			isTimerRunning = false;
			updateTimerElements();
			document.getElementById("sbPeriodNum").style.backgroundColor = "#ff0000";
			if(isMiniTimerEnabled) {
				isMiniTimerRunning = false;
				updateMiniTimerElements();
			}
			updateAllTimerButton();
			setHornPlaying(true);
		}
	}
}

function countdownMiniTimer() {
	if(isMiniTimerRunning) {
		if(miniTimer[1] > 0) miniTimer[1]--;
		else if(miniTimer[0] > 0) {
			miniTimer[0]--;
			miniTimer[1] = 9;
		}
		updateMiniTimerDisplay();
		if(miniTimer[0] == 0 && miniTimer[1] == 0) {
			isMiniTimerRunning = false;
			updateMiniTimerElements();
			if(isTimerEnabled) {
				isTimerRunning = false;
				updateTimerElements();
			}
			updateAllTimerButton();
			setHornPlaying(true);
		}
	}
}

function toggleHotkeyActivation() {
	isHotkeyMode = document.getElementById("hotkeyActivation").checked;
	// checkbox.onmousedown = function(event) { event.preventDefault(); }
}

function setHotkeyFunctions() {
	window.addEventListener('keydown', function(event) {
            if(isHotkeyMode) {
				// SCORE AND COUNTERS
				if(event.key.toLowerCase() == "s") {
					if(event.shiftKey)
						document.getElementById("lowerAminus1").click();
					else
						document.getElementById("lowerAplus1").click();
				}

				if(event.key.toLowerCase() == "d") {
					if(event.shiftKey)
						document.getElementById("upperAminus1").click();
					else
						document.getElementById("upperAplus1").click();
				}

				if(event.key.toLowerCase() == "f") {
					if(event.shiftKey)
						isBasketball? document.getElementById("scoreAfuncA").click():document.getElementById("scoreAfuncB").click();
					else
						isBasketball? document.getElementById("scoreAfuncB").click():document.getElementById("scoreAfuncC").click();
				}

				if(event.key.toLowerCase() == "l") {
					if(event.shiftKey)
						document.getElementById("lowerBminus1").click();
					else
						document.getElementById("lowerBplus1").click();
				}

				if(event.key.toLowerCase() == "k") {
					if(event.shiftKey)
						document.getElementById("upperBminus1").click();
					else
						document.getElementById("upperBplus1").click();
				}

				if(event.key.toLowerCase() == "j") {
					if(event.shiftKey)
						isBasketball? document.getElementById("scoreBfuncA").click():document.getElementById("scoreBfuncB").click();
					else
						isBasketball? document.getElementById("scoreBfuncB").click():document.getElementById("scoreBfuncC").click();
				}

				// POSSESSION
				if(event.key.toLowerCase() == "a") document.getElementById("teamAposs").click();
				if(event.key == ";") document.getElementById("teamBposs").click();

				// PERIOD HOTKEYS
				if(event.key == "F7") {
					document.getElementById("periodNum").stepDown();
					changePeriod();
				}
				if(event.key == "F8") {
					document.getElementById("periodNum").stepUp();
					changePeriod();
				}

				// CHANGE COURT
				if(event.key == "F1") document.getElementById("changeCourt").click();

                // TIMER HOTKEYS
                if(event.key == " ") {
					document.getElementById("toggleTimerState").click();
                    event.preventDefault();
                }
                if(event.key.toLowerCase() == "b") document.getElementById("toggleMiniTimerState").click();
                if(event.key.toLowerCase() == "v") document.getElementById("setMiniTimerB").click();
                if(event.key.toLowerCase() == "n") document.getElementById("setMiniTimerA").click();
				if(event.code == "Digit8") {
					if(event.shiftKey)
						adjustTimer(-600);
					else adjustTimer(600);
				}
				if(event.code == "Digit9") {
					if(event.shiftKey)
						adjustTimer(-10);
					else adjustTimer(10);
				}
				if(event.code == "Digit0") {
					if(event.shiftKey)
						adjustTimer(-1);
					else adjustTimer(1);
				}
				if(event.key == "_") adjustMiniTimer(-10);
				if(event.key == "-") adjustMiniTimer(10);
				if(event.key == "+") adjustMiniTimer(-1);
				if(event.key == "=") adjustMiniTimer(1);
			
                // SFX HOTKEYS
                if(event.key == "Backspace") document.getElementById("hornButton").onmousedown();
                if(event.code == "Digit1") document.getElementById("sfxButton1").click();
                if(event.code == "Digit2") document.getElementById("sfxButton2").click();
                if(event.code == "Digit3") document.getElementById("sfxButton3").click();
                if(event.code == "Digit4") document.getElementById("sfxButton4").click();
                if(event.code == "Digit5") document.getElementById("sfxButton5").click();
            }
		}
	);
    window.addEventListener('keyup', function(event) {
            if(event.key === "Backspace" && isHotkeyMode)
                document.getElementById("hornButton").onmouseup();
        }
    );
}
