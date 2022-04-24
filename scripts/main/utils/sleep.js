// Function to sleep or pause the control flow
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

module.exports = sleep
