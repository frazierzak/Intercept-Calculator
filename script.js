// Helper functions

// Convert degrees to radians
const toRadians = (degrees) => degrees * (Math.PI / 180)

// Convert radians to degrees
const toDegrees = (radians) => radians * (180 / Math.PI)

// Normalize angle to the range [-180, 180)
const normalizeAngle = (angle) => {
  angle = angle % 360
  return angle >= 180 ? angle - 360 : angle
}

// Open the specified tab and scroll to its content
function openTab(tabName) {
  $('.tab-content').removeClass('active')
  $('#' + tabName).addClass('active')
  $('html, body').animate(
    {
      scrollTop: $('#' + tabName).offset().top,
    },
    500
  )
}

// Show or hide the back-to-top button depending on scroll position
function handleBackToTopButton() {
  const scrollTop = $(window).scrollTop()
  const windowHeight = $(window).height()
  if (scrollTop > windowHeight / 2) {
    $('.back-to-top').addClass('active')
  } else {
    $('.back-to-top').removeClass('active')
  }
}

// Scroll back to the top of the page
function backToTop() {
  $('html, body').animate({ scrollTop: 0 }, 500)
}

// Attach a scroll event listener to handle the back-to-top button
$(window).on('scroll', handleBackToTopButton)

//Tooltip Code
document.querySelectorAll('.tooltip-container').forEach(function (container) {
  container.addEventListener('click', function () {
    let tooltip = container.querySelector('.tooltip-text')
    if (tooltip.style.visibility === 'visible') {
      tooltip.style.visibility = 'hidden'
      tooltip.style.opacity = '0'
    } else {
      tooltip.style.visibility = 'visible'
      tooltip.style.opacity = '1'
    }
  })
})

// Disable scroll wheel behavior on all inputs
var inputs = document.querySelectorAll('input')
inputs.forEach(function (input) {
  input.addEventListener('wheel', function (event) {
    event.preventDefault()
  })
})

// Calculate the intercept course based on target and interceptor details
function calculateInterceptCourse(
  targetBearing,
  targetHeading,
  targetSpeed,
  maxSpeed
) {
  let targetBearingRad = toRadians(targetBearing)
  let targetHeadingRad = toRadians(targetHeading)
  let a = targetSpeed / maxSpeed
  let b = Math.sin(targetHeadingRad - targetBearingRad)
  let argumentForAsin = a * b

  // Check if the argument for Math.asin is valid
  if (argumentForAsin < -1 || argumentForAsin > 1) {
    return NaN
  }

  let interceptAngleRad = Math.asin(argumentForAsin)
  let interceptCourseRad = targetBearingRad + interceptAngleRad
  let interceptCourse = normalizeAngle(toDegrees(interceptCourseRad))
  return interceptCourse
}

let chart = null // Placeholder for the current chart
const tooltipFont = {
  family: 'Barlow',
  size: 16,
  color: '#000000',
}

document.addEventListener('DOMContentLoaded', () => {
  const clouds = document.querySelectorAll('.cloud')

  clouds.forEach((cloud) => {
    const cloudWidth = cloud.clientWidth
    const cloudHeight = cloud.clientHeight

    // Generate a random scale between 1.3 (130%) and 1 (100%)
    const randomScale = 1 + Math.random() * 0.3

    const randomStartX =
      Math.random() * (window.innerWidth - cloudWidth * randomScale) // Random X position
    const randomStartY =
      Math.random() * (window.innerHeight - cloudHeight * randomScale) // Random Y position

    const angle = 45 // Angle in degrees (NE direction)
    const radianAngle = angle * (Math.PI / 180) // Convert to radians

    // Calculate the distance to move along the angle
    const distance = Math.abs(
      (cloudWidth * randomScale) / Math.cos(radianAngle)
    )

    // Calculate the new X and Y positions after moving along the angle
    const newX = randomStartX + distance * Math.cos(radianAngle)
    const newY = randomStartY - distance * Math.sin(radianAngle)

    const randomDuration = Math.random() * 60 + 300 // Random duration between 300s and 360s

    cloud.style.left = `${randomStartX}px`
    cloud.style.top = `${randomStartY}px`
    cloud.style.transform = `scale(${randomScale})` // Apply the random scale
    cloud.style.animationDuration = `${randomDuration}s`

    // Apply animation to move the cloud along the calculated angle
    cloud.style.animation = `moveCloud ${randomDuration}s linear infinite`
  })
})

document.addEventListener('DOMContentLoaded', function () {
  // Event listener for form submission
  document
    .getElementById('myForm')
    .addEventListener('submit', function (event) {
      event.preventDefault()
      const imageContainer = document.getElementById('interceptChartContainer')
      imageContainer.classList.remove('loaded')

      // Parsing input values from the form
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
      let targetCourseLength = parseFloat(
        document.getElementById('course_length_target').value
      )

      // 1. Initial Calculations
      let targetBearingRad = toRadians(targetBearing)
      let targetHeadingRad = toRadians(targetHeading)

      let timeToDestination
      if (!isNaN(targetCourseLength) && !isNaN(targetSpeed)) {
        timeToDestination = targetCourseLength / targetSpeed
      }

      // 2. Intercept Calculations
      let distanceToIntercept, requiredSpeed, interceptCourse, timeToIntercept
      if (!isNaN(desiredTimeToIntercept)) {
        // Intercept based on desired time
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
        // Check if the required speed is greater than max speed
        if (requiredSpeed > maxSpeed) {
          if (chart !== null) {
            chart.destroy()
            chart = null
          }
          document.getElementById(
            'resultsContainer'
          ).innerHTML = `<p class="waiting">Interception is not possible with the given max speed.</p>`
          return
        }
        interceptCourse = toDegrees(Math.atan2(newTargetY, newTargetX))
        interceptCourse =
          interceptCourse < 0 ? interceptCourse + 360 : interceptCourse
        timeToIntercept = desiredTimeToIntercept
      } else if (!isNaN(maxSpeed)) {
        // Intercept based on given maxSpeed
        interceptCourse = calculateInterceptCourse(
          targetBearing,
          targetHeading,
          targetSpeed,
          maxSpeed
        )

        if (isNaN(interceptCourse)) {
          if (chart !== null) {
            chart.destroy()
            chart = null
          }
          document.getElementById(
            'resultsContainer'
          ).innerHTML = `<p class="waiting">Interception is not possible with the given max speed.</p>`
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
        // Display error message
        document.getElementById(
          'resultsContainer'
        ).innerHTML = `<p class="waiting">Either your Max Speed or Desired Intercept Time must be entered</p>`
        return
      }

      // Display results
      document.getElementById(
        'resultsContainer'
      ).innerHTML = `<p>Intercept Course: <span>${Math.round(
        interceptCourse
      )}°</span></p>
<p>Time to Intercept: <span>${timeToIntercept.toFixed(1)} HR</span></p>
<p>Distance to Intercept: <span>${Math.round(distanceToIntercept)} KM</span></p>
<p>Speed Required: <span>${Math.round(requiredSpeed)} KM/HR</span></p>`

      // 3. Position Calculations
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
          requiredSpeed *
          timeToIntercept *
          Math.cos(toRadians(90 - interceptCourse)),
        y:
          requiredSpeed *
          timeToIntercept *
          Math.sin(toRadians(90 - interceptCourse)),
      }
      const playerDirectionVector = {
        x: playerInterceptPosition.x - playerPosition.x,
        y: playerInterceptPosition.y - playerPosition.y,
      }
      const targetDirectionVector = {
        x: targetFinalPosition.x - targetInitialPosition.x,
        y: targetFinalPosition.y - targetInitialPosition.y,
      }

      // 1. Cleanup & Initial Setup
      // Destroy any existing chart and reset the canvas
      var ctx = document.getElementById('interceptChart').getContext('2d')
      if (chart !== null) {
        chart.destroy()
        chart = null
        ctx.canvas.width = ctx.canvas.width
      }

      // Helper function to create a visible line dataset
      function createVisibleLineDataset(data, color) {
        return {
          borderColor: color,
          data,
          fill: false,
          showLine: true,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderWidth: 2,
        }
      }

      // 2. Data Calculations
      // Calculate positions and other data required for the chart
      const playerInterceptContinuation = {
        x: playerInterceptPosition.x + playerDirectionVector.x * 100,
        y: playerInterceptPosition.y + playerDirectionVector.y * 100,
      }
      const targetInterceptContinuation = {
        x: playerInterceptPosition.x + targetDirectionVector.x * 100,
        y: playerInterceptPosition.y + targetDirectionVector.y * 100,
      }

      // Calculate the position of the target after traveling the targetCourseLength
      let targetEndPoint
      let showTargetLine = false // A flag to decide whether to show the target's course line

      if (targetSpeed && targetHeading) {
        if (
          targetCourseLength &&
          !isNaN(targetCourseLength) &&
          timeToDestination
        ) {
          targetEndPoint = {
            x:
              targetInitialPosition.x +
              targetSpeed *
                timeToDestination *
                Math.cos(toRadians(90 - targetHeading)),
            y:
              targetInitialPosition.y +
              targetSpeed *
                timeToDestination *
                Math.sin(toRadians(90 - targetHeading)),
          }
          showTargetLine = true // Only show the line if we have a course length
        } else {
          // You can adjust this arbitrary multiplier (e.g., 1000) to make the line longer if needed
          targetEndPoint = {
            x:
              targetInitialPosition.x +
              1000 * Math.cos(toRadians(90 - targetHeading)),
            y:
              targetInitialPosition.y +
              1000 * Math.sin(toRadians(90 - targetHeading)),
          }
        }
      }

      // 3. Checks & Validations
      // Check if interception is possible before the target changes course
      if (
        targetCourseLength &&
        !isNaN(targetCourseLength) &&
        timeToIntercept > timeToDestination
      ) {
        document.getElementById(
          'resultsContainer'
        ).innerHTML = `<p class="waiting">Interception is not possible before the target changes course.</p>`
        return
      }

      // Adjust chart's scale and check data for NaN values
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
      if (targetEndPoint) {
        xValues.push(targetEndPoint.x)
        yValues.push(targetEndPoint.y)
      }
      let xMin = Math.min(...xValues) - 100
      let xMax = Math.max(...xValues) + 100
      let yMin = Math.min(...yValues) - 100
      let yMax = Math.max(...yValues) + 100

      console.log('xMin:', xMin)
      console.log('xMax:', xMax)
      console.log('yMin:', yMin)
      console.log('yMax:', yMax)

      if ([xMin, xMax, yMin, yMax].some((value) => isNaN(value))) {
        console.error('Chart axis bounds contain NaN values')
        return
      }

      // 4. Chart Data Preparation
      // Prepare the datasets for the chart
      let datasets = [
        {
          label: 'Intersection Point',
          pointBorderColor: '#3a3a3a',
          pointBackgroundColor: '#3a3a3a',
          pointBorderWidth: 1,
          data: [playerInterceptPosition],
          showLine: false,
          pointRadius: 14,
          pointHoverRadius: 14,
          pointStyle: 'triangle',
        },
        {
          label: 'Player Position',
          pointBorderColor: '#f9f470',
          pointBackgroundColor: 'transparent',
          pointBorderWidth: 6,
          pointHoverBorderWidth: 6,
          data: [playerPosition],
          showLine: false,
          pointRadius: 10,
          pointHoverRadius: 10,
        },
        {
          label: 'Target Position',
          backgroundColor: '#b45b5b',
          pointBackgroundColor: '#b45b5b',
          data: [targetInitialPosition],
          showLine: false,
          pointRadius: 14,
          pointHoverRadius: 14,
          pointStyle: 'rect',
        },
        {
          borderColor: '#f9f470',
          data: [playerPosition, playerInterceptPosition], // Stop the line at the intercept point
          fill: false,
          showLine: true,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderWidth: 3,
        },
      ]

      // Only add the Target Destination marker if the targetCourseLength is provided.
      if (targetCourseLength && !isNaN(targetCourseLength)) {
        datasets.push({
          label: 'Target Destination', // Add the label for the dataset
          pointBorderColor: '#b45b5b',
          pointBackgroundColor: '#b45b5b',
          pointBorderWidth: 6,
          pointHoverBorderWidth: 6,
          data: [targetEndPoint],
          showLine: false,
          pointRadius: 10,
          pointHoverRadius: 10,
          pointStyle: 'crossRot',
        })
      }

      // Add the dataset for the target's course.
      datasets.push({
        borderColor: 'rgb(231, 231, 231)',
        data: [targetInitialPosition, targetEndPoint],
        fill: false,
        showLine: true,
        pointRadius:
          targetCourseLength && !isNaN(targetCourseLength) ? [0, 10] : [0, 0],
        pointHoverRadius:
          targetCourseLength && !isNaN(targetCourseLength) ? [0, 10] : [0, 0],
        borderWidth: 3,
        pointBackgroundColor: 'transparent', // Ensure there's no fill color for the points
        pointBorderColor: 'transparent', // Ensure there's no border color for the points
      })

      datasets.forEach((dataset, datasetIndex) => {
        dataset.data.forEach((point, pointIndex) => {
          if (isNaN(point.x) || isNaN(point.y)) {
            console.log(
              `NaN found in dataset ${datasetIndex} at point ${pointIndex}.`
            )
            console.log(point)
          }
        })
      })

      if (
        datasets.some((dataset) =>
          dataset.data.some((point) => isNaN(point.x) || isNaN(point.y))
        )
      ) {
        console.error('Chart data contains NaN values')
        return
      }

      // 5. Chart Rendering
      // Draw the chart

      imageContainer.classList.add('loaded')

      // Create the chart (provided there were no errors)
      chart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: datasets,
        },
        options: {
          layout: {
            padding: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            },
          },
          responsive: true,
          maintainAspectRatio: false,
          aspectRatio: 1,
          scales: {
            x: {
              title: {
                display: false,
              },
              ticks: {
                display: false,
              },
              grid: {
                display: false, // This removes the gridlines
                drawBorder: false, // This removes the border
              },
              min: xMin,
              max: xMax + 100,
            },
            y: {
              title: {
                display: false,
              },
              ticks: {
                display: false,
              },
              grid: {
                display: false, // This removes the gridlines
                drawBorder: false, // This removes the border
              },
              min: yMin,
              max: yMax,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                title: function (tooltipItems) {
                  const datasetLabel = tooltipItems[0]?.dataset?.label
                  if (datasetLabel === 'Player Position') {
                    return 'Detachment Starting Position'
                  } else if (datasetLabel === 'Target Position') {
                    return 'Target Starting Position'
                  } else if (datasetLabel === 'Intersection Point') {
                    return 'Intercept Point'
                  } else if (datasetLabel === 'Target Destination') {
                    return 'Target Destination' // Return the label for "Target Destination"
                  } else {
                    return '' // Default title if no matching label is found
                  }
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
                  } else if (datasetLabel === 'Target Destination') {
                    const timeToReach = targetCourseLength / targetSpeed
                    return [
                      'Length: ' + targetCourseLength.toFixed(0) + ' km', // Add Length information
                      'Time to Reach: ' + timeToReach.toFixed(1) + ' HR', // Add Time to Reach information
                    ]
                  }
                },
              },
              titleFont: tooltipFont,
              bodyFont: tooltipFont,
            },
            beforeDraw: function (chartInstance, easing) {
              let ctx = chartInstance.chart.ctx
              ctx.save()
              ctx.drawImage(
                backgroundImage,
                0,
                0,
                chartInstance.chart.width,
                chartInstance.chart.height
              )
              ctx.restore()
            },
          },
        },
      })
    })

  // Reset functionality
  document.getElementById('resetButton').addEventListener('click', function () {
    document.getElementById(
      'resultsContainer'
    ).innerHTML = `<p class="waiting">Waiting for Data</p>`
    const imageContainer = document.getElementById('interceptChartContainer')
    imageContainer.classList.remove('loaded')

    if (chart !== null) {
      chart.destroy()
      chart = new Chart(
        document.getElementById('interceptChart').getContext('2d'),
        {}
      )
    }
  })
})
