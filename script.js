document.addEventListener('DOMContentLoaded', function () {
    // Current date
    let currentDate = new Date();
    let selectedDate = null;
    let selectedTime = null;

    // Sample booked appointments 
    const bookedAppointments = {
        '2023-5-15': ['09:00 AM', '02:30 PM'],
        '2023-5-20': ['10:30 AM', '04:00 PM'],
        '2023-5-25': ['11:00 AM', '03:30 PM']
    };

    // Initialize the calendar
    renderCalendar(currentDate);

    // Event listeners for month navigation
    document.getElementById('prev-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    // Confirm appointment button
    document.getElementById('confirm-btn').addEventListener('click', confirmAppointment);

    function renderCalendar(date) {
        const calendarGrid = document.getElementById('calendar-grid');
        const monthYear = document.getElementById('month-year');

        // Set month and year in header
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        monthYear.textContent = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

        // Clear previous days 
        while (calendarGrid.children.length > 7) {
            calendarGrid.removeChild(calendarGrid.lastChild);
        }

        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

        // Get days from previous month
        const prevMonthDays = new Date(date.getFullYear(), date.getMonth(), 0).getDate();

        // Add days from previous month
        for (let i = 0; i < firstDay; i++) {
            const dayElement = createDayElement(prevMonthDays - firstDay + i + 1, true);
            calendarGrid.appendChild(dayElement);
        }

        // Add days from current month
        const today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = createDayElement(i, false);

            // Check if this is today
            if (date.getFullYear() === today.getFullYear() &&
                date.getMonth() === today.getMonth() &&
                i === today.getDate()) {
                dayElement.classList.add('today');
            }

            // Check if this day is selected
            if (selectedDate &&
                date.getFullYear() === selectedDate.getFullYear() &&
                date.getMonth() === selectedDate.getMonth() &&
                i === selectedDate.getDate()) {
                dayElement.classList.add('selected');
            }

            // Add appointment count if any
            const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${i}`;
            if (bookedAppointments[dateKey] && bookedAppointments[dateKey].length > 0) {
                const appointmentCount = document.createElement('div');
                appointmentCount.classList.add('appointment-count');
                appointmentCount.textContent = bookedAppointments[dateKey].length;
                dayElement.appendChild(appointmentCount);
            }

            calendarGrid.appendChild(dayElement);
        }

        // Add days from next month to fill the grid
        const totalCells = firstDay + daysInMonth;
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

        for (let i = 1; i <= remainingCells; i++) {
            const dayElement = createDayElement(i, true);
            calendarGrid.appendChild(dayElement);
        }
    }

    function createDayElement(dayNumber, isInactive) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        if (isInactive) dayElement.classList.add('inactive');

        const dayNumberElement = document.createElement('div');
        dayNumberElement.classList.add('day-number');
        dayNumberElement.textContent = dayNumber;
        dayElement.appendChild(dayNumberElement);

        if (!isInactive) {
            dayElement.addEventListener('click', () => selectDate(dayNumber));
        }

        return dayElement;
    }

    function selectDate(day) {
        const calendarDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        selectedDate = calendarDate;


        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });

        event.target.classList.add('selected');


        const dateString = calendarDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
        document.getElementById('selected-date').textContent = dateString;


        generateTimeSlots(calendarDate);


        document.getElementById('appointment-details').innerHTML = '<p>Select a time slot to book an appointment</p>';
        document.getElementById('confirm-btn').disabled = true;
        selectedTime = null;
    }

    function generateTimeSlots(date) {
        const timeSlotsContainer = document.getElementById('time-slots');
        timeSlotsContainer.innerHTML = '';


        const startHour = 9;
        const endHour = 17;
        const interval = 30; // minutes

        const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        const bookedSlots = bookedAppointments[dateKey] || [];

        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += interval) {
                const timeString = `${hour > 12 ? hour - 12 : hour}:${minute === 0 ? '00' : minute} ${hour >= 12 ? 'PM' : 'AM'}`;
                const timeSlot = document.createElement('div');
                timeSlot.classList.add('time-slot');
                timeSlot.textContent = timeString;

                // Check if this slot is booked
                if (bookedSlots.includes(timeString)) {
                    timeSlot.classList.add('booked');
                } else {
                    timeSlot.addEventListener('click', () => selectTimeSlot(timeString, timeSlot));
                }

                timeSlotsContainer.appendChild(timeSlot);
            }
        }
    }

    function selectTimeSlot(time, element) {

        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });

        // Add selected class to clicked time slot
        element.classList.add('selected');


        const dateString = selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        document.getElementById('appointment-details').innerHTML = `
            <h4>Appointment Details</h4>
            <p><strong>Date:</strong> ${dateString}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Service:</strong> Standard Service (60 mins)</p>
        `;

        document.getElementById('confirm-btn').disabled = false;
        selectedTime = time;
    }

    function confirmAppointment() {
        if (!selectedDate || !selectedTime) return;

        const dateKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;


        if (!bookedAppointments[dateKey]) {
            bookedAppointments[dateKey] = [];
        }
        bookedAppointments[dateKey].push(selectedTime);


        alert(`Appointment confirmed for ${selectedDate.toLocaleDateString()} at ${selectedTime}`);
        renderCalendar(currentDate);
        generateTimeSlots(selectedDate);

        // Reset selection
        document.getElementById('appointment-details').innerHTML = '<p>Appointment booked successfully!</p>';
        document.getElementById('confirm-btn').disabled = true;
        selectedTime = null;
    }
});
// Create stars and shooting stars
function createStars() {
    const starsContainer = document.getElementById('stars');
    starsContainer.innerHTML = '';

   
    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.width = `${Math.random() * 3}px`;
        star.style.height = star.style.width;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.setProperty('--duration', `${2 + Math.random() * 3}s`);
        starsContainer.appendChild(star);
    }

    
    for (let i = 0; i < 5; i++) {
        const shootingStar = document.createElement('div');
        shootingStar.classList.add('shooting-star');
        shootingStar.style.left = `${10 + Math.random() * 80}%`;
        shootingStar.style.top = `${Math.random() * 50}%`;
        shootingStar.style.setProperty('--duration', `${15 + Math.random() * 10}s`);
        shootingStar.style.animationDelay = `${Math.random() * 20}s`;
        starsContainer.appendChild(shootingStar);
    }
}


window.addEventListener('load', createStars);



function selectDate(day) {
  

   
    event.target.classList.add('selected');

    void event.target.offsetWidth;
}

function selectTimeSlot(time, element) {
   
    element.classList.add('selected');

    void element.offsetWidth;
}
   
function selectDate(day) {
   
   
    event.target.classList.add('selected');


    void event.target.offsetWidth;

}   

function selectTimeSlot(time, element) {
    

    element.classList.add('selected');

   
    void element.offsetWidth;

   
}