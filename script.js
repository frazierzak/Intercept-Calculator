// Helper functions
const toRadians = (degrees) => degrees * (Math.PI / 180)
const toDegrees = (radians) => radians * (180 / Math.PI)
const normalizeAngle = (angle) => {
  angle = angle % 360
  return angle >= 180 ? angle - 360 : angle
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

let chart = null // Destroy previous chart

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
        requiredSpeed = distanceToIntercept / timeToIntercept
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

      // Create a scatter plot showing the player's and target's positions over time
      let playerPosition = { x: 0, y: 0 }
      let targetInitialPosition = {
        x: targetDistance * Math.cos(toRadians(90 - targetBearing)),
        y: targetDistance * Math.sin(toRadians(90 - targetBearing)),
      }
      let targetFinalPosition = {
        x:
          targetInitialPosition.x +
          targetSpeed *
            timeToIntercept *
            Math.cos(toRadians(90 - targetHeading)),
        y:
          targetInitialPosition.y +
          targetSpeed *
            timeToIntercept *
            Math.sin(toRadians(90 - targetHeading)),
      }
      let playerInterceptPosition = {
        x:
          maxSpeed *
          timeToIntercept *
          Math.cos(toRadians(90 - interceptCourse)),
        y:
          maxSpeed *
          timeToIntercept *
          Math.sin(toRadians(90 - interceptCourse)),
      }

      // Calculate the maximum and minimum values for the x and y coordinates
      let xValues = [
        playerPosition.x,
        targetInitialPosition.x,
        targetFinalPosition.x,
        playerInterceptPosition.x,
      ]
      let yValues = [
        playerPosition.y,
        targetInitialPosition.y,
        targetFinalPosition.y,
        playerInterceptPosition.y,
      ]
      let xMin = Math.min(...xValues) - 100
      let xMax = Math.max(...xValues) + 100
      let yMin = Math.min(...yValues) - 100
      let yMax = Math.max(...yValues) + 100

      var ctx = document.getElementById('interceptChart').getContext('2d')

      // Destroy the previous chart if it exists
      if (chart !== null) {
        chart.destroy()
      }

      chart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [
            {
              label: 'Intercept Course',
              borderColor: '#f9f470',
              data: [playerPosition, playerInterceptPosition],
              fill: false,
              showLine: true,
            },
            {
              label: 'Target Course',
              borderColor: 'rgb(190, 190, 190)',
              data: [targetInitialPosition, targetFinalPosition],
              fill: false,
              showLine: true,
            },
          ],
        },
        options: {
          responsive: true, // Add this line to make the chart responsive
          maintainAspectRatio: false, // Add this line to allow the chart to resize in both dimensions
          scales: {
            x: {
              title: {
                display: false, // Hide the X label
              },
              ticks: {
                display: false, // Hide the X ticks
              },
              min: xMin,
              max: xMax,
            },
            y: {
              title: {
                display: false, // Hide the Y label
              },
              ticks: {
                display: false, // Hide the Y ticks
              },
              min: yMin,
              max: yMax,
            },
          },
          plugins: {
            legend: {
              display: false, // Add this line to hide the legend
            },
            tooltip: {
              callbacks: {
                title: function (tooltipItems) {
                  return chart.data.datasets[tooltipItems[0].datasetIndex].label
                },
                label: function (tooltipItem) {
                  if (tooltipItem.datasetIndex === 0) {
                    if (tooltipItem.dataIndex === 0) {
                      return 'Max Speed: ' + maxSpeed + 'km/h'
                    } else {
                      return (
                        'Intercept\nTime: ' +
                        timeToIntercept.toFixed(1) +
                        'hr\nDistance: ' +
                        Math.round(distanceToIntercept) +
                        'km'
                      )
                    }
                  } else {
                    if (tooltipItem.dataIndex === 0) {
                      return (
                        'Speed: ' +
                        targetSpeed +
                        'km/h\nCourse: ' +
                        targetHeading +
                        '°\nDistance: ' +
                        targetDistance +
                        'km'
                      )
                    }
                  }
                },
              },
            },
          },
        },
      })
    })

  document.getElementById('resetButton').addEventListener('click', function () {
    document.getElementById('resultsContainer').innerHTML = ''
  })
})
