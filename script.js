document.querySelector('.booking-form').addEventListener('submit', function(event) {
    event.preventDefault();
    alert('Форма успешно отправлена!');
    this.reset();
});