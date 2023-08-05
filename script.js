// Helper functions
const toRadians = (degrees) => degrees * (Math.PI / 180)
const toDegrees = (radians) => radians * (180 / Math.PI)
const normalizeAngle = (angle) => {
  angle = angle % 360
  return angle >= 0 ? angle : angle + 360
}

// Function to calculate intercept course
function calculateInterceptCourse(
  targetBearing,
  targetHeading,
  targetSpeed,
  maxSpeed
) {
  let targetBearingRad = toRadians(targetBearing)
  let targetHeadingRad = toRadians(targetHeading)

  console.log('Target Bearing:', targetBearing)
  console.log('Target Heading:', targetHeading)

  let a = targetSpeed / maxSpeed
  let b = Math.sin(targetHeadingRad - targetBearingRad)

  let interceptAngleRad = Math.asin(a * b)

  let interceptCourseRad = targetBearingRad + interceptAngleRad
  let interceptCourse = normalizeAngle(toDegrees(interceptCourseRad))

  return interceptCourse
}

// JQuery to show Directions and Math
function openTab(tabName) {
  $('.tab-content').hide() // Hide all tab content.
  $('#' + tabName).fadeIn() // Show the specific tab content with fade in effect.
}

document.addEventListener('DOMContentLoaded', function () {
  document
    .getElementById('myForm')
    .addEventListener('submit', function (event) {
      event.preventDefault()

      let maxSpeed = parseFloat(document.getElementById('speed_self').value)
      let targetBearing = parseFloat(
        document.getElementById('direction_target_from_you').value
      )
      let targetHeading = parseFloat(
        document.getElementById('direction_target_heading').value
      )
      let targetSpeed = parseFloat(
        document.getElementById('speed_target').value
      )
      let targetDistance = parseFloat(
        document.getElementById('distance_target').value
      )
      let desiredTimeToIntercept = parseFloat(
        document.getElementById('desired_time').value
      )

      let interceptCourse, timeToIntercept, distanceToIntercept, requiredSpeed

      // Convert all angles to radians for calculations
      let targetBearingRad = toRadians(targetBearing)
      let targetHeadingRad = toRadians(targetHeading)

      if (!isNaN(desiredTimeToIntercept)) {
        let newTargetX =
          targetDistance * Math.cos(targetBearingRad) +
          targetSpeed * desiredTimeToIntercept * Math.cos(targetHeadingRad)
        let newTargetY =
          targetDistance * Math.sin(targetBearingRad) +
          targetSpeed * desiredTimeToIntercept * Math.sin(targetHeadingRad)

        distanceToIntercept = Math.sqrt(
          newTargetX * newTargetX + newTargetY * newTargetY
        )
        requiredSpeed = distanceToIntercept / desiredTimeToIntercept

        if (requiredSpeed > maxSpeed) {
          document.getElementById(
            'resultsContainer'
          ).innerHTML = `<p>Interception is not possible within the given timeframe with current maximum speed.</p>`
          return
        }

        interceptCourse = toDegrees(Math.atan2(newTargetY, newTargetX))
        interceptCourse = normalizeAngle(interceptCourse)

        timeToIntercept = desiredTimeToIntercept
      } else if (!isNaN(maxSpeed)) {
        interceptCourse = calculateInterceptCourse(
          targetBearing,
          targetHeading,
          targetSpeed,
          maxSpeed
        )

        if (interceptCourse === null) {
          document.getElementById(
            'resultsContainer'
          ).innerHTML = `<p>Interception is not possible with current maximum speed.</p>`
          return
        }

        let interceptCourseRad = toRadians(interceptCourse)
        let closingSpeedX =
          maxSpeed * Math.cos(interceptCourseRad) -
          targetSpeed * Math.cos(targetHeadingRad)
        let closingSpeedY =
          maxSpeed * Math.sin(interceptCourseRad) -
          targetSpeed * Math.sin(targetHeadingRad)
        let closingSpeed = Math.sqrt(
          closingSpeedX * closingSpeedX + closingSpeedY * closingSpeedY
        )

        timeToIntercept = targetDistance / closingSpeed
        distanceToIntercept = timeToIntercept * maxSpeed
        requiredSpeed = maxSpeed
      } else {
        // If neither maxSpeed or desiredTimeToIntercept are entered
        document.getElementById(
          'resultsContainer'
        ).innerHTML = `<p>Either your Max Speed or Desired Intercept Time must be entered</p>`
        return
      }

      // Display results in the resultsContainer
      document.getElementById(
        'resultsContainer'
      ).innerHTML = `<p>Intercept Course: <span>${Math.round(
        interceptCourse
      )}°</span></p>
<p>Time to Intercept: <span>${timeToIntercept.toFixed(1)} HR</span></p>
<p>Distance to Intercept: <span>${Math.round(distanceToIntercept)} KM</span></p>
<p>Speed Required: <span>${Math.round(requiredSpeed)} KM/HR</span></p>`
    })

  document.getElementById('resetButton').addEventListener('click', function () {
    document.getElementById('resultsContainer').innerHTML = ''
  })
})
