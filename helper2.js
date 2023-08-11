/**
 * Open the specified tab and scroll to its content.
 * @param {string} tabName - The name of the tab to be opened.
 */
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

/**
 * Show or hide the back-to-top button depending on scroll position.
 */
function handleBackToTopButton() {
  const scrollTop = $(window).scrollTop()
  const windowHeight = $(window).height()
  if (scrollTop > windowHeight / 2) {
    $('.back-to-top').addClass('active')
  } else {
    $('.back-to-top').removeClass('active')
  }
}

/**
 * Scroll back to the top of the page.
 */
function backToTop() {
  $('html, body').animate({ scrollTop: 0 }, 500)
}

// Handle the back-to-top button on scroll event
$(window).on('scroll', handleBackToTopButton)

// =====================
// UI Event Handlers
// =====================

// Tooltip behavior
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
document.querySelectorAll('input').forEach(function (input) {
  input.addEventListener('wheel', function (event) {
    event.preventDefault()
  })
})

const cloudImages = [
  { width: 621, height: 424, url: 'images/cloud1.png' },
  { width: 620, height: 437, url: 'images/cloud2.png' },
  { width: 442, height: 311, url: 'images/cloud3.png' },
  { width: 437, height: 356, url: 'images/cloud4.png' },
  { width: 290, height: 211, url: 'images/cloud5.png' },
]

const numClouds = 8

function createRandomCloud() {
  const randomCloud =
    cloudImages[Math.floor(Math.random() * cloudImages.length)]

  const cloudDiv = document.createElement('div')
  cloudDiv.classList.add('cloud')
  cloudDiv.style.width = `${randomCloud.width}px`
  cloudDiv.style.height = `${randomCloud.height}px`
  cloudDiv.style.backgroundImage = `url('${randomCloud.url}')`

  return cloudDiv
}

const maxClouds = 8

function createAndSetupCloud() {
  const cloud = createRandomCloud()

  // Random scale for size between 0.8 (80%) and 1.3 (130%)
  const randomScale = 0.8 + Math.random() * 0.5
  cloud.style.transform = `scale(${randomScale})`

  // Random speed between 0.8 (80%) and 1.3 (130%)
  const randomSpeedScale = 0.8 + Math.random() * 0.5
  const baseDuration = 100
  const randomDuration = baseDuration * randomSpeedScale
  cloud.style.animationDuration = `${randomDuration}s`

  return cloud
}

function animateClouds() {
  const cloudsContainer = document.querySelector('.clouds')

  for (let i = 0; i < maxClouds; i++) {
    const cloud = createAndSetupCloud()
    cloudsContainer.appendChild(cloud)

    let randomStartX, randomStartY
    if (i < maxClouds) {
      // Initial clouds
      randomStartX = Math.random() * (window.innerWidth - cloud.clientWidth)
      randomStartY = Math.random() * (window.innerHeight - cloud.clientHeight)
    } else if (Math.random() > 0.5) {
      // New clouds
      randomStartX = -cloud.clientWidth
      randomStartY = Math.random() * window.innerHeight
    } else {
      randomStartX = Math.random() * window.innerWidth
      randomStartY = window.innerHeight
    }

    cloud.style.left = `${randomStartX}px`
    cloud.style.top = `${randomStartY}px`

    cloud.addEventListener('animationiteration', () => {
      // Adjusted to create clouds off-screen
      if (Math.random() > 0.5) {
        randomStartX = -cloud.clientWidth
        randomStartY = Math.random() * window.innerHeight
      } else {
        randomStartX = Math.random() * window.innerWidth
        randomStartY = window.innerHeight
      }

      cloud.style.left = `${randomStartX}px`
      cloud.style.top = `${randomStartY}px`

      // Ensure total number of clouds remains consistent with `maxClouds`
      while (cloudsContainer.children.length < maxClouds) {
        const newCloud = createAndSetupCloud()
        cloudsContainer.appendChild(newCloud)
        if (Math.random() > 0.5) {
          newCloud.style.left = `${-newCloud.clientWidth}px`
          newCloud.style.top = `${Math.random() * window.innerHeight}px`
        } else {
          newCloud.style.left = `${Math.random() * window.innerWidth}px`
          newCloud.style.top = `${window.innerHeight}px`
        }
      }
    })
  }
}

// Call the cloud animation function
animateClouds()
