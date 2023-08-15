document.addEventListener('DOMContentLoaded', function () {
  // Attach event listener to the form submission
  document
    .getElementById('myForm')
    .addEventListener('submit', function (event) {
      event.preventDefault() // Prevent the default form submission behavior

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

      let isLanded = document.getElementById('isLanded').checked

      let additionalTargetDistance = 0
      if (isLanded) {
        additionalTargetDistance = targetSpeed * 0.25 // 0.25 hours = 15 minutes
        // Calculate the x and y components of the target's movement
        let deltaX =
          additionalTargetDistance * Math.sin(toRadians(targetHeading))
        let deltaY =
          additionalTargetDistance * Math.cos(toRadians(targetHeading))

        // Convert the original target bearing and distance to x and y components
        let originalX = targetDistance * Math.sin(toRadians(targetBearing))
        let originalY = targetDistance * Math.cos(toRadians(targetBearing))

        // Add the target's movement to its original position
        let newX = originalX + deltaX
        let newY = originalY + deltaY

        // Convert the new x and y components back to a bearing and distance
        targetBearing = toDegrees(Math.atan2(newX, newY))
        targetDistance = Math.sqrt(newX ** 2 + newY ** 2)
      }

      // Calculate Intercept Course and Time to Intercept
      let interceptCourse, timeToIntercept, requiredSpeed, distanceToIntercept
      ;[interceptCourse, timeToIntercept, requiredSpeed, distanceToIntercept] =
        calculateIntercept(
          targetBearing,
          targetHeading,
          targetSpeed,
          maxSpeed,
          targetDistance
        )

      if (isLanded) {
        timeToIntercept += 0.25
      }

      let hours = Math.floor(timeToIntercept)
      let minutes = Math.round((timeToIntercept - hours) * 60)

      // Display results
      document.getElementById('resultsContainer').innerHTML = `
    <p>Intercept Course: <span>${Math.round(interceptCourse)}°</span></p>
    <p>Time to Intercept: <span>${hours}h ${minutes}m</span></p>
    <p>Required Speed: <span>${Math.round(requiredSpeed)} km/h</span></p>
    <p>Distance to Intercept: <span>${Math.round(
      distanceToIntercept
    )} km</span></p>`

      // After getting the results from calculateIntercept

      // Set the div to be square
      let animationContainer = document.getElementById('animationContainer')
      let containerWidth = animationContainer.offsetWidth
      animationContainer.style.height = `${containerWidth}px`

      let interceptorElem = document.getElementById('interceptor')
      let targetElem = document.getElementById('target')
      let interceptPointElem = document.getElementById('interceptPoint')

      // Calculate the positions of the dots relative to each other
      let interceptX =
        distanceToIntercept * Math.sin(toRadians(interceptCourse))
      let interceptY =
        -distanceToIntercept * Math.cos(toRadians(interceptCourse))

      let targetStartX = targetDistance * Math.sin(toRadians(targetBearing))
      let targetStartY = -targetDistance * Math.cos(toRadians(targetBearing))

      // Calculate the scale factor
      let triangleMaxSide = Math.max(
        Math.sqrt(Math.pow(interceptX, 2) + Math.pow(interceptY, 2)),
        Math.sqrt(Math.pow(targetStartX, 2) + Math.pow(targetStartY, 2))
      )
      let scaleFactor = (containerWidth * 0.8) / triangleMaxSide // 0.8 to ensure it doesn't touch the borders

      // Calculate the bounding box of the triangle
      let minX = Math.min(0, interceptX, targetStartX) // 0 for interceptor's initial position
      let maxX = Math.max(0, interceptX, targetStartX)
      let minY = Math.min(0, interceptY, targetStartY)
      let maxY = Math.max(0, interceptY, targetStartY)

      // Calculate the center of the bounding box
      let boundingBoxCenterX = (minX + maxX) / 2
      let boundingBoxCenterY = (minY + maxY) / 2

      // Calculate the offset to center the triangle in the container
      let offsetX = containerWidth / 2 - boundingBoxCenterX * scaleFactor
      let offsetY = containerWidth / 2 - boundingBoxCenterY * scaleFactor

      // Offset the triangle's vertices
      interceptX = interceptX * scaleFactor + offsetX
      interceptY = interceptY * scaleFactor + offsetY
      targetStartX = targetStartX * scaleFactor + offsetX
      targetStartY = targetStartY * scaleFactor + offsetY

      // Set the positions of the dots
      interceptorElem.style.left = `${offsetX}px`
      interceptorElem.style.top = `${offsetY}px`
      targetElem.style.left = `${targetStartX}px`
      targetElem.style.top = `${targetStartY}px`
      interceptPointElem.style.left = `${interceptX}px`
      interceptPointElem.style.top = `${interceptY}px`

      // Set the positions of the dots
      interceptorElem.style.left = `${offsetX}px`
      interceptorElem.style.top = `${offsetY}px`
      targetElem.style.left = `${targetStartX}px`
      targetElem.style.top = `${targetStartY}px`
      interceptPointElem.style.left = `${interceptX}px`
      interceptPointElem.style.top = `${interceptY}px`

      // Rounding the numbers
      let roundedTargetDistance = Math.round(targetDistance)
      let roundedInterceptCourse = Math.round(interceptCourse)

      // Calculate midpoints of each line
      let midpointInterceptorTarget = {
        x: (offsetX + targetStartX) / 2,
        y: (offsetY + targetStartY) / 2,
      }

      let midpointInterceptorIntercept = {
        x: (offsetX + interceptX) / 2,
        y: (offsetY + interceptY) / 2,
      }

      // Calculate the perpendicular direction for adjustment
      let perpDirectionInterceptorTarget = {
        x:
          (targetStartY - offsetY) /
          Math.sqrt(
            Math.pow(targetStartX - offsetX, 2) +
              Math.pow(targetStartY - offsetY, 2)
          ),
        y:
          -(targetStartX - offsetX) /
          Math.sqrt(
            Math.pow(targetStartX - offsetX, 2) +
              Math.pow(targetStartY - offsetY, 2)
          ),
      }

      let perpDirectionInterceptorIntercept = {
        x:
          (interceptY - offsetY) /
          Math.sqrt(
            Math.pow(interceptX - offsetX, 2) +
              Math.pow(interceptY - offsetY, 2)
          ),
        y:
          -(interceptX - offsetX) /
          Math.sqrt(
            Math.pow(interceptX - offsetX, 2) +
              Math.pow(interceptY - offsetY, 2)
          ),
      }

      // Calculate rotation angles for the text
      let angleInterceptorTarget =
        (Math.atan2(targetStartY - offsetY, targetStartX - offsetX) * 180) /
        Math.PI
      let angleInterceptorIntercept =
        (Math.atan2(interceptY - offsetY, interceptX - offsetX) * 180) / Math.PI

      angleInterceptorTarget = adjustAngle(
        angleInterceptorTarget,
        offsetY,
        targetStartY
      )
      angleInterceptorIntercept = adjustAngle(
        angleInterceptorIntercept,
        offsetY,
        interceptY
      )

      const estimatedLabelHeight = 20 // Based on 16px font size plus some buffer.
      const basePadding = 5
      const extraPadding = 10 // Adjust this value as needed

      midpointInterceptorTarget.x +=
        basePadding * perpDirectionInterceptorTarget.x
      midpointInterceptorTarget.y +=
        basePadding * perpDirectionInterceptorTarget.y

      let distanceBetweenMidpoints = calculateDistance(
        midpointInterceptorTarget,
        midpointInterceptorIntercept
      )

      if (distanceBetweenMidpoints < 2 * estimatedLabelHeight) {
        // Labels are likely overlapping, apply extra padding
        midpointInterceptorTarget.x -=
          extraPadding * perpDirectionInterceptorTarget.x
        midpointInterceptorTarget.y -=
          extraPadding * perpDirectionInterceptorTarget.y

        midpointInterceptorIntercept.x +=
          extraPadding * perpDirectionInterceptorIntercept.x
        midpointInterceptorIntercept.y +=
          extraPadding * perpDirectionInterceptorIntercept.y
      }

      let fontData =
        'font-size="16" font-weight="900" letter-spacing="3" text-anchor="middle"'

      // Draw the lines between points and add the text
      let svgContainer = document.getElementById('lineContainer')
      let halfDotSize = 5 // Half of the dot's size (10px / 2)
      svgContainer.innerHTML = `
<line x1="${offsetX + halfDotSize}" y1="${offsetY + halfDotSize}" x2="${
        targetStartX + halfDotSize
      }" y2="${
        targetStartY + halfDotSize
      }" class="blueLine" style="stroke-width:2" />
<line x1="${offsetX + halfDotSize}" y1="${offsetY + halfDotSize}" x2="${
        interceptX + halfDotSize
      }" y2="${
        interceptY + halfDotSize
      }" class="redLine" style="stroke-width:2" />
<line x1="${targetStartX + halfDotSize}" y1="${
        targetStartY + halfDotSize
      }" x2="${interceptX + halfDotSize}" y2="${
        interceptY + halfDotSize
      }" class="greenLine" style="stroke-width:2" />

<text x="${midpointInterceptorTarget.x}" y="${
        midpointInterceptorTarget.y
      }" transform="rotate(${angleInterceptorTarget},${
        midpointInterceptorTarget.x
      },${
        midpointInterceptorTarget.y
      })" ${fontData} class="interceptorAngleText">${roundedTargetDistance} KM</text>
<text x="${midpointInterceptorIntercept.x}" y="${
        midpointInterceptorIntercept.y
      }" transform="rotate(${angleInterceptorIntercept},${
        midpointInterceptorIntercept.x
      },${
        midpointInterceptorIntercept.y
      })" ${fontData} class="distanceText">${roundedInterceptCourse}°</text>
`

      // Set a fixed duration:
      let duration = isLanded ? 6500 : 5000

      // Set rotation for the arrows based on the heading
      let interceptorArrow = interceptorElem.querySelector('.arrow')
      let targetArrow = targetElem.querySelector('.arrow')

      interceptorArrow.style.transform = `rotate(${interceptCourse}deg)`
      targetArrow.style.transform = `rotate(${targetHeading}deg)`

      // Animate the interceptor to the intercept point
      let interceptorAnimation = interceptorElem.animate(
        [
          { top: `${offsetY}px`, left: `${offsetX}px` },
          { top: `${interceptY}px`, left: `${interceptX}px` },
        ],
        {
          duration: duration,
          fill: 'forwards',
        }
      )

      // Animate the target's movement
      let targetAnimation = targetElem.animate(
        [
          { top: `${targetStartY}px`, left: `${targetStartX}px` },
          { top: `${interceptY}px`, left: `${interceptX}px` },
        ],
        {
          duration: duration,
          fill: 'forwards',
        }
      )

      // Loop the animation after it ends with a 3-second pause
      interceptorAnimation.onfinish = function () {
        setTimeout(function () {
          interceptorAnimation.play()
          targetAnimation.play()
        }, 3000) // 3-second pause
      }

      targetAnimation.onfinish = function () {
        setTimeout(function () {
          interceptorAnimation.play()
          targetAnimation.play()
        }, 3000) // 3-second pause
      }
    })

  // Helper functions
  function toRadians(degrees) {
    return degrees * (Math.PI / 180)
  }

  function toDegrees(radians) {
    return radians * (180 / Math.PI)
  }

  function normalizeAngle(angle) {
    angle = angle % 360
    return angle >= 180 ? angle - 360 : angle
  }

  function calculateIntercept(
    targetBearing,
    targetHeading,
    targetSpeed,
    maxSpeed,
    targetDistance
  ) {
    let targetBearingRad = toRadians(targetBearing)
    let targetHeadingRad = toRadians(targetHeading)
    let a = targetSpeed / maxSpeed
    let b = Math.sin(targetHeadingRad - targetBearingRad)
    let argumentForAsin = a * b

    if (argumentForAsin < -1 || argumentForAsin > 1) {
      return [NaN, NaN, NaN]
    }

    let interceptAngleRad = Math.asin(argumentForAsin)
    let interceptCourseRad = targetBearingRad + interceptAngleRad
    let interceptCourse = normalizeAngle(toDegrees(interceptCourseRad))

    let closingSpeedX =
      maxSpeed * Math.cos(interceptCourseRad) -
      targetSpeed * Math.cos(targetHeadingRad)
    let closingSpeedY =
      maxSpeed * Math.sin(interceptCourseRad) -
      targetSpeed * Math.sin(targetHeadingRad)
    let closingSpeed = Math.sqrt(closingSpeedX ** 2 + closingSpeedY ** 2)
    let timeToIntercept = targetDistance / closingSpeed

    let requiredSpeed = maxSpeed // Here, the required speed is the max speed
    let distanceToIntercept = requiredSpeed * timeToIntercept

    return [
      interceptCourse,
      timeToIntercept,
      requiredSpeed,
      distanceToIntercept,
    ]
  }

  function adjustAngle(angle, startY, endY) {
    if (endY < startY) {
      if (angle >= 0 && angle < 180) {
        return angle + 180
      }
    } else {
      if (angle >= 180 && angle < 360) {
        return angle - 180
      }
    }
    return angle
  }

  function calculateDistance(point1, point2) {
    return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2)
  }
})
