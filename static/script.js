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

      let interceptCourse = calculateInterceptCourse(
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

      let timeToIntercept = targetDistance / closingSpeed
      let distanceToIntercept = timeToIntercept * maxSpeed

      // Display results in the resultsContainer
      document.getElementById(
        'resultsContainer'
      ).innerHTML = `<p>Intercept Course: <span>${interceptCourse.toFixed(
        2
      )}°</span></p>
    <p>Time to Intercept: <span>${timeToIntercept.toFixed(2)} HR</span></p>
    <p>Distance to Intercept: <span>${distanceToIntercept.toFixed(
      2
    )} KM</span></p>`
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
