const timeEl = document.getElementById("time");
const statusEl = document.getElementById("status");
const notifyBtn = document.getElementById("notifyBtn");

function updateClock() {
  const now = new Date();
  timeEl.textContent = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const min = now.getMinutes();

  if (min === 15 || min === 45) {
    triggerAlarm();
  }
}

function triggerAlarm() {
  statusEl.textContent = "Event Active";

  if (Notification.permission === "granted") {
    new Notification("AION 2 Event", {
      body: "Event aktif sekarang!",
      icon: "icon-192.png"
    });
  }
}

notifyBtn.addEventListener("click", async () => {
  const perm = await Notification.requestPermission();
  if (perm === "granted") {
    alert("Notification enabled");
  }
});

setInterval(updateClock, 1000);
updateClock();
