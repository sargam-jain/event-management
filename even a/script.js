const eventForm = document.getElementById('eventForm');
const eventList = document.getElementById('eventList');
const calendarContent = document.getElementById('calendarContent');
const listViewBtn = document.getElementById('listViewBtn');
const calendarViewBtn = document.getElementById('calendarViewBtn');
const toggleModeBtn = document.getElementById('toggleMode');
const calendarSection = document.getElementById('calendar');

let events = [];
let editMode = false;
let editEventId = null;

eventForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('eventName').value.trim();
  const date = document.getElementById('eventDate').value;
  const desc = document.getElementById('eventDesc').value.trim();

  if (name && date && desc) {
    if (editMode) {
      events = events.map(ev => ev.id === editEventId ? { ...ev, name, date, desc } : ev);
      editMode = false;
      editEventId = null;
    } else {
      const event = { id: Date.now(), name, date, desc };
      events.push(event);
    }

    saveEvents();
    renderEvents();
    eventForm.reset();
  }
});

function renderEvents() {
  eventList.innerHTML = '';
  calendarContent.innerHTML = '';

  if (events.length === 0) {
    eventList.innerHTML = '<p>No upcoming events. Add some!</p>';
    return;
  }

  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  events.forEach(ev => {
    const card = document.createElement('div');
    card.className = 'event-card';
    const daysLeft = getDaysLeft(ev.date);

    card.innerHTML = `
      <h3>${ev.name}</h3>
      <p><strong>Date:</strong> ${ev.date}</p>
      <p>${ev.desc}</p>
      <div class="countdown">${daysLeft >= 0 ? daysLeft + ' days left' : 'Event passed'}</div>
      <div class="actions">
        <button class="edit-btn" onclick="editEvent(${ev.id})">Edit</button>
        <button class="delete-btn" onclick="deleteEvent(${ev.id})">Delete</button>
      </div>
    `;

    eventList.appendChild(card);

    // Calendar Day
    const dayCard = document.createElement('div');
    dayCard.className = 'calendar-day';
    dayCard.innerHTML = `<strong>${ev.name}</strong><br>${ev.date}`;
    calendarContent.appendChild(dayCard);

    if (daysLeft === 0) {
      notify(`Today is ${ev.name}!`);
    } else if (daysLeft === 1) {
      notify(`${ev.name} is tomorrow!`);
    }
  });
}

function deleteEvent(id) {
  events = events.filter(ev => ev.id !== id);
  saveEvents();
  renderEvents();
}

function editEvent(id) {
  const event = events.find(ev => ev.id === id);
  if (event) {
    document.getElementById('eventName').value = event.name;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventDesc').value = event.desc;

    editMode = true;
    editEventId = id;
  }
}

function getDaysLeft(eventDate) {
  const today = new Date();
  const eventDay = new Date(eventDate);
  const diffTime = eventDay - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function saveEvents() {
  localStorage.setItem('events', JSON.stringify(events));
}

function loadEvents() {
  const storedEvents = localStorage.getItem('events');
  if (storedEvents) {
    events = JSON.parse(storedEvents);
  }
}

function notify(message) {
  if (Notification.permission === 'granted') {
    new Notification('Event Reminder', { body: message });
  }
}

window.addEventListener('load', () => {
  loadEvents();
  renderEvents();

  if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
});

listViewBtn.addEventListener('click', () => {
  eventList.style.display = 'block';
  calendarSection.style.display = 'none';
});

calendarViewBtn.addEventListener('click', () => {
  eventList.style.display = 'none';
  calendarSection.style.display = 'block';
});

toggleModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

