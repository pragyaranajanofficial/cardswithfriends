document.addEventListener('DOMContentLoaded', function() {
    const verifyButton = document.getElementById('verify-age-btn');
    const birthdateInput = document.getElementById('birthdate');

    // Set date input constraints
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
    birthdateInput.max = maxDate.toISOString().split('T')[0];

    verifyButton.addEventListener('click', verifyAge);
});