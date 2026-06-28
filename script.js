const tabs = document.querySelectorAll(".tab");
const cards = document.querySelectorAll(".service-card");
const calendarLabel = document.querySelector(".calendar-head strong");
const calendarButtons = document.querySelectorAll(".calendar-grid button");
const monthFormatter = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" });
const weekdayFormatter = new Intl.DateTimeFormat("ru-RU", { weekday: "short" });
const baseWeek = new Date(2026, 5, 22);
let weekOffset = 0;

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const breed = tab.dataset.breed;

    tabs.forEach((item) => item.classList.toggle("is-active", item === tab));
    cards.forEach((card) => {
      card.classList.toggle("is-muted", card.dataset.card !== breed);
    });
  });
});

function renderWeek() {
  const weekStart = new Date(baseWeek);
  weekStart.setDate(baseWeek.getDate() + weekOffset * 7);
  calendarLabel.textContent = monthFormatter.format(weekStart).replace(/^./, (letter) => letter.toUpperCase());

  calendarButtons.forEach((day, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    day.querySelector("span").textContent = weekdayFormatter.format(date).replace(".", "");
    day.querySelector("strong").textContent = date.getDate();
    day.classList.toggle("is-today", date.toDateString() === new Date(2026, 5, 23).toDateString());
    day.classList.toggle("is-selected", index === 3);
  });
}

document.querySelectorAll("[data-week]").forEach((button) => {
  button.addEventListener("click", () => {
    weekOffset += button.dataset.week === "next" ? 1 : -1;
    renderWeek();
  });
});

calendarButtons.forEach((day) => {
  day.addEventListener("click", () => {
    calendarButtons.forEach((item) => item.classList.remove("is-selected"));
    day.classList.add("is-selected");
  });
});

document.querySelectorAll(".slot-row button").forEach((slot) => {
  slot.addEventListener("click", () => {
    document.querySelectorAll(".slot-row button").forEach((item) => item.classList.remove("is-picked"));
    slot.classList.add("is-picked");
  });
});

document.querySelector(".booking-form").addEventListener("submit", (e) => {
  e.preventDefault();
  
  const form = e.target;
  const name = form.name.value;
  const phone = form.phone.value;
  const pet = form.querySelector('select:nth-of-type(1)').value;
  const master = form.querySelector('select:nth-of-type(2)').value;
  
  const selectedDay = document.querySelector(".calendar-grid .is-selected strong").textContent.trim();
  const selectedTime = document.querySelector(".slot-row .is-picked").textContent.trim();
  const monthYear = document.querySelector(".calendar-head strong").textContent.trim();
  
  const dateStr = `${selectedDay} ${monthYear}`;
  const note = document.querySelector(".booking-note");

  note.textContent = `Отправляем заявку...`;
  note.classList.add("is-visible");
  
  fetch('/api/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: name,
      contact: phone,
      message: `Запись на груминг.\nПитомец: ${pet}\nМастер: ${master}\nДата: ${dateStr}\nВремя: ${selectedTime}`,
      source: 'grooming'
    })
  })
  .then(res => res.json())
  .then(data => {
    note.textContent = `Спасибо, ${name}! Заявка успешно отправлена на ${selectedDay} число в ${selectedTime}. Мы свяжемся для подтверждения.`;
    form.reset();
  })
  .catch(err => {
    console.error(err);
    note.textContent = `Ошибка при отправке. Пожалуйста, напишите нам напрямую или позвоните.`;
  });
});

// ==========================================================================
// Interactive Before/After Slider
// ==========================================================================
const slider = document.querySelector(".before-after-slider");
if (slider) {
  const beforeImg = slider.querySelector(".before-image");
  const beforeImgTag = beforeImg.querySelector("img");
  const handle = slider.querySelector(".slider-handle");

  function resizeSlider() {
    const width = slider.offsetWidth;
    beforeImgTag.style.width = width + "px";
  }

  function move(e) {
    const rect = slider.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    let pct = (x / rect.width) * 100;
    
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;
    
    beforeImg.style.width = pct + "%";
    handle.style.left = pct + "%";
  }

  let active = false;
  handle.addEventListener("mousedown", () => active = true);
  window.addEventListener("mouseup", () => active = false);
  window.addEventListener("mousemove", (e) => {
    if (!active) return;
    move(e);
  });

  handle.addEventListener("touchstart", () => active = true);
  window.addEventListener("touchend", () => active = false);
  window.addEventListener("touchmove", (e) => {
    if (!active) return;
    move(e);
  });

  slider.addEventListener("click", (e) => {
    if (e.target === handle) return;
    move(e);
  });

  window.addEventListener("resize", resizeSlider);
  resizeSlider();
  
  setTimeout(resizeSlider, 100);
}

// ==========================================================================
// Typography Parallax Scrolling
// ==========================================================================
const parallaxTexts = document.querySelectorAll(".bg-parallax-text");
if (parallaxTexts.length > 0) {
  window.addEventListener("scroll", () => {
    const scrollY = window.pageYOffset;
    parallaxTexts.forEach((text) => {
      const speed = parseFloat(text.dataset.speed) || 1;
      const parent = text.closest(".before-after");
      const parentRect = parent.getBoundingClientRect();
      const parentTop = parentRect.top + scrollY;
      const viewportHeight = window.innerHeight;
      
      if (parentRect.top < viewportHeight && parentRect.bottom > 0) {
        const relativeScroll = scrollY - parentTop + viewportHeight / 2;
        const translateX = relativeScroll * speed * 0.15;
        text.style.transform = `translateX(${translateX}px)`;
      }
    });
  });
}
