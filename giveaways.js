// Load and display giveaways
function loadGiveaways() {
  console.log("[v0] Starting to load giveaways...")
  const giveawaysList = document.getElementById("giveaways-list")

  // Initialize data if not exists
  if (!localStorage.getItem("giveaways")) {
    const exampleGiveaways = [
      {
        id: "example1",
        name: "Dominus Empyreus",
        image: "/dominus-empyreus-roblox-hat.png",
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        description: "Increíble Dominus Empyreus para el ganador!",
        createdAt: new Date().toISOString(),
      },
      {
        id: "example2",
        name: "1000 Robux",
        image: "/robux-roblox-currency.png",
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        description: "1000 Robux directos a tu cuenta!",
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem("giveaways", JSON.stringify(exampleGiveaways))
  }

  if (!localStorage.getItem("participants")) {
    const exampleParticipants = {
      example1: ["Player123", "GamerPro456", "RobloxFan789", "NoobMaster2024", "BuilderKing"],
      example2: ["CoolPlayer1", "AwesomeGamer", "RobloxLover"],
    }
    localStorage.setItem("participants", JSON.stringify(exampleParticipants))
  }

  let giveaways = []
  let participants = {}

  try {
    giveaways = JSON.parse(localStorage.getItem("giveaways") || "[]")
    participants = JSON.parse(localStorage.getItem("participants") || "{}")
    console.log("[v0] Successfully loaded from localStorage")
    console.log("[v0] Giveaways:", giveaways)
    console.log("[v0] Participants:", participants)
  } catch (error) {
    console.error("[v0] Error loading from localStorage:", error)
    giveaways = []
    participants = {}
  }

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
                 onerror="this.src='/generic-virtual-item.png'">
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

function formatDate(dateString) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }
  return new Date(dateString).toLocaleDateString("es-ES", options)
}

// Load giveaways when page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] DOM loaded, initializing giveaways page...")
  loadGiveaways()
})
