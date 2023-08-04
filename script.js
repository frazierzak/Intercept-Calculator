// Helper functions
const toRadians = (degrees) => degrees * (Math.PI / 180)
const toDegrees = (radians) => radians * (180 / Math.PI)
const normalizeAngle = (angle) => {
  while (angle < 0) angle += 360
  while (angle >= 360) angle -= 360
  return angle
}

document.addEventListener('DOMContentLoaded', function () {
  // Function to calculate intercept course
  function calculateInterceptCourse(
    targetBearing,
    targetHeading,
    targetSpeed,
    maxSpeed
  ) {
    let targetBearingRad = toRadians(targetBearing)
    let targetHeadingRad = toRadians(targetHeading)

    let targetSpeedX = targetSpeed * Math.cos(targetHeadingRad)
    let targetSpeedY = targetSpeed * Math.sin(targetHeadingRad)

    let interceptSpeedX = targetSpeedX + maxSpeed * Math.cos(targetBearingRad)
    let interceptSpeedY = targetSpeedY + maxSpeed * Math.sin(targetBearingRad)

    let interceptCourseRad = Math.atan2(interceptSpeedY, interceptSpeedX)

    return normalizeAngle(toDegrees(interceptCourseRad))
  }

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

      if (maxSpeed < targetSpeed) {
        let interceptionCone = calculateInterceptionCone(targetSpeed, maxSpeed)
        if (
          Math.abs(targetBearing - targetHeading) > interceptionCone &&
          Math.abs(targetBearing - targetHeading) < 360 - interceptionCone
        ) {
          document.getElementById(
            'resultsContainer'
          ).innerHTML = `<p>Interception is not possible with current maximum speed.</p>`
          return
        }
      }

      if (!isNaN(desiredTimeToIntercept)) {
        // Convert all angles to radians for calculations
        targetBearing = toRadians(targetBearing)
        targetHeading = toRadians(targetHeading)

        let newTargetX =
          targetDistance * Math.cos(targetBearing) +
          targetSpeed * desiredTimeToIntercept * Math.cos(targetHeading)
        let newTargetY =
          targetDistance * Math.sin(targetBearing) +
          targetSpeed * desiredTimeToIntercept * Math.sin(targetHeading)

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
      } else {
        interceptCourse = calculateInterceptCourse(
          targetBearing,
          targetHeading,
          targetSpeed,
          maxSpeed
        )

        let interceptCourseRad = toRadians(interceptCourse)
        let targetHeadingRad = toRadians(targetHeading)

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
        requiredSpeed = distanceToIntercept / timeToIntercept
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

function calculateInterceptionCone(targetSpeed, maxSpeed) {
  return toDegrees(Math.acos(maxSpeed / targetSpeed))
}
