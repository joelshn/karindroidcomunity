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

  // Fallback data in case JSON files don't load
  const fallbackGiveaways = [
    {
      id: "dominus-empyreus-2024",
      name: "Dominus Empyreus",
      description: "¡Gana este increíble Dominus Empyreus valorado en miles de Robux!",
      image: "https://tr.rbxcdn.com/38c6edccd50633730ff4cf39ac8859aa/420/420/Hat/Png",
      endDate: "2024-12-31T23:59:59Z",
      createdAt: "2024-12-01T00:00:00Z",
    },
    {
      id: "robux-giveaway-1000",
      name: "1000 Robux",
      description: "¡Participa por 1000 Robux gratis!",
      image: "https://images.rbxcdn.com/8560f731abce3a66c2a0b4d8a8e3d2b8/420/420/Image/Png",
      endDate: "2024-12-25T23:59:59Z",
      createdAt: "2024-12-01T00:00:00Z",
    },
  ]

  const fallbackParticipants = {
    "dominus-empyreus-2024": ["player1", "player2", "player3", "player4", "player5"],
    "robux-giveaway-1000": ["player1", "player6", "player7"],
  }

  let giveaways = []
  let participants = {}

  try {
    console.log("[v0] Starting to load giveaways...")

    console.log("[v0] Attempting to load from JSON files...")
    const giveawaysResponse = await fetch("data/giveaways.json")
    const participantsResponse = await fetch("data/participants.json")

    if (giveawaysResponse.ok && participantsResponse.ok) {
      giveaways = await giveawaysResponse.json()
      participants = await participantsResponse.json()
      console.log("[v0] Successfully loaded from JSON files")
    } else {
      throw new Error("JSON files not accessible")
    }
  } catch (error) {
    console.log("[v0] JSON files failed, using fallback data:", error.message)
    giveaways = fallbackGiveaways
    participants = fallbackParticipants
  }

  console.log("[v0] Final giveaways data:", giveaways)
  console.log("[v0] Final participants data:", participants)

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

  console.log("[v0] Active giveaways after filtering:", activeGiveaways)

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
