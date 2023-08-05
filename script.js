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

const tooltipFont = {
  family: 'Barlow', // Change this to the desired font family
  size: 12, // Change this to the desired font size
  color: '#000000', // Change this to the desired font color
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

      // Calculate the direction vectors for the Interceptor and Target lines
      const playerDirectionVector = {
        x: playerInterceptPosition.x - playerPosition.x,
        y: playerInterceptPosition.y - playerPosition.y,
      }

      const targetDirectionVector = {
        x: targetFinalPosition.x - targetInitialPosition.x,
        y: targetFinalPosition.y - targetInitialPosition.y,
      }

      // Helper function to create a visible line dataset
      function createVisibleLineDataset(data, color) {
        return {
          borderColor: color,
          data,
          fill: false,
          showLine: true,
          pointRadius: 0, // Hide the points
          pointHoverRadius: 0,
          borderWidth: 2, // Set the line width as desired
        }
      }

      // New points for the line continuation after intercept point
      const playerInterceptContinuation = {
        x: playerInterceptPosition.x + playerDirectionVector.x * 100,
        y: playerInterceptPosition.y + playerDirectionVector.y * 100,
      }

      const targetInterceptContinuation = {
        x: playerInterceptPosition.x + targetDirectionVector.x * 100,
        y: playerInterceptPosition.y + targetDirectionVector.y * 100,
      }

      chart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [
            // Interceptor: Line up to the intersection point
            createVisibleLineDataset(
              [playerPosition, playerInterceptPosition],
              '#f9f470'
            ),
            // Interceptor: Line extending from the intersection point
            createVisibleLineDataset(
              [playerInterceptPosition, playerInterceptContinuation],
              '#f9f470'
            ),
            // Target: Line up to the intersection point
            createVisibleLineDataset(
              [targetInitialPosition, targetFinalPosition],
              'rgb(190, 190, 190)'
            ),
            // Target: Line extending from the intersection point
            createVisibleLineDataset(
              [targetFinalPosition, targetInterceptContinuation],
              'rgb(190, 190, 190)'
            ),
            {
              label: 'Intersection Point',
              backgroundColor: '#f9f470', // Change the color as desired
              // pointBorderColor: 'none', // Change the point border color as desired
              pointBackgroundColor: '#f9f470', // Change the point fill color as desired
              data: [playerInterceptPosition],
              showLine: false,
              pointRadius: 8, // Increase the point radius for better visibility
              pointHoverRadius: 8, // Increase the hover radius as well
              order: 3, // Set a higher order to draw the intersection point on top
            },
            {
              label: 'Player Position',
              backgroundColor: '#4c916b', // Change the color as desired
              pointBackgroundColor: '#4c916b', // Change the point fill color as desired
              data: [playerPosition],
              showLine: false,
              pointRadius: 8, // Increase the point radius for better visibility
              pointHoverRadius: 8, // Increase the hover radius as well
              order: 3, // Set a higher order to draw the point on top
            },
            {
              label: 'Target Position',
              backgroundColor: '#b45b5b', // Change the color as desired
              pointBackgroundColor: '#b45b5b', // Change the point fill color as desired
              data: [targetInitialPosition],
              showLine: false,
              pointRadius: 8, // Increase the point radius for better visibility
              pointHoverRadius: 8, // Increase the hover radius as well
              order: 3, // Set a higher order to draw the point on top
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
              max: xMax + 100, // Add some padding to the right edge
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
                  const datasetLabel =
                    chart.data.datasets[tooltipItems[0].datasetIndex].label

                  if (datasetLabel === 'Player Position') {
                    return 'Player Position'
                  } else if (datasetLabel === 'Target Position') {
                    return 'Target Position'
                  } else if (datasetLabel === 'Intersection Point') {
                    return 'Intercept Point'
                  }

                  return ''
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
              titleFont: tooltipFont,
              bodyFont: tooltipFont,
            },
          },
        },
      })
    })

  document.getElementById('resetButton').addEventListener('click', function () {
    document.getElementById('resultsContainer').innerHTML = ''
    document.getElementById('interceptChartContainer').innerHTML =
      '<canvas id="interceptChart"></canvas>'
    if (chart !== null) {
      chart.destroy()
    }
  })
})
