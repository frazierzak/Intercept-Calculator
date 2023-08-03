function getFormValues() {
  var speed_self = parseFloat(document.getElementById('speed_self').value)
  var desired_time = parseFloat(document.getElementById('desired_time').value)
  var speed_target = parseFloat(document.getElementById('speed_target').value)
  var direction_target_from_you = parseFloat(
    document.getElementById('direction_target_from_you').value
  )
  var direction_target_heading = parseFloat(
    document.getElementById('direction_target_heading').value
  )
  var distance_target = parseFloat(
    document.getElementById('distance_target').value
  )

  return {
    speed_self,
    desired_time,
    speed_target,
    direction_target_from_you,
    direction_target_heading,
    distance_target,
  }
}

function displayWarning(message) {
  document.getElementById(
    'resultsContainer'
  ).innerHTML = `<p class="warning">${message}</p>`
}

function calculateHeading(event) {
  event.preventDefault()

  // Get form values
  var {
    speed_self,
    desired_time,
    speed_target,
    direction_target_from_you,
    direction_target_heading,
    distance_target,
  } = getFormValues()

  // Check for invalid form inputs
  var bothSelfSpeedAndDesiredTimeFilled =
    !isNaN(speed_self) && !isNaN(desired_time)
  var neitherSelfSpeedNorDesiredTimeFilled =
    isNaN(speed_self) && isNaN(desired_time)
  var anyRequiredFieldEmpty =
    isNaN(speed_target) ||
    isNaN(direction_target_from_you) ||
    isNaN(direction_target_heading) ||
    isNaN(distance_target)

  if (
    bothSelfSpeedAndDesiredTimeFilled ||
    neitherSelfSpeedNorDesiredTimeFilled ||
    anyRequiredFieldEmpty
  ) {
    var warningMessage =
      bothSelfSpeedAndDesiredTimeFilled || neitherSelfSpeedNorDesiredTimeFilled
        ? 'You must fill out either speed_self or desired_time, but not both!'
        : 'You must fill out all fields'
    displayWarning(warningMessage)
    return
  }

  // If only speed_self is filled, calculate desired_time. If only desired_time is filled, calculate speed_self.
  desired_time = isNaN(desired_time)
    ? distance_target / speed_self
    : desired_time
  speed_self = isNaN(speed_self) ? distance_target / desired_time : speed_self

  //Calculations
  // Convert degrees to radians
  var angle_target = (90 - direction_target_from_you) * (Math.PI / 180)
  if (angle_target < 0) {
    angle_target += 2 * Math.PI
  }

  var angle_movement = (90 - direction_target_heading) * (Math.PI / 180)
  if (angle_movement < 0) {
    angle_movement += 2 * Math.PI
  }

  // Perform calculations
  var distance_moved_target = speed_target * desired_time

  var x_target = distance_target * Math.cos(angle_target)
  var y_target = distance_target * Math.sin(angle_target)

  var x_movement = distance_moved_target * Math.cos(angle_movement)
  var y_movement = distance_moved_target * Math.sin(angle_movement)

  var x_final = x_target + x_movement
  var y_final = y_target + y_movement

  var distance_final = Math.sqrt(x_final ** 2 + y_final ** 2)
  var speed_self = distance_final / desired_time // Calculate speed_self using desired_time

  var angle_final = Math.atan2(y_final, x_final) * (180 / Math.PI)
  angle_final = 90 - angle_final
  if (angle_final < 0) {
    angle_final += 360
  }

  // Round the results
  speed_self = Math.round(speed_self * 10) / 10 // Round the result
  angle_final = Math.round(angle_final)
  distance_final = Math.round(distance_final)

  // Update the results container
  var resultsContainer = document.getElementById('resultsContainer')
  resultsContainer.innerHTML = ''
  resultsContainer.innerHTML +=
    '<p>Course: <span>' + angle_final + '°</span></p>'
  resultsContainer.innerHTML +=
    '<p>Distance: <span>' + distance_final + ' km</span></p>'
  resultsContainer.innerHTML +=
    '<p>Speed: <span>' + speed_self + ' km/hr</span></p>' // Show calculated speed_self
}

function clearResults() {
  var resultsContainer = document.getElementById('resultsContainer')
  resultsContainer.innerHTML = ''
}

// Attach the form submission handler
document.getElementById('myForm').addEventListener('submit', calculateHeading)

function clearResults() {
  document.getElementById('resultsContainer').innerHTML = ''
}

document.getElementById('myForm').addEventListener('reset', clearResults)
