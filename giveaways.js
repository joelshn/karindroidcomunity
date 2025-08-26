// Load and display giveaways
async function loadGiveaways() {
  const giveawaysList = document.getElementById("giveaways-list")

  // Declare readJSONFile function
  function readJSONFile(filePath) {
    return fetch(filePath)
      .then((response) => response.json())
      .catch((error) => {
        throw new Error(`Error reading JSON file ${filePath}: ${error.message}`)
      })
  }

  try {
    const giveaways = await readJSONFile("data/giveaways.json")
    const participants = await readJSONFile("data/participants.json")

    console.log("[v0] Loaded giveaways:", giveaways)
    console.log("[v0] Loaded participants:", participants)

    if (!giveaways || giveaways.length === 0) {
      giveawaysList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-gift" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                    <h3>No hay sorteos activos</h3>
                    <p>¡Mantente atento a nuestras redes sociales para futuros sorteos!</p>
                </div>
            `
      return
    }

    const now = new Date()
    const activeGiveaways = giveaways.filter((g) => new Date(g.endDate) > now)

    console.log("[v0] Active giveaways:", activeGiveaways)

    if (activeGiveaways.length === 0) {
      giveawaysList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-clock" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                    <h3>No hay sorteos activos en este momento</h3>
                    <p>¡Los sorteos han finalizado! Mantente atento para futuros sorteos.</p>
                </div>
            `
      return
    }

    giveawaysList.innerHTML = activeGiveaways
      .map((giveaway) => {
        const participantCount = participants[giveaway.id] ? participants[giveaway.id].length : 0
        const timeLeft = getTimeLeft(giveaway.endDate)

        return `
                <div class="giveaway-card">
                    <div style="display: flex; gap: 30px; align-items: center; flex-wrap: wrap;">
                        <img src="${giveaway.image}" alt="${giveaway.name}" class="giveaway-image" 
                             onerror="this.src='https://via.placeholder.com/150x150/667eea/ffffff?text=Roblox+Item'">
                        <div class="giveaway-info" style="flex: 1; min-width: 250px;">
                            <h3>${giveaway.name}</h3>
                            ${giveaway.description ? `<p style="color: #666; margin-bottom: 15px;">${giveaway.description}</p>` : ""}
                            <div class="giveaway-meta">
                                <div class="meta-item">
                                    <i class="fas fa-clock"></i>
                                    <span>Termina: ${formatDate(giveaway.endDate)}</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-users"></i>
                                    <span>${participantCount} participantes</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-hourglass-half"></i>
                                    <span>${timeLeft}</span>
                                </div>
                            </div>
                            <a href="participar.html?id=${giveaway.id}" class="participate-btn">
                                <i class="fas fa-gift"></i> Participar
                            </a>
                        </div>
                    </div>
                </div>
            `
      })
      .join("")
  } catch (error) {
    console.error("Error loading giveaways:", error)
    giveawaysList.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i> 
                Error al cargar los sorteos. Por favor, intenta de nuevo más tarde.
            </div>
        `
  }
}

function getTimeLeft(endDate) {
  const now = new Date()
  const end = new Date(endDate)
  const diff = end - now

  if (diff <= 0) return "Finalizado"

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

// Load giveaways when page loads
document.addEventListener("DOMContentLoaded", loadGiveaways)

// Declare formatDate function
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" }
  return new Date(dateString).toLocaleDateString(undefined, options)
}
