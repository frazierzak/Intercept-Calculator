function calculateHeading(event) {
  event.preventDefault()

  // Get form values
  var speed_self = parseFloat(document.getElementById('speed_self').value)
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

  // Check if any input is empty
  if (
    isNaN(speed_self) ||
    isNaN(speed_target) ||
    isNaN(direction_target_from_you) ||
    isNaN(direction_target_heading) ||
    isNaN(distance_target)
  ) {
    alert('All fields are required.')
    return
  }

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
  var time_to_target = distance_target / speed_self
  var distance_moved_target = speed_target * time_to_target

  var x_target = distance_target * Math.cos(angle_target)
  var y_target = distance_target * Math.sin(angle_target)

  var x_movement = distance_moved_target * Math.cos(angle_movement)
  var y_movement = distance_moved_target * Math.sin(angle_movement)

  var x_final = x_target + x_movement
  var y_final = y_target + y_movement

  var distance_final = Math.sqrt(x_final ** 2 + y_final ** 2)
  var angle_final = Math.atan2(y_final, x_final) * (180 / Math.PI)
  angle_final = 90 - angle_final
  if (angle_final < 0) {
    angle_final += 360
  }

  var time_to_intercept = distance_final / speed_self

  // Round the results
  angle_final = Math.round(angle_final)
  distance_final = Math.round(distance_final)
  time_to_intercept = Math.round(time_to_intercept * 10) / 10

  // Update the results container
  var resultsContainer = document.getElementById('resultsContainer')
  resultsContainer.innerHTML = ''
  resultsContainer.innerHTML +=
    '<p>Course: <span>' + angle_final + '°</span></p>'
  resultsContainer.innerHTML +=
    '<p>Distance: <span>' + distance_final + ' km</span></p>'
  resultsContainer.innerHTML +=
    '<p>Time: <span>' + time_to_intercept + ' hrs</span></p>'
}

// Attach the form submission handler
document.getElementById('myForm').addEventListener('submit', calculateHeading)
