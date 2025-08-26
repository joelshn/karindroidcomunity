// Get giveaway ID from URL
function getGiveawayId() {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get("id")
}

// Load giveaway details and check participation status
async function loadGiveawayDetails() {
  const giveawayId = getGiveawayId()
  if (!giveawayId) {
    window.location.href = "sorteos.html"
    return
  }

  const detailsDiv = document.getElementById("giveaway-details")
  const formDiv = document.getElementById("participation-form")
  const registeredDiv = document.getElementById("already-registered")

  try {
    const giveaways = await readJSONFile("data/giveaways.json")
    const participants = await readJSONFile("data/participants.json")

    const giveaway = giveaways.find((g) => g.id === giveawayId)
    if (!giveaway) {
      detailsDiv.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Sorteo no encontrado.
                </div>
                <a href="sorteos.html" class="btn-primary">Volver a Sorteos</a>
            `
      return
    }

    // Check if giveaway has ended
    if (new Date(giveaway.endDate) <= new Date()) {
      detailsDiv.innerHTML = `
                <div class="error">
                    <i class="fas fa-clock"></i> 
                    Este sorteo ha finalizado.
                </div>
                <a href="sorteos.html" class="btn-primary">Volver a Sorteos</a>
            `
      return
    }

    const participantCount = participants[giveawayId] ? participants[giveawayId].length : 0

    detailsDiv.innerHTML = `
            <div style="text-align: center; margin-bottom: 30px;">
                <img src="${giveaway.image}" alt="${giveaway.name}" 
                     style="width: 200px; height: 200px; object-fit: cover; border-radius: 15px; margin-bottom: 20px;"
                     onerror="this.src='/roblox-brainrot.png'">
                <h2>${giveaway.name}</h2>
                ${giveaway.description ? `<p style="color: #666; margin: 15px 0;">${giveaway.description}</p>` : ""}
                <div style="display: flex; justify-content: center; gap: 30px; margin-top: 20px; flex-wrap: wrap;">
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>Termina: ${formatDate(giveaway.endDate)}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-users"></i>
                        <span>${participantCount} participantes</span>
                    </div>
                </div>
            </div>
        `

    // Check if user already participated
    const savedUsername = localStorage.getItem(`giveaway_${giveawayId}`)
    if (savedUsername && participants[giveawayId] && participants[giveawayId].includes(savedUsername)) {
      registeredDiv.style.display = "block"
      formDiv.style.display = "none"
    } else {
      formDiv.style.display = "block"
      registeredDiv.style.display = "none"
    }
  } catch (error) {
    console.error("Error loading giveaway details:", error)
    detailsDiv.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i> 
                Error al cargar los detalles del sorteo.
            </div>
        `
  }
}

// Participate in giveaway
async function participateInGiveaway(event) {
  event.preventDefault()

  const giveawayId = getGiveawayId()
  const username = document.getElementById("roblox-username").value.trim()

  if (!username) {
    showMessage("Por favor, ingresa tu nombre de usuario de Roblox.", "error")
    return
  }

  try {
    const participants = (await readJSONFile("data/participants.json")) || {}

    // Initialize array if it doesn't exist
    if (!participants[giveawayId]) {
      participants[giveawayId] = []
    }

    // Check if user already participated
    if (participants[giveawayId].includes(username)) {
      showMessage("Ya estás registrado en este sorteo.", "error")
      return
    }

    // Add participant
    participants[giveawayId].push(username)

    // Save to GitHub
    const success = await writeJSONFile("data/participants.json", participants)

    if (success) {
      localStorage.setItem(`giveaway_${giveawayId}`, username)
      showMessage("¡Te has registrado exitosamente en el sorteo!", "success")

      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } else {
      showMessage("Error al registrarte. Por favor, intenta de nuevo.", "error")
    }
  } catch (error) {
    console.error("Error participating in giveaway:", error)
    showMessage("Error al registrarte. Por favor, intenta de nuevo.", "error")
  }
}

// Load details when page loads
document.addEventListener("DOMContentLoaded", loadGiveawayDetails)

// Declare functions used in the code
function readJSONFile(filePath) {
  // Implementation for reading JSON file
}

function formatDate(date) {
  // Implementation for formatting date
}

function showMessage(message, type) {
  // Implementation for showing message
}

function writeJSONFile(filePath, data) {
  // Implementation for writing JSON file
}
