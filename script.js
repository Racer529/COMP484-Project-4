let map;
let currentIndex = 0;
let score = 0;
let startTime;
let timerInterval;

// Quiz locations
const quizLocations = [
  { name: "CSUN Campus Store", lat: 34.23747553946416, lng: -118.52818709786648},
  { name: "Bayramian Hall", lat: 34.24037587015141, lng: -118.53130918915708 },
  { name: "Jacaranda Hall", lat: 34.24119187219472, lng: -118.52893643884367},
  { name: "Manzanita Hall", lat: 34.23778989307924, lng: -118.530283877017 },
  { name: "Santa Susana Hall", lat: 34.23771703049018, lng: -118.5292854867092 } // D2
];


function initMap() {
  // Center map on CSUN campus
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 34.239, lng: -118.528 },
    zoom: 16.8, //Zoom settings
    disableDefaultUI: true,
    draggable: false,
    scrollwheel: false,
    disableDoubleClickZoom: true
  });

  // Start timer
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);

  // Show first question
  showQuestion();

  // Listen for double-clicks
  google.maps.event.addListener(map, "dblclick", function(event) {
    checkAnswer(event.latLng);
  });

  // Load high score from localStorage
  let highScore = localStorage.getItem("csunMapQuizHighScore");
  if (highScore) {
    document.getElementById("highscore").innerHTML = "High Score: " + highScore + "s";
  }

  // Reset button
  document.getElementById("resetBtn").addEventListener("click", resetQuiz);
}

function showQuestion() {
  if (currentIndex < quizLocations.length) {
    document.getElementById("info").innerHTML =
      "Where is <b>" + quizLocations[currentIndex].name + "</b>? Double-click to answer.";
  } else {
    clearInterval(timerInterval);
    let totalTime = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById("info").innerHTML =
      "Quiz finished! You got <span class='correct'>" + score +
      "</span> out of " + quizLocations.length + " correct in " + totalTime + "s.";

    // Check and update high score
    let highScore = localStorage.getItem("csunMapQuizHighScore");
    if (!highScore || totalTime < highScore) {
      localStorage.setItem("csunMapQuizHighScore", totalTime);
      document.getElementById("highscore").innerHTML = "High Score: " + totalTime + "s";
    }
  }
}

function checkAnswer(userLatLng) {
  if (currentIndex >= quizLocations.length) return;

  let current = quizLocations[currentIndex];
  let distance = haversineDistance(
    [userLatLng.lat(), userLatLng.lng()],
    [current.lat, current.lng]
  );

  if (distance < 0.05) { // within ~50 meters
    document.getElementById("info").innerHTML =
      "Correct! You found <span class='correct'>" + current.name + "</span>.";
    score++;
    new google.maps.Marker({
      position: { lat: current.lat, lng: current.lng },
      map: map,
      icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
      animation: google.maps.Animation.BOUNCE
    });

  } else {
    document.getElementById("info").innerHTML =
      "Sorry, wrong location. The correct spot for <span class='wrong'>" +
      current.name + "</span> is shown.";
    new google.maps.Marker({
      position: { lat: current.lat, lng: current.lng },
      map: map,
      icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
    });
  }

  currentIndex++;
  setTimeout(showQuestion, 2000);
}

// Haversine formula to measure distance between two lat/lng points
function haversineDistance(coords1, coords2) {
  function toRad(x) { return x * Math.PI / 180; }
  let lat1 = coords1[0], lon1 = coords1[1];
  let lat2 = coords2[0], lon2 = coords2[1];

  let R = 6371; // km
  let dLat = toRad(lat2 - lat1);
  let dLon = toRad(lon2 - lon1);
  let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  let d = R * c;
  return d; // distance in km
}

function updateTimer() {
  let elapsed = Math.floor((Date.now() - startTime) / 1000);
  document.getElementById("timer").innerHTML = "Time: " + elapsed + "s";
}

function resetQuiz() {
  // Reset variables
  currentIndex = 0;
  score = 0;
  clearInterval(timerInterval);
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);

  // Reset map
  map.setCenter({ lat: 34.239, lng: -118.528 });
  map.setZoom(16);

  // Reset info
  document.getElementById("info").innerHTML = "Double-click on the map to find the location!";
  showQuestion();
}