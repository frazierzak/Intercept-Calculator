// Helper functions
const toRadians = (degrees) => degrees * (Math.PI / 180)
const toDegrees = (radians) => radians * (180 / Math.PI)
const normalizeAngle = (angle) => {
  angle = angle % 360
  return angle >= 180 ? angle - 360 : angle
}

//Jquery function to open tabs
function openTab(tabName) {
  $('.tab-content').removeClass('active') // Hide all tab content.
  $('#' + tabName).addClass('active') // Show the specific tab content with slide-in effect.

  // Scroll to the content with a smooth animation
  $('html, body').animate(
    {
      scrollTop: $('#' + tabName).offset().top,
    },
    500
  ) // Adjust scroll speed as needed.
}

// Function to handle back-to-top button visibility
function handleBackToTopButton() {
  const scrollTop = $(window).scrollTop()
  const windowHeight = $(window).height()

  if (scrollTop > windowHeight / 2) {
    $('.back-to-top').addClass('active')
  } else {
    $('.back-to-top').removeClass('active')
  }
}

// Function to scroll back to top when the "BACK TO TOP" button is clicked
function backToTop() {
  $('html, body').animate({ scrollTop: 0 }, 500) // Scroll to the top with a smooth animation
}

// Attach a scroll event listener to show/hide the "BACK TO TOP" button
$(window).on('scroll', handleBackToTopButton)

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
            {
              label: 'Intersection Point',
              backgroundColor: '#f9f470',
              pointBackgroundColor: '#f9f470',
              data: [playerInterceptPosition],
              showLine: false,
              pointRadius: 8,
              pointHoverRadius: 8,
            },
            {
              label: 'Player Position',
              backgroundColor: '#4c916b',
              pointBackgroundColor: '#4c916b',
              data: [playerPosition],
              showLine: false,
              pointRadius: 8,
              pointHoverRadius: 8,
            },
            {
              label: 'Target Position',
              backgroundColor: '#b45b5b',
              pointBackgroundColor: '#b45b5b',
              data: [targetInitialPosition],
              showLine: false,
              pointRadius: 8,
              pointHoverRadius: 8,
            },
            {
              borderColor: '#f9f470',
              data: [playerPosition, playerInterceptContinuation],
              fill: false,
              showLine: true,
              pointRadius: 0,
              pointHoverRadius: 0,
              borderWidth: 2,
            },
            {
              borderColor: 'rgb(190, 190, 190)',
              data: [targetInitialPosition, targetInterceptContinuation],
              fill: false,
              showLine: true,
              pointRadius: 0,
              pointHoverRadius: 0,
              borderWidth: 2,
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
                  const datasetLabel = tooltipItems[0].dataset.label
                  if (datasetLabel === 'Player Position') {
                    return 'Detachment Starting Position'
                  } else if (datasetLabel === 'Target Position') {
                    return 'Target Starting Position'
                  } else if (datasetLabel === 'Intersection Point') {
                    return 'Intercept Point'
                  }
                  return ''
                },
                label: function (tooltipItem) {
                  const datasetLabel = tooltipItem.dataset.label

                  if (datasetLabel === 'Player Position') {
                    return 'Max Speed: ' + maxSpeed + ' km/h'
                  } else if (datasetLabel === 'Target Position') {
                    return [
                      'Course: ' + targetHeading + '°',
                      'Speed: ' + targetSpeed + ' km/h',
                      'Distance from Detachment: ' +
                        Math.round(targetDistance) +
                        ' km',
                    ]
                  } else if (datasetLabel === 'Intersection Point') {
                    return [
                      'Intercept Course: ' + Math.round(interceptCourse) + '°',
                      'Intercept Speed: ' + Math.round(requiredSpeed) + ' km/h',
                      'Time to Intercept: ' +
                        timeToIntercept.toFixed(1) +
                        ' HR',
                      'Distance to Intercept: ' +
                        Math.round(distanceToIntercept) +
                        ' KM',
                    ]
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
