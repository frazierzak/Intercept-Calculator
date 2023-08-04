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

      if (!isNaN(desiredTimeToIntercept)) {
        // Convert all angles to radians for calculations
        targetBearing = targetBearing * (Math.PI / 180)
        targetHeading = targetHeading * (Math.PI / 180)

        // Calculate the new position of the target after desiredTimeToIntercept
        let newTargetX =
          targetDistance * Math.cos(targetBearing) +
          targetSpeed * desiredTimeToIntercept * Math.cos(targetHeading)
        let newTargetY =
          targetDistance * Math.sin(targetBearing) +
          targetSpeed * desiredTimeToIntercept * Math.sin(targetHeading)

        // Calculate the distance to the new target position
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

        // Calculate the intercept course to the new target position
        interceptCourse = Math.atan2(newTargetY, newTargetX)

        // Convert the intercept course back to degrees
        interceptCourse = interceptCourse * (180 / Math.PI)

        // Normalize the heading to the range [0, 360)
        while (interceptCourse < 0) {
          interceptCourse += 360
        }
        while (interceptCourse >= 360) {
          interceptCourse -= 360
        }

        timeToIntercept = desiredTimeToIntercept
      } else {
        interceptCourse = calculateInterceptCourse(
          targetBearing,
          targetHeading,
          targetSpeed,
          maxSpeed
        )

        let interceptCourseRad = interceptCourse * (Math.PI / 180)
        let targetBearingRad = targetBearing * (Math.PI / 180)
        let targetHeadingRad = targetHeading * (Math.PI / 180)

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
})

function calculateInterceptCourse(
  targetBearing,
  targetHeading,
  targetSpeed,
  maxSpeed
) {
  // Convert degrees to radians for calculations
  let targetBearingRad = targetBearing * (Math.PI / 180)
  let targetHeadingRad = targetHeading * (Math.PI / 180)

  // Calculate the target's relative speed components
  let targetSpeedX = targetSpeed * Math.cos(targetHeadingRad)
  let targetSpeedY = targetSpeed * Math.sin(targetHeadingRad)

  // Calculate the relative speed components needed to intercept the target
  let interceptSpeedX = targetSpeedX + maxSpeed * Math.cos(targetBearingRad)
  let interceptSpeedY = targetSpeedY + maxSpeed * Math.sin(targetBearingRad)

  // Calculate the required heading to intercept (in radians)
  let interceptCourseRad = Math.atan2(interceptSpeedY, interceptSpeedX)

  // Convert the intercept course back to degrees
  let interceptCourse = interceptCourseRad * (180 / Math.PI)

  // Normalise the heading to the range [0, 360)
  while (interceptCourse < 0) {
    interceptCourse += 360
  }

  while (interceptCourse >= 360) {
    interceptCourse -= 360
  }

  return interceptCourse
}
